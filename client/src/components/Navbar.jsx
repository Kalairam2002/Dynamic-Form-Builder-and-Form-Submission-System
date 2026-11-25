import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import Button from './ui/Button';
import Logo from './Logo';

function navLinkClasses({ isActive }) {
  const color = isActive ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  return `px-3 py-1.5 text-sm font-medium ${color} rounded-md`;
}

export default function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 mx-auto px-4 h-16 max-w-5xl">
        <div className="flex items-center gap-6">
          <Link to="/" aria-label="Form Builder home">
            <Logo />
          </Link>
          <nav>
            <NavLink to="/" end className={navLinkClasses}>
              Forms
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center justify-center size-8 text-sm font-semibold text-primary-700 bg-primary-100 rounded-full">
              {initial}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => dispatch(logout())}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
