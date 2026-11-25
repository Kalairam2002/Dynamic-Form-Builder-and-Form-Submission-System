import { FormIcon } from './ui/Icons';

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-center justify-center size-8 bg-primary-600 text-white rounded-md">
        <FormIcon className="size-5" />
      </span>
      <span className="text-base font-semibold text-gray-900">Form Builder</span>
    </span>
  );
}
