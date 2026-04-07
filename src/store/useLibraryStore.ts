import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { AppState, SourceFile, ChatMessage } from '@/types';
import { uploadToBlob } from '@/lib/actions';

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
        // Auto-trigger sync if online (Optional, but good for UX)
        // get().syncWithBlob(); 
      },

      syncWithBlob: async () => {
        const { libraryFiles } = get();
        const unsyncedFiles = libraryFiles.filter(f => !f.isSynced && f.base64);
        
        if (unsyncedFiles.length === 0) return;

        console.log(`Syncing ${unsyncedFiles.length} files with Vercel Blob...`);

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
              console.log(`Successfully synced: ${file.name}`);
            }
          } catch (err) {
            console.error(`Sync failed for ${file.name}:`, err);
          }
        }
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
