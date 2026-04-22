import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import { api } from "./api";
const API = window.location.port === "5173" ? "http://localhost:4000" : window.location.origin;

export default function TaskModal({ task, onClose, onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Açıklama ekle... (görsel yapıştırmak için Ctrl+V)" }),
    ],
    editorProps: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: e.target.result })
                )
              );
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of files) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              const { schema } = view.state;
              const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const pos = coords ? coords.pos : view.state.selection.from;
              view.dispatch(
                view.state.tr.insert(pos, schema.nodes.image.create({ src: e.target.result }))
              );
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    content: task.description || "",
    onUpdate({ editor }) {
      clearTimeout(window._saveTimer);
      window._saveTimer = setTimeout(() => {
        save(editor.getHTML());
      }, 800);
    },
  });

  const save = useCallback(
    async (html) => {
      const updated = await api(`/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ description: html }) });
      onUpdate(updated);
    },
    [task.id, onUpdate]
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const addImageUrl = () => {
    const url = prompt("Görsel URL'si:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addImageFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => editor.chain().focus().setImage({ src: e.target.result }).run();
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const setLink = () => {
    const url = prompt("Link URL'si:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.text}</h2>
          <button className="btn-danger" onClick={onClose}>✕</button>
        </div>

        <div className="toolbar">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor?.isActive("bold") ? "active" : ""}><b>B</b></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor?.isActive("italic") ? "active" : ""}><i>I</i></button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor?.isActive("strike") ? "active" : ""}><s>S</s></button>
          <span className="sep" />
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive("heading", { level: 2 }) ? "active" : ""}>H2</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive("heading", { level: 3 }) ? "active" : ""}>H3</button>
          <span className="sep" />
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor?.isActive("bulletList") ? "active" : ""}>• Liste</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor?.isActive("orderedList") ? "active" : ""}>1. Liste</button>
          <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor?.isActive("codeBlock") ? "active" : ""}>{"</>"}</button>
          <span className="sep" />
          <button onClick={setLink}>🔗 Link</button>
          <button onClick={addImageFile}>🖼 Dosya</button>
          <button onClick={addImageUrl}>🔗 URL</button>
        </div>

        <EditorContent editor={editor} className="editor-content" />
        <div className="modal-footer">Otomatik kaydediliyor...</div>
      </div>
    </div>
  );
}
