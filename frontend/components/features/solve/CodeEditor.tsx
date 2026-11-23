"use client";

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Compartment, EditorState, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import {
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import type { LanguageId } from "@/services/solve/languages";

const grammar = (language: LanguageId) =>
  language === "python" ? python() : language === "java" ? java() : cpp();

// The editor wears the site's colours: the tokens, not a borrowed theme.
const theme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "var(--ground)",
      color: "var(--ink)",
      fontSize: "14px",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      lineHeight: "23px",
      overflow: "auto",
    },
    ".cm-content": { padding: "14px 0", caretColor: "var(--accent)" },
    ".cm-gutters": {
      backgroundColor: "var(--ground)",
      color: "var(--ink-faint)",
      border: "none",
    },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 16px" },
    ".cm-activeLine": { backgroundColor: "var(--surface)" },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--surface)",
      color: "var(--ink)",
    },
    ".cm-cursor": { borderLeftColor: "var(--accent)", borderLeftWidth: "2px" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground":
      { backgroundColor: "var(--accent-soft)" },
    ".cm-matchingBracket": {
      backgroundColor: "transparent",
      outline: "1px solid var(--line-strong)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--surface)",
      border: "1px solid var(--line-strong)",
      borderRadius: "var(--radius-md)",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "var(--surface-sunk)",
      color: "var(--ink)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--surface-sunk)",
      border: "none",
      color: "var(--ink-muted)",
    },
  },
  { dark: true },
);
const colours = HighlightStyle.define([
  {
    tag: [t.keyword, t.controlKeyword, t.modifier],
    color: "var(--rank-expert)",
  },
  {
    tag: [t.typeName, t.className, t.namespace],
    color: "var(--rank-specialist)",
  },
  { tag: [t.string, t.character, t.special(t.string)], color: "var(--solved)" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--pending)" },
  { tag: [t.comment], color: "var(--ink-faint)", fontStyle: "italic" },
  { tag: [t.meta, t.processingInstruction], color: "var(--rank-cm)" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "var(--ink-muted)" },
]);

/**
 * The code editor. `value` is the draft; the editor reports every change and
 * takes a new value only when it differs from what it shows (another problem,
 * another language). Ctrl or Cmd with Enter runs. Tab indents, so Escape and
 * then Tab is how the keyboard leaves the editor.
 */
export default function CodeEditor({
  value,
  onChange,
  language,
  onRun,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  language: LanguageId;
  onRun?: () => void;
  label: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const grammarSlot = useRef(new Compartment());
  // the listeners below are made once; these keep them pointed at the latest props
  const latest = useRef({ onChange, onRun });
  useEffect(() => {
    latest.current = { onChange, onRun };
  });

  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                run: () => {
                  latest.current.onRun?.();
                  return true;
                },
              },
            ]),
          ),
          keymap.of([indentWithTab]),
          indentUnit.of("    "),
          grammarSlot.current.of(grammar(language)),
          theme,
          syntaxHighlighting(colours),
          EditorView.contentAttributes.of({
            "aria-label": label,
            spellcheck: "false",
            autocapitalize: "off",
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged)
              latest.current.onChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
    // The editor is built once; the effects below keep it in step with the props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value)
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({
      effects: grammarSlot.current.reconfigure(grammar(language)),
    });
  }, [language]);

  return <div ref={host} className={className} />;
}
