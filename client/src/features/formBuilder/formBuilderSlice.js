// Owns the form open in the builder: a working copy of its details and fields, the
// unsaved-changes flag, load/save status and the validation errors returned on save.
// Each field gets a uid that is only used for React keys and editing; it is removed before saving.
import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import api, { toApiError } from '../../api/axios';
import { getFieldType } from './fieldTypes';

const DEFAULT_OPTIONS = ['Option 1', 'Option 2'];

function withUid(field, uid = nanoid()) {
  return { ...field, uid, options: field.options || [], defaultValue: field.defaultValue ?? null };
}

function toApiField(field) {
  const { uid, ...rest } = field;
  return rest;
}

function createField(type, uid, fields) {
  const usedKeys = fields.map((field) => field.key);
  let number = fields.length + 1;
  while (usedKeys.includes(`field${number}`)) number += 1;

  return {
    uid,
    key: `field${number}`,
    label: 'Untitled question',
    type,
    placeholder: '',
    defaultValue: null,
    required: false,
    options: getFieldType(type).hasOptions ? [...DEFAULT_OPTIONS] : [],
  };
}

// The API returns errors keyed by path ("fields.2.key"). Fields can be reordered,
// so errors are stored by uid instead of index.
function splitErrors(errors, fields) {
  const result = { details: {}, fields: {} };

  for (const [path, message] of Object.entries(errors)) {
    const match = path.match(/^fields\.(\d+)\.(\w+)/);
    const field = match && fields[Number(match[1])];

    if (field) {
      result.fields[field.uid] = { ...result.fields[field.uid], [match[2]]: message };
    } else {
      result.details[path] = message;
    }
  }
  return result;
}

function applyServerForm(state, form, keepUids) {
  state.formId = form._id;
  state.details = { name: form.name, description: form.description || '' };
  state.formStatus = form.status;
  state.fields = form.fields.map((field, index) =>
    withUid(field, keepUids ? state.fields[index]?.uid : undefined)
  );
  state.isDirty = false;
  state.errors = { details: {}, fields: {} };
}

export const loadForm = createAsyncThunk('formBuilder/load', async (formId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/forms/${formId}`);
    return data;
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

export const saveForm = createAsyncThunk(
  'formBuilder/save',
  async (status, { getState, rejectWithValue }) => {
    const { formId, details, fields } = getState().formBuilder;
    const payload = { ...details, status, fields: fields.map(toApiField) };

    try {
      const { data } = await api.put(`/forms/${formId}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  }
);

const initialState = {
  formId: null,
  details: { name: '', description: '' },
  formStatus: 'draft',
  fields: [],
  isDirty: false,
  loadStatus: 'idle',
  loadError: null,
  saveStatus: 'idle',
  saveError: null,
  errors: { details: {}, fields: {} },
};

function findField(state, uid) {
  return state.fields.find((field) => field.uid === uid);
}

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    updateDetails(state, action) {
      Object.assign(state.details, action.payload);
      Object.keys(action.payload).forEach((name) => delete state.errors.details[name]);
      state.isDirty = true;
    },
    addField: {
      reducer(state, action) {
        const { type, uid } = action.payload;
        state.fields.push(createField(type, uid, state.fields));
        delete state.errors.details.fields;
        state.isDirty = true;
      },
      prepare(type) {
        return { payload: { type, uid: nanoid() } };
      },
    },
    updateField(state, action) {
      const { uid, changes } = action.payload;
      const field = findField(state, uid);
      if (!field) return;

      Object.assign(field, changes);
      const fieldErrors = state.errors.fields[uid];
      if (fieldErrors) Object.keys(changes).forEach((name) => delete fieldErrors[name]);
      state.isDirty = true;
    },
    changeFieldType(state, action) {
      const { uid, type } = action.payload;
      const field = findField(state, uid);
      if (!field) return;

      field.type = type;
      // The old default may not make sense for the new type (e.g. text -> number).
      field.defaultValue = null;
      if (getFieldType(type).hasOptions && field.options.length === 0) {
        field.options = [...DEFAULT_OPTIONS];
      }
      delete state.errors.fields[uid];
      state.isDirty = true;
    },
    removeField(state, action) {
      state.fields = state.fields.filter((field) => field.uid !== action.payload);
      delete state.errors.fields[action.payload];
      state.isDirty = true;
    },
    moveField(state, action) {
      const { uid, direction } = action.payload;
      const index = state.fields.findIndex((field) => field.uid === uid);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= state.fields.length) return;

      [state.fields[index], state.fields[target]] = [state.fields[target], state.fields[index]];
      state.isDirty = true;
    },
    resetBuilder() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadForm.pending, (state) => {
        state.loadStatus = 'loading';
        state.loadError = null;
      })
      .addCase(loadForm.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        applyServerForm(state, action.payload, false);
      })
      .addCase(loadForm.rejected, (state, action) => {
        state.loadStatus = 'failed';
        state.loadError = action.payload?.message || 'Could not load this form';
      })

      .addCase(saveForm.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveForm.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        applyServerForm(state, action.payload, true);
      })
      .addCase(saveForm.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload?.message || 'Could not save the form';
        state.errors = splitErrors(action.payload?.errors || {}, state.fields);
      });
  },
});

export const {
  updateDetails,
  addField,
  updateField,
  changeFieldType,
  removeField,
  moveField,
  resetBuilder,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;
