import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useLocale } from '../context/LocaleContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { t } = useLocale();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.error'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">{t('auth.login.title')}</h1>
        <div className="text-center text-sm text-slate-500">{t('auth.login.subtitle')}</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-700">{t('auth.login.email')}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-700">{t('auth.login.password')}</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="btn-primary w-full">
            {t('auth.login.submit')}
          </button>
        </form>
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">{t('auth.or')}</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>
        <GoogleAuthButton onSuccess={() => navigate('/dashboard')} />
        <div className="text-center text-sm">
          {t('auth.register.existing')}{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark">
            {t('auth.register.title')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
