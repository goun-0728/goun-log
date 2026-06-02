"use client";

import { useRef, useState } from "react";
import { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

type RichTextEditorProps = {
  name: string;
  defaultValue?: string;
};

export default function RichTextEditor({ name, defaultValue = "" }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const [error, setError] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          loading: "lazy",
        },
      }),
      FontSize,
    ],
    content: defaultValue || "<p></p>",
    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
  });

  if (!editor) {
    return <textarea name={name} rows={18} defaultValue={defaultValue} required />;
  }
  const activeEditor = editor;

  async function uploadBodyImage(file: File) {
    setError("");
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as { ok: boolean; url?: string; error?: string };

    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.error || "이미지 업로드에 실패했습니다.");
    }

    activeEditor.chain().focus().setImage({ src: result.url }).run();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadBodyImage(file).catch((error) => {
      setError(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
    });
  }

  function setLink() {
    const previousUrl = activeEditor.getAttributes("link").href as string | undefined;
    const href = window.prompt("링크 URL을 입력하세요.", previousUrl || "https://");
    if (href === null) return;

    if (!href.trim()) {
      activeEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const openNewWindow = window.confirm("새 창에서 열까요?");
    activeEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href,
        target: openNewWindow ? "_blank" : null,
        rel: openNewWindow ? "noopener noreferrer" : null,
      })
      .run();
  }

  return (
    <div className="rich-editor">
      <input type="hidden" name={name} value={html} />
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="rich-toolbar" aria-label="본문 편집 도구">
        <select
          aria-label="제목 스타일"
          defaultValue="paragraph"
          onChange={(event) => {
            const value = event.target.value;
            if (value === "paragraph") activeEditor.chain().focus().setParagraph().run();
            else activeEditor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 | 4 }).run();
          }}
        >
          <option value="paragraph">본문</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
        </select>
        <select
          aria-label="글자 크기"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value;
            if (value) activeEditor.chain().focus().setFontSize(value).run();
          }}
        >
          <option value="">크기</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="22px">22</option>
          <option value="28px">28</option>
          <option value="36px">36</option>
        </select>
        <button type="button" onClick={() => activeEditor.chain().focus().toggleBold().run()} aria-label="굵게">
          B
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().toggleItalic().run()} aria-label="기울임">
          I
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().toggleUnderline().run()} aria-label="밑줄">
          U
        </button>
        <label className="rich-color-control">
          글자
          <input type="color" defaultValue="#111111" onChange={(event) => activeEditor.chain().focus().setColor(event.target.value).run()} />
        </label>
        <label className="rich-color-control">
          형광
          <input
            type="color"
            defaultValue="#fff2a8"
            onChange={(event) => activeEditor.chain().focus().toggleHighlight({ color: event.target.value }).run()}
          />
        </label>
        <button type="button" onClick={() => activeEditor.chain().focus().setTextAlign("left").run()}>
          왼쪽
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().setTextAlign("center").run()}>
          가운데
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().setTextAlign("right").run()}>
          오른쪽
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().toggleBulletList().run()}>
          점 리스트
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().toggleOrderedList().run()}>
          번호 리스트
        </button>
        <button type="button" onClick={setLink}>
          링크
        </button>
        <button type="button" onClick={() => imageInputRef.current?.click()}>
          본문 이미지
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().setHorizontalRule().run()}>
          구분선
        </button>
        <button type="button" onClick={() => activeEditor.chain().focus().setHardBreak().run()}>
          줄바꿈
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="rich-hidden-file"
          onChange={handleImageChange}
        />
      </div>
      <EditorContent editor={activeEditor} />
    </div>
  );
}
