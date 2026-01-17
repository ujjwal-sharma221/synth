"use client";

import { useEffect, useRef } from "react";

import { basicSetup, EditorView } from "codemirror";
import { customTheme } from "../../extensions/theme";
import { javascript } from "@codemirror/lang-javascript";
import { catppuccinMocha } from "@fsegurai/codemirror-theme-catppuccin-mocha";

export function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: `const Greeting = ({ name }) => {
  return (
    <div className="greeting">
      {\`Hello, \${name}!\`}
    </div>
  );
};`,
      parent: editorRef.current,
      extensions: [
        basicSetup,
        javascript({ typescript: true }),
        catppuccinMocha,
        customTheme,
      ],
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} className="size-full  bg-background" />;
}
