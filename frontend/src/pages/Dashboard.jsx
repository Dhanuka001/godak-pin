import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import SkeletonItemCard from '../components/SkeletonItemCard';
import { districtNames } from '../utils/locationData';
import CitySelect from '../components/CitySelect';
import { categories } from '../utils/categoryData';
const conditions = ['Like new', 'Used - good', 'Used - fair'];

const Dashboard = () => {
  const { user, setProfile: setUserProfile } = useAuthContext();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    district: user?.district || '',
    city: user?.city || '',
    contactNote: user?.contactNote || '',
  });
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    district: user?.district || '',
    city: user?.city || '',
    contactNote: user?.contactNote || '',
  });
  const [editingProfile, setEditingProfile] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    condition: '',
    district: '',
    city: '',
    images: [],
    primaryImageIndex: 0,
  });
  const [showItemForm, setShowItemForm] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUserProfile(res.data.user);
      setProfile({
        name: res.data.user.name || '',
        email: res.data.user.email || '',
        mobile: res.data.user.mobile || '',
        district: res.data.user.district || '',
        city: res.data.user.city || '',
        contactNote: res.data.user.contactNote || '',
      });
      setProfileForm({
        name: res.data.user.name || '',
        email: res.data.user.email || '',
        mobile: res.data.user.mobile || '',
        district: res.data.user.district || '',
        city: res.data.user.city || '',
        contactNote: res.data.user.contactNote || '',
      });
    } catch (err) {
      // ignore
    }
  };

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
    fetchProfile();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setForm({ ...form, district: value, city: '' });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((images) => {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
        primaryImageIndex: prev.images.length ? prev.primaryImageIndex : 0,
      }));
    });
  };

  const setPrimaryImage = (idx) => {
    setForm((prev) => ({ ...prev, primaryImageIndex: idx }));
  };

  const removeImage = (idx) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== idx);
      const nextPrimary = prev.primaryImageIndex >= nextImages.length ? 0 : prev.primaryImageIndex;
      return { ...prev, images: nextImages, primaryImageIndex: nextPrimary };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await api.post('/items', {
        ...form,
        images: form.images,
        primaryImageIndex: form.primaryImageIndex,
      });
      setMessage('භාණ්ඩය සාර්තකව එකතු විය.');
      setForm({
        title: '',
        category: '',
        description: '',
        condition: '',
        district: '',
        city: '',
        images: [],
        primaryImageIndex: 0,
      });
      setShowItemForm(false);
      fetchItems();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save item');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setProfileForm({ ...profileForm, district: value, city: '' });
      return;
    }
    setProfileForm({ ...profileForm, [name]: value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/auth/me', profileForm);
      setUserProfile(res.data.user);
      setProfile(res.data.user);
      setProfileForm({
        name: res.data.user.name || '',
        email: res.data.user.email || '',
        mobile: res.data.user.mobile || '',
        district: res.data.user.district || '',
        city: res.data.user.city || '',
        contactNote: res.data.user.contactNote || '',
      });
      setEditingProfile(false);
    } catch (err) {
      // ignore for now
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">මගේ ගිණුම</h2>
            <div className="text-sm text-slate-500">Profile & contact details</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary text-sm px-4 py-2"
              onClick={() => setEditingProfile((v) => !v)}
            >
              {editingProfile ? 'Close' : 'Edit profile'}
            </button>
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-500"
              onClick={() => {
                // logout is only exposed inside account as requested
                const event = new CustomEvent('gp:logout');
                window.dispatchEvent(event);
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm text-slate-500">Name</div>
            <div className="text-lg font-semibold text-slate-900">{profile.name}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm text-slate-500">Mobile</div>
            <div className="text-lg font-semibold text-slate-900">{profile.mobile}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm text-slate-500">ස්ථානය</div>
            <div className="text-lg font-semibold text-slate-900">
              {profile.district} {profile.city ? `• ${profile.city}` : ''}
            </div>
          </div>
        </div>
        {profile.contactNote && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm text-slate-500">Contact note</div>
            <div className="text-sm text-slate-700">{profile.contactNote}</div>
          </div>
        )}

        {editingProfile && (
          <form onSubmit={submitProfile} className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-700">Name</label>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Mobile</label>
                <input
                  name="mobile"
                  value={profileForm.mobile}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">District</label>
                <select
                  name="district"
                  value={profileForm.district}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select district</option>
                  {districtNames.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-700">City</label>
                <CitySelect
                  district={profileForm.district}
                  value={profileForm.city}
                  name="profileCity"
                  onChange={(city) => setProfileForm((prev) => ({ ...prev, city }))}
                  placeholder="Select or search your city"
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Contact note</label>
                <textarea
                  name="contactNote"
                  value={profileForm.contactNote}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={profileSaving}>
                {profileSaving ? 'Saving...' : 'Update profile'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">මගේ භාණ්ඩ</h2>
            <div className="text-sm text-slate-500">Items you posted</div>
          </div>
          <button className="btn-secondary text-sm px-4 py-2" onClick={() => setShowItemForm((v) => !v)}>
            {showItemForm ? 'Close form' : 'නව භාණ්ඩයක් දාන්න'}
          </button>
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

      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowItemForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">නව භාණ්ඩයක් දාන්න</h3>
                <p className="text-sm text-slate-500">Fill details and set a primary image</p>
              </div>
              <button
                className="text-slate-500 hover:text-primary text-lg"
                onClick={() => setShowItemForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-700">Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleItemChange}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleItemChange}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.nameEn} value={c.nameEn}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-slate-700">Condition</label>
                    <select
                      name="condition"
                      value={form.condition}
                      onChange={handleItemChange}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select condition</option>
                      {conditions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">District</label>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleItemChange}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select district</option>
                      {districtNames.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-700">City</label>
                    <CitySelect
                      district={form.district}
                      value={form.city}
                      name="itemCity"
                      required
                      onChange={(city) => setForm((prev) => ({ ...prev, city }))}
                      placeholder="Select or search your city"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-700">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleItemChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary h-24"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Images (multiple)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImages}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2"
                  />
                  <div className="text-xs text-slate-500 mt-1">Select multiple files; choose primary image below.</div>
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
                <div className="text-sm text-slate-700">Preview & primary image</div>
                {form.images.length === 0 ? (
                  <div className="h-48 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                    No images selected
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative border border-slate-200 rounded-lg overflow-hidden">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover" />
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <input
                            type="radio"
                            name="primaryImage"
                            checked={form.primaryImageIndex === idx}
                            onChange={() => setPrimaryImage(idx)}
                          />
                          <span className="text-xs bg-white/80 px-2 py-1 rounded">Primary</span>
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full w-7 h-7"
                          onClick={() => removeImage(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
