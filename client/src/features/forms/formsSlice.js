
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { toApiError } from '../../api/axios';

const PAGE_SIZE = 10;


export const fetchForms = createAsyncThunk('forms/fetchAll', async ({ page, status }, { rejectWithValue }) => {
  try {
    const params = { page, limit: PAGE_SIZE };
    if (status) params.status = status;
    const { data } = await api.get('/forms', { params });
    return data;
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

export const createForm = createAsyncThunk('forms/create', async (name, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/forms', { name });
    return data;
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

export const deleteForm = createAsyncThunk('forms/delete', async (formId, { rejectWithValue }) => {
  try {
    await api.delete(`/forms/${formId}`);
    return formId;
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

const initialState = {
  items: [],
  page: 1,
  totalPages: 0,
  total: 0,
  status: 'idle',
  error: null,
  latestRequestId: null,
  createStatus: 'idle',
  createError: null,
  deleteStatus: 'idle',
  deleteError: null,
};

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    resetCreateStatus(state) {
      state.createStatus = 'idle';
      state.createError = null;
    },
    resetDeleteStatus(state) {
      state.deleteStatus = 'idle';
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForms.pending, (state, action) => {
        state.latestRequestId = action.meta.requestId;
        if (action.meta.arg.silent) return;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        // Only the newest request may update the list, so an older slow response
        // cannot bring back outdated counts.
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        if (action.meta.arg.silent) return;
        state.status = 'failed';
        state.error = action.payload?.message || 'Could not load your forms';
      })

      .addCase(createForm.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createForm.fulfilled, (state) => {
        state.createStatus = 'succeeded';
      })
      .addCase(createForm.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload?.errors?.name || action.payload?.message || 'Could not create the form';
      })

      .addCase(deleteForm.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteForm.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.items = state.items.filter((form) => form._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteForm.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload?.message || 'Could not delete the form';
      });
  },
});

export const { resetCreateStatus, resetDeleteStatus } = formsSlice.actions;
export default formsSlice.reducer;
