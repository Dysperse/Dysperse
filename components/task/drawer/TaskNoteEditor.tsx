"use dom";
import CharacterCount from "@tiptap/extension-character-count";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDOMImperativeHandle } from "expo/dom";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useDebounce } from "use-debounce";

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
  Image,
  Placeholder.configure({
    placeholder: "Add a note…",
  }),

  Dropcursor,
  Link.configure({
    openOnClick: true,
    autolink: true,
    linkOnPaste: true,
    defaultProtocol: "https",
    protocols: ["http", "https", "mailto"],
  }),
];

function CharacterCounter({ theme }) {
  const { editor } = useCurrentEditor();
  const percentage = editor
    ? Math.round((100 / LIMIT) * editor.storage.characterCount.characters())
    : 0;

  const isEditorFocused = editor?.isFocused;

  return (
    percentage > 75 && (
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
    )
  );
}

function Focuser({ showEditorWhenEmpty, containerRef, openLink }) {
  const { editor } = useCurrentEditor();

  useEffect(() => {
    if (editor.isEmpty && !showEditorWhenEmpty) {
      editor.commands.focus();
    }
  }, [editor]);

  useEffect(() => {
    const t = (event) => {
      if (event.target.tagName === "A") {
        event.preventDefault();
        event.stopPropagation();
        editor.commands.blur();
        openLink(event.target.href);
        setTimeout(() => {
          editor.commands.blur();
        }, 1);
      }
    };

    containerRef.current?.addEventListener("mousedown", t);
    containerRef.current?.addEventListener("click", t);

    return () => {
      containerRef.current?.removeEventListener("mousedown", t);
      containerRef.current?.removeEventListener("click", t);
    };
  });

  return null;
}

const EditorRef = forwardRef((_, ref) => {
  const { editor } = useCurrentEditor();

  useImperativeHandle(ref, () => ({
    editor,
  }));

  return null;
});

function Saver({ updateTask }) {
  const { editor } = useCurrentEditor();
  const [debouncedSave] = useDebounce(async () => {
    const content = editor.getHTML();
    updateTask({ note: editor.isEmpty ? null : content });
  }, 5000);

  useEffect(() => {
    const save = async () => {
      const content = editor.getHTML();
      updateTask({ note: editor.isEmpty ? null : content });
    };

    window.addEventListener("blur", () => editor.commands.blur());

    editor.on("blur", save);
    editor.on("update", debouncedSave);

    return () => {
      editor.off("blur", save);
      editor.off("update", debouncedSave);
    };
  }, [editor, updateTask, debouncedSave]);

  return null;
}

function FormatMenuSetter({ setSelectionState }) {
  const { editor } = useCurrentEditor();

  useEffect(() => {
    const handleUpdate = () => {
      setSelectionState({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
      });
    };

    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
    };
  }, [editor, setSelectionState]);

  return null;
}

