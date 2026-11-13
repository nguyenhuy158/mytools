#!/usr/bin/env bash
# Installs bws (Bitwarden Secrets Manager CLI), cf (Cloudflare CLI, beta) and Tailscale.
# Linux x86_64 / arm64 and macOS. Idempotent: skips tools already installed.
#
# Auth model:
#   bws        reads its token from the BWS_ACCESS_TOKEN env var.
#   cf         uses CLOUDFLARE_API_TOKEN, read from the bws secret of that name.
#   tailscale  logs in with the TS_AUTH_KEY bws secret.
# Without BWS_ACCESS_TOKEN the tools are installed but not authenticated.
# In containers without TUN/systemd tailscaled runs in userspace mode and ~/.ssh/config
# routes tailnet hosts through `tailscale nc`.
# Set SKIP_AUTH=1 to install only.
# Finishes by writing a README.md for this machine (README_PATH, default ~/README.md).
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
NODE_MIN_MAJOR=22
NODE_MIN_MINOR=18

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)  BWS_TARGET="x86_64-unknown-linux-gnu" ;;
  Linux-aarch64) BWS_TARGET="aarch64-unknown-linux-gnu" ;;
  Darwin-arm64)  BWS_TARGET="aarch64-apple-darwin" ;;
  Darwin-x86_64) BWS_TARGET="x86_64-apple-darwin" ;;
  *) echo "Unsupported platform: $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac

SUDO=""
[ -w "$INSTALL_DIR" ] || SUDO="sudo"

bws_secret() {
  bws secret list | python3 -I -c '
import json, sys
secrets = {item["key"]: item["value"] for item in json.load(sys.stdin)}
value = secrets.get(sys.argv[1])
if not value:
    sys.exit("bws secret " + sys.argv[1] + " not found")
sys.stdout.write(value)
' "$1"
}

can_authenticate() {
  [ "${SKIP_AUTH:-0}" != "1" ] && [ -n "${BWS_ACCESS_TOKEN:-}" ] && command -v bws >/dev/null 2>&1
}

install_bws() {
  if command -v bws >/dev/null 2>&1; then
    echo "bws already installed: $(bws --version)"
    return
  fi
  local version workdir
  version="$(curl -fsSL -H 'User-Agent: install-tools' https://crates.io/api/v1/crates/bws \
    | python3 -c 'import sys,json;print(json.load(sys.stdin)["crate"]["max_stable_version"])')"
  workdir="$(mktemp -d)"
  trap 'rm -rf "$workdir"' RETURN
  curl -fsSL -o "$workdir/bws.zip" \
    "https://github.com/bitwarden/sdk-sm/releases/download/bws-v${version}/bws-${BWS_TARGET}-${version}.zip"
  python3 -I -c 'import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' \
    "$workdir/bws.zip" "$workdir"
  $SUDO install -m 755 "$workdir/bws" "$INSTALL_DIR/bws"
  echo "bws installed: $(bws --version)"
}

install_cf() {
  if command -v cf >/dev/null 2>&1 && cf --version 2>/dev/null | grep -qi cloudflare; then
    echo "cf already installed: $(cf --version)"
    return
  fi
  command -v npm >/dev/null 2>&1 || { echo "npm not found; install Node >= ${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}" >&2; exit 1; }
  local node_major node_minor
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  node_minor="$(node -p 'process.versions.node.split(".")[1]')"
  if [ "$node_major" -lt "$NODE_MIN_MAJOR" ] || { [ "$node_major" -eq "$NODE_MIN_MAJOR" ] && [ "$node_minor" -lt "$NODE_MIN_MINOR" ]; }; then
    echo "cf needs Node >= ${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}, found $(node --version)" >&2
    exit 1
  fi
  npm install --global cf
  echo "cf installed: $(cf --version)"
  echo "Tip: if another 'cf' (Cloud Foundry) is on PATH, use 'cloudflare' instead."
}

