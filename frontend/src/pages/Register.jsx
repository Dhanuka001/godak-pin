import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import { districtNames } from '../utils/locationData';
import CitySelect from '../components/CitySelect';
import GoogleAuthButton from '../components/GoogleAuthButton';

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
      setError('Passwords do not match');
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
      setError(err.response?.data?.message || 'Could not register');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">ගිණුමක් තනන්න</h1>
        <div className="text-center text-sm text-slate-500">Create your account</div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-700">Name</label>
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
            <label className="text-sm text-slate-700">Email</label>
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
              <label className="text-sm text-slate-700">Password</label>
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
              <label className="text-sm text-slate-700">Confirm Password</label>
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
              <label className="text-sm text-slate-700">Mobile</label>
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
              <label className="text-sm text-slate-700">District</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">දිස්ත්‍රික්කය / District</option>
                {districtNames.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-700">Nearest City</label>
            <CitySelect
              district={form.district}
              value={form.city}
              required
              onChange={(city) => setForm((prev) => ({ ...prev, city }))}
              placeholder="Select or search your city"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="btn-primary w-full">
            <span className="btn-label">
              <span className="si">ගිණුමක් තනන්න</span>
              <span className="en">Register</span>
            </span>
          </button>
        </form>
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">or</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>
        <GoogleAuthButton onSuccess={() => navigate('/dashboard')} />
        <div className="text-center text-sm">
          දැනටමත් ගිණුමක් තියෙනවද?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark">
            ලොග් වෙන්න
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
