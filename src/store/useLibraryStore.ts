import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { AppState, SourceFile, ChatMessage } from '@/types';

// Configure LocalForage
localforage.config({
  name: 'KiaOraTutor',
  storeName: 'library_store',
  description: 'Offline storage for study materials and chat history'
});

// Custom storage engine for Zustand using LocalForage
const localForageStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await localforage.getItem<string>(name);
    return value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      libraryFiles: [],
      sessionFiles: [],
      chatMessages: [
         {
             id: 'welcome',
             role: 'assistant',
             content: 'Kia Ora! How can I assist you with your studies today?',
             timestamp: Date.now()
         }
      ],
      learnedArtifacts: [],

      addFileToLibrary: async (file: SourceFile) => {
        set((state) => ({
          libraryFiles: [...state.libraryFiles, file]
        }));
      },

      syncWithBlob: async () => {
        // Implementation will call Server Actions to upload to Vercel Blob
        // It should update the 'isSynced' and 'url' properties
        console.log('Syncing outstanding files with Vercel Blob...');
      },

      addMessage: (msg: ChatMessage) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, msg]
        }));
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
          learnedArtifacts: []
        }));
      }
    }),
    {
      name: 'kia-ora-tutor-storage',
      storage: createJSONStorage(() => localForageStorage),
      partialize: (state) => ({ 
        libraryFiles: state.libraryFiles, 
        chatMessages: state.chatMessages,
        learnedArtifacts: state.learnedArtifacts,
        locale: state.locale
      }), // only persist these fields
    }
  )
);
