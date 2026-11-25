import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout, SESSION_KEY } from '../features/auth/authSlice';
import formsReducer from '../features/forms/formsSlice';
import formBuilderReducer from '../features/formBuilder/formBuilderSlice';
import formRendererReducer from '../features/formRenderer/formRendererSlice';
import submissionsReducer from '../features/submissions/submissionsSlice';
import { setupInterceptors } from '../api/axios';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forms: formsReducer,
    formBuilder: formBuilderReducer,
    formRenderer: formRendererReducer,
    submissions: submissionsReducer,
  },
});

setupInterceptors(store, logout);

let savedToken = store.getState().auth.token;

store.subscribe(() => {
  const { token, user } = store.getState().auth;
  if (token === savedToken) return;

  savedToken = token;
  if (token) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
});
