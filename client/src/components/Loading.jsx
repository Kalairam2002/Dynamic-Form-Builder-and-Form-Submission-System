export default function Loading({ text = 'Loading...' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
      <span
        aria-hidden="true"
        className="size-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"
      />
      {text}
    </div>
  );
}
