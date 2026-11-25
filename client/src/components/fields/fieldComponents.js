import CheckboxGroup from './CheckboxGroup';
import RadioGroup from './RadioGroup';
import SelectInput from './SelectInput';
import TextareaInput from './TextareaInput';
import TextInput from './TextInput';

// Maps a field type from the form definition to the component that renders it.
// Supporting a new type means adding one component and one line here.
// isGroup marks types made of several inputs, which get a group label instead of <label for>.
export const FIELD_COMPONENTS = {
  text: { component: TextInput },
  email: { component: TextInput },
  number: { component: TextInput },
  phone: { component: TextInput },
  date: { component: TextInput },
  textarea: { component: TextareaInput },
  select: { component: SelectInput },
  radio: { component: RadioGroup, isGroup: true },
  checkbox: { component: CheckboxGroup, isGroup: true },
};
