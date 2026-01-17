"use client";

import { useEffect, useMemo, useRef } from "react";

import { EditorView } from "codemirror";
import { keymap } from "@codemirror/view";
import { minimap } from "../../extensions/minimap";
import { customTheme } from "../../extensions/theme";
import { indentWithTab } from "@codemirror/commands";
import { customSetup } from "../../extensions/custom-setup";
import { getLanguageExtension } from "../../extensions/language";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { catppuccinMocha } from "@fsegurai/codemirror-theme-catppuccin-mocha";

export function CodeEditor({
  fileName,
  initalValues = "",
  onChange,
}: {
  fileName: string;
  initalValues?: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(
    () => getLanguageExtension(fileName),
    [fileName],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initalValues,
      parent: editorRef.current,
      extensions: [
        customSetup,
        languageExtension,
        catppuccinMocha,
        customTheme,
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.view.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [languageExtension]);

  return <div ref={editorRef} className="size-full  bg-background" />;
}
