import { InboxIcon } from './ui/Icons';

export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center bg-white border border-dashed border-gray-300 rounded-lg">
      <span className="flex items-center justify-center mb-4 size-12 text-gray-400 bg-gray-100 rounded-full">
        <InboxIcon className="size-6" />
      </span>
      <h3 className="mb-1 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mb-5 max-w-sm text-sm text-gray-500">{message}</p>
      {action}
    </div>
  );
}
