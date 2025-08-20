// src/lib/redux/features/scheduleDraftSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WizardData } from '@/types';
import { setInitialData } from './wizardSlice'; // Centralized data management

const DRAFTS_STORAGE_KEY = 'scheduleDrafts';

export interface ClientScheduleDraft {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    data: WizardData;
}

interface DraftState {
    drafts: ClientScheduleDraft[];
    activeDraft: ClientScheduleDraft | null;
}

const initialState: DraftState = {
    drafts: [],
    activeDraft: null,
};

const scheduleDraftSlice = createSlice({
    name: 'scheduleDraft',
    initialState,
    reducers: {
        loadDraftsFromStorage: (state) => {
            try {
                const storedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
                if (storedDrafts) {
                    state.drafts = JSON.parse(storedDrafts);
                    state.activeDraft = state.drafts.find(d => d.isActive) || null;
                }
            } catch (error) {
                console.error("Failed to load drafts from localStorage:", error);
                state.drafts = [];
            }
        },
        saveDraftToStorage: (state, action: PayloadAction<ClientScheduleDraft>) => {
            const newDraft = action.payload;
            const existingIndex = state.drafts.findIndex(d => d.id === newDraft.id);

            if (existingIndex !== -1) {
                state.drafts[existingIndex] = newDraft;
            } else {
                state.drafts.push(newDraft);
            }
            
            if (newDraft.isActive) {
                state.drafts.forEach(draft => {
                    draft.isActive = draft.id === newDraft.id;
                });
            }

            try {
                localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(state.drafts));
            } catch (error) {
                console.error("Failed to save drafts to localStorage:", error);
            }
        },
        setActiveDraft: (state, action: PayloadAction<ClientScheduleDraft | null>) => {
            const draftToActivate = action.payload;
            state.drafts.forEach(draft => {
                draft.isActive = draft.id === draftToActivate?.id;
            });
            state.activeDraft = draftToActivate;
            try {
                localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(state.drafts));
            } catch (error) {
                 console.error("Failed to update active draft in localStorage:", error);
            }
        },
        deleteDraftFromStorage: (state, action: PayloadAction<string>) => {
            const draftIdToDelete = action.payload;
            state.drafts = state.drafts.filter(d => d.id !== draftIdToDelete);
            
            if (state.activeDraft?.id === draftIdToDelete) {
                state.activeDraft = state.drafts.length > 0 ? state.drafts[0] : null;
                if (state.activeDraft) {
                    state.activeDraft.isActive = true;
                }
            }

            try {
                localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(state.drafts));
            } catch (error) {
                console.error("Failed to save drafts after deletion:", error);
            }
        },
    },
    selectors: {
        selectAllDrafts: (state) => state.drafts,
        selectActiveDraft: (state) => state.activeDraft,
    },
});

export const { 
    loadDraftsFromStorage, 
    saveDraftToStorage, 
    setActiveDraft, 
    deleteDraftFromStorage 
} = scheduleDraftSlice.actions;

export const { selectAllDrafts, selectActiveDraft } = scheduleDraftSlice.selectors;
export default scheduleDraftSlice.reducer;
