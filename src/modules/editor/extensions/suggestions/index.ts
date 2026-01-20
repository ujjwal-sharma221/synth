import {
  Decoration,
  ViewPlugin,
  DecorationSet,
  EditorView,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { fetchSuggestions } from "./fetch";
import { StateField, StateEffect } from "@codemirror/state";

// stateEffect - a way to send messages to update the state
const setSuggestionEffect = StateEffect.define<string | null>();

//  statefield - holds our suggestions state in the editor
// create - initial state
// update - called on every transaction(something like a key stroke) to potentially update the value
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },

  update(value, transaction) {
    // check each suggestion, if we have setSuggestionEffect's value, update the value or keep the original one

    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }

    return value;
  },
});

// create custom dom element to render on the editor
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.9";
    span.style.pointerEvents = "none";
    span.style.color = "#fff";
    return span;
  }
}

let debounceTimer: number | null = null;
let isWaitingForSuggestion = false;
const debounceDelay = 300;

let currentAbortController: AbortController | null = null;

const mockSuggestions = (textBeforeCursor: string) => {
  const trimmed = textBeforeCursor.trim();
  if (trimmed.endsWith("const")) return "randomSynthEnvValue";
  if (trimmed.endsWith("function")) return "myFunction() {\n \n}";
  if (trimmed.endsWith("console.")) return "log()";
  if (trimmed.endsWith("return")) return "null";

  return null;
};

const generatePayload = ({
  view,
  fileName,
}: {
  view: EditorView;
  fileName: string;
}) => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;

  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);
  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];
  const previousLinesToFetch = Math.min(currentLine.number - 1, 5);
  for (let i = previousLinesToFetch; i >= 1; i--) {
    const line = view.state.doc.line(currentLine.number - i);
    previousLines.push(line.text);
  }

  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);
  for (let i = 1; i <= linesToFetch; i++) {
    const line = view.state.doc.line(currentLine.number + i);
    nextLines.push(line.text);
  }

  const textBeforeCursor = currentLine.text.slice(0, cursorInLine);
  const textAfterCursor = currentLine.text.slice(cursorInLine);

  return {
    fileName,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor,
    textAfterCursor,
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  };
};

const debouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      triggerSuggestion(view: EditorView) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
          currentAbortController = null;
        }

        isWaitingForSuggestion = true;
        debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload({ view, fileName });
          if (!payload) {
            isWaitingForSuggestion = false;
            view.dispatch({ effects: setSuggestionEffect.of(null) });
            return;
          }

          currentAbortController = new AbortController();
          const suggestion = await fetchSuggestions(
            payload,
            currentAbortController.signal,
          );

          // Set this BEFORE dispatching so the render plugin can see it
          isWaitingForSuggestion = false;
          view.dispatch({
            effects: [setSuggestionEffect.of(suggestion)],
          });
        }, debounceDelay);
      }

      destroy() {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
        }
      }
    },
  );
};

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      // rebuild the doc if cursor changed, suggestion changed or something along those lines

      const isSuggestionChanged = update.transactions.some((transaction) => {
        return transaction.effects.some((effect) => {
          return effect.is(setSuggestionEffect);
        });
      });

      const shouldRebuild =
        update.docChanged || update.selectionSet || isSuggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      if (isWaitingForSuggestion) {
        return Decoration.none;
      }

      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }

      // widget decoration at the cursor position
      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // render after cursor
        }).range(cursor),
      ]);
    }
  },

  { decorations: (plugin) => plugin.decorations },
);

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false; // no suggestion to accept, let tab perform normally
      }

      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: suggestion }, // insert the suggestion at the cursor position
        selection: { anchor: cursor + suggestion.length }, // move the cursor to the end of the suggestion
        effects: [setSuggestionEffect.of(null)], // clear the suggestion
      });

      return true;
    },
  },
]);

export const suggestions = (fileName: string) => [
  suggestionState, // state storage
  debouncePlugin(fileName), // debounce logic
  renderPlugin, // render logic
  acceptSuggestionKeymap, // tab to accept
];
