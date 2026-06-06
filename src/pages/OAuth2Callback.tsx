import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore, useToastStore } from '../store/useSwiftStore';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth2 login error:', error);
      addToast(`Authentication failed: ${error}`, 'error');
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (token && refreshToken) {
      localStorage.setItem('sc_logged_in', 'true');
      localStorage.setItem('sc_access_token', token);
      localStorage.setItem('sc_refresh_token', refreshToken);

      // Set isLoggedIn to true in store
      useAuthStore.setState({ isLoggedIn: true });

      // Fetch user profile and redirect
      fetchCurrentUser()
        .then(() => {
          addToast('Logged in successfully with social account!', 'success');
          // Fetch addresses
          useAuthStore.getState().fetchAddresses().catch(() => {});
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          console.error('Failed to load user info', err);
          addToast('Failed to load profile. Please try again.', 'error');
          navigate('/login', { replace: true });
        });
    } else {
      addToast('Invalid authentication callback.', 'error');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, addToast, fetchCurrentUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-700/50 backdrop-blur-md">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
          Completing Social Login
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Please wait while we secure your connection and prepare your dashboard...
        </p>
      </div>
    </div>
  );
}
