// src/lib/redux/slices/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState, type ActiveSession, type SessionState, SessionParticipant } from './session/types';
import type { RootState } from '../store'; // Import RootState

// Thunks
import { 
  fetchChatroomClasses, 
  fetchMeetingParticipants, 
  startSession, 
  startMeeting, 
  fetchSessionState, 
  endSession,
  sendMessage,
  raiseHand,
  lowerHand,
} from './session/thunks';

// Reducers
import { participantReducers } from './session/reducers/participants';
import { handRaiseReducers } from './session/reducers/handRaise';
import { reactionReducers } from './session/reducers/reactions';
import { pollReducers } from './session/reducers/polls';
import { quizReducers } from './session/reducers/quizzes';
import { rewardReducers } from './session/reducers/rewards';
import { timerReducers } from './session/reducers/timer';
import { audioReducers } from './session/reducers/audio';
import { spotlightReducers } from './session/reducers/spotlight';
import { breakoutRoomReducers } from './session/reducers/breakoutRooms';
import { chatReducers } from './session/reducers/chat';

const ensureSessionArrays = (session: ActiveSession): ActiveSession => ({
  ...session,
  participants: session.participants || [],
  raisedHands: session.raisedHands || [],
  reactions: session.reactions || [],
  polls: session.polls || [],
  quizzes: session.quizzes || [],
  rewardActions: session.rewardActions || [],
  messages: session.messages || [],
});


const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    ...participantReducers,
    ...handRaiseReducers,
    ...reactionReducers,
    ...pollReducers,
    ...quizReducers,
    ...rewardReducers,
    ...timerReducers,
    ...audioReducers,
    ...spotlightReducers,
    ...breakoutRoomReducers,
    ...chatReducers,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chatroom Classes
      .addCase(fetchChatroomClasses.pending, (state) => { state.loading = true; })
      .addCase(fetchChatroomClasses.fulfilled, (state, action) => {
        state.classes = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatroomClasses.rejected, (state) => { state.loading = false; })
      
      // Fetch Meeting Participants
      .addCase(fetchMeetingParticipants.pending, (state) => { state.loading = true; })
      .addCase(fetchMeetingParticipants.fulfilled, (state, action: PayloadAction<SessionParticipant[]>) => {
        state.meetingCandidates = action.payload;
        state.loading = false;
      })
      .addCase(fetchMeetingParticipants.rejected, (state) => { state.loading = false; })
      
      // Start Session / Meeting
      .addCase(startSession.pending, (state) => { state.loading = true; })
      .addCase(startSession.fulfilled, (state, action: PayloadAction<ActiveSession>) => {
        state.activeSession = ensureSessionArrays(action.payload);
        state.loading = false;
      })
      .addCase(startSession.rejected, (state) => { state.loading = false; })
      .addCase(startMeeting.pending, (state) => { state.loading = true; })
      .addCase(startMeeting.fulfilled, (state, action: PayloadAction<ActiveSession>) => {
        state.activeSession = ensureSessionArrays(action.payload);
        state.loading = false;
      })
      .addCase(startMeeting.rejected, (state) => { state.loading = false; })
      
      // Fetch Session State
      .addCase(fetchSessionState.pending, (state) => { state.loading = false; }) // Don't show full screen loader for polls
      .addCase(fetchSessionState.fulfilled, (state, action: PayloadAction<ActiveSession>) => {
        state.activeSession = ensureSessionArrays(action.payload);
        state.loading = false;
      })
      .addCase(fetchSessionState.rejected, (state) => { state.loading = false; })
      
      // End Session
      .addCase(endSession.fulfilled, (state) => {
        state.activeSession = null;
        state.selectedClass = null;
        state.selectedStudents = [];
        state.selectedTeachers = [];
      })
      
      // Send Message (in-session)
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.activeSession) {
            state.activeSession.messages.push(action.payload);
        }
      })
      
      // Raise/Lower Hand
      .addCase(raiseHand.fulfilled, (state, action: PayloadAction<ActiveSession>) => {
        state.activeSession = ensureSessionArrays(action.payload);
      })
      .addCase(lowerHand.fulfilled, (state, action: PayloadAction<ActiveSession>) => {
        state.activeSession = ensureSessionArrays(action.payload);
      });
  },
});

export const {
  setSelectedClass,
  toggleStudentSelection,
  toggleTeacherSelection,
  moveParticipant,
  removeStudentFromSession,
  addStudentToSession,
  updateStudentPresence,
  clearAllRaisedHands,
  sendReaction,
  clearReactions,
  createPoll,
  votePoll,
  endPoll,
  createQuiz,
  answerQuiz,
  nextQuizQuestion,
  updateQuizTimer,
  endQuiz,
  awardReward,
  awardParticipationPoints,
  setTimer,
  toggleTimer,
  resetTimer,
  stopTimer,
  tickTimer,
  toggleMute,
  muteAllStudents,
  unmuteAllStudents,
  toggleSpotlight,
  createBreakoutRooms,
  endBreakoutRooms,
  breakoutTimerTick,
  sendGeneralMessage,
  clearChatMessages
} = sessionSlice.actions;

// New selector for the entire session state slice
export const selectSessionState = (state: RootState): SessionState => state.session;


export default sessionSlice.reducer;
export * from './session/thunks';
