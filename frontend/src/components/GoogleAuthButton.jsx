import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';

const GoogleAuthButton = ({ onSuccess }) => {
  const { login } = useAuthContext();
  const [error, setError] = useState('');
  const buttonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(googleClientId);

  const handleGoogleResponse = useCallback(
    async (credentialResponse) => {
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
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      }
    },
    [login, onSuccess]
  );

  useEffect(() => {
    if (!isConfigured || !buttonRef.current) return;
    const { google } = window;
    if (!google?.accounts?.id) {
      setError('Google Identity script not loaded. Please refresh and ensure the domain is allowed in Google Console.');
      return;
    }
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleResponse,
      cancel_on_tap_outside: true,
    });
    buttonRef.current.innerHTML = '';
    buttonRef.current.className = 'g_id_signin';
    google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      size: 'large',
      theme: 'outline',
      shape: 'rectangular',
      text: 'signin_with',
    });
  }, [googleClientId, isConfigured, handleGoogleResponse]);

  if (!isConfigured) return null;

  return (
    <div className="space-y-2">
      <div ref={buttonRef} />
      <button
        type="button"
        className="hidden"
        onClick={() =>
          setError(
            `Google login was blocked for this origin (${window.location.origin}). Add this origin to the OAuth client's Authorized JavaScript origins and ensure the client ID matches the backend.`
          )
        }
        aria-hidden="true"
      />
      {error && <div className="text-sm text-red-600 text-center">{error}</div>}
    </div>
  );
};

export default GoogleAuthButton;
