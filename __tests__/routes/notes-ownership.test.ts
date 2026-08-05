import { describe, it, expect } from "vitest";
import {
  OWNER_COOKIE,
  listKeyFor,
  ownerCookieHeader,
  ownsNote,
  readOwnerId,
} from "~/utils/notes-owner";
import { loader as listNotes, action as createNote } from "~/routes/api.notes";
import {
  loader as getNote,
  action as noteAction,
} from "~/routes/api.notes_.$id";

const OWNER_A = "11111111-2222-3333-4444-555555555555";
const OWNER_B = "99999999-8888-7777-6666-555555555555";

/** In-memory stand-in for the NOTES KV namespace. */
function fakeKV(seed: Record<string, unknown> = {}) {
  const store = new Map<string, string>(
    Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]),
  );
  return {
    store,
    kv: {
      get: async (key: string, type?: string) => {
        const raw = store.get(key);
        if (raw === undefined) return null;
        return type === "json" ? JSON.parse(raw) : raw;
      },
      put: async (key: string, value: string) => void store.set(key, value),
      delete: async (key: string) => void store.delete(key),
    },
  };
}

const ctx = (kv: unknown) => ({ cloudflare: { env: { NOTES: kv } } }) as never;

/** FormData with a title, since an empty one breaks the test parser. */
const titled = (title: string) => {
  const body = new FormData();
  body.set("title", title);
  return body;
};

const note = (id: string, ownerId?: string) => ({
  id,
  title: `note ${id}`,
  content: "<p>hi</p>",
  plainText: "hi",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...(ownerId ? { ownerId } : {}),
});

/**
 * Request stand-in. A real `Request` cannot carry a Cookie header here: the
 * test environment applies browser rules and strips it as a forbidden header,
 * while a Worker receives it normally. So the cookie is served from a shim
 * around a real Request, which still provides url/method/formData.
 */
const req = (
  url: string,
  {
    owner,
    method = "GET",
    body,
  }: { owner?: string; method?: string; body?: FormData } = {},
) => {
  const real = new Request(`https://huyab.click${url}`, { method, body });
  const cookie = owner ? `${OWNER_COOKIE}=${owner}` : null;

  return {
    url: real.url,
    method: real.method,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "cookie" ? cookie : real.headers.get(name),
    },
    formData: () => real.formData(),
  };
};

describe("notes owner cookie", () => {
  it("reads the owner id from a cookie header", () => {
    expect(readOwnerId(`${OWNER_COOKIE}=${OWNER_A}`)).toBe(OWNER_A);
  });

  it("finds it among other cookies", () => {
    expect(readOwnerId(`theme=dark; ${OWNER_COOKIE}=${OWNER_A}; lang=vi`)).toBe(
      OWNER_A,
    );
  });

  it("returns null when absent or empty", () => {
    expect(readOwnerId(null)).toBe(null);
    expect(readOwnerId("")).toBe(null);
    expect(readOwnerId("theme=dark")).toBe(null);
  });

  it("rejects a value that is not a uuid", () => {
    // Stops a hand-crafted cookie from becoming an owner id.
    expect(readOwnerId(`${OWNER_COOKIE}=../../etc/passwd`)).toBe(null);
    expect(readOwnerId(`${OWNER_COOKIE}=notes:list`)).toBe(null);
    expect(readOwnerId(`${OWNER_COOKIE}=`)).toBe(null);
  });

  it("issues an httpOnly, Secure, SameSite cookie", () => {
    const header = ownerCookieHeader(OWNER_A);
    expect(header).toContain(`${OWNER_COOKIE}=${OWNER_A}`);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Path=/");
    expect(header).toMatch(/Max-Age=\d+/);
  });

  it("keys each owner's list separately", () => {
    expect(listKeyFor(OWNER_A)).not.toBe(listKeyFor(OWNER_B));
    expect(listKeyFor(OWNER_A)).toContain(OWNER_A);
  });
});

