import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import { districtNames } from '../utils/locationData';
import CitySelect from '../components/CitySelect';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useLocale } from '../context/LocaleContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    mobile: '',
    district: '',
    city: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { t } = useLocale();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setForm({ ...form, district: value, city: '' });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        district: form.district,
        city: form.city,
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.error'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">{t('auth.register.title')}</h1>
        <div className="text-center text-sm text-slate-500">{t('auth.register.subtitle')}</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-700">{t('auth.register.name')}</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-700">{t('auth.register.email')}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-700">{t('auth.register.password')}</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-700">{t('auth.register.confirmPassword')}</label>
              <input
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
            <label className="text-sm text-slate-700">{t('auth.register.mobile')}</label>
              <input
                name="mobile"
                type="text"
                value={form.mobile}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-700">{t('auth.register.district')}</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">{t('auth.register.districtSelect')}</option>
                {districtNames.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
                <label className="text-sm text-slate-700">{t('auth.register.city')}</label>
                <CitySelect
                  district={form.district}
                  value={form.city}
                  required
                  onChange={(city) => setForm((prev) => ({ ...prev, city }))}
              placeholder={t('auth.register.cityPlaceholder')}
              helperText={t('citySelect.helper')}
                />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="btn-primary w-full">
            {t('auth.register.submit')}
          </button>
        </form>
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">or</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>
        <GoogleAuthButton onSuccess={() => navigate('/dashboard')} />
        <div className="text-center text-sm">
          {t('auth.register.existing')}{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark">
            {t('auth.login.title')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
