import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { FIELD_TYPES } from '../features/formBuilder/fieldTypes';
import {
  addField,
  loadForm,
  removeField,
  resetBuilder,
  saveForm,
  updateDetails,
} from '../features/formBuilder/formBuilderSlice';
import { notifyChange } from '../utils/syncChannel';
import Alert from '../components/ui/Alert';
import Button, { buttonClasses } from '../components/ui/Button';
import Card from '../components/ui/Card';
import { PlusIcon } from '../components/ui/Icons';
import Input, { FieldError, Label, inputClasses } from '../components/ui/Input';
import ConfirmDialog from '../components/ConfirmDialog';
import FieldEditor from '../components/FieldEditor';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';

export default function FormBuilder() {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const {
    details,
    formStatus,
    fields,
    isDirty,
    loadStatus,
    loadError,
    saveStatus,
    saveError,
    errors,
  } = useSelector((state) => state.formBuilder);

  const [newFieldType, setNewFieldType] = useState('text');
  const [newestUid, setNewestUid] = useState(null);
  const [fieldToRemove, setFieldToRemove] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    dispatch(loadForm(formId));
    return () => dispatch(resetBuilder());
  }, [dispatch, formId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function handleAddField() {
    const action = dispatch(addField(newFieldType));
    setNewestUid(action.payload.uid);
  }

  function handleRemoveField() {
    dispatch(removeField(fieldToRemove.uid));
    setFieldToRemove(null);
  }

  async function handleSave(status) {
    setNotice('');
    const result = await dispatch(saveForm(status));
    if (saveForm.fulfilled.match(result)) {
      notifyChange('form', formId);
      setNotice(status === 'published' ? 'Form published.' : 'Draft saved.');
    }
  }

  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return <Loading text="Loading form..." />;
  }

  if (loadStatus === 'failed') {
    return (
      <div className="space-y-4">
        <Alert>{loadError}</Alert>
        <Link to="/" className={buttonClasses('secondary')}>
          Back to forms
        </Link>
      </div>
    );
  }

  const isSaving = saveStatus === 'loading';
  const isPublished = formStatus === 'published';

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
        Back to forms
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mt-2 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              {details.name || 'Untitled form'}
            </h1>
            <StatusBadge status={formStatus} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
            {isPublished && (
              <>
                {' '}
                <Link
                  to={`/forms/${formId}`}
                  target="_blank"
                  className="font-medium text-primary-700 hover:underline"
                >
                  Open public form
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleSave('draft')} disabled={isSaving}>
            {isPublished ? 'Switch to draft' : 'Save as draft'}
          </Button>
          <Button onClick={() => handleSave('published')} disabled={isSaving}>
            {isSaving ? 'Saving...' : isPublished ? 'Save changes' : 'Publish form'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {notice && <Alert variant="success">{notice}</Alert>}
        {saveError && <Alert>{saveError}</Alert>}

        <Card className="space-y-4">
          <Input
            id="form-name"
            label="Form name"
            value={details.name}
            onChange={(event) => dispatch(updateDetails({ name: event.target.value }))}
            error={errors.details.name}
          />
          <div>
            <Label htmlFor="form-description">Description</Label>
            <textarea
              id="form-description"
              rows={3}
              className={inputClasses(Boolean(errors.details.description))}
              placeholder="Shown at the top of the form"
              value={details.description}
              onChange={(event) => dispatch(updateDetails({ description: event.target.value }))}
            />
            <FieldError message={errors.details.description} />
          </div>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Fields</h2>
            <span className="text-sm text-gray-500">{fields.length} total</span>
          </div>

          {errors.details.fields && <Alert className="mb-3">{errors.details.fields}</Alert>}

          {fields.length === 0 ? (
            <p className="px-4 py-8 text-sm text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg">
              No fields yet. Add one below to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <FieldEditor
                  key={field.uid}
                  field={field}
                  index={index}
                  total={fields.length}
                  errors={errors.fields[field.uid]}
                  defaultOpen={field.uid === newestUid}
                  onRemove={setFieldToRemove}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-4 p-4 sm:flex-row sm:items-end bg-white border border-gray-200 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="new-field-type">Add a field</Label>
              <select
                id="new-field-type"
                className={inputClasses(false)}
                value={newFieldType}
                onChange={(event) => setNewFieldType(event.target.value)}
              >
                {Object.entries(FIELD_TYPES).map(([type, info]) => (
                  <option key={type} value={type}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="secondary" onClick={handleAddField}>
              <PlusIcon className="size-4" />
              Add field
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(fieldToRemove)}
        title="Remove field"
        message={`Remove "${fieldToRemove?.label}" from this form? The change is applied when you save.`}
        confirmLabel="Remove field"
        onConfirm={handleRemoveField}
        onCancel={() => setFieldToRemove(null)}
      />
    </div>
  );
}
