import { create } from "zustand";

export type ViewMode = "chat" | "study" | "quiz";

interface ViewState {
    currentView: ViewMode;
    isLoading: boolean;
    setView: (view: ViewMode) => void;
    setLoading: (loading: boolean) => void;
}

export const useViewStore = create<ViewState>((set) => ({
    currentView: "chat",
    isLoading: false,
    setView: (view) => set({ currentView: view }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
