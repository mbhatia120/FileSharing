import { Toaster } from '@/components/ui/toaster';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
} 