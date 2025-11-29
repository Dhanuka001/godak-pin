import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Filters from '../components/Filters';
import ItemCard from '../components/ItemCard';
import SkeletonItemCard from '../components/SkeletonItemCard';
import api from '../utils/api';
import { useLocale } from '../context/LocaleContext';

const ItemsList = () => {
  const location = useLocation();
  const initialState = { q: '', district: '', city: '', category: '', ...(location.state || {}) };
  const [filters, setFilters] = useState(initialState);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/items', { params: filters });
      setItems(res.data);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    fetchItems();
    setShowFilters(false);
  };

  const { t } = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      <div className="mb-4 md:hidden flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('itemsList.title')}</h2>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 shadow"
        >
          <span aria-hidden>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 5h16M6.5 12h11M9 19h6" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="9.5" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </span>
          <span>{t('itemsList.filters')}</span>
        </button>
      </div>
      {showFilters && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl p-4 animate-slideDown">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-slate-800">{t('itemsList.refine')}</h4>
              <button className="text-slate-500" onClick={() => setShowFilters(false)}>
                ✕
              </button>
            </div>
            <Filters values={filters} onChange={setFilters} onSubmit={onSubmit} layout="bar" />
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="hidden md:block">
          <Filters values={filters} onChange={setFilters} onSubmit={onSubmit} layout="sidebar" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 hidden md:block">{t('itemsList.sectionTitle')}</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonItemCard key={idx} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card p-6 text-center text-slate-600">{t('itemsList.empty')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {items.map((item) => (
                <ItemCard key={item.slug || item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
