import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

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

interface Note {
  id: string;
  title: string;
  content: string;
  plainText: string;
  createdAt: string;
  updatedAt: string;
}

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
export async function loader({ params, context }: LoaderFunctionArgs) {
  try {
    const { id } = params;
    if (!id) {
      return json({ error: "Note ID required" }, { status: 400 });
    }

    const kv = getKV(context);
    const note = await kv.get(`notes:${id}`, "json");

    if (!note) {
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

    if (method === "PUT") {
      const formData = await request.formData();
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      const existing = await kv.get(`notes:${id}`, "json");
      if (!existing) {
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
      await kv.delete(`notes:${id}`);

      // Update list
      const listKey = "notes:list";
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
