"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- */
/*  Rich text editor.                                              */
/*                                                                 */
/*  A contentEditable surface with a formatting toolbar — no       */
/*  editor dependency, and nothing renders until the browser has   */
/*  mounted it, which keeps it clear of hydration mismatches.      */
/*  Whatever it produces is sanitised again on the server before   */
/*  it is stored, so the toolbar is a convenience, not a boundary. */
/* -------------------------------------------------------------- */

type Command = {
  icon: typeof Bold;
  label: string;
  run: (exec: (command: string, value?: string) => void) => void;
};

const COMMANDS: Command[][] = [
  [
    { icon: Bold, label: "Bold", run: (exec) => exec("bold") },
    { icon: Italic, label: "Italic", run: (exec) => exec("italic") },
  ],
  [
    {
      icon: Heading2,
      label: "Heading",
      run: (exec) => exec("formatBlock", "<h2>"),
    },
    {
      icon: Heading3,
      label: "Subheading",
      run: (exec) => exec("formatBlock", "<h3>"),
    },
    {
      icon: Quote,
      label: "Quote",
      run: (exec) => exec("formatBlock", "<blockquote>"),
    },
    { icon: Code, label: "Code block", run: (exec) => exec("formatBlock", "<pre>") },
  ],
  [
    { icon: List, label: "Bullet list", run: (exec) => exec("insertUnorderedList") },
    {
      icon: ListOrdered,
      label: "Numbered list",
      run: (exec) => exec("insertOrderedList"),
    },
  ],
  [
    { icon: Undo2, label: "Undo", run: (exec) => exec("undo") },
    { icon: Redo2, label: "Redo", run: (exec) => exec("redo") },
  ],
];

export function RichText({
  value,
  onChange,
  onPickImage,
}: {
  value: string;
  onChange: (html: string) => void;
  /** Opens the media library and resolves with a URL, or null if cancelled. */
  onPickImage?: () => Promise<string | null>;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // contentEditable can't be server-rendered without React and the browser
  // disagreeing about the DOM, so the surface appears after mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Seed the DOM once. After that the element owns its own content — writing
  // `value` back on every keystroke would fight the caret.
  useEffect(() => {
    if (mounted && editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [mounted, value]);

  function exec(command: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  async function insertLink() {
    const url = window.prompt("Link URL");
    if (!url) return;
    // A link the browser would treat as script is refused outright.
    if (/^\s*(javascript|vbscript):/i.test(url)) {
      window.alert("That link type isn't allowed.");
      return;
    }
    exec("createLink", url);
  }

  async function insertImage() {
    const url = onPickImage ? await onPickImage() : window.prompt("Image URL");
    if (url) exec("insertImage", url);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg/50">
      <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-2">
        {COMMANDS.map((group, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <span className="mx-1 h-5 w-px bg-line" />}
            {group.map((command) => (
              <ToolbarButton
                key={command.label}
                label={command.label}
                icon={command.icon}
                onClick={() => command.run(exec)}
              />
            ))}
          </div>
        ))}

        <span className="mx-1 h-5 w-px bg-line" />
        <ToolbarButton label="Link" icon={Link2} onClick={insertLink} />
        <ToolbarButton label="Image" icon={ImageIcon} onClick={insertImage} />
      </div>

      {mounted ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Content"
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onBlur={(e) => onChange(e.currentTarget.innerHTML)}
          className={cn(
            "min-h-[320px] max-w-none px-4 py-3 text-sm leading-relaxed text-ink-2 outline-none",
            "[&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink",
            "[&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink",
            "[&_p]:my-2 [&_a]:text-brand-3 [&_a]:underline",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-2/60 [&_blockquote]:pl-4 [&_blockquote]:text-ink",
            "[&_pre]:my-3 [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs",
            "[&_img]:my-3 [&_img]:rounded-lg",
          )}
        />
      ) : (
        <div className="min-h-[320px] px-4 py-3 text-sm text-ink-3">Loading editor…</div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // Keeps the text selection alive — a click that stole focus would make
      // every command apply to nothing.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
