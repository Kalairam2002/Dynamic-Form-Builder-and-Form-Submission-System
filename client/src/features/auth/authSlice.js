// Owns the logged-in admin and their token. It is saved to localStorage by store.js
// so a page refresh keeps the session.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { toApiError } from '../../api/axios';

export const SESSION_KEY = 'formBuilderSession';

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || {};
  } catch {
    return {};
  }
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

const session = loadSession();

const initialState = {
  token: session.token || null,
  user: session.user || null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      return { ...initialState, token: null, user: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed, please try again';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
