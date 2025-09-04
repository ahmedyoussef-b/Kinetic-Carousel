// src/lib/redux/features/students/studentsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Student } from '@/types';
import { entityApi } from '../../api/entityApi';

export type StudentsState = {
  items: Array<Student>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: StudentsState = {
  items: [],
  status: 'idle',
  error: null,
};


export const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setAllStudents(state, action: PayloadAction<Student[]>) {
      state.items = action.payload;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      entityApi.endpoints.getStudents.matchFulfilled,
      (state, { payload }) => {
        state.items = payload as Student[];
        state.status = 'succeeded';
      }
    )
  },
  selectors: {
    selectAllStudents: (state) => state.items,
    getStudentsStatus: (state) => state.status,
    getStudentsError: (state) => state.error,
  }
});

export const { setAllStudents } = studentsSlice.actions;
export const { selectAllStudents, getStudentsStatus, getStudentsError } = studentsSlice.selectors;
export default studentsSlice.reducer;
