export const USAGE = `ToolHub — text case converter over HTTP
https://huyab.cfd

USAGE
  curl huyab.cfd/<case> -d '<text>'
  curl huyab.cfd/<case>/<text>
  echo '<text>' | curl huyab.cfd/<case> --data-binary @-
  cat file.txt | curl huyab.cfd/<case> --data-binary @-

CASES  — shown as applied to: tỉnh ninh thuận
  upper         TỈNH NINH THUẬN       (aliases: u, uc)
  lower         tỉnh ninh thuận       (aliases: l, lc)
  sentence      Tỉnh ninh thuận       (alias: s)
  capitalized   Tỉnh Ninh Thuận       (aliases: c, cap)
  title         Tỉnh Ninh Thuận       (alias: t)
  alternating   tỈnH NiNh tHuẬn       (aliases: a, alt)
  inverse       TỈNH NINH THUẬN       (aliases: i, inv)

  alternating counts spaces too, so the rhythm carries across words.
  inverse swaps each letter's case, so lowercase input comes back uppercase.

OPTIONS
  -h, --help    show this help
  ?json         reply with JSON instead of plain text
                (or send: Accept: application/json)
  ?text=<text>  pass the text as a query parameter

WGET
  wget -qO- huyab.cfd/-h
  wget -qO- --post-data='tỉnh ninh thuận' huyab.cfd/upper
  wget -qO- 'huyab.cfd/title/tỉnh ninh thuận'

  wget cannot read the body from a pipe: --post-file needs a seekable file,
  so both '-' and /dev/stdin fail. Write a temp file, or use curl for pipes.

SHELL HELPER
  Tired of quoting? Install a 'tc' function once:

    eval "$(curl -s huyab.cfd/sh)"      # add to ~/.zshrc to keep it
    tc t tinh ninh thuan                  # Tinh Ninh Thuan
    tc upper tỉnh ninh thuận              # TỈNH NINH THUẬN
    cat notes.txt | tc upper              # reads stdin when given no words

  Works under sh, bash and zsh, with curl or wget (whichever you have).

NOTES
  Vietnamese diacritics are handled correctly — matching is Unicode-aware.
  Trailing newlines in the input are preserved; curl -d strips them for you.
  Quote the whole URL if the text has spaces — curl treats a bare second
  word as another URL and tries to resolve it as a hostname:
    curl huyab.cfd/t ninh thuan      ✗  "Could not resolve host: ninh"
    curl 'huyab.cfd/t/ninh thuan'    ✓
    curl huyab.cfd/t -d 'ninh thuan' ✓

EXAMPLES
  curl huyab.cfd/upper -d 'tỉnh ninh thuận'
  curl 'huyab.cfd/title/tỉnh ninh thuận'
  curl 'huyab.cfd/capitalized?text=phan rang tháp chàm&json'
  curl -s huyab.cfd/lower -d 'NINH THUẬN' | tee out.txt
`;

export function createBanner(cases: string[]): string {
  return `ToolHub — text case converter
  cases: ${cases.join(" ")}
  usage: curl huyab.cfd/<case> -d '<text>'
  help:  curl huyab.cfd/-h

The full site (JSON tools, diff, calendar, games) is at https://huyab.cfd
`;
}

/**
 * Shell function served at /sh, so text with spaces needs no quoting:
 *   eval "$(curl -s huyab.cfd/sh)" && tc t tinh ninh thuan
 *
 * POSIX sh — no arrays, no [[ ]] — so it works under sh, bash and zsh. It
 * prefers curl and falls back to wget, which cannot post from a pipe and so
 * needs stdin buffered into a temp file.
 */
export const SHELL_HELPER = `# ToolHub case converter — eval "$(curl -s huyab.cfd/sh)"
tc() {
  _tc_url="https://huyab.cfd"
  if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    if command -v curl >/dev/null 2>&1; then
      curl -s "$_tc_url/-h"
    else
      wget -qO- "$_tc_url/-h"
    fi
    unset _tc_url
    return 0
  fi
  _tc_case="$1"
  shift
  if command -v curl >/dev/null 2>&1; then
    if [ $# -eq 0 ]; then
      # No words given: convert stdin, so \`cat f | tc upper\` works.
      curl -s --data-binary @- "$_tc_url/$_tc_case"
    else
      curl -s --data-binary "$*" "$_tc_url/$_tc_case"
    fi
  elif command -v wget >/dev/null 2>&1; then
    if [ $# -eq 0 ]; then
      # wget's --post-file needs a seekable file, so buffer the pipe.
      _tc_tmp=$(mktemp) || { echo "tc: mktemp failed" >&2; return 1; }
      cat > "$_tc_tmp"
      wget -qO- --post-file="$_tc_tmp" "$_tc_url/$_tc_case"
      rm -f "$_tc_tmp"
      unset _tc_tmp
    else
      wget -qO- --post-data="$*" "$_tc_url/$_tc_case"
    fi
  else
    echo "tc: needs curl or wget" >&2
    unset _tc_case _tc_url
    return 127
  fi
  unset _tc_case _tc_url
}
`;
