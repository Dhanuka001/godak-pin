import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LocaleProvider } from './context/LocaleContext';

const Providers = ({ children }) => (
  <BrowserRouter>
    <LocaleProvider>
      <AuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </AuthProvider>
    </LocaleProvider>
  </BrowserRouter>
);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isGoogleConfigured = Boolean(googleClientId);
const app = (
  <Providers>
    <App />
  </Providers>
);
const withGoogle = isGoogleConfigured ? (
  <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
) : (
  app
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {withGoogle}
  </React.StrictMode>
);
