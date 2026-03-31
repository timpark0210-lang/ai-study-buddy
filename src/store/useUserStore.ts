import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
    level: number;
    xp: number;
    streak: number;
    lastActiveDate: string | null;
    
    // Actions
    addXp: (amount: number) => void;
    updateStreak: () => void;
    resetUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            level: 1,
            xp: 0,
            streak: 0,
            lastActiveDate: null,

            addXp: (amount) => {
                const newXp = get().xp + amount;
                const nextLevelThreshold = get().level * 1000;
                
                if (newXp >= nextLevelThreshold) {
                    set({ 
                        level: get().level + 1, 
                        xp: newXp - nextLevelThreshold 
                    });
                } else {
                    set({ xp: newXp });
                }
            },

            updateStreak: () => {
                const today = new Date().toISOString().split("T")[0];
                const lastDate = get().lastActiveDate;

                if (!lastDate) {
                    set({ streak: 1, lastActiveDate: today });
                    return;
                }

                if (lastDate === today) return;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];

                if (lastDate === yesterdayStr) {
                    set({ streak: get().streak + 1, lastActiveDate: today });
                } else {
                    set({ streak: 1, lastActiveDate: today });
                }
            },

            resetUser: () => set({ level: 1, xp: 0, streak: 0, lastActiveDate: null }),
        }),
        { name: "kiatutor-user-storage" }
    )
);
