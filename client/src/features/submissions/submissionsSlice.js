// Owns the admin's view of submissions: the form they belong to (for labels and
// columns), one page of the list, the single submission being viewed, and delete status.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { toApiError } from '../../api/axios';

const PAGE_SIZE = 10;

export const fetchSubmissionForm = createAsyncThunk(
  'submissions/fetchForm',
  async (formId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/forms/${formId}`);
      return data;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
  {
    // Going from the list to a single submission should not load the same form again.
    condition: (formId, { getState }) => {
      const { form, formStatus } = getState().submissions;
      return !(form?._id === formId && formStatus === 'succeeded');
    },
  }
);

// silent: true is used for background refreshes, so the table does not flash a
// loading state or an error while the admin is looking at it.
export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchAll',
  async ({ formId, page }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/forms/${formId}/submissions`, {
        params: { page, limit: PAGE_SIZE },
      });
      return data;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  }
);

export const fetchSubmission = createAsyncThunk(
  'submissions/fetchOne',
  async ({ formId, submissionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/forms/${formId}/submissions/${submissionId}`);
      return data;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  'submissions/delete',
  async ({ formId, submissionId }, { rejectWithValue }) => {
    try {
      await api.delete(`/forms/${formId}/submissions/${submissionId}`);
      return submissionId;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  }
);

const initialState = {
  form: null,
  formStatus: 'idle',
  formError: null,
  items: [],
  page: 1,
  totalPages: 0,
  total: 0,
  listStatus: 'idle',
  listError: null,
  latestListRequestId: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  deleteStatus: 'idle',
  deleteError: null,
};

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    resetDeleteStatus(state) {
      state.deleteStatus = 'idle';
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissionForm.pending, (state) => {
        state.formStatus = 'loading';
        state.formError = null;
        state.form = null;
        state.items = [];
        state.total = 0;
      })
      .addCase(fetchSubmissionForm.fulfilled, (state, action) => {
        state.formStatus = 'succeeded';
        state.form = action.payload;
      })
      .addCase(fetchSubmissionForm.rejected, (state, action) => {
        state.formStatus = 'failed';
        state.formError = action.payload?.message || 'Could not load this form';
      })

      .addCase(fetchSubmissions.pending, (state, action) => {
        state.latestListRequestId = action.meta.requestId;
        if (action.meta.arg.silent) return;
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        // Refreshes can overlap; only the newest request may update the list,
        // so a slow older response never puts stale data back on screen.
        if (action.meta.requestId !== state.latestListRequestId) return;
        state.listStatus = 'succeeded';
        state.listError = null;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestListRequestId) return;
        if (action.meta.arg.silent) return;
        state.listStatus = 'failed';
        state.listError = action.payload?.message || 'Could not load submissions';
      })

      .addCase(fetchSubmission.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
        state.current = null;
      })
      .addCase(fetchSubmission.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchSubmission.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload?.message || 'Could not load this submission';
      })

      .addCase(deleteSubmission.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.total -= 1;
        if (state.current?._id === action.payload) state.current = null;
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload?.message || 'Could not delete this submission';
      });
  },
});

export const { resetDeleteStatus } = submissionsSlice.actions;
export default submissionsSlice.reducer;
