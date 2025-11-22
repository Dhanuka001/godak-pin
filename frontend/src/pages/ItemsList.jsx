import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Filters from '../components/Filters';
import ItemCard from '../components/ItemCard';
import SkeletonItemCard from '../components/SkeletonItemCard';
import api from '../utils/api';

const ItemsList = () => {
  const location = useLocation();
  const initialState = location.state || { q: '', district: '', category: '' };
  const [filters, setFilters] = useState(initialState);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <div className="container-fixed py-8">
      <div className="mb-4 md:hidden">
        <Filters values={filters} onChange={setFilters} onSubmit={onSubmit} layout="bar" />
      </div>
      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="hidden md:block">
          <Filters values={filters} onChange={setFilters} onSubmit={onSubmit} layout="sidebar" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">භාණ්ඩ</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonItemCard key={idx} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card p-6 text-center text-slate-600">
              මෙම ප්‍රදේශයේ භාණ්ඩ නොමැත. පසුව නැවත බලන්න.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
