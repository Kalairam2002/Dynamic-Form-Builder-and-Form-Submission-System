import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteSubmission,
  fetchSubmission,
  fetchSubmissionForm,
  resetDeleteStatus,
} from '../features/submissions/submissionsSlice';
import { formatDate, formatValue } from '../utils/format';
import { notifyChange } from '../utils/syncChannel';
import Alert from '../components/ui/Alert';
import Button, { buttonClasses } from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';

function AnswerList({ rows }) {
  return (
    <dl className="divide-y divide-gray-200">
      {rows.map((row) => (
        <div key={row.key} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm font-medium text-gray-500">{row.label}</dt>
          <dd className="text-sm text-gray-900 whitespace-pre-line break-words sm:col-span-2">
            {formatValue(row.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function SubmissionDetail() {
  const { formId, submissionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { form, formError, current, currentStatus, currentError, deleteStatus, deleteError } =
    useSelector((state) => state.submissions);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const listPath = `/admin/forms/${formId}/submissions`;

  useEffect(() => {
    dispatch(fetchSubmissionForm(formId));
    dispatch(fetchSubmission({ formId, submissionId }));
  }, [dispatch, formId, submissionId]);

  function openDeleteDialog() {
    dispatch(resetDeleteStatus());
    setIsDeleteOpen(true);
  }

  async function handleDelete() {
    const result = await dispatch(deleteSubmission({ formId, submissionId }));
    if (!deleteSubmission.fulfilled.match(result)) return;

    notifyChange('submissions', formId);
    navigate(listPath, { replace: true });
  }

  const error = formError || currentError;
  if (error) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Link to={listPath} className={buttonClasses('secondary')}>
          Back to submissions
        </Link>
      </div>
    );
  }

  if (!form || current?._id !== submissionId || currentStatus === 'loading') {
    return <Loading text="Loading submission..." />;
  }

  const formKeys = form.fields.map((field) => field.key);
  const answers = form.fields.map((field) => ({
    key: field.key,
    label: field.label,
    value: current.data[field.key],
  }));
  // Answers for fields that were renamed or removed from the form after this response was sent.
  const oldAnswers = Object.keys(current.data)
    .filter((key) => !formKeys.includes(key))
    .map((key) => ({ key, label: key, value: current.data[key] }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={listPath} className="text-sm text-gray-500 hover:text-gray-900">
        Back to submissions
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Submission</h1>
          <p className="text-sm text-gray-500">
            {form.name} &middot; {formatDate(current.createdAt)}
          </p>
        </div>
        <Button variant="danger" onClick={openDeleteDialog}>
          Delete submission
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <AnswerList rows={answers} />
        </Card>

        {oldAnswers.length > 0 && (
          <Card>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Fields no longer on the form</h2>
            <AnswerList rows={oldAnswers} />
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete submission"
        message="This submission will be permanently deleted. This cannot be undone."
        confirmLabel="Delete submission"
        isLoading={deleteStatus === 'loading'}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
