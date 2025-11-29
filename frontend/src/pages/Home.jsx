import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import ItemCard from '../components/ItemCard';
import SkeletonItemCard from '../components/SkeletonItemCard';
import api from '../utils/api';
import { useLocale } from '../context/LocaleContext';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchItems = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/items', { params });
      setItems(res.data.slice(0, 6));
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const { t } = useLocale();

  return (
    <div>
      <Hero onSearch={(payload) => fetchItems(payload)} />
      <Categories />
      <section className="max-w-7xl mx-auto px-4 pt-4 pb-12 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">{t('home.heading')}</h2>
            <div className="text-sm text-slate-600">{t('home.subheading')}</div>
          </div>
          <button
            onClick={() => navigate('/items')}
            className="text-primary hover:text-primary-dark font-semibold"
          >
            {t('home.viewAll')}
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonItemCard key={idx} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-center text-slate-600">{t('home.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.slice(0, 12).map((item) => (
              <ItemCard key={item.slug || item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
