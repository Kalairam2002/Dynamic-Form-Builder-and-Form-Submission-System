import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mb-6 text-sm text-gray-500">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className={buttonClasses('secondary')}>
        Go to home
      </Link>
    </div>
  );
}