install_tailscale() {
  if command -v tailscale >/dev/null 2>&1; then
    echo "tailscale already installed: $(tailscale version | head -1)"
    return
  fi
  case "$(uname -s)" in
    Linux)
      curl -fsSL https://tailscale.com/install.sh | sh
      ;;
    Darwin)
      command -v brew >/dev/null 2>&1 || { echo "Homebrew not found; install it first (https://brew.sh)" >&2; exit 1; }
      brew install tailscale
      ;;
  esac
  echo "tailscale installed: $(tailscale version | head -1)"
}

verify_cf_token() {
  can_authenticate || { echo "cf: skipped token check (no BWS_ACCESS_TOKEN or SKIP_AUTH=1)"; return; }
  local token
  token="$(bws_secret CLOUDFLARE_API_TOKEN)"
  if CLOUDFLARE_API_TOKEN="$token" cf zones list >/dev/null 2>&1; then
    echo "cf: CLOUDFLARE_API_TOKEN from bws works"
    echo "Use it in your shell with:"
    echo "  export CLOUDFLARE_API_TOKEN=\"\$(bws secret list | python3 -I -c 'import json,sys;print({i[\"key\"]:i[\"value\"] for i in json.load(sys.stdin)}[\"CLOUDFLARE_API_TOKEN\"])')\""
  else
    echo "cf: CLOUDFLARE_API_TOKEN from bws was rejected" >&2
    return 1
  fi
}

TS_STATE_DIR="${TS_STATE_DIR:-$HOME/.local/share/tailscale}"
TS_SOCKET="$TS_STATE_DIR/tailscaled.sock"

use_userspace_tailscale() {
  [ "$(uname -s)" = "Linux" ] || return 1
  [ -e /dev/net/tun ] && [ -d /run/systemd/system ] && return 1
  return 0
}

start_userspace_tailscaled() {
  mkdir -p "$TS_STATE_DIR"
  if [ -S "$TS_SOCKET" ] && tailscale --socket="$TS_SOCKET" version >/dev/null 2>&1; then
    return
  fi
  nohup tailscaled --tun=userspace-networking \
    --state="$TS_STATE_DIR/tailscaled.state" --socket="$TS_SOCKET" \
    >"$TS_STATE_DIR/tailscaled.log" 2>&1 &
  local waited=0
  until [ -S "$TS_SOCKET" ] || [ "$waited" -ge 10 ]; do
    sleep 1
    waited=$((waited + 1))
  done
  [ -S "$TS_SOCKET" ] || { echo "tailscaled did not start; see $TS_STATE_DIR/tailscaled.log" >&2; return 1; }
}

login_tailscale() {
  can_authenticate || { echo "tailscale: skipped login (no BWS_ACCESS_TOKEN or SKIP_AUTH=1)"; return; }
  local ts_cmd=(tailscale) up_cmd=(sudo tailscale)
  if use_userspace_tailscale; then
    start_userspace_tailscaled
    ts_cmd=(tailscale --socket="$TS_SOCKET")
    up_cmd=("${ts_cmd[@]}")
    echo "tailscale: userspace mode (no TUN or systemd); socket $TS_SOCKET"
  fi
  if "${ts_cmd[@]}" status >/dev/null 2>&1; then
    echo "tailscale already connected"
    return
  fi
  if [ "$(uname -s)" = "Darwin" ]; then
    sudo brew services start tailscale
  fi
  local keyfile
  keyfile="$(mktemp)"
  chmod 600 "$keyfile"
  trap 'rm -f "$keyfile"' RETURN
  bws_secret TS_AUTH_KEY > "$keyfile"
  "${up_cmd[@]}" up --auth-key="file:$keyfile"
  echo "tailscale connected"
}

setup_tailnet_ssh() {
  use_userspace_tailscale || return 0
  [ -S "$TS_SOCKET" ] || return 0
  local hosts
  hosts="$(tailscale --socket="$TS_SOCKET" status --json | python3 -I -c '
import json, re, sys
status = json.load(sys.stdin)
names = []
for peer in status.get("Peer", {}).values():
    for name in (peer["HostName"], peer["DNSName"].rstrip(".")):
        if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9.-]*", name) and name != "localhost":
            names.append(name)
