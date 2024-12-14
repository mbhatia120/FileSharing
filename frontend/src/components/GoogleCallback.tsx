import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { googleLogin } from '../store/slices/authSlice';
import { toast } from '../hooks/use-toast';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const processedRef = useRef(false);

  useEffect(() => {
    const processCode = async () => {
      // Prevent double processing
      if (processedRef.current) {
        return;
      }

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      console.log('GoogleCallback mounted with:', {
        code: code ? code.substring(0, 10) + '...' : null,
        error,
        location: location.pathname,
        processed: processedRef.current
      });

      if (error) {
        console.error('Google auth error:', error);
        toast({
          title: "Authentication Failed",
          description: "Google sign-in was cancelled or failed",
          variant: "destructive",
        });
        navigate('/auth/login');
        return;
      }
      
      if (!code) {
        console.error('No auth code received');
        toast({
          title: "Invalid Request",
          description: "No authentication code received",
          variant: "destructive",
        });
        navigate('/auth/login');
        return;
      }

      try {
        processedRef.current = true;
        const response = await dispatch(googleLogin(code)).unwrap();
        console.log('Google login success:', response);
        toast({
          title: "Success",
          description: "Successfully logged in with Google!",
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Google login error:', error);
        toast({
          title: "Login failed",
          description: typeof error === 'string' ? error : "Failed to login with Google",
          variant: "destructive",
        });
        navigate('/auth/login');
      }
    };

    processCode();

    // Cleanup function
    return () => {
      processedRef.current = false;
    };
  }, [searchParams, dispatch, navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing login...</h2>
        <p className="text-muted-foreground">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
} 