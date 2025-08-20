// src/lib/redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { authApi } from './api/authApi';
import authReducer from './features/auth/authSlice';
import classesReducer, { setAllClasses } from './features/classes/classesSlice';
import subjectsReducer, { setAllSubjects } from './features/subjects/subjectsSlice';
import teachersReducer, { setAllTeachers } from './features/teachers/teachersSlice';
import classroomsReducer, { setAllClassrooms } from './features/classrooms/classroomsSlice';
import scheduleReducer, { setInitialSchedule } from './features/schedule/scheduleSlice';
import sessionReducer from './slices/sessionSlice';
import notificationReducer from './slices/notificationSlice';
import reportReducer from './slices/reportSlice';
import lessonRequirementsReducer, { setAllRequirements } from './features/lessonRequirements/lessonRequirementsSlice';
import gradesReducer, { setAllGrades } from './features/grades/gradesSlice';
import teacherConstraintsReducer, { setAllTeacherConstraints } from './features/teacherConstraintsSlice';
import subjectRequirementsReducer, { setAllSubjectRequirements } from './features/subjectRequirementsSlice';
import teacherAssignmentsReducer, { setAllTeacherAssignments } from './features/teacherAssignmentsSlice';
import schoolConfigReducer, { setSchoolConfig } from './features/schoolConfigSlice';
import attendanceReducer from './features/attendance/attendanceSlice';
import { entityApi } from './api/entityApi/index';
import scheduleDraftReducer from './features/scheduleDraftSlice';
import wizardReducer from './features/wizardSlice';
import { setInitialData } from './features/wizardSlice';

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [entityApi.reducerPath]: entityApi.reducer,
  auth: authReducer,
  classes: classesReducer,
  subjects: subjectsReducer,
  teachers: teachersReducer,
  classrooms: classroomsReducer,
  schedule: scheduleReducer,
  session: sessionReducer,
  notifications: notificationReducer,
  reports: reportReducer,
  lessonRequirements: lessonRequirementsReducer,
  grades: gradesReducer,
  teacherConstraints: teacherConstraintsReducer,
  subjectRequirements: subjectRequirementsReducer,
  teacherAssignments: teacherAssignmentsReducer,
  schoolConfig: schoolConfigReducer,
  attendance: attendanceReducer,
  scheduleDraft: scheduleDraftReducer,
  wizard: wizardReducer,
});

// Middleware to handle the setInitialData action
const hydrationMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === setInitialData.type) {
    const data = action.payload;
    store.dispatch(setSchoolConfig(data.school));
    store.dispatch(setAllClasses(data.classes));
    store.dispatch(setAllSubjects(data.subjects));
    store.dispatch(setAllTeachers(data.teachers));
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
      immutableCheck: false,
      serializableCheck: false,
    }).concat([authApi.middleware, entityApi.middleware, hydrationMiddleware]),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = typeof store;
