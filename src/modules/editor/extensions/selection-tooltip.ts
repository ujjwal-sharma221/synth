import { EditorState, StateField } from "@codemirror/state";
import { Tooltip, EditorView, showTooltip } from "@codemirror/view";
import { quickEditState, showQuickEditEffect } from "./quick-edit";

let editorView: EditorView | null = null;

const createTooltipForSelection = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) return [];

  const isQuickEditActive = state.field(quickEditState);
  if (isQuickEditActive) return [];

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,

      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";

        const addToChatButton = document.createElement("button");
        addToChatButton.textContent = "Add to Chat";
        addToChatButton.className =
          "font-sans px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md transition-colors duration-150";

        const quickEditButton = document.createElement("button");
        quickEditButton.className =
          "font-sans px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md transition-colors duration-150";

        const quickEditButtonText = document.createElement("span");
        quickEditButtonText.textContent = "Quick Edit";

        const quickEditButtonShortcut = document.createElement("span");
        quickEditButtonShortcut.textContent = "(CMD-k)";
        quickEditButtonShortcut.className = "text-xs text-muted-foreground";

        quickEditButton.appendChild(quickEditButtonText);
        quickEditButton.appendChild(quickEditButtonShortcut);

        addToChatButton.onclick = () => {
          // Placeholder for Add to Chat functionality
          console.log("Add to Chat clicked");
        };

        quickEditButton.onclick = () => {
          if (editorView) {
            editorView.dispatch({
              effects: showQuickEditEffect.of(true),
            });
          }
        };

        dom.appendChild(addToChatButton);
        dom.appendChild(quickEditButton);

        return {
          dom,
        };
      },
    },
  ];
};

const selectionTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createTooltipForSelection(state);
  },

  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createTooltipForSelection(transaction.state);
    }

    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return createTooltipForSelection(transaction.state);
      }
    }

    return tooltips;
  },

  provide: (field) =>
    showTooltip.computeN([field], (state) => {
      return state.field(field);
    }),
});

const captureViewExtension = EditorView.updateListener.of((update) => {
  editorView = update.view;
});

export const selectionTooltip = () => [
  selectionTooltipField,
  captureViewExtension,
];
