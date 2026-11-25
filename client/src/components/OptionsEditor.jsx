import Button from './ui/Button';
import { FieldError, Label, inputClasses } from './ui/Input';

export default function OptionsEditor({ id, options, error, onChange }) {
  function updateOption(index, value) {
    onChange(options.map((option, i) => (i === index ? value : option)));
  }

  function removeOption(index) {
    onChange(options.filter((_, i) => i !== index));
  }

  function addOption() {
    onChange([...options, `Option ${options.length + 1}`]);
  }

  return (
    <div>
      <Label htmlFor={`${id}-0`}>Options</Label>
      <div className="space-y-2">
        {options.map((option, index) => (
          // Options are plain strings that can repeat while typing, so the index is the only stable key.
          <div key={index} className="flex gap-2">
            <input
              id={`${id}-${index}`}
              aria-label={`Option ${index + 1}`}
              className={inputClasses(false)}
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => removeOption(index)}
              disabled={options.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="mt-2" onClick={addOption}>
        Add option
      </Button>
      <FieldError message={error} />
    </div>
  );
}
