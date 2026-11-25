import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PublicForm from './pages/PublicForm';
import SubmissionDetail from './pages/SubmissionDetail';
import Submissions from './pages/Submissions';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forms/:formId" element={<PublicForm />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin/forms/:formId/edit" element={<FormBuilder />} />
          <Route path="/admin/forms/:formId/submissions" element={<Submissions />} />
          <Route
            path="/admin/forms/:formId/submissions/:submissionId"
            element={<SubmissionDetail />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
