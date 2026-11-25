const DOT_COLORS = {
  draft: 'bg-gray-400',
  published: 'bg-success-600',
};

const LABELS = {
  draft: 'Draft',
  published: 'Published',
};

export default function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span className={`size-2 ${DOT_COLORS[status]} rounded-full`} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
