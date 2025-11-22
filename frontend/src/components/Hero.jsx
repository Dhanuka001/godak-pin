import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/godak-pin-web-hero.png';
import { districtNames } from '../utils/locationData';
import { categoriesForFilters } from '../utils/categoryData';

const Hero = ({ onSearch }) => {
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    onSearch({ q, district, category });
    navigate('/items', { state: { q, district, category } });
  };

  return (
    <section className="relative text-white pb-10 overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-90 mix-blend-multiply"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/85" />
      <div className="container-fixed py-10 relative z-10">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              ඔබ භාවිතා නොකරන, වෙන ආයෙකුට භාවිතා කළ හැකි දේවල් විශ්වාසයෙන් බෙදාගන්න.
            </h1>
            <p className="mt-3 text-white/80">
              Give unused items a new life in Sri Lanka. Share with trust, receive with gratitude.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 text-white px-4 py-2 text-sm font-semibold">
                No buying-selling, only giving
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 text-slate-900 px-6 py-3 font-semibold transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-primary"
            >
              <span className="btn-label">
                <span className="si">නව භාණ්ඩයක් දාන්න</span>
                <span className="en">Add new item</span>
              </span>
            </button>
            <button
              onClick={() => navigate('/items')}
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 text-slate-900 px-6 py-3 font-semibold transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-primary"
            >
              <span className="btn-label">
                <span className="si">භාණ්ඩ සොයන්න</span>
                <span className="en">Browse items</span>
              </span>
            </button>
          </div>
        </div>

        <form
          onSubmit={submit}
        className="mt-8 bg-white/30 backdrop-blur-md rounded-2xl shadow-card px-4 py-4 md:px-6 md:py-5 max-w-5xl mx-auto border border-white/50"
        >
          <div className="grid md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center">
            <input
              type="text"
              placeholder="භාණ්ඩ සොයන්න…"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">දිශාව</option>
              {districtNames.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">ප්‍රවර්ගය</option>
              {categoriesForFilters.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {c.nameEn}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary w-full md:w-auto px-6 py-3">
              <span className="btn-label">
                <span className="si">සොයන්න</span>
                <span className="en">Search</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;
