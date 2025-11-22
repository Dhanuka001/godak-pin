import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import ItemDetailSkeleton from '../components/ItemDetailSkeleton';
import { useAuthContext } from '../context/AuthContext';

const ItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const fetchItem = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data);
    } catch (err) {
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/items/${id}/request`);
      setMessage('ඉල්ලීම සටහන් විය (Request recorded).');
    } catch (err) {
      setMessage(err.response?.data?.message || 'කණගාටුයි, දෝෂයකි.');
    }
  };

  if (loading) return <ItemDetailSkeleton />;

  if (!item) {
    return (
      <div className="container-fixed py-8">
        <div className="card p-6 text-center text-slate-600">Item not found.</div>
      </div>
    );
  }

  return (
    <div className="container-fixed py-8 grid md:grid-cols-2 gap-8">
      <div className="card overflow-hidden">
        <img
          src={item.imageUrl || 'https://via.placeholder.com/600x400.png?text=GodakPin.lk'}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
          <span className="bg-slate-100 px-3 py-1 rounded-full">
            {item.district} • {item.city}
          </span>
          <span className="bg-slate-100 px-3 py-1 rounded-full">{item.condition}</span>
        </div>
        <p className="text-slate-700 leading-relaxed">{item.description}</p>
        <div className="card p-4 space-y-2">
          <div className="text-sm text-slate-600">
            දායකයා: <strong>{item.ownerName || 'සාමාජික'}</strong> ({item.ownerDistrict || item.district})
          </div>
          <div className="text-xs text-amber-600">
            ⚠ සුරක්ෂිතව හමුවන්න – දින මැද, පොදු ස්ථානයක.
            <div className="text-[11px] text-slate-500">Meet in public places during the day.</div>
          </div>
          <button onClick={handleRequest} className="btn-primary w-full">
            <span className="btn-label">
              <span className="si">අයිතමය ඉල්ලන්න</span>
              <span className="en">Request this item</span>
            </span>
          </button>
          {message && <div className="text-sm text-primary">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
