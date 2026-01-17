import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { Extension } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";

export const getLanguageExtension = (fileName: string): Extension => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
      return javascript();

    case "jsx":
      return javascript({ jsx: true });

    case "ts":
      return javascript({ typescript: true });

    case "tsx":
      return javascript({ jsx: true, typescript: true });

    case "css":
      return css();

    case "html":
      return html();

    case "json":
      return json();

    case "mdx":
    case "md":
      return markdown();

    default:
      return [];
  }
};
