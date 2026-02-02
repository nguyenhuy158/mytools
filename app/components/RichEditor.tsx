import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm max-w-none focus:outline-none min-h-96 p-4 text-gray-900 dark:text-gray-100",
      },
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    active,
    disabled: isDisabled,
    title,
  }: {
    icon: React.ComponentType<{ size: number }>;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={isDisabled || disabled}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
        active
          ? "bg-blue-500 text-white dark:bg-blue-600"
          : "text-gray-700 dark:text-gray-300"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title}
      type="button"
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border border-white/20 dark:border-white/10 rounded-lg overflow-hidden backdrop-blur-sm bg-white/10 dark:bg-white/5">
      {/* Toolbar */}
      <div className="bg-white/15 dark:bg-white/10 border-b border-white/20 dark:border-white/10 p-2 flex flex-wrap gap-1">
        <ToolbarButton
          icon={Bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={Italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={Strikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        />

        <div className="h-6 border-l border-gray-300 dark:border-gray-700 mx-1" />

        <ToolbarButton
          icon={Heading1}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        />
        <ToolbarButton
          icon={Heading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        />
        <ToolbarButton
          icon={Heading3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        />

        <div className="h-6 border-l border-gray-300 dark:border-gray-700 mx-1" />

        <ToolbarButton
          icon={List}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        />
        <ToolbarButton
          icon={Quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        />
        <ToolbarButton
          icon={Code}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        />
      </div>

      {/* Editor */}
      <div
        className={`bg-white dark:bg-gray-950 ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <EditorContent
          editor={editor}
          className="min-h-96"
        />
      </div>
    </div>
  );
};
