import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserNav from './UserNav';

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-semibold text-lg">SecureX</span>
            </Link>
            
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <UserNav />
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 