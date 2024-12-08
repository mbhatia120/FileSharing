import { useAppSelector, useAppDispatch } from './redux';
import { logout } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user && !!token,
    logout: handleLogout,
  };
}; 