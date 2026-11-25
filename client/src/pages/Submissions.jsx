import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  deleteSubmission,
  fetchSubmissionForm,
  fetchSubmissions,
  resetDeleteStatus,
} from '../features/submissions/submissionsSlice';
import { formatDate, formatValue } from '../utils/format';
import { notifyChange } from '../utils/syncChannel';
import useAutoRefresh from '../hooks/useAutoRefresh';
import Alert from '../components/ui/Alert';
import Button, { buttonClasses } from '../components/ui/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

// Only the first few fields fit in the table; the detail page shows everything.
const PREVIEW_FIELD_COUNT = 3;

export default function Submissions() {
  const { formId } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const {
    form,
    formStatus,
    formError,
    items,
    totalPages,
    total,
    listStatus,
    listError,
    deleteStatus,
    deleteError,
  } = useSelector((state) => state.submissions);

  const [submissionToDelete, setSubmissionToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchSubmissionForm(formId));
  }, [dispatch, formId]);

  useEffect(() => {
    dispatch(fetchSubmissions({ formId, page }));
  }, [dispatch, formId, page]);

  useAutoRefresh((changedFormId) => {
    if (changedFormId && changedFormId !== formId) return;
    dispatch(fetchSubmissions({ formId, page, silent: true }));
  }, ['submissions']);

  function goToPage(nextPage) {
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
  }

  function openDeleteDialog(submission) {
    dispatch(resetDeleteStatus());
    setSubmissionToDelete(submission);
  }

  async function handleDelete() {
    const result = await dispatch(deleteSubmission({ formId, submissionId: submissionToDelete._id }));
    if (!deleteSubmission.fulfilled.match(result)) return;

    notifyChange('submissions', formId);
    setSubmissionToDelete(null);
    if (items.length === 1 && page > 1) {
      goToPage(page - 1);
    } else {
      dispatch(fetchSubmissions({ formId, page }));
    }
  }

  if (formStatus === 'failed') {
    return (
      <div className="space-y-4">
        <Alert>{formError}</Alert>
        <Link to="/" className={buttonClasses('secondary')}>
          Back to forms
        </Link>
      </div>
    );
  }

  if (!form) return <Loading text="Loading submissions..." />;

  const previewFields = form.fields.slice(0, PREVIEW_FIELD_COUNT);

  return (
    <div>
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
        Back to forms
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{form.name}</h1>
          <p className="text-sm text-gray-500">
            {total} {total === 1 ? 'submission' : 'submissions'}
          </p>
        </div>
        <Link to={`/admin/forms/${formId}/edit`} className={buttonClasses('secondary')}>
          Edit form
        </Link>
      </div>

      {listError && <Alert className="mb-4">{listError}</Alert>}

      {listStatus === 'loading' && items.length === 0 && <Loading text="Loading submissions..." />}

      {listStatus === 'succeeded' && items.length === 0 && (
        <EmptyState
          title="No submissions yet"
          message={
            form.status === 'published'
              ? 'Share the public link and responses will show up here.'
              : 'Publish the form to start collecting responses.'
          }
          action={
            <Link to={`/admin/forms/${formId}/edit`} className={buttonClasses('secondary')}>
              Open form builder
            </Link>
          }
        />
      )}

      {items.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full min-w-[720px] text-sm text-left">
              <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Submitted</th>
                  {previewFields.map((field) => (
                    <th key={field.key} className="px-4 py-3">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(submission.createdAt)}
                    </td>
                    {previewFields.map((field) => (
                      <td key={field.key} className="px-4 py-3 max-w-[200px] text-gray-900 truncate">
                        {formatValue(submission.data[field.key])}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/forms/${formId}/submissions/${submission._id}`}
                          className={buttonClasses('secondary', 'sm')}
                        >
                          View
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => openDeleteDialog(submission)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(submissionToDelete)}
        title="Delete submission"
        message="This submission will be permanently deleted. This cannot be undone."
        confirmLabel="Delete submission"
        isLoading={deleteStatus === 'loading'}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setSubmissionToDelete(null)}
      />
    </div>
  );
}
