import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
} 