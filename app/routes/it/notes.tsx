import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Download, Upload, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/PageHeader";
import { RichEditor } from "../../components/RichEditor";
import { NotesList } from "../../components/NotesList";
import type { Note, NoteListItem } from "../../utils/notes";
import { htmlToMarkdown } from "../../utils/notes";
import { notesApi } from "../../utils/notesApi";

export function meta() {
  return [
    { title: "Notes - Store and Manage Notes" },
    { name: "description", content: "Create, edit, and manage notes with rich text formatting and Cloudflare KV storage." },
  ];
}

export default function NotesPage() {
  const { t } = useTranslation();

  // State management
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load notes list
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const notesList = await notesApi.listNotes();
      setNotes(notesList);
      if (notesList.length > 0 && !selectedNoteId) {
        loadNote(notesList[0].id);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast.error(t("notes.toast.load_error") || "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [selectedNoteId, t]);

  // Load single note
  const loadNote = useCallback(async (id: string) => {
    try {
      const note = await notesApi.getNote(id);
      setCurrentNote(note);
      setSelectedNoteId(id);
    } catch (error) {
      console.error("Failed to load note:", error);
      toast.error(t("notes.toast.load_error") || "Failed to load note");
    }
  }, [t]);

  // Auto-save handler
  const handleNoteChange = useCallback(
    (content: string) => {
      if (!currentNote) return;

      const updatedNote = {
        ...currentNote,
        content,
      };
      setCurrentNote(updatedNote);

      // Clear existing timer
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      // Set new auto-save timer (2 seconds)
      saveTimerRef.current = setTimeout(async () => {
        await saveNote(updatedNote);
      }, 2000);
    },
    [currentNote]
  );

  // Save note
  const saveNote = useCallback(
    async (note: Note) => {
      try {
        setIsSaving(true);
        const saved = await notesApi.updateNote(note.id, {
          title: note.title,
          content: note.content,
        });
        setCurrentNote(saved);
        toast.success(t("notes.toast.saved") || "Note saved");
        // Refresh list to update timestamps
        await loadNotes();
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error(t("notes.toast.save_error") || "Failed to save note");
      } finally {
        setIsSaving(false);
      }
    },
    [t, loadNotes]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      if (!currentNote) return;
      const updated = { ...currentNote, title: newTitle };
      setCurrentNote(updated);
      saveNote(updated);
    },
    [currentNote, saveNote]
  );

  // Create new note
  const handleCreateNote = useCallback(async () => {
    try {
      const note = await notesApi.createNote();
      setCurrentNote(note);
      setSelectedNoteId(note.id);
      await loadNotes();
      toast.success(t("notes.toast.created") || "New note created");
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error(t("notes.toast.create_error") || "Failed to create note");
    }
  }, [t, loadNotes]);

  // Delete note
  const handleDeleteNote = useCallback(
    async (id: string) => {
      if (!confirm(t("notes.dialogs.confirm_delete") || "Delete this note?")) {
        return;
      }

      try {
        await notesApi.deleteNote(id);
        toast.success(t("notes.toast.deleted") || "Note deleted");
        if (selectedNoteId === id) {
          setCurrentNote(null);
          setSelectedNoteId(null);
        }
        await loadNotes();
      } catch (error) {
        console.error("Failed to delete note:", error);
        toast.error(t("notes.toast.delete_error") || "Failed to delete note");
      }
    },
    [selectedNoteId, t, loadNotes]
  );

  // Export note as JSON
  const handleExportJSON = useCallback(() => {
    if (!currentNote) return;
    const dataStr = JSON.stringify(currentNote, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentNote.title.replace(/[^a-z0-9]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("notes.toast.exported") || "Note exported");
  }, [currentNote, t]);

  // Export note as Markdown
  const handleExportMarkdown = useCallback(() => {
    if (!currentNote) return;
    const markdown = `# ${currentNote.title}\n\n${htmlToMarkdown(currentNote.content)}`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentNote.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("notes.toast.exported") || "Note exported");
  }, [currentNote, t]);

  // Import notes from JSON
  const handleImportJSON = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const note = JSON.parse(text) as Note;
        
        // Validate note structure
        if (!note.title || !note.content) {
          throw new Error("Invalid note format");
        }

        // Create new note with imported data
        const newNote = await notesApi.createNote(note.title);
        await notesApi.updateNote(newNote.id, {
          content: note.content,
          plainText: note.plainText || "",
        });

        toast.success(t("notes.toast.imported") || "Note imported");
        await loadNotes();
      } catch (error) {
        console.error("Failed to import note:", error);
        toast.error(t("notes.toast.import_error") || "Failed to import note");
      }
    };
    input.click();
  }, [t, loadNotes]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-300 dark:border-gray-700 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title={t("notes.title") || "Notes"}
            description={t("notes.description") || "Create and manage notes with rich text formatting."}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 h-[calc(100vh-200px)]">
        <div className="flex gap-4 h-full">
          {/* Sidebar - Notes List */}
          <div className="w-full md:w-80 min-w-0 rounded-lg overflow-hidden shadow">
            <NotesList
              notes={notes}
              selectedNoteId={selectedNoteId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectNote={loadNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              isLoading={isLoading}
            />
          </div>

          {/* Main Editor */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {currentNote ? (
              <>
                {/* Title input */}
                <div className="bg-white dark:bg-gray-950 p-4 rounded-lg shadow">
                  <input
                    type="text"
                    value={currentNote.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    placeholder="Note title..."
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Last updated: {new Date(currentNote.updatedAt).toLocaleString()}
                  </p>
                </div>

                {/* Rich Editor */}
                <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
                  <RichEditor
                    content={currentNote.content}
                    onChange={handleNoteChange}
                    placeholder="Start typing your note..."
                    disabled={isSaving}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-950 p-4 rounded-lg shadow">
                  <button
                    onClick={() => saveNote(currentNote)}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    <Save size={18} />
                    {isSaving ? "Saving..." : "Save"}
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition"
                    title="Export as JSON"
                  >
                    <Download size={18} />
                    JSON
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition"
                    title="Export as Markdown"
                  >
                    <Download size={18} />
                    MD
                  </button>

                  <button
                    onClick={handleImportJSON}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition"
                    title="Import from JSON"
                  >
                    <Upload size={18} />
                    Import
                  </button>

                  <button
                    onClick={() => handleDeleteNote(currentNote.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                    title="Delete note"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg shadow flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">
                    {isLoading ? "Loading notes..." : "No note selected. Create or select a note to get started."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
