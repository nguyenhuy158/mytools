import React from "react";
import { Search, Plus } from "lucide-react";
import type { NoteListItem } from "../utils/notes";
import { NoteCard } from "./NoteCard";

interface NotesListProps {
  notes: NoteListItem[];
  selectedNoteId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  isLoading?: boolean;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  searchQuery,
  onSearchChange,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  isLoading = false,
}) => {
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.plainText.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white/10 dark:bg-white/5 backdrop-blur-lg border-r border-white/20 dark:border-white/10">
      {/* Header with create button */}
      <div className="p-4 border-b border-white/20 dark:border-white/10 space-y-3">
        <button
          onClick={onCreateNote}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Plus size={18} />
          New Note
        </button>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-white/20 dark:border-white/10 rounded-lg bg-white/15 dark:bg-white/5 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25 dark:focus:bg-white/15"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {notes.length === 0 ? "No notes yet" : "No matching notes"}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onClick={() => onSelectNote(note.id)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
