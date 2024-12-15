import Cookies from 'js-cookie';
import { User } from '@/types/auth';

const COOKIE_OPTIONS = {
  secure: true,
  sameSite: 'strict' as const,
  expires: 7,
  path: '/'
};

const COOKIE_REMOVAL_OPTIONS = {
  secure: true,
  sameSite: 'strict' as const,
  expires: new Date(new Date().getTime() + 1), // Set expiration to 1ms from now
  path: '/auth/login'
};

export const auth = {
  getToken: () => {
    return Cookies.get('token');
  },

  setToken: (token: string) => {
    Cookies.set('token', token, COOKIE_OPTIONS);
  },

  getRefreshToken: () => {
    return Cookies.get('refreshToken');
  },

  setRefreshToken: (token: string) => {
    Cookies.set('refreshToken', token, COOKIE_OPTIONS);
  },

  getUser: () => {
    const user = Cookies.get('user');
    return user ? JSON.parse(user) as User : null;
  },

  setUser: (user: User) => {
    Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
  },

  clear: () => {
    // Set cookies with 1ms expiration to effectively delete them
    Cookies.set('token', '', COOKIE_REMOVAL_OPTIONS);
    Cookies.set('refreshToken', '', COOKIE_REMOVAL_OPTIONS);
    Cookies.set('user', '', COOKIE_REMOVAL_OPTIONS);
    
    // Also remove them normally as a fallback
    Cookies.remove('token', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    Cookies.remove('user', { path: '/' });

    // Reload the page to clear any in-memory state
    window.location.reload();
  },
}; 