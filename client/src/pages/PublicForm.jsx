import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  fetchPublicForm,
  resetRenderer,
  resetSubmitStatus,
  submitForm,
} from '../features/formRenderer/formRendererSlice';
import { validateField } from '../components/fields/validateField';
import { notifyChange } from '../utils/syncChannel';
import useAutoRefresh from '../hooks/useAutoRefresh';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CheckIcon } from '../components/ui/Icons';
import Logo from '../components/Logo';
import FieldRenderer, { getFieldId } from '../components/FieldRenderer';
import Loading from '../components/Loading';

function getDefaultValue(field) {
  if (field.type === 'checkbox') {
    return Array.isArray(field.defaultValue) ? field.defaultValue : [];
  }
  return field.defaultValue == null ? '' : String(field.defaultValue);
}

function focusField(key) {
  document.getElementById(getFieldId(key))?.focus();
}

function FormBody({ form }) {
  const dispatch = useDispatch();
  const { submitStatus, submitError } = useSelector((state) => state.formRenderer);

  // Only holds fields the user has changed. The form definition can be refreshed while
  // the page is open, so any other field (including newly added ones) shows its default.
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const isDraft = form.status === 'draft';
  const isSubmitting = submitStatus === 'loading';

  function getValue(field) {
    return Object.hasOwn(values, field.key) ? values[field.key] : getDefaultValue(field);
  }

  // Built from the current fields, so answers for fields the admin removed are not sent.
  function buildSubmissionData() {
    const data = {};
    for (const field of form.fields) data[field.key] = getValue(field);
    return data;
  }

  function handleChange(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    if (!errors[key]) return;

    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validateAll() {
    const found = {};
    for (const field of form.fields) {
      const message = validateField(field, getValue(field));
      if (message) found[field.key] = message;
    }
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const found = validateAll();
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const result = await dispatch(submitForm({ formId: form._id, data: buildSubmissionData() }));
    if (submitForm.fulfilled.match(result)) {
      notifyChange('submissions', form._id);
      return;
    }
    if (submitForm.rejected.match(result)) {
      const serverErrors = result.payload?.errors || {};
      setErrors(serverErrors);
      const firstServerError = Object.keys(serverErrors)[0];
      if (firstServerError) focusField(firstServerError);
    }
  }

  function handleSubmitAnother() {
    setValues({});
    setErrors({});
    dispatch(resetSubmitStatus());
  }

  if (submitStatus === 'succeeded') {
    return (
      <Card className="py-10 text-center">
        <span className="flex items-center justify-center mx-auto mb-4 size-12 text-success-700 bg-success-50 rounded-full">
          <CheckIcon className="size-6" />
        </span>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Thanks, your response was sent</h1>
        <p className="mb-6 text-sm text-gray-500">
          We have received your answers for &ldquo;{form.name}&rdquo;.
        </p>
        <Button variant="secondary" onClick={handleSubmitAnother}>
          Submit another response
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-t-4 border-t-primary-600">
      <div className="pb-5 mb-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">{form.name}</h1>
        {form.description && (
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{form.description}</p>
        )}
      </div>

      {isDraft && (
        <Alert className="mb-6">
          This form is a draft. Only you can see it, and it cannot accept responses until it is
          published.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {form.fields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={getValue(field)}
            error={errors[field.key]}
            onChange={handleChange}
          />
        ))}

        <Alert>{submitError}</Alert>

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-gray-500">
           Fields marked  with <span className="text-danger-600">*</span> are required.
          </p>
          <Button type="submit" disabled={isSubmitting || isDraft}>
            {isSubmitting ? 'Sending...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function PublicForm() {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const { form, status } = useSelector((state) => state.formRenderer);

  useEffect(() => {
    dispatch(fetchPublicForm({ formId }));
    return () => dispatch(resetRenderer());
  }, [dispatch, formId]);

  // Picks up changes the admin saves (or a switch to draft) without a page reload.
  useAutoRefresh((changedFormId) => {
    if (changedFormId && changedFormId !== formId) return;
    dispatch(fetchPublicForm({ formId, silent: true }));
  }, ['form']);

  let content;
  if (status === 'failed') {
    content = (
      <Card className="text-center">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">This form is not available</h1>
        <p className="text-sm text-gray-500">
          The link may be wrong, or the form is no longer accepting responses.
        </p>
      </Card>
    );
  } else if (status === 'succeeded' && form) {
    // The key resets the typed values if a different form is opened.
    content = <FormBody key={form._id} form={form} />;
  } else {
    content = <Loading text="Loading form..." />;
  }

  return (
    <div className="px-4 py-10 min-h-screen bg-gray-50">
      <div className="mx-auto max-w-xl">
        {content}
        <div className="flex justify-center mt-8 opacity-70">
          <Logo />
        </div>
      </div>
    </div>
  );
}
