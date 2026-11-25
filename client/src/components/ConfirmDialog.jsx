import Alert from './ui/Alert';
import Button from './ui/Button';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}) {
  const footer = (
    <>
      <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? 'Deleting...' : confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal open={open} title={title} onClose={onCancel} footer={footer}>
      <p>{message}</p>
      <Alert className="mt-3">{error}</Alert>
    </Modal>
  );
}
