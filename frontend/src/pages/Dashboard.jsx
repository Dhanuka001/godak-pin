import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import SkeletonItemCard from '../components/SkeletonItemCard';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    condition: '',
    district: '',
    city: '',
    imageUrl: '',
  });
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/items');
      const mine = res.data.filter((item) => item.owner === user._id);
      setMyItems(mine);
    } catch (err) {
      setMyItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await api.post('/items', form);
      setMessage('භාණ්ඩය සාර්තකව එකතු විය.');
      setForm({ title: '', category: '', description: '', condition: '', district: '', city: '', imageUrl: '' });
      fetchItems();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fixed py-8 space-y-8">
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">නව භාණ්ඩයක් දාන්න</h2>
        <div className="text-sm text-slate-500">Add new item to share</div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-700">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-700">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-700">Condition</label>
                <input
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-700">District</label>
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-700">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
              />
              <div className="text-xs text-slate-500 mt-1">Preview only; stored as simple data URL for MVP.</div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              <span className="btn-label">
                <span className="si">නව භාණ්ඩයක් දාන්න</span>
                <span className="en">{saving ? 'Saving...' : 'Add item'}</span>
              </span>
            </button>
            {message && <div className="text-sm text-primary">{message}</div>}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 space-y-3">
            <div className="text-sm text-slate-700">Preview</div>
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" className="rounded-lg border border-slate-200" />
            ) : (
              <div className="h-48 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                No image selected
              </div>
            )}
            <div className="text-xs text-slate-500">
              භාණ්ඩය සාර්තකව එකතු විය – shown after saving successfully.
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">මගේ භාණ්ඩ</h2>
          <div className="text-sm text-slate-500">Items you posted</div>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonItemCard key={idx} />
            ))}
          </div>
        ) : myItems.length === 0 ? (
          <div className="card p-6 text-center text-slate-600 space-y-2">
            <div>ඔබගේ පළමු භාණ්ඩය දැන් දාන්න.</div>
            <div className="text-sm text-slate-500">No items yet</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
