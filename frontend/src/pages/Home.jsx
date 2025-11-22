import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ItemCard from '../components/ItemCard';
import SkeletonItemCard from '../components/SkeletonItemCard';
import api from '../utils/api';

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

  return (
    <div>
      <Hero onSearch={(payload) => fetchItems(payload)} />
      <section className="container-fixed pt-12 pb-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 mb-5 ">Latest items</h2>
          <button
            onClick={() => navigate('/items')}
            className="text-primary hover:text-primary-dark font-semibold"
          >
            සියල්ල බලන්න
          </button>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonItemCard key={idx} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-center text-slate-600">
            මෙම ප්‍රදේශයේ භාණ්ඩ නොමැත. පසුව නැවත බලන්න.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
