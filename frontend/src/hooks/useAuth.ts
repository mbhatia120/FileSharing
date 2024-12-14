import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { auth } from '@/utils/auth';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

  const logout = () => {
    dispatch(logoutAction());
    navigate('/auth/login');
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !!auth.getToken(),
    logout,
  };
}; 