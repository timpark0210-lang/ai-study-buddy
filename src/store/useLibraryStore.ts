import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { AppState, SourceFile, ChatMessage, ActiveView, StudySession } from '@/types';
import { uploadToBlob, syncHistoryAction } from '@/lib/actions';

// Configure LocalForage
localforage.config({
  name: 'KiaOraTutor',
  storeName: 'library_store',
  description: 'Offline storage for study materials and chat history'
});

const localForageStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await localforage.getItem<string>(name) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

// Debounce Timer Ref for JSON Overwrite API calls
let syncTimeout: NodeJS.Timeout | null = null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      activeView: 'UPLOAD',
      
      libraryFiles: [],
      sessionFiles: [],
      studySessions: [],
      currentSessionId: null,
      
      chatMessages: [
         {
             id: 'welcome',
             role: 'assistant',
             content: 'Kia Ora! How can I assist you with your studies today?',
             timestamp: Date.now()
         }
      ],
      learnedArtifacts: [],

      setActiveView: (view: ActiveView) => set({ activeView: view }),
      
      setCurrentSessionId: (id: string | null) => set({ currentSessionId: id }),

      addStudySession: (session: StudySession) => {
        set((state) => ({ studySessions: [session, ...state.studySessions] }));
        get().syncHistoryToJson(); // Auto trigger debounced sync
      },

      updateStudySession: (id: string, data: Partial<StudySession>) => {
        set((state) => ({
          studySessions: state.studySessions.map(s => s.id === id ? { ...s, ...data } : s)
        }));
        get().syncHistoryToJson(); // Auto trigger debounced sync
      },

      addFileToLibrary: async (file: SourceFile) => {
        set((state) => ({ libraryFiles: [...state.libraryFiles, file] }));
      },

      syncWithBlob: async () => {
        const { libraryFiles } = get();
        const unsyncedFiles = libraryFiles.filter(f => !f.isSynced && f.base64);
        
        if (unsyncedFiles.length === 0) return;

        for (const file of unsyncedFiles) {
          try {
            const result = await uploadToBlob(file.base64!, file.name, file.mimeType);
            if (result.success) {
              set((state) => ({
                libraryFiles: state.libraryFiles.map(f => 
                  f.id === file.id 
                    ? { ...f, isSynced: true, url: result.url, base64: undefined } 
                    : f
                )
              }));
            }
          } catch (err) {
            console.error(`Sync failed for ${file.name}:`, err);
          }
        }
      },

      // Edge-Case Defense: Debounced Cloud Overwrite (Zero-DB LMS)
      syncHistoryToJson: async () => {
        if (syncTimeout) clearTimeout(syncTimeout);
        
        syncTimeout = setTimeout(async () => {
          try {
             const { studySessions } = get();
             const jsonString = JSON.stringify(studySessions);
             await syncHistoryAction(jsonString);
             console.log("Vercel Blob user_history.json successfully backed up.");
          } catch (err) {
             console.error("History Backup Failed", err);
          }
        }, 3000); // 3 Second Debounce delay
      },

      addMessage: (msg: ChatMessage) => {
        set((state) => ({ chatMessages: [...state.chatMessages, msg] }));
      },

      clearSession: () => {
        set(() => ({
          sessionFiles: [],
          chatMessages: [
            {
               id: 'welcome',
               role: 'assistant',
               content: 'Session cleared. Kia Ora! How can I assist you next?',
               timestamp: Date.now()
            }
          ],
          learnedArtifacts: [],
          currentSessionId: null
        }));
      }
    }),
    {
      name: 'kia-ora-tutor-storage',
      storage: createJSONStorage(() => localForageStorage),
      partialize: (state) => ({ 
        libraryFiles: state.libraryFiles, 
        studySessions: state.studySessions,
        chatMessages: state.chatMessages,
        learnedArtifacts: state.learnedArtifacts,
        locale: state.locale
      }),
    }
  )
);
