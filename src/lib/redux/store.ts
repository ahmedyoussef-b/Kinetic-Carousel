// src/lib/redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

// APIs
import { authApi } from './api/authApi';
import { entityApi } from './api/entityApi';
import { draftApi } from './api/draftApi';

// Slices
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import notificationReducer from './slices/notificationSlice';
import reportReducer from './slices/reportSlice';
import wizardReducer, { setInitialData } from './features/wizardSlice';
import schoolConfigReducer, { setSchoolConfig } from './features/schoolConfigSlice';
import classesReducer, { setAllClasses } from './features/classes/classesSlice';
import subjectsReducer, { setAllSubjects } from './features/subjects/subjectsSlice';
import teachersReducer, { setAllTeachers } from './features/teachers/teachersSlice';
import studentsReducer, { setAllStudents } from './features/students/studentsSlice';
import classroomsReducer, { setAllClassrooms } from './features/classrooms/classroomsSlice';
import gradesReducer, { setAllGrades } from './features/grades/gradesSlice';
import lessonRequirementsReducer, { setAllRequirements } from './features/lessonRequirements/lessonRequirementsSlice';
import teacherConstraintsReducer, { setAllTeacherConstraints } from './features/teacherConstraintsSlice';
import subjectRequirementsReducer, { setAllSubjectRequirements } from './features/subjectRequirementsSlice';
import teacherAssignmentsReducer, { setAllTeacherAssignments } from './features/teacherAssignmentsSlice';
import scheduleReducer, { setInitialSchedule } from './features/schedule/scheduleSlice';
import scheduleDraftReducer from './features/scheduleDraftSlice';
import attendanceReducer from './features/attendance/attendanceSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  session: sessionReducer,
  reports: reportReducer,
  notifications: notificationReducer,
  wizard: wizardReducer,
  schoolConfig: schoolConfigReducer,
  classes: classesReducer,
  subjects: subjectsReducer,
  teachers: teachersReducer,
  students: studentsReducer,
  classrooms: classroomsReducer,
  grades: gradesReducer,
  lessonRequirements: lessonRequirementsReducer,
  teacherConstraints: teacherConstraintsReducer,
  subjectRequirements: subjectRequirementsReducer,
  teacherAssignments: teacherAssignmentsReducer,
  schedule: scheduleReducer,
  scheduleDraft: scheduleDraftReducer,
  attendance: attendanceReducer,
  [authApi.reducerPath]: authApi.reducer,
  [entityApi.reducerPath]: entityApi.reducer,
  [draftApi.reducerPath]: draftApi.reducer,
});

// Middleware to handle the setInitialData action for wizard hydration
const hydrationMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === setInitialData.type) {
    const data = action.payload;
    store.dispatch(setSchoolConfig(data.school));
    store.dispatch(setAllClasses(data.classes));
    store.dispatch(setAllSubjects(data.subjects));
    store.dispatch(setAllTeachers(data.teachers));
    store.dispatch(setAllStudents(data.students));
    store.dispatch(setAllClassrooms(data.rooms));
    store.dispatch(setAllGrades(data.grades));
    store.dispatch(setAllRequirements(data.lessonRequirements));
    store.dispatch(setAllTeacherConstraints(data.teacherConstraints));
    store.dispatch(setAllSubjectRequirements(data.subjectRequirements));
    store.dispatch(setAllTeacherAssignments(data.teacherAssignments));
    store.dispatch(setInitialSchedule(data.schedule));
  }
  return next(action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disabling for performance and to allow non-serializable data if needed
      immutableCheck: false,
    }).concat(
      authApi.middleware,
      entityApi.middleware,
      draftApi.middleware,
      hydrationMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = typeof store;
