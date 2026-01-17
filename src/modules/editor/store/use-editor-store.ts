import { create } from "zustand";

import { Id } from "../../../../convex/_generated/dataModel";

interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;
  getTabState: (projectId: Id<"projects">) => TabState;

  openFile: ({
    projectId,
    fileId,
    options,
  }: {
    projectId: Id<"projects">;
    fileId: Id<"files">;
    options: { pinned: boolean };
  }) => void;

  closeTab: ({
    projectId,
    fileId,
  }: {
    projectId: Id<"projects">;
    fileId: Id<"files">;
  }) => void;

  closeAllTabs: (project: Id<"projects">) => void;

  setActiveTab: ({
    projectId,
    fileId,
  }: {
    projectId: Id<"projects">;
    fileId: Id<"files">;
  }) => void;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: new Map(),

  getTabState: (projectId) => {
    return get().tabs.get(projectId) ?? defaultTabState;
  },

  openFile: ({ projectId, options, fileId }) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, previewTabId } = state;
    const isOpen = openTabs.includes(fileId);

    // opening as preview
    if (!isOpen && !options.pinned) {
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId ? fileId : id))
        : [...openTabs, fileId];

      tabs.set(projectId, {
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });

      set({ tabs });
      return;
    }

    // opening as pinned
    if (!isOpen && options.pinned) {
      tabs.set(projectId, {
        ...state,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      });

      set({ tabs });
      return;
    }

    // file already open - just active and pin if double clicked
    const shouldPin = options.pinned && previewTabId === fileId;
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });

    set({ tabs });
  },

  closeTab: ({ projectId, fileId }) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, activeTabId, previewTabId } = state;
    const tabIdx = openTabs.indexOf(fileId);

    if (tabIdx === -1) return;

    const newTabs = openTabs.filter((id) => id !== fileId);

    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIdx >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabIdx];
      }
    }

    tabs.set(projectId, {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });

    set({ tabs });
  },

  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);

    set({ tabs });
  },

  setActiveTab: ({ projectId, fileId }) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    tabs.set(projectId, { ...state, activeTabId: fileId });

    set({ tabs });
  },
}));
