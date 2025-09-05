// src/lib/redux/slices/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '@/types';

// Assuming OnlineUser and other related types will be defined in a central types file
// For now, let's define them here based on your provided slice
interface OnlineUser {
  id: string;
  email: string;
  role: Role;
  socketId: string;
  name: string;
}

interface SocketState {
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  invitations: any[];
  currentSession: any;
}

const initialState: SocketState = {
  isConnected: false,
  onlineUsers: [],
  invitations: [],
  currentSession: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<OnlineUser[]>) => {
      state.onlineUsers = action.payload;
    },
    addInvitation: (state, action: PayloadAction<any>) => {
      // Avoid duplicate invitations
      if (!state.invitations.some(inv => inv.sessionId === action.payload.sessionId)) {
        state.invitations.push(action.payload);
      }
    },
    removeInvitation: (state, action: PayloadAction<string>) => {
      state.invitations = state.invitations.filter(
        inv => inv.sessionId !== action.payload
      );
    },
    setCurrentSession: (state, action: PayloadAction<any>) => {
      state.currentSession = action.payload;
    },
    clearSession: (state) => {
      state.currentSession = null;
      state.invitations = [];
    }
  },
});

export const {
  setConnected,
  setOnlineUsers,
  addInvitation,
  removeInvitation,
  setCurrentSession,
  clearSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
