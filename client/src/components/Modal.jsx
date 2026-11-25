import { useEffect } from 'react';

export default function Modal({ open, title, onClose, footer, children }) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 id="modal-title" className="text-base font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        <div className="px-5 py-4 text-sm text-gray-600">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
