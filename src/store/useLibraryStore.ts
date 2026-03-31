import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LibraryItem {
    id: string;
    title: string;
    content: string; // Plain text extraction
    mimeType: string;
    timestamp: string;
}

interface LibraryState {
    items: LibraryItem[];
    activeItemId: string | null;
    
    // Actions
    addItem: (item: LibraryItem) => void;
    removeItem: (id: string) => void;
    setActiveItem: (id: string | null) => void;
}

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set) => ({
            items: [],
            activeItemId: null,

            addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
            removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            setActiveItem: (id) => set({ activeItemId: id }),
        }),
        { name: "kiatutor-library-storage" }
    )
);
