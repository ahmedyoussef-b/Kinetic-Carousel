// src/lib/redux/slices/session/thunks/sessions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActiveSession, ClassRoom, Poll, Quiz, SessionParticipant, QuizQuestion } from '../types';
import { SESSION_TEMPLATES } from '@/lib/constants';
import type { SafeUser, Role, SessionTemplatePoll } from '@/types';
import { addNotification } from '../../notificationSlice';

export const startSession = createAsyncThunk<ActiveSession, { 
  classId: string; 
  className: string; 
  participantIds: string[]; 
  templateId?: string 
}, { 
  rejectValue: string;
  state: { session: { classes: ClassRoom[] }, auth: { user: SafeUser | null } };
}>(
  'session/startSession',
  async ({ classId, className, participantIds, templateId }, { rejectValue, getState, dispatch }) => {
    const state = getState();
    const host = state.auth.user;
    const selectedClass = state.session.classes.find((c: ClassRoom) => c.id.toString() === classId);

    if (!host || !selectedClass) return rejectValue('Host or class data not found');

    const participants: SessionParticipant[] = selectedClass.students
      .filter((s: SessionParticipant) => participantIds.includes(s.id))
      .map((s: SessionParticipant) => ({ 
        ...s, 
        isInSession: true, 
        hasRaisedHand: false, 
        points: s.points || 0, 
        badges: s.badges || [], 
        isMuted: false, 
        breakoutRoomId: null 
      }));
    
    // Assurer que l'hôte (professeur) est inclus dans la liste des participants
    participants.unshift({ 
      id: host.id,
      userId: host.id,
      name: host.name || host.email, 
      email: host.email, 
      role: host.role as Role,
      img: host.img, 
      isOnline: true, 
      isInSession: true, 
      hasRaisedHand: false, 
      points: 0, 
      badges: [], 
      isMuted: false, 
      breakoutRoomId: null 
    });

    let templatePolls: Poll[] = [];
    let templateQuizzes: Quiz[] = [];
    const selectedTemplate = templateId ? SESSION_TEMPLATES.find(t => t.id === templateId) : null;
    
    if (selectedTemplate) {
      templatePolls = selectedTemplate.polls.map((p: SessionTemplatePoll) => ({
        id: `poll_${Date.now()}_${Math.random()}`, 
        question: p.question, 
        options: p.options.map((text: string, i: number) => ({ id: `opt_${i}`, text, votes: [] })), 
        isActive: false, 
        createdAt: new Date().toISOString(), 
        totalVotes: 0
      }));
      
      templateQuizzes = selectedTemplate.quizzes.map((q: Omit<Quiz, 'id' | 'startTime' | 'isActive' | 'currentQuestionIndex' | 'answers' | 'timeRemaining'>) => ({
        id: `quiz_${Date.now()}_${Math.random()}`, 
        title: q.title, 
        questions: q.questions.map((ques: Omit<QuizQuestion, 'id'>, i: number) => ({ ...ques, id: `q_${i}` })), 
        currentQuestionIndex: 0, 
        isActive: false, 
        startTime: new Date().toISOString(), 
        answers: [], 
        timeRemaining: q.questions[0]?.timeLimit || 30
      }));
    }
    
    const initialSessionPayload = {
      sessionType: 'class',
      classId,
      className,
      participants,
      hostId: host.id,
      title: className,
      polls: templatePolls,
      quizzes: templateQuizzes,
    };

    try {
      const response = await fetch('/api/chatroom/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialSessionPayload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectValue(errorData.message || 'Failed to start session on server');
      }
      const newSession: ActiveSession = await response.json();
      
      // --- DEBUGGING LOGS ---
      console.log(`[startSession Thunk] Début de l'envoi des notifications.`);
      console.log(`[startSession Thunk] Hôte ID: ${host.id}`);
      console.log(`[startSession Thunk] IDs des participants à inviter:`, participantIds);
      
      participantIds.forEach(participantId => {
          console.log(`[startSession Thunk] Traitement de l'ID du participant: ${participantId}`);
          const shouldSend = participantId !== host.id;
          console.log(`[startSession Thunk] Est-ce que ${participantId} !== ${host.id} ? ${shouldSend}`);
          
          if(shouldSend) {
              console.log(`[startSession Thunk] ✅ Envoi de la notification à ${participantId}`);
              dispatch(addNotification({
                  type: 'session_invite',
                  title: `Invitation à la session: ${className}`,
                  message: `Le professeur ${host.name} vous invite à rejoindre la session.`,
                  actionUrl: `/list/chatroom/session?sessionId=${newSession.id}`,
              }));
          } else {
              console.log(`[startSession Thunk] ❌ Notification ignorée pour l'hôte ${participantId}`);
          }
      });
       // --- FIN DES LOGS DE DÉBOGAGE ---

      return newSession;
    } catch (error) {
      return rejectValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const startMeeting = createAsyncThunk<ActiveSession, { 
  title: string; 
  participantIds: string[] 
}, { 
  rejectValue: string;
  state: { session: { meetingCandidates: SessionParticipant[] }, auth: { user: SafeUser | null } };
}>(
  'session/startMeeting',
  async ({ title, participantIds }, { rejectValue, getState, dispatch }) => {
    const state = getState();
    const host = state.auth.user;
    const allCandidates = state.session.meetingCandidates;

    if (!host) return rejectValue('Host user not found');

    const participants: SessionParticipant[] = allCandidates
      .filter((p: SessionParticipant) => participantIds.includes(p.id))
      .map((p: SessionParticipant) => ({ 
        ...p, 
        isInSession: true, 
        hasRaisedHand: false, 
        points: 0, 
        badges: [], 
        isMuted: false, 
        breakoutRoomId: null 
      }));

    participants.unshift({ 
      id: host.id,
      userId: host.id,
      name: host.name || host.email, 
      email: host.email, 
      role: host.role as Role,
      img: host.img, 
      isOnline: true, 
      isInSession: true, 
      hasRaisedHand: false, 
      points: 0, 
      badges: [], 
      isMuted: false, 
      breakoutRoomId: null 
    });

    const initialSessionPayload = {
      sessionType: 'meeting',
      title,
      participants,
      hostId: host.id,
      className: title,
      classId: '',
      polls: [],
      quizzes: [],
    };

    try {
      const response = await fetch('/api/chatroom/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialSessionPayload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectValue(errorData.message || 'Failed to start meeting on server');
      }
       const newSession: ActiveSession = await response.json();

      // Dispatch notifications for meetings too
      console.log(`[startMeeting Thunk] Début de l'envoi des notifications de réunion.`);
      console.log(`[startMeeting Thunk] Hôte ID: ${host.id}`);
      console.log(`[startMeeting Thunk] IDs des participants à inviter:`, participantIds);

      participantIds.forEach(participantId => {
        console.log(`[startMeeting Thunk] Traitement de l'ID du participant: ${participantId}`);
        const shouldSend = participantId !== host.id;
        console.log(`[startMeeting Thunk] Est-ce que ${participantId} !== ${host.id} ? ${shouldSend}`);

        if(shouldSend) {
          console.log(`[startMeeting Thunk] ✅ Envoi de la notification à ${participantId}`);
          dispatch(addNotification({
              type: 'session_invite',
              title: `Invitation à la réunion: ${title}`,
              message: `${host.name} vous invite à rejoindre la réunion.`,
              actionUrl: `/list/chatroom/session?sessionId=${newSession.id}`,
          }));
        } else {
           console.log(`[startMeeting Thunk] ❌ Notification ignorée pour l'hôte ${participantId}`);
        }
      });

      return newSession;
    } catch (error) {
      return rejectValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchSessionState = createAsyncThunk(
  'session/fetchState', 
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatroom/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session state');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const endSession = createAsyncThunk(
  'session/endSession', 
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatroom/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to end session');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);
