import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteForm, fetchForms, resetDeleteStatus } from '../features/forms/formsSlice';
import { formatDate } from '../utils/format';
import { notifyChange } from '../utils/syncChannel';
import useAutoRefresh from '../hooks/useAutoRefresh';
import Alert from '../components/ui/Alert';
import Button, { buttonClasses } from '../components/ui/Button';
import { FormIcon, PlusIcon } from '../components/ui/Icons';
import ConfirmDialog from '../components/ConfirmDialog';
import CreateFormModal from '../components/CreateFormModal';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
];

const EMPTY_MESSAGES = {
  '': 'Create your first form to start collecting responses.',
  published: 'No published forms yet. Publish a draft to share it.',
  draft: 'No drafts right now. Every form you create starts as a draft.',
};

function CountBadge({ count }) {
  if (!count) return null;

  return (
    <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-semibold text-white bg-primary-600 border-2 border-white rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const statusFilter = searchParams.get('status') || '';

  const { items, totalPages, total, status, error, deleteStatus, deleteError } = useSelector(
    (state) => state.forms
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    dispatch(fetchForms({ page, status: statusFilter }));
  }, [dispatch, page, statusFilter]);

  useAutoRefresh(() => {
    dispatch(fetchForms({ page, status: statusFilter, silent: true }));
  });

  function updateQuery(nextPage, nextStatus) {
    const params = {};
    if (nextPage > 1) params.page = String(nextPage);
    if (nextStatus) params.status = nextStatus;
    setSearchParams(params);
  }

  function reload() {
    dispatch(fetchForms({ page, status: statusFilter }));
  }

  function openDeleteDialog(form) {
    dispatch(resetDeleteStatus());
    setFormToDelete(form);
  }

  async function handleDelete() {
    const result = await dispatch(deleteForm(formToDelete._id));
    if (!deleteForm.fulfilled.match(result)) return;

    notifyChange('form', formToDelete._id);
    setFormToDelete(null);
    if (items.length === 1 && page > 1) {
      updateQuery(page - 1, statusFilter);
    } else {
      reload();
    }
  }

  async function copyLink(formId) {
    const link = `${window.location.origin}/forms/${formId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(formId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard access can be blocked (e.g. plain http), so let the user copy it by hand.
      window.prompt('Copy this link', link);
    }
  }

  const isFirstLoad = status === 'loading' && items.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your forms</h1>
         
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon className="size-4" />
          New form
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4 border-b border-gray-200">
        <nav className="flex gap-1 -mb-px" aria-label="Filter forms by status">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => updateQuery(1, tab.value)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive
                    ? 'text-primary-700 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
        {status === 'succeeded' && (
          <span className="hidden sm:inline text-sm text-gray-500">
            {total} {total === 1 ? 'form' : 'forms'}
          </span>
        )}
      </div>

      {error && (
        <Alert className="mb-4">
          {error}{' '}
          <button type="button" className="font-medium underline" onClick={reload}>
            Try again
          </button>
        </Alert>
      )}

      {isFirstLoad && <Loading text="Loading your forms..." />}

      {status === 'succeeded' && items.length === 0 && (
        <EmptyState
          title={statusFilter ? 'Nothing here' : 'No forms yet'}
          message={EMPTY_MESSAGES[statusFilter]}
          action={
            !statusFilter && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <PlusIcon className="size-4" />
                Create a form
              </Button>
            )
          }
        />
      )}

      {items.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full min-w-[760px] text-sm text-left">
              <thead className="text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((form) => (
                  <tr key={form._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center shrink-0 size-9 text-primary-700 bg-primary-50 rounded-md">
                          <FormIcon className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/forms/${form._id}/edit`}
                            className="block font-medium text-gray-900 truncate hover:text-primary-700"
                          >
                            {form.name}
                          </Link>
                          <span className="text-xs text-gray-500">
                            Created {formatDate(form.createdAt)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={form.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(form.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/forms/${form._id}/edit`} className={buttonClasses('secondary', 'sm')}>
                          Edit
                        </Link>
                        <Link
                          to={`/admin/forms/${form._id}/submissions`}
                          className={`relative ${buttonClasses('secondary', 'sm')}`}
                          aria-label={`Submissions (${form.submissionCount ?? 0})`}
                        >
                          Submissions
                          <CountBadge count={form.submissionCount} />
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => copyLink(form._id)}
                          disabled={form.status !== 'published'}
                          title={form.status !== 'published' ? 'Publish the form to share it' : undefined}
                        >
                          {copiedId === form._id ? 'Copied' : 'Copy link'}
                        </Button>
                        <Button variant="dangerSubtle" size="sm" onClick={() => openDeleteDialog(form)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={(nextPage) => updateQuery(nextPage, statusFilter)} />
        </>
      )}

      <CreateFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <ConfirmDialog
        open={Boolean(formToDelete)}
        title="Delete form"
        message={`"${formToDelete?.name}" and all of its submissions will be deleted. This cannot be undone.`}
        confirmLabel="Delete form"
        isLoading={deleteStatus === 'loading'}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setFormToDelete(null)}
      />
    </div>
  );
}
