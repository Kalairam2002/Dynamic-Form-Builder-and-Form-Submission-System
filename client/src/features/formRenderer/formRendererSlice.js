// Owns the public form definition being shown and the submit status. The values the
// user types and the per-field errors stay in the PublicForm component's local state.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { toApiError } from '../../api/axios';

// silent: true is used for background refreshes, so the form stays on screen (with
// whatever the user has typed) while the latest definition is loaded.
export const fetchPublicForm = createAsyncThunk(
  'formRenderer/fetchForm',
  async ({ formId }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/forms/${formId}`);
      return data;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  }
);

export const submitForm = createAsyncThunk(
  'formRenderer/submit',
  async ({ formId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/forms/${formId}/submissions`, { data });
      return response.data;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  }
);

const initialState = {
  form: null,
  status: 'idle',
  error: null,
  latestRequestId: null,
  submitStatus: 'idle',
  submitError: null,
};

const formRendererSlice = createSlice({
  name: 'formRenderer',
  initialState,
  reducers: {
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
    resetRenderer() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicForm.pending, (state, action) => {
        state.latestRequestId = action.meta.requestId;
        if (action.meta.arg.silent) return;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPublicForm.fulfilled, (state, action) => {
        // Only the newest request may update the form, so a slow older response
        // cannot bring back an outdated definition.
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = 'succeeded';
        state.error = null;
        state.form = action.payload;
      })
      .addCase(fetchPublicForm.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        // During a background refresh, a network hiccup keeps the current form on screen.
        // A 404 means the form was unpublished or deleted, so the user should see that.
        if (action.meta.arg.silent && action.payload?.status !== 404) return;
        state.status = 'failed';
        state.error = action.payload?.message || 'Could not load this form';
      })

      .addCase(submitForm.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitForm.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload?.message || 'Could not send your response';
      });
  },
});

export const { resetSubmitStatus, resetRenderer } = formRendererSlice.actions;
export default formRendererSlice.reducer;