describe("ownsNote", () => {
  it("accepts the owner that created it", () => {
    expect(ownsNote(note("a", OWNER_A), OWNER_A)).toBe(true);
  });

  it("rejects a different owner", () => {
    expect(ownsNote(note("a", OWNER_A), OWNER_B)).toBe(false);
  });

  it("rejects a caller with no cookie", () => {
    expect(ownsNote(note("a", OWNER_A), null)).toBe(false);
  });

  it("rejects a legacy note that has no owner", () => {
    // Pre-existing notes must not be handed to whoever asks first.
    expect(ownsNote(note("legacy"), OWNER_A)).toBe(false);
  });

  it("rejects a missing note", () => {
    expect(ownsNote(null, OWNER_A)).toBe(false);
  });
});

describe("GET /api/notes", () => {
  it("returns only the caller's notes", async () => {
    const { kv } = fakeKV({
      "notes:a1": note("a1", OWNER_A),
      "notes:b1": note("b1", OWNER_B),
      [listKeyFor(OWNER_A)]: ["a1"],
      [listKeyFor(OWNER_B)]: ["b1"],
    });

    const res = await listNotes({
      request: req("/api/notes", { owner: OWNER_A }),
      context: ctx(kv),
      params: {},
    } as never);

    const body = (await res.json()) as { id: string }[];
    expect(body.map((n) => n.id)).toEqual(["a1"]);
  });

  it("returns an empty list and a cookie for a first-time visitor", async () => {
    const { kv } = fakeKV({
      "notes:a1": note("a1", OWNER_A),
      [listKeyFor(OWNER_A)]: ["a1"],
    });

    const res = await listNotes({
      request: req("/api/notes"),
      context: ctx(kv),
      params: {},
    } as never);

    expect(await res.json()).toEqual([]);
    expect(res.headers.get("Set-Cookie")).toContain(OWNER_COOKIE);
    expect(res.headers.get("Set-Cookie")).toContain("HttpOnly");
  });

  it("never leaks legacy unowned notes", async () => {
    // The two notes that existed on prod before this change.
    const { kv } = fakeKV({
      "notes:old1": note("old1"),
      "notes:list": ["old1"],
    });

    const res = await listNotes({
      request: req("/api/notes", { owner: OWNER_A }),
      context: ctx(kv),
      params: {},
    } as never);

    expect(await res.json()).toEqual([]);
  });

  it("skips a note whose ownerId disagrees with the list it sits in", async () => {
    const { kv } = fakeKV({
      "notes:b1": note("b1", OWNER_B),
      [listKeyFor(OWNER_A)]: ["b1"],
    });

    const res = await listNotes({
      request: req("/api/notes", { owner: OWNER_A }),
      context: ctx(kv),
      params: {},
    } as never);

    expect(await res.json()).toEqual([]);
  });
});

describe("POST /api/notes", () => {
  it("stamps the note with the caller's owner id", async () => {
    const { kv, store } = fakeKV();
    const body = new FormData();
    body.set("title", "mine");

    const res = await createNote({
      request: req("/api/notes", { owner: OWNER_A, method: "POST", body }),
      context: ctx(kv),
      params: {},
    } as never);

    const created = (await res.json()) as { id: string; ownerId: string };
    expect(res.status).toBe(201);
    expect(created.ownerId).toBe(OWNER_A);
    expect(JSON.parse(store.get(listKeyFor(OWNER_A))!)).toEqual([created.id]);
    // The old global key must not be written any more.
    expect(store.has("notes:list")).toBe(false);
  });

  it("mints an owner and returns the cookie when there is none", async () => {
    const { kv, store } = fakeKV();
    // A field is required: the test environment's multipart parser rejects an
    // entirely empty FormData, which a Worker accepts.
    const body = new FormData();
    body.set("title", "first note");

    const res = await createNote({
      request: req("/api/notes", { method: "POST", body }),
      context: ctx(kv),
      params: {},
    } as never);

    const created = (await res.json()) as { ownerId: string };
    expect(created.ownerId).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.headers.get("Set-Cookie")).toContain(created.ownerId);
    expect(store.has(listKeyFor(created.ownerId))).toBe(true);
  });

  it("does not re-issue a cookie for a known owner", async () => {
    const { kv } = fakeKV();
    const res = await createNote({
      request: req("/api/notes", {
        owner: OWNER_A,
        method: "POST",
        body: titled("anything"),
      }),
      context: ctx(kv),
      params: {},
    } as never);
    expect(res.headers.get("Set-Cookie")).toBe(null);
  });
});

