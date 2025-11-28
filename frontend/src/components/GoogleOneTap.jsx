import { useState } from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';

const GoogleOneTap = () => {
  const { user, login } = useAuthContext();
  const [error, setError] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(googleClientId);

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse?.credential) {
        setError('Google sign-in failed. Please try again.');
        return;
      }
      setError('');
      try {
        const res = await api.post(
          '/auth/google',
          { credential: credentialResponse.credential },
          { withCredentials: true }
        );
        login(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      }
    },
    onError: () =>
      setError(
        `Google One Tap was blocked for this origin (${window.location.origin}). Add this origin to the OAuth client's Authorized JavaScript origins and ensure the client ID matches the backend.`
      ),
    disabled: !isConfigured || Boolean(user),
  });

  if (!isConfigured || user || !error) return null;

  return <div className="text-xs text-red-600 text-center">{error}</div>;
};

export default GoogleOneTap;
