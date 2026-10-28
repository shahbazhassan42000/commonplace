"use client";

import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type ReactNode, useEffect, useState } from "react";

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "nofollow noopener noreferrer ugc", target: "_blank" },
    },
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({ placeholder: "Type the quote, line, poetry etc" }),
];

/**
 * A rich-text field whose HTML is mirrored into a hidden input so it posts with
 * the form. The server sanitizes it; the editor's config is only for the UI.
 */
export function RichEditor({
  name,
  initialHTML,
  invalid,
  ariaDescribedBy,
  onText,
}: {
  name: string;
  initialHTML?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
  onText?: (text: string) => void;
}) {
  const [html, setHtml] = useState(initialHTML ?? "");
  const editor = useEditor({
    extensions,
    content: initialHTML ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich min-h-[160px] px-[22px] py-[14px] focus:outline-none",
        dir: "auto",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "The line",
        ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      onText?.(editor.getText());
    },
  });

  // Report the starting text once the editor parses initialHTML (keeps the
  // character counter right after a failed submit re-populates the field).
  useEffect(() => {
    if (editor) onText?.(editor.getText());
  }, [editor, onText]);

  return (
    <div
      className="rich-editor overflow-hidden rounded-[15px] border border-burgundy bg-parchment"
      data-invalid={invalid ? "true" : undefined}
    >
      <Toolbar editor={editor} />
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-[160px] px-[22px] py-[14px] font-hand text-slate" aria-hidden="true">
          Type the quote, line, poetry etc
        </div>
      )}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="h-[45px] border-b border-burgundy/25" aria-hidden="true" />;
  }

  const setLink = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "https://";
    const url = window.prompt("Link URL (leave empty to remove)", prev);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-burgundy/25 px-2 py-1.5"
    >
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </Btn>

      <Divider />

      <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </Btn>
      <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </Btn>

      <Divider />

      <Btn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        ⯇
      </Btn>
      <Btn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        ≡
      </Btn>
      <Btn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        ⯈
      </Btn>

      <Divider />

      <Btn title="Add or edit link" active={editor.isActive("link")} onClick={setLink}>
        🔗
      </Btn>
      <Btn title="Clear formatting" active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        ⌫
      </Btn>
    </div>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-burgundy/20" />;
}

function Btn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      // Keep the editor's selection when the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[15px] leading-none transition-colors hover:bg-burgundy/10 ${
        active ? "bg-burgundy/15 text-burgundy" : "text-ink"
      }`}
    >
      {children}
    </button>
  );
}