describe("GET /api/notes/:id", () => {
  const seeded = () =>
    fakeKV({
      "notes:a1": note("a1", OWNER_A),
      "notes:old1": note("old1"),
      [listKeyFor(OWNER_A)]: ["a1"],
    });

  const fetchNote = (id: string, owner?: string) => {
    const { kv } = seeded();
    return getNote({
      request: req(`/api/notes/${id}`, { owner }),
      context: ctx(kv),
      params: { id },
    } as never);
  };

  it("returns the caller's own note", async () => {
    const res = await fetchNote("a1", OWNER_A);
    expect(res.status).toBe(200);
    expect(((await res.json()) as { id: string }).id).toBe("a1");
  });

  it("hides another owner's note behind a 404, not a 403", async () => {
    // A 403 would confirm the id exists; 404 gives nothing away.
    const res = await fetchNote("a1", OWNER_B);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Note not found" });
  });

  it("hides it from a caller with no cookie", async () => {
    expect((await fetchNote("a1")).status).toBe(404);
  });

  it("hides legacy unowned notes", async () => {
    expect((await fetchNote("old1", OWNER_A)).status).toBe(404);
  });
});

describe("PUT and DELETE /api/notes/:id", () => {
  const seeded = () =>
    fakeKV({
      "notes:a1": note("a1", OWNER_A),
      [listKeyFor(OWNER_A)]: ["a1"],
    });

  it("lets the owner edit", async () => {
    const { kv, store } = seeded();
    const body = new FormData();
    body.set("title", "renamed");

    const res = await noteAction({
      request: req("/api/notes/a1", { owner: OWNER_A, method: "PUT", body }),
      context: ctx(kv),
      params: { id: "a1" },
    } as never);

    expect(res.status).toBe(200);
    expect(JSON.parse(store.get("notes:a1")!).title).toBe("renamed");
  });

  it("refuses an edit from another owner and leaves the note alone", async () => {
    const { kv, store } = seeded();
    const body = new FormData();
    body.set("title", "hijacked");

    const res = await noteAction({
      request: req("/api/notes/a1", { owner: OWNER_B, method: "PUT", body }),
      context: ctx(kv),
      params: { id: "a1" },
    } as never);

    expect(res.status).toBe(404);
    expect(JSON.parse(store.get("notes:a1")!).title).toBe("note a1");
  });

  it("lets the owner delete", async () => {
    const { kv, store } = seeded();
    const res = await noteAction({
      request: req("/api/notes/a1", { owner: OWNER_A, method: "DELETE" }),
      context: ctx(kv),
      params: { id: "a1" },
    } as never);

    expect(res.status).toBe(200);
    expect(store.has("notes:a1")).toBe(false);
    expect(JSON.parse(store.get(listKeyFor(OWNER_A))!)).toEqual([]);
  });

  it("refuses a delete from another owner and keeps the note", async () => {
    // This is the attack that used to work: anyone could wipe the list.
    const { kv, store } = seeded();
    const res = await noteAction({
      request: req("/api/notes/a1", { owner: OWNER_B, method: "DELETE" }),
      context: ctx(kv),
      params: { id: "a1" },
    } as never);

    expect(res.status).toBe(404);
    expect(store.has("notes:a1")).toBe(true);
    expect(JSON.parse(store.get(listKeyFor(OWNER_A))!)).toEqual(["a1"]);
  });

  it("refuses a delete with no cookie at all", async () => {
    const { kv, store } = seeded();
    const res = await noteAction({
      request: req("/api/notes/a1", { method: "DELETE" }),
      context: ctx(kv),
      params: { id: "a1" },
    } as never);

    expect(res.status).toBe(404);
    expect(store.has("notes:a1")).toBe(true);
  });
});
