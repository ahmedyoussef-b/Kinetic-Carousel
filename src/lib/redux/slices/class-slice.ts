import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Student, Class } from '@/types';
import { RootState } from '../store';

interface ClassState {
  items: Class[];
  students: Student[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ClassState = {
  items: [],
  students: [],
  status: 'idle',
  error: null,
};

export const fetchAllStudents = createAsyncThunk('classes/fetchAllStudents', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/students');
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateClassStudents = createAsyncThunk(
  'classes/updateClassStudents',
  async ({ classId, studentIds }: { classId: string; studentIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to update class students');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStudents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.status = 'succeeded';
        state.students = action.payload;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateClassStudents.fulfilled, (state, action: PayloadAction<Class>) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const selectClasses = (state: RootState) => state.classes;

export default classSlice.reducer;
