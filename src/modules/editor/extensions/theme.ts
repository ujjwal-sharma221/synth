import { EditorView } from "codemirror";

export const customTheme = EditorView.theme({
  "&": {
    outline: "none !important",
  },

  ".cm-content": {
    fontSize: "14px ",
    fontFamily: "var(--font-mono), monospace",
  },

  ".cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
});
