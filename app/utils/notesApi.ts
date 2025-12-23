import type { Note, NoteListItem } from "./notes";

export interface ApiError {
  message: string;
  status: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Unknown error" }))) as {
      message?: string;
    };
    throw {
      message: error.message || `HTTP ${response.status}`,
      status: response.status,
    } as ApiError;
  }
  return response.json() as Promise<T>;
}

// Using FormData with React Router routes
export const notesApi = {
  // Create a new note
  async createNote(title: string = "Untitled Note"): Promise<Note> {
    const formData = new FormData();
    formData.append("title", title);
    const response = await fetch("/api/notes", {
      method: "POST",
      body: formData,
    });
    return handleResponse<Note>(response);
  },

  // Get single note (using action with params)
  async getNote(id: string): Promise<Note> {
    const response = await fetch(`/api/notes/${id}`);
    return handleResponse<Note>(response);
  },

  // List/search notes
  async listNotes(search?: string): Promise<NoteListItem[]> {
    const url = new URL("/api/notes", window.location.origin);
    if (search) url.searchParams.set("search", search);
    const response = await fetch(url.pathname + url.search);
    return handleResponse<NoteListItem[]>(response);
  },

  // Update note
  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const formData = new FormData();
    formData.append("title", updates.title || "");
    formData.append("content", updates.content || "");
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      body: formData,
    });
    return handleResponse<Note>(response);
  },

  // Delete note
  async deleteNote(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ success: boolean }>(response);
  },
};
