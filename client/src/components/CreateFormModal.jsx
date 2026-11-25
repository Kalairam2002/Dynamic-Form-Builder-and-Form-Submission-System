import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createForm, resetCreateStatus } from '../features/forms/formsSlice';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './Modal';

export default function CreateFormModal({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createStatus, createError } = useSelector((state) => state.forms);
  const [name, setName] = useState('');

  const isSaving = createStatus === 'loading';

  function handleClose() {
    setName('');
    dispatch(resetCreateStatus());
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await dispatch(createForm(name.trim()));
    if (!createForm.fulfilled.match(result)) return;

    handleClose();
    navigate(`/admin/forms/${result.payload._id}/edit`);
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
        Cancel
      </Button>
      <Button type="submit" form="create-form" disabled={isSaving || !name.trim()}>
        {isSaving ? 'Creating...' : 'Create form'}
      </Button>
    </>
  );

  return (
    <Modal open={open} title="New form" onClose={handleClose} footer={footer}>
      <form id="create-form" onSubmit={handleSubmit}>
        <Input
          id="new-form-name"
          label="Form name"
          placeholder="example: Employee Details"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={createError}
          autoFocus
        />
        {/* <p className="mt-3 text-sm text-gray-500">
          The form starts with common fields like name, email and department. You can change or
          remove them in the builder.
        </p> */}
      </form>
    </Modal>
  );
}
