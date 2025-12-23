import React from "react";
import { Trash2 } from "lucide-react";
import type { NoteListItem } from "../utils/notes";

interface NoteCardProps {
  note: NoteListItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onClick,
  onDelete,
}) => {
  const preview = note.plainText.substring(0, 60) + (note.plainText.length > 60 ? "..." : "");
  const lastEdited = new Date(note.updatedAt).toLocaleDateString();

  return (
    <div
      onClick={onClick}
      className={`p-3 border-l-4 cursor-pointer transition ${
        isSelected
          ? "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-l-gray-300 dark:border-l-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {note.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {preview || "(empty)"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {lastEdited}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Delete note"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
