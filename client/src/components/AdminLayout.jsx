import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AdminLayout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>
    </>
  );
}
