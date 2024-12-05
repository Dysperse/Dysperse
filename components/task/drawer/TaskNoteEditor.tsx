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
import { useEffect } from "react";

const LIMIT = 3000;
const extensions = [
  StarterKit.configure({
    bold: { HTMLAttributes: { style: "font-family: body_700" } },
    paragraph: { HTMLAttributes: { style: "margin: 5px 0 " } },
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
  height: 40,
  width: 40,
  background: "transparent",
  aspectRatio: "1/1",
});

const iconStyles = (theme) => ({
  fontSize: "24px",
  fontFamily: "symbols_outlined",
  color: theme[11],
});

const menuStyles = (theme) => ({
  background: theme[4],
  borderRadius: 999,
  boxShadow:
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  overflow: "hidden",
});

const MenuBar = ({ theme }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu editor={editor}>
      <div style={menuStyles(theme)}>
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
      <div style={menuStyles(theme)}>
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
        transition: "all 0.2s",
        opacity: isEditorFocused ? 1 : 0,
        position: "absolute",
        bottom: 0,
        right: 0,
        margin: 20,
        marginBottom: -10,
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
    </div>
  );
}

function DragHandleConfiguration({ theme }) {
  const { editor } = useCurrentEditor();

  return (
    <DragHandle editor={editor}>
      <div style={{ marginRight: -35, width: 50 }}>
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

function Focuser({ onEmptyBlur }) {
  const { editor } = useCurrentEditor();

  useEffect(() => {
    if (editor.getHTML() === '<p style="margin: 5px 0 "></p>') {
      editor.commands.focus();
    }
  }, []);

  useEffect(() => {
    const t = () => {
      if (editor.getHTML() === '<p style="margin: 5px 0 "></p>') {
        onEmptyBlur();
      }
    };
    editor.on("blur", t);

    return () => {
      editor.off("blur", t);
    };
  }, []);
  return null;
}

export default function TaskNoteEditor({ theme, content, onEmptyBlur }) {
  return (
    <div className="prose" style={{ position: "relative" }}>
      <style>
        {`.prose{color:var(--tw-prose-body);max-width:65ch;--tw-prose-body:${theme[8]};--tw-prose-headings:${theme[11]};--tw-prose-lead:${theme[6]};--tw-prose-links:${theme[11]};--tw-prose-bold:${theme[11]};--tw-prose-counters:${theme[5]};--tw-prose-bullets:${theme[4]};--tw-prose-hr:${theme[3]};--tw-prose-quotes:${theme[11]};--tw-prose-quote-borders:${theme[3]};--tw-prose-captions:${theme[5]};--tw-prose-kbd:${theme[11]};--tw-prose-kbd-shadows:17 24 39;--tw-prose-code:${theme[11]};--tw-prose-pre-code:${theme[3]};--tw-prose-pre-bg:${theme[10]};--tw-prose-th-borders:${theme[4]};--tw-prose-td-borders:${theme[3]};--tw-prose-invert-body:${theme[4]};--tw-prose-invert-headings:${theme[12]};--tw-prose-invert-lead:${theme[4]};--tw-prose-invert-links:${theme[12]};--tw-prose-invert-bold:${theme[12]};--tw-prose-invert-counters:${theme[4]};--tw-prose-invert-bullets:${theme[6]};--tw-prose-invert-hr:${theme[8]};--tw-prose-invert-quotes:${theme[1]};--tw-prose-invert-quote-borders:${theme[8]};--tw-prose-invert-captions:${theme[4]};--tw-prose-invert-kbd:${theme[12]};--tw-prose-invert-kbd-shadows:255 255 255;--tw-prose-invert-code:${theme[12]};--tw-prose-invert-pre-code:${theme[4]};--tw-prose-invert-pre-bg:rgb(0 0 0 / 50%);--tw-prose-invert-th-borders:${theme[6]};--tw-prose-invert-td-borders:${theme[8]};font-size:1rem;line-height:1.75}.prose :where(p):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em}.prose :where([class~=lead]):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-lead);font-size:1.25em;line-height:1.6;margin-top:1.2em;margin-bottom:1.2em}.prose :where(a):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-links);text-decoration:underline;font-weight:500}.prose :where(strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-bold);font-weight:600}.prose :where(a strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(blockquote strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(thead th strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(ol):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:decimal;margin-top:1.25em;margin-bottom:1.25em;padding-left:1.625em}.prose :where(ol[type="A"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-alpha}.prose :where(ol[type="a"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-alpha}.prose :where(ol[type="A" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-alpha}.prose :where(ol[type="a" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-alpha}.prose :where(ol[type="I"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-roman}.prose :where(ol[type="i"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-roman}.prose :where(ol[type="I" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-roman}.prose :where(ol[type="i" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-roman}.prose :where(ol[type="1"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:decimal}.prose :where(ul):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:disc;margin-top:1.25em;margin-bottom:1.25em;padding-left:1.625em}.prose :where(ol > li):not(:where([class~=not-prose],[class~=not-prose] *))::marker{font-weight:400;color:var(--tw-prose-counters)}.prose :where(ul > li):not(:where([class~=not-prose],[class~=not-prose] *))::marker{color:var(--tw-prose-bullets)}.prose :where(dt):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-weight:600;margin-top:1.25em}.prose :where(hr):not(:where([class~=not-prose],[class~=not-prose] *)){border-color:var(--tw-prose-hr);border-top-width:1px;margin-top:3em;margin-bottom:3em}.prose :where(blockquote):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:500;font-style:italic;color:var(--tw-prose-quotes);border-left-width:.25rem;border-left-color:var(--tw-prose-quote-borders);quotes:"\\201C""\\201D""\\2018""\\2019";margin-top:1.6em;margin-bottom:1.6em;padding-left:1em}.prose :where(blockquote p:first-of-type):not(:where([class~=not-prose],[class~=not-prose] *))::before{content:open-quote}.prose :where(blockquote p:last-of-type):not(:where([class~=not-prose],[class~=not-prose] *))::after{content:close-quote}.prose :where(h1):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-weight:800;font-size:2.25em;margin-top:0;margin-bottom:.8888889em;line-height:1.1111111}.prose :where(h1 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:900;color:inherit}.prose :where(h2):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-weight:700;font-size:1.5em;margin-top:2em;margin-bottom:1em;line-height:1.3333333}.prose :where(h2 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:800;color:inherit}.prose :where(h3):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-weight:600;font-size:1.25em;margin-top:1.6em;margin-bottom:.6em;line-height:1.6}.prose :where(h3 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:700;color:inherit}.prose :where(h4):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-weight:600;margin-top:1.5em;margin-bottom:.5em;line-height:1.5}.prose :where(h4 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:700;color:inherit}.prose :where(img):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(picture):not(:where([class~=not-prose],[class~=not-prose] *)){display:block;margin-top:2em;margin-bottom:2em}.prose :where(kbd):not(:where([class~=not-prose],[class~=not-prose] *)){font-weight:500;font-family:inherit;color:var(--tw-prose-kbd);box-shadow:0 0 0 1px rgb(var(--tw-prose-kbd-shadows) / 10%),0 3px 0 rgb(var(--tw-prose-kbd-shadows) / 10%);font-size:.875em;border-radius:.3125rem;padding:.1875em .375em}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-code);font-weight:600;font-size:.875em}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *))::before{content:"\`"}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *))::after{content:"\`"}.prose :where(a code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(h1 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(h2 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-size:.875em}.prose :where(h3 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-size:.9em}.prose :where(h4 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(blockquote code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(thead th code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(pre):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-pre-code);background-color:var(--tw-prose-pre-bg);overflow-x:auto;font-weight:400;font-size:.875em;line-height:1.7142857;margin-top:1.7142857em;margin-bottom:1.7142857em;border-radius:.375rem;padding:.8571429em 1.1428571em}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *)){background-color:transparent;border-width:0;border-radius:0;padding:0;font-weight:inherit;color:inherit;font-size:inherit;font-family:inherit;line-height:inherit}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *))::before{content:none}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *))::after{content:none}.prose :where(table):not(:where([class~=not-prose],[class~=not-prose] *)){width:100%;table-layout:auto;text-align:left;margin-top:2em;margin-bottom:2em;font-size:.875em;line-height:1.7142857}.prose :where(thead):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:1px;border-bottom-color:var(--tw-prose-th-borders)}.prose :where(thead th):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-weight:600;vertical-align:bottom;padding-right:.5714286em;padding-bottom:.5714286em;padding-left:.5714286em}.prose :where(tbody tr):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:1px;border-bottom-color:var(--tw-prose-td-borders)}.prose :where(tbody tr:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:0}.prose :where(tbody td):not(:where([class~=not-prose],[class~=not-prose] *)){vertical-align:baseline}.prose :where(tfoot):not(:where([class~=not-prose],[class~=not-prose] *)){border-top-width:1px;border-top-color:var(--tw-prose-th-borders)}.prose :where(tfoot td):not(:where([class~=not-prose],[class~=not-prose] *)){vertical-align:top}.prose :where(figure > *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0;margin-bottom:0}.prose :where(figcaption):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-captions);font-size:.875em;line-height:1.4285714;margin-top:.8571429em}.prose :where(picture > img):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0;margin-bottom:0}.prose :where(video):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(li):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.5em;margin-bottom:.5em}.prose :where(ol > li):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:.375em}.prose :where(ul > li):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:.375em}.prose :where(.prose > ul > li p):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.75em;margin-bottom:.75em}.prose :where(.prose > ul > li > :first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em}.prose :where(.prose > ul > li > :last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:1.25em}.prose :where(.prose > ol > li > :first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em}.prose :where(.prose > ol > li > :last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:1.25em}.prose :where(ul ul,ul ol,ol ul,ol ol):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.75em;margin-bottom:.75em}.prose :where(dl):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em}.prose :where(dd):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.5em;padding-left:1.625em}.prose :where(hr + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(h2 + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(h3 + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(h4 + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(thead th:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:0}.prose :where(thead th:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-right:0}.prose :where(tbody td,tfoot td):not(:where([class~=not-prose],[class~=not-prose] *)){padding:.5714286em}.prose :where(tbody td:first-child,tfoot td:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:0}.prose :where(tbody td:last-child,tfoot td:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-right:0}.prose :where(figure):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(.prose > :first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(.prose > :last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:0}`}
      </style>
      <EditorProvider
        extensions={extensions}
        content={content}
        slotAfter={<CharacterCounter theme={theme} />}
        editorContainerProps={{
          style: {
            // color: theme[12],
            paddingLeft: 15,
            paddingRight: 30,
            fontFamily: "body_400",
          },
        }}
      >
        <Focuser onEmptyBlur={onEmptyBlur} />
        <DragHandleConfiguration theme={theme} />
        <MenuBar theme={theme} />
        <CreateMenuBar theme={theme} />
      </EditorProvider>
    </div>
  );
}
