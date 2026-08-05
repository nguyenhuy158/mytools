import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import {
  listKeyFor,
  ownsNote,
  readOwnerId,
  type OwnerNote,
} from "../utils/notes-owner";

function json(data: any, init?: ResponseInit) {
  const response = new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  return response;
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

function extractPlainText(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
  return text;
}

// GET /api/notes/:id - Fetch single note
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  try {
    const { id } = params;
    if (!id) {
      return json({ error: "Note ID required" }, { status: 400 });
    }

    const kv = getKV(context);
    const ownerId = readOwnerId(request.headers.get("cookie"));
    const note = (await kv.get(`notes:${id}`, "json")) as Note | null;

    // 404, not 403: a wrong guess must not reveal that the id exists.
    if (!note || !ownsNote(note, ownerId)) {
      return json({ error: "Note not found" }, { status: 404 });
    }

    return json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

// PUT /api/notes/:id - Update note
// DELETE /api/notes/:id - Delete note
export async function action({ request, params, context }: ActionFunctionArgs) {
  try {
    const { id } = params;
    if (!id) {
      return json({ error: "Note ID required" }, { status: 400 });
    }

    const kv = getKV(context);
    const method = request.method.toUpperCase();
    const ownerId = readOwnerId(request.headers.get("cookie"));

    if (method === "PUT") {
      const formData = await request.formData();
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      const existing = (await kv.get(`notes:${id}`, "json")) as Note | null;
      // Same 404 for missing and not-yours, so ids cannot be probed.
      if (!existing || !ownsNote(existing, ownerId)) {
        return json({ error: "Note not found" }, { status: 404 });
      }

      const updated: Note = {
        ...(existing as Note),
        title: title || (existing as Note).title,
        content: content !== undefined ? content : (existing as Note).content,
        plainText: content ? extractPlainText(content) : (existing as Note).plainText,
        updatedAt: new Date().toISOString(),
      };

      await kv.put(`notes:${id}`, JSON.stringify(updated));
      return json(updated);
    }

    if (method === "DELETE") {
      const existing = (await kv.get(`notes:${id}`, "json")) as Note | null;
      if (!existing || !ownsNote(existing, ownerId)) {
        return json({ error: "Note not found" }, { status: 404 });
      }

      await kv.delete(`notes:${id}`);

      // Update this owner's list
      const listKey = listKeyFor(ownerId!);
      const listValue = await kv.get(listKey, "json");
      const list = (listValue as string[]) || [];
      const updated = list.filter((noteId: string) => noteId !== id);
      await kv.put(listKey, JSON.stringify(updated));

      return json({ success: true });
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Error in note action:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
