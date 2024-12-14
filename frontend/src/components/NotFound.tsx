import { useLocation, Link } from 'react-router-dom';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The page {location.pathname} does not exist.
        </p>
        <Link 
          to="/"
          className="text-primary hover:text-primary/90"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
} 