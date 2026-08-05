import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { v4 as uuidv4 } from "uuid";
import {
  listKeyFor,
  ownerCookieHeader,
  readOwnerId,
  type OwnerNote,
} from "../utils/notes-owner";

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

type Note = OwnerNote;

function getKV(context: any): KVNamespace {
  const kv = context?.cloudflare?.env?.NOTES;
  if (!kv) {
    // Gracefully handle missing NOTES namespace in development
    console.warn("NOTES KV namespace not configured. Please add to wrangler.jsonc");
    return {
      get: async () => null,
      put: async () => {},
      delete: async () => {},
    } as any;
  }
  return kv;
}

// GET /api/notes - List all notes (with optional search)
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const kv = getKV(context);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    // No cookie yet means no notes yet: answer with an empty list and hand out
    // an owner id, rather than showing this browser somebody else's notes.
    const ownerId = readOwnerId(request.headers.get("cookie"));
    if (!ownerId) {
      return json([], {
        headers: { "Set-Cookie": ownerCookieHeader(uuidv4()) },
      });
    }

    // Only this owner's note ids.
    const listValue = await kv.get(listKeyFor(ownerId), "json");
    const noteIds: string[] = (listValue as string[]) || [];

    // Fetch all notes and filter
    const notes: Note[] = [];
    for (const id of noteIds) {
      const note = await kv.get(`notes:${id}`, "json");
      if (note) {
        const noteData = note as Note;
        // Belt and braces: the list is already per-owner, but a note that
        // somehow names another owner must never be returned.
        if (noteData.ownerId !== ownerId) continue;
        // Filter by search query
        if (
          search === "" ||
          noteData.title.toLowerCase().includes(search) ||
          noteData.plainText.toLowerCase().includes(search)
        ) {
          notes.push(noteData);
        }
      }
    }

    // Sort by updatedAt descending
    notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Return simplified list (no full content)
    const list = notes.map(({ id, title, plainText, updatedAt }) => ({
      id,
      title,
      plainText: plainText.substring(0, 100),
      updatedAt,
    }));

    return json(list);
  } catch (error) {
    console.error("Error listing notes:", error);
    return json({ error: "Failed to list notes" }, { status: 500 });
  }
}

// POST /api/notes - Create new note
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const kv = getKV(context);
    const formData = await request.formData();
    const title = (formData.get("title") as string) || "Untitled Note";

    // First write from this browser mints the owner id and returns the cookie.
    const existingOwner = readOwnerId(request.headers.get("cookie"));
    const ownerId = existingOwner ?? uuidv4();

    const noteId = uuidv4();
    const now = new Date().toISOString();
    const note: Note = {
      id: noteId,
      title,
      content: "",
      plainText: "",
      createdAt: now,
      updatedAt: now,
      ownerId,
    };

    // Save note
    await kv.put(`notes:${noteId}`, JSON.stringify(note));

    // Update this owner's list
    const listKey = listKeyFor(ownerId);
    const listValue = await kv.get(listKey, "json");
    const list = (listValue as string[]) || [];
    if (!list.includes(noteId)) {
      list.unshift(noteId);
      await kv.put(listKey, JSON.stringify(list));
    }

    return json(note, {
      status: 201,
      headers: existingOwner
        ? undefined
        : { "Set-Cookie": ownerCookieHeader(ownerId) },
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return json({ error: "Failed to create note" }, { status: 500 });
  }
}
