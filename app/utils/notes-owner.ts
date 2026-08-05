/**
 * Per-browser ownership for the notes API.
 *
 * Notes used to live under one global KV key with no auth at all, so every
 * visitor read, edited and deleted everyone else's notes. Each browser now
 * gets an opaque owner id in an httpOnly cookie, and every note records the
 * owner that created it.
 *
 * This is deliberately not a login: the tool stays usable with no account.
 * The trade-off is that clearing cookies, or opening the site in another
 * browser, means starting from an empty list.
 */

export const OWNER_COOKIE = "notes_owner";

/** A year — long enough that notes are not lost between visits. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Owner ids are uuids; anything else in the cookie is ignored. */
const OWNER_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface OwnerNote {
  id: string;
  title: string;
  content: string;
  plainText: string;
  createdAt: string;
  updatedAt: string;
  /** Absent on notes created before ownership existed. */
  ownerId?: string;
}

/** Read the owner id from a Cookie header, or null when there is none. */
export function readOwnerId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.split("=");
    if (rawName.trim() !== OWNER_COOKIE) continue;
    const value = decodeURIComponent(rest.join("=").trim());
    return OWNER_PATTERN.test(value) ? value : null;
  }
  return null;
}

/**
 * Set-Cookie value for a freshly minted owner. httpOnly so page scripts (and
 * anything injected into them) cannot read or forge it; SameSite=Lax so it
 * still arrives on a normal top-level navigation.
 */
export function ownerCookieHeader(ownerId: string): string {
  return [
    `${OWNER_COOKIE}=${encodeURIComponent(ownerId)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

/** KV key holding one owner's note ids. */
export function listKeyFor(ownerId: string): string {
  return `notes:list:${ownerId}`;
}

/**
 * Whether this owner may see or change this note.
 *
 * A note with no ownerId predates this change. Handing those to whoever asks
 * first would give a stranger someone else's notes, so they stay unreachable.
 */
export function ownsNote(note: OwnerNote | null, ownerId: string | null): boolean {
  if (!note || !ownerId) return false;
  return note.ownerId === ownerId;
}