print(" ".join(sorted(set(names))), "100.*")
')"
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  local config="$HOME/.ssh/config" marker_begin="# BEGIN install-tools tailnet" marker_end="# END install-tools tailnet"
  touch "$config"
  chmod 600 "$config"
  python3 -I - "$config" "$marker_begin" "$marker_end" <<PY
import sys
config, begin, end = sys.argv[1:4]
text = open(config).read()
if begin in text:
    head, rest = text.split(begin, 1)
    text = head + rest.split(end, 1)[1].lstrip("\n")
block = """$marker_begin
Host $hosts
  ProxyCommand tailscale --socket=$TS_SOCKET nc %h %p
$marker_end
"""
open(config, "w").write(text.rstrip("\n") + ("\n\n" if text.strip() else "") + block)
PY
  echo "ssh: tailnet hosts routed through tailscale nc ($config)"
}

tool_version() {
  local name="$1"
  command -v "$name" >/dev/null 2>&1 || { echo "not installed"; return; }
  case "$name" in
    tailscale) tailscale version 2>/dev/null | head -1 ;;
    *)         "$name" --version 2>/dev/null | head -1 ;;
  esac
}

tailscale_state() {
  command -v tailscale >/dev/null 2>&1 || { echo "not installed"; return; }
  if tailscale status >/dev/null 2>&1; then echo "connected"; else echo "not connected"; fi
}

write_readme() {
  local marker="<!-- generated by install-tools.sh -->"
  local target="${README_PATH:-$HOME/README.md}"
  if [ -e "$target" ] && ! grep -qF "$marker" "$target"; then
    target="${target%.md}.install-tools.md"
    echo "readme: existing README.md is not ours; writing $target instead"
  fi
  local bws_auth="no (BWS_ACCESS_TOKEN not set)"
  [ -n "${BWS_ACCESS_TOKEN:-}" ] && bws_auth="yes (BWS_ACCESS_TOKEN is set)"
  cat > "$target" <<README
$marker
# This machine

Set up by \`install-tools.sh\` on $(date -u +"%Y-%m-%d %H:%M UTC") (host: $(hostname), $(uname -s) $(uname -m)).

## Installed tools

| Tool | Version | State |
|---|---|---|
| bws (Bitwarden Secrets Manager) | $(tool_version bws) | token in env: $bws_auth |
| cf (Cloudflare CLI, beta) | $(tool_version cf) | uses \`CLOUDFLARE_API_TOKEN\` from bws |
| tailscale | $(tool_version tailscale) | $(tailscale_state) |

## Where the tokens come from

| Tool | Token | Source |
|---|---|---|
| bws | \`BWS_ACCESS_TOKEN\` | environment variable (set it yourself) |
| cf | \`CLOUDFLARE_API_TOKEN\` | bws secret with the same name |
| tailscale | \`TS_AUTH_KEY\` | bws secret, used by \`tailscale up\` |

No secret is stored in this file or in the script.

## Common commands

\`\`\`bash
# bws: list secret names only (no values)
bws secret list | python3 -I -c 'import json,sys;[print(i["key"]) for i in json.load(sys.stdin)]'

# cf: use the Cloudflare token from bws for this shell
export CLOUDFLARE_API_TOKEN="\$(bws secret list | python3 -I -c 'import json,sys;print({i["key"]:i["value"] for i in json.load(sys.stdin)}["CLOUDFLARE_API_TOKEN"])')"
cf zones list

# tailscale
tailscale status
sudo tailscale up --auth-key=file:/path/to/keyfile
\`\`\`

## Run it again

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/nguyenhuy158/mytools/main/scripts/install-tools.sh | bash
\`\`\`

Set \`SKIP_AUTH=1\` to install only, without logging in.
README
  echo "readme: wrote $target"
}

install_bws
install_cf
install_tailscale
verify_cf_token
login_tailscale
setup_tailnet_ssh
write_readme