export default forwardRef<any, object>(function TaskNoteEditor(
  {
    theme,
    content,
    setFocused,
    updateTask,
    setSelectionState,
    showEditorWhenEmpty,
    onContainerFocus,
    openLink,
  }: any,
  ref
) {
  const editorRef = useRef<any>(null);

  useDOMImperativeHandle(
    ref,
    () => ({
      editor: editorRef.current.editor,
      focus: () => editorRef.current.editor.commands.focus(),
      insertImage: (url) =>
        editorRef.current.editor
          .chain()
          .focus()
          .insertContent(`<img src="${url}" /> `)
          .run(),

      insertHeading: (level) =>
        editorRef.current.editor.chain().focus().toggleHeading({ level }).run(),

      insertLink: (link) =>
        editorRef.current.editor
          .chain()
          .focus()
          .insertContent(
            `<a href="${link.url}" target="_blank">${
              link.name || link.url
            }</a> `
          )
          .run(),
      toggleBulletList: () =>
        editorRef.current.editor.chain().focus().toggleBulletList().run(),
      toggleCodeBlock: () =>
        editorRef.current.editor.chain().focus().toggleCodeBlock().run(),
      setHorizontalRule: () =>
        editorRef.current.editor.chain().focus().setHorizontalRule().run(),

      toggleBold: () =>
        editorRef.current.editor.chain().focus().toggleBold().run(),
      toggleItalic: () =>
        editorRef.current.editor.chain().focus().toggleItalic().run(),
      toggleUnderline: () =>
        editorRef.current.editor.chain().focus().toggleUnderline().run(),
    }),
    []
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef) {
      const element = containerRef.current;

      element.addEventListener("focusout", (event) => {
        element.spellcheck = false;
        if (!element.matches(":focus-within")) {
          setFocused(false);
          const selection = window.getSelection();
          selection?.removeAllRanges();
        }
      });

      element.addEventListener("focusin", () => {
        element.spellcheck = true;
        setFocused(true);
      });
    }
  }, []);

  return (
    <div
      className="prose"
      spellCheck={false}
      ref={containerRef}
      tabIndex={0}
      onFocus={(e) => {
        if (e.target.classList.contains("prose")) {
          e.target.blur();
          onContainerFocus?.();
        }
      }}
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        padding: "0 15px",
      }}
      onMouseDown={() => editorRef.current.editor.commands.focus()}
      onClick={() => editorRef.current.editor.commands.focus()}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />
      <style>
        {/* @ts-expect-error yeah */}
        {typeof ReactNativeWebView !== "undefined" &&
          `* {font-family: 'Jost', sans-serif!important;}`}
        {`.prose img{display:block;height:auto;margin:0;margin-bottom:4px;max-width:100%;cursor:default;border-radius:20px}.prose:focus-within img.ProseMirror-selectednode{outline:5px solid ${theme[8]}}code{font-family: 'mono', pre!important}.tiptap{outline:none}`}
        {`.prose h2 { margin: 10px 0}`}
        {`p.is-editor-empty:first-child::before{color:${theme[6]};content:attr(data-placeholder);font-family:body_300;float:left;height:0;pointer-events:none}`}
        {`.prose{color:var(--tw-prose-body);max-width:65ch;--tw-prose-body:${theme[11]};--tw-prose-headings:${theme[11]};--tw-prose-lead:${theme[6]};--tw-prose-links:${theme[11]};--tw-prose-bold:${theme[11]};--tw-prose-counters:${theme[9]};--tw-prose-bullets:${theme[6]};--tw-prose-hr:${theme[3]};--tw-prose-quotes:${theme[11]};--tw-prose-quote-borders:${theme[3]};--tw-prose-captions:${theme[5]};--tw-prose-kbd:${theme[11]};--tw-prose-kbd-shadows:17 24 39;--tw-prose-code:${theme[11]};--tw-prose-pre-code:${theme[3]};--tw-prose-pre-bg:${theme[10]};--tw-prose-th-borders:${theme[4]};--tw-prose-td-borders:${theme[3]};--tw-prose-invert-body:${theme[4]};--tw-prose-invert-headings:${theme[12]};--tw-prose-invert-lead:${theme[4]};--tw-prose-invert-links:${theme[12]};--tw-prose-invert-bold:${theme[12]};--tw-prose-invert-counters:${theme[4]};--tw-prose-invert-bullets:${theme[6]};--tw-prose-invert-hr:${theme[11]};--tw-prose-invert-quotes:${theme[1]};--tw-prose-invert-quote-borders:${theme[11]};--tw-prose-invert-captions:${theme[4]};--tw-prose-invert-kbd:${theme[12]};--tw-prose-invert-kbd-shadows:255 255 255;--tw-prose-invert-code:${theme[12]};--tw-prose-invert-pre-code:${theme[4]};--tw-prose-invert-pre-bg:rgb(0 0 0 / 50%);--tw-prose-invert-th-borders:${theme[6]};--tw-prose-invert-td-borders:${theme[11]};font-size:1rem;line-height:1.75}.prose :where(p):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em}.prose :where([class~=lead]):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-lead);font-size:1.25em;line-height:1.6;margin-top:1.2em;margin-bottom:1.2em}.prose :where(a):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-links);text-decoration:underline;font-family: 'body_500', 'Jost', sans-serif;font-weight: 500}.prose :where(strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-bold);font-family: 'body_600', 'Jost', sans-serif;font-weight: 600}.prose :where(a strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(blockquote strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(thead th strong):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(ol):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:decimal;margin-top:1.25em;margin-bottom:1.25em;padding-left:1.625em}.prose :where(ol[type="A"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-alpha}.prose :where(ol[type="a"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-alpha}.prose :where(ol[type="A" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-alpha}.prose :where(ol[type="a" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-alpha}.prose :where(ol[type="I"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-roman}.prose :where(ol[type="i"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-roman}.prose :where(ol[type="I" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:upper-roman}.prose :where(ol[type="i" s]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:lower-roman}.prose :where(ol[type="1"]):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:decimal}.prose :where(ul):not(:where([class~=not-prose],[class~=not-prose] *)){list-style-type:disc;margin-top:1.25em;margin-bottom:1.25em;padding-left:1.625em}.prose :where(ol > li):not(:where([class~=not-prose],[class~=not-prose] *))::marker{font-family: 'body_400', 'Jost', sans-serif;font-weight: 400;color:var(--tw-prose-counters)}.prose :where(ul > li):not(:where([class~=not-prose],[class~=not-prose] *))::marker{color:var(--tw-prose-bullets)}.prose :where(dt):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-family: 'body_600', 'Jost', sans-serif;font-weight: 600;margin-top:1.25em}.prose :where(hr):not(:where([class~=not-prose],[class~=not-prose] *)){border-color:var(--tw-prose-hr);border-top-width:1px;margin-top:0.5em;margin-bottom:0.5em}.prose :where(blockquote):not(:where([class~=not-prose],[class~=not-prose] *)){font-family: 'body_500', 'Jost', sans-serif;font-weight: 500;font-style:italic;color:var(--tw-prose-quotes);border-left-width:.25rem;border-left-color:var(--tw-prose-quote-borders);quotes:"\\201C""\\201D""\\2018""\\2019";margin-top:1.6em;margin-bottom:1.6em;padding-left:1em}.prose :where(blockquote p:first-of-type):not(:where([class~=not-prose],[class~=not-prose] *))::before{content:open-quote}.prose :where(blockquote p:last-of-type):not(:where([class~=not-prose],[class~=not-prose] *))::after{content:close-quote}.prose :where(h1):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-family: 'body_800', 'Jost', sans-serif;font-weight: 800;font-size:2.25em;margin-top:0;margin-bottom:.8888889em;line-height:1.1111111}.prose :where(h1 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-family: 'body_900', 'Jost', sans-serif;font-weight: 900;color:inherit}.prose :where(h2):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-family: 'body_700', 'Jost', sans-serif;font-weight: 700;font-size:1.5em;margin-top:2em;margin-bottom:1em;line-height:1.3333333}.prose :where(h2 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-family: 'body_800', 'Jost', sans-serif;font-weight: 800;color:inherit}.prose :where(h3):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-family: 'body_600', 'Jost', sans-serif;font-weight: 600;font-size:1.25em;margin-top:1.6em;margin-bottom:.6em;line-height:1.6}.prose :where(h3 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-family: 'body_700', 'Jost', sans-serif;font-weight: 700;color:inherit}.prose :where(h4):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-family: 'body_600', 'Jost', sans-serif;font-weight: 600;margin-top:1.5em;margin-bottom:.5em;line-height:1.5}.prose :where(h4 strong):not(:where([class~=not-prose],[class~=not-prose] *)){font-family: 'body_700', 'Jost', sans-serif;font-weight: 700;color:inherit}.prose :where(img):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(picture):not(:where([class~=not-prose],[class~=not-prose] *)){display:block;margin-top:2em;margin-bottom:2em}.prose :where(kbd):not(:where([class~=not-prose],[class~=not-prose] *)){font-family: 'body_500', 'Jost', sans-serif;font-weight: 500;font-family:inherit;color:var(--tw-prose-kbd);box-shadow:0 0 0 1px rgb(var(--tw-prose-kbd-shadows) / 10%),0 3px 0 rgb(var(--tw-prose-kbd-shadows) / 10%);font-size:.875em;border-radius:.3125rem;padding:.1875em .375em}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-code);font-family: 'body_600', 'Jost', sans-serif;font-weight: 600;font-size:.875em}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *))::before{content:"\`"}.prose :where(code):not(:where([class~=not-prose],[class~=not-prose] *))::after{content:"\`"}.prose :where(a code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(h1 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(h2 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-size:.875em}.prose :where(h3 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit;font-size:.9em}.prose :where(h4 code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(blockquote code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(thead th code):not(:where([class~=not-prose],[class~=not-prose] *)){color:inherit}.prose :where(pre):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-pre-code);background-color:var(--tw-prose-pre-bg);overflow-x:auto;font-family: 'body_400', 'Jost', sans-serif;font-weight: 400;font-size:.875em;line-height:1.7142857;margin-top:1.7142857em;margin-bottom:1.7142857em;border-radius:.375rem;padding:.8571429em 1.1428571em}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *)){background-color:transparent;border-width:0;border-radius:0;padding:0;font-weight:inherit;color:inherit;font-size:inherit;font-family:inherit;line-height:inherit}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *))::before{content:none}.prose :where(pre code):not(:where([class~=not-prose],[class~=not-prose] *))::after{content:none}.prose :where(table):not(:where([class~=not-prose],[class~=not-prose] *)){width:100%;table-layout:auto;text-align:left;margin-top:2em;margin-bottom:2em;font-size:.875em;line-height:1.7142857}.prose :where(thead):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:1px;border-bottom-color:var(--tw-prose-th-borders)}.prose :where(thead th):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-headings);font-family: 'body_600', 'Jost', sans-serif;font-weight: 600;vertical-align:bottom;padding-right:.5714286em;padding-bottom:.5714286em;padding-left:.5714286em}.prose :where(tbody tr):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:1px;border-bottom-color:var(--tw-prose-td-borders)}.prose :where(tbody tr:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){border-bottom-width:0}.prose :where(tbody td):not(:where([class~=not-prose],[class~=not-prose] *)){vertical-align:baseline}.prose :where(tfoot):not(:where([class~=not-prose],[class~=not-prose] *)){border-top-width:1px;border-top-color:var(--tw-prose-th-borders)}.prose :where(tfoot td):not(:where([class~=not-prose],[class~=not-prose] *)){vertical-align:top}.prose :where(figure > *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0;margin-bottom:0}.prose :where(figcaption):not(:where([class~=not-prose],[class~=not-prose] *)){color:var(--tw-prose-captions);font-size:.875em;line-height:1.4285714;margin-top:.8571429em}.prose :where(picture > img):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0;margin-bottom:0}.prose :where(video):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(li):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.5em;margin-bottom:.5em}.prose :where(ol > li):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:.375em}.prose :where(ul > li):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:.375em}.prose :where(.prose > ul > li p):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.75em;margin-bottom:.75em}.prose :where(.prose > ul > li > :first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em}.prose :where(.prose > ul > li > :last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:1.25em}.prose :where(.prose > ol > li > :first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em}.prose :where(.prose > ol > li > :last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:1.25em}.prose :where(ul ul,ul ol,ol ul,ol ol):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.75em;margin-bottom:.75em}.prose :where(dl):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:1.25em;margin-bottom:1.25em}.prose :where(dd):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:.5em;padding-left:1.625em}.prose :where(hr + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(h2 + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(h3 + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(h4 + *):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(thead th:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:0}.prose :where(thead th:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-right:0}.prose :where(tbody td,tfoot td):not(:where([class~=not-prose],[class~=not-prose] *)){padding:.5714286em}.prose :where(tbody td:first-child,tfoot td:first-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-left:0}.prose :where(tbody td:last-child,tfoot td:last-child):not(:where([class~=not-prose],[class~=not-prose] *)){padding-right:0}.prose :where(figure):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:2em;margin-bottom:2em}.prose :where(.prose > :first-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-top:0}.prose :where(.prose > :last-child):not(:where([class~=not-prose],[class~=not-prose] *)){margin-bottom:0}`}
      </style>
      <EditorProvider
        extensions={extensions}
        content={content}
        slotAfter={<CharacterCounter theme={theme} />}
        editorContainerProps={{
          style: {
            fontFamily: "'body_400', 'Jost', sans-serif",
          },
          className: "editor-container",
          onKeyDown: (e) => {
            if (e.key === "Escape") {
              e.target.blur();

              const selection = window.getSelection();
              selection?.removeAllRanges();
            }
          },
        }}
      >
        <Saver updateTask={updateTask} />
        <Focuser
          openLink={openLink}
          showEditorWhenEmpty={showEditorWhenEmpty}
          containerRef={containerRef}
          setFocused={setFocused}
        />
        <EditorRef ref={editorRef} />
        <FormatMenuSetter setSelectionState={setSelectionState} />
      </EditorProvider>
    </div>
  );
});

