import { FIELD_COMPONENTS } from './fields/fieldComponents';
import { FieldError } from './ui/Input';

export function getFieldId(key) {
  return `field-${key}`;
}

export default function FieldRenderer({ field, value, error, onChange }) {
  // Unknown types fall back to a text input so a newer form never breaks the page.
  const { component: Component, isGroup } = FIELD_COMPONENTS[field.type] || FIELD_COMPONENTS.text;

  const id = getFieldId(field.key);
  const labelId = `${id}-label`;
  const LabelTag = isGroup ? 'span' : 'label';

  return (
    <div>
      <LabelTag
        id={labelId}
        htmlFor={isGroup ? undefined : id}
        className="block mb-1.5 text-sm font-medium text-gray-700"
      >
        {field.label}
        {field.required && <span className="text-danger-600"> *</span>}
      </LabelTag>

      <Component
        id={id}
        labelId={labelId}
        field={field}
        value={value}
        hasError={Boolean(error)}
        onChange={(nextValue) => onChange(field.key, nextValue)}
      />

      <FieldError message={error} />
    </div>
  );
}
