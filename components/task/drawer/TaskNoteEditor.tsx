"use dom";
import DragHandle from "@tiptap-pro/extension-drag-handle-react";
import CharacterCount from "@tiptap/extension-character-count";
import Gapcursor from "@tiptap/extension-gapcursor";
import Underline from "@tiptap/extension-underline";
import {
  BubbleMenu,
  EditorProvider,
  FloatingMenu,
  useCurrentEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const LIMIT = 3000;
const extensions = [
  StarterKit.configure({
    bold: { HTMLAttributes: { style: "font-family: body_700" } },
  }),
  Underline,
  Gapcursor,
  CharacterCount.configure({
    limit: LIMIT,
  }),
];

const buttonStyles = (selected) => ({
  color: selected ? "blue" : "inherit",
  fontWeight: selected ? "bold" : "normal",
  border: 0,
  background: "transparent",
});

const iconStyles = (theme) => ({
  fontSize: "24px",
  fontFamily: "symbols_outlined",
  color: theme[11],
});

const MenuBar = ({ theme }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu editor={editor}>
      <div
        style={{
          background: theme[6],
          border: `2px solid ${theme[7]}`,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <button
          style={buttonStyles(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <span style={iconStyles(theme)}>format_bold</span>
        </button>
        <button
          style={buttonStyles(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <span style={iconStyles(theme)}>format_italic</span>
        </button>
        <button
          style={buttonStyles(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        >
          <span style={iconStyles(theme)}>format_underlined</span>
        </button>
        <button
          style={buttonStyles(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <span style={iconStyles(theme)}>format_list_bulleted</span>
        </button>
        <button
          style={buttonStyles(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <span style={iconStyles(theme)}>format_list_numbered</span>
        </button>
      </div>
    </BubbleMenu>
  );
};

function CreateMenuBar({ theme }) {
  const { editor } = useCurrentEditor();

  return (
    <FloatingMenu editor={editor}>
      <div
        style={{
          background: theme[6],
          border: `2px solid ${theme[7]}`,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <button
          title="Heading 1"
          style={buttonStyles(editor.isActive("heading", { level: 1 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <span style={iconStyles(theme)}>format_h1</span>
        </button>
        <button
          title="Heading 2"
          style={buttonStyles(editor.isActive("heading", { level: 2 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <span style={iconStyles(theme)}>format_h2</span>
        </button>
        <button
          title="Heading 3"
          style={buttonStyles(editor.isActive("heading", { level: 3 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <span style={iconStyles(theme)}>format_h3</span>
        </button>
        <button
          title="Bulleted list"
          style={buttonStyles(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <span style={iconStyles(theme)}>format_list_bulleted</span>
        </button>
        <button
          title="Numbered List"
          style={buttonStyles(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <span style={iconStyles(theme)}>format_list_numbered</span>
        </button>
        <button
          title="Code block"
          style={buttonStyles(editor.isActive("code"))}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
        >
          <span style={iconStyles(theme)}>code</span>
        </button>
        <button
          title="Horizontal line"
          style={buttonStyles(false)}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <span style={iconStyles(theme)}>horizontal_rule</span>
        </button>
      </div>
    </FloatingMenu>
  );
}

function CharacterCounter({ theme }) {
  const { editor } = useCurrentEditor();
  const percentage = editor
    ? Math.round((100 / LIMIT) * editor.storage.characterCount.characters())
    : 0;

  const isEditorFocused = editor?.isFocused;

  return (
    <div
      style={{
        visibility: isEditorFocused ? "visible" : "hidden",
        transition: "all 0.2s",
        display: "flex",
        overflow: "hidden",
        maxHeight: isEditorFocused ? 20 : 0,
        opacity: isEditorFocused ? 1 : 0,
        gap: 10,
      }}
    >
      <svg height="20" width="20" viewBox="0 0 20 20">
        <circle r="10" cx="10" cy="10" fill={theme[6]} />
        <circle
          r="5"
          cx="10"
          cy="10"
          fill="transparent"
          stroke={theme[11]}
          strokeWidth="10"
          strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
          transform="rotate(-90) translate(-20)"
        />
        <circle r="6" cx="10" cy="10" fill={theme[3]} />
      </svg>
      <span
        style={{
          color: theme[7],
          fontFamily: "body_700",
          fontSize: 14,
        }}
      >
        {editor.storage.characterCount.characters()} / {LIMIT}
      </span>
    </div>
  );
}

function DragHandleConfiguration({ theme }) {
  const { editor } = useCurrentEditor();

  return (
    <DragHandle editor={editor}>
      <div style={{ marginRight: -30, width: 50 }}>
        <div
          style={{
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            color: theme[11],
            opacity: 0.5,
            marginLeft: -5,
            marginTop: -2,
          }}
        >
          <span
            style={{
              fontFamily: "symbols_outlined",
              fontSize: 24,
            }}
          >
            drag_indicator
          </span>
        </div>
      </div>
    </DragHandle>
  );
}

export default function TaskNoteEditor({ theme, content }) {
  return (
    <div>
      <EditorProvider
        extensions={extensions}
        content={content}
        slotAfter={<CharacterCounter theme={theme} />}
        editorContainerProps={{
          style: {
            color: theme[12],
            paddingLeft: 30,
            paddingRight: 30,
            fontFamily: "body_400",
          },
        }}
      >
        <DragHandleConfiguration theme={theme} />
        <MenuBar theme={theme} />
        <CreateMenuBar theme={theme} />
      </EditorProvider>
    </div>
  );
}
