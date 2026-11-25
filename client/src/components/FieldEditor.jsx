import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FIELD_TYPES, getFieldType } from '../features/formBuilder/fieldTypes';
import { changeFieldType, moveField, updateField } from '../features/formBuilder/formBuilderSlice';
import Button from './ui/Button';
import { ChevronDownIcon, ChevronUpIcon } from './ui/Icons';
import Input, { FieldError, Label, inputClasses } from './ui/Input';
import OptionsEditor from './OptionsEditor';

const DEFAULT_INPUT_TYPES = { number: 'number', date: 'date', email: 'email' };

function DefaultValueInput({ field, id, error, onChange }) {
  if (field.type === 'checkbox') {
    const selected = Array.isArray(field.defaultValue) ? field.defaultValue : [];

    function toggle(option) {
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];
      onChange(next);
    }

    return (
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-gray-700">Checked by default</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {field.options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="size-4 accent-primary-600"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
        <FieldError message={error} />
      </fieldset>
    );
  }

  if (getFieldType(field.type).hasOptions) {
    return (
      <div>
        <Label htmlFor={id}>Default value</Label>
        <select
          id={id}
          className={inputClasses(Boolean(error))}
          value={field.defaultValue ?? ''}
          onChange={(event) => onChange(event.target.value || null)}
        >
          <option value="">No default</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FieldError message={error} />
      </div>
    );
  }

  return (
    <Input
      id={id}
      label="Default value"
      type={DEFAULT_INPUT_TYPES[field.type] || 'text'}
      value={field.defaultValue ?? ''}
      onChange={(event) => onChange(event.target.value)}
      error={error}
    />
  );
}

export default function FieldEditor({ field, index, total, errors = {}, defaultOpen = false, onRemove }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const typeInfo = getFieldType(field.type);
  const hasErrors = Object.keys(errors).length > 0;
  const showBody = isOpen || hasErrors;
  const inputId = (name) => `${field.uid}-${name}`;

  function update(changes) {
    dispatch(updateField({ uid: field.uid, changes }));
  }

  function updateNumber(name, value) {
    update({ [name]: value === '' ? null : Number(value) });
  }

  function move(direction) {
    dispatch(moveField({ uid: field.uid, direction }));
  }

  return (
    <div
      className={`bg-white border ${hasErrors ? 'border-danger-600' : 'border-gray-200'} rounded-lg shadow-sm`}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="flex items-center justify-center shrink-0 size-7 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
          {index + 1}
        </span>
        <button
          type="button"
          className="flex-1 min-w-0 text-left"
          onClick={() => setIsOpen(!showBody)}
          aria-expanded={showBody}
        >
          <span className="block text-sm font-medium text-gray-900 truncate">
            {field.label || 'Untitled question'}
            {field.required && <span className="text-danger-600"> *</span>}
          </span>
          <span className="flex items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 text-[11px] font-medium text-primary-700 bg-primary-50 rounded">
              {typeInfo.label}
            </span>
            <span className="text-xs text-gray-500 truncate">{field.key}</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => move(-1)}
            disabled={index === 0}
            aria-label="Move field up"
            title="Move up"
          >
            <ChevronUpIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => move(1)}
            disabled={index === total - 1}
            aria-label="Move field down"
            title="Move down"
          >
            <ChevronDownIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!showBody)}>
            {showBody ? 'Close' : 'Edit'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
            onClick={() => onRemove(field)}
          >
            Remove
          </Button>
        </div>
      </div>

      {showBody && (
        <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 border-t border-gray-200">
          <Input
            id={inputId('label')}
            label="Label"
            value={field.label}
            onChange={(event) => update({ label: event.target.value })}
            error={errors.label}
          />
          <div>
            <Input
              id={inputId('key')}
              label="Field key"
              value={field.key}
              onChange={(event) => update({ key: event.target.value })}
              error={errors.key}
            />
            {!errors.key && (
              <p className="mt-1 text-xs text-gray-500">Used as the name in submission data.</p>
            )}
          </div>

          <div>
            <Label htmlFor={inputId('type')}>Field type</Label>
            <select
              id={inputId('type')}
              className={inputClasses(Boolean(errors.type))}
              value={field.type}
              onChange={(event) => dispatch(changeFieldType({ uid: field.uid, type: event.target.value }))}
            >
              {Object.entries(FIELD_TYPES).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.type} />
          </div>

          {typeInfo.hasPlaceholder && (
            <Input
              id={inputId('placeholder')}
              label="Placeholder"
              value={field.placeholder}
              onChange={(event) => update({ placeholder: event.target.value })}
              error={errors.placeholder}
            />
          )}

          {typeInfo.hasLength && (
            <>
              <Input
                id={inputId('minLength')}
                type="number"
                min="0"
                label="Min length"
                value={field.minLength ?? ''}
                onChange={(event) => updateNumber('minLength', event.target.value)}
                error={errors.minLength}
              />
              <Input
                id={inputId('maxLength')}
                type="number"
                min="1"
                label="Max length"
                value={field.maxLength ?? ''}
                onChange={(event) => updateNumber('maxLength', event.target.value)}
                error={errors.maxLength}
              />
            </>
          )}

          {typeInfo.hasRange && (
            <>
              <Input
                id={inputId('min')}
                type="number"
                label="Min value"
                value={field.min ?? ''}
                onChange={(event) => updateNumber('min', event.target.value)}
                error={errors.min}
              />
              <Input
                id={inputId('max')}
                type="number"
                label="Max value"
                value={field.max ?? ''}
                onChange={(event) => updateNumber('max', event.target.value)}
                error={errors.max}
              />
            </>
          )}

          {typeInfo.hasOptions && (
            <div className="sm:col-span-2">
              <OptionsEditor
                id={inputId('option')}
                options={field.options}
                error={errors.options}
                onChange={(options) => update({ options })}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <DefaultValueInput
              field={field}
              id={inputId('default')}
              error={errors.defaultValue}
              onChange={(defaultValue) => update({ defaultValue })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 accent-primary-600"
              checked={field.required}
              onChange={(event) => update({ required: event.target.checked })}
            />
            Required field
          </label>
        </div>
      )}
    </div>
  );
}
