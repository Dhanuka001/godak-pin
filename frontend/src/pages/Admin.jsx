import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import ItemCard from '../components/ItemCard';
import CitySelect from '../components/CitySelect';
import { districtNames } from '../utils/locationData';
import { categories } from '../utils/categoryData';

const conditions = ['Like new', 'Used - good', 'Used - fair'];
const createEmptyEditForm = () => ({
  title: '',
  category: '',
  description: '',
  condition: '',
  district: '',
  city: '',
});

const Admin = () => {
  const { user } = useAuthContext();
  const { t } = useLocale();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [itemActionId, setItemActionId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState(createEmptyEditForm());
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [editPrimaryImageIndex, setEditPrimaryImageIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statRes, reportRes, itemRes, paymentRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/reports'),
        api.get('/admin/items'),
        api.get('/admin/payments'),
      ]);
      setStats(statRes.data);
      setReports(reportRes.data);
      setItems(itemRes.data);
      setPayments(paymentRes.data);
    } catch (err) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateReportStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/admin/reports/${id}/status`, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      // ignore for now
    } finally {
      setUpdating(null);
    }
  };

  const setStatus = async (item, status) => {
    setItemActionId(item._id);
    try {
      const res = await api.put(`/admin/items/${item._id}`, { status });
      setItems((prev) => prev.map((it) => (it._id === item._id ? res.data : it)));
    } finally {
      setItemActionId(null);
    }
  };

  const openConfirm = (item, type) => {
    setConfirmAction({ item, type });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const status = confirmAction.type === 'delete' ? 'deleted' : 'available';
    await setStatus(confirmAction.item, status);
    setConfirmAction(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      category: item.category || '',
      description: item.description || '',
      condition: item.condition || '',
      district: item.district || '',
      city: item.city || '',
    });
    setEditError('');
    setEditImages([]);
    setEditPrimaryImageIndex(0);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
    setEditForm(createEmptyEditForm());
    setEditError('');
    setEditImages([]);
    setEditPrimaryImageIndex(0);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'district') {
      setEditForm((prev) => ({ ...prev, district: value, city: '' }));
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditCityChange = (city) => {
    setEditForm((prev) => ({ ...prev, city }));
  };

  const handleEditImages = (e) => {
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
      setEditImages((prev) => {
        const next = [...prev, ...images];
        setEditPrimaryImageIndex((prevIndex) => {
          if (!next.length) return 0;
          if (prevIndex >= next.length) return next.length - 1;
          return prevIndex;
        });
        return next;
      });
      e.target.value = '';
    });
  };

  const setEditPrimaryImage = (idx) => {
    setEditPrimaryImageIndex(idx);
  };

  const removeEditImage = (idx) => {
    setEditImages((prev) => {
      const nextImages = prev.filter((_, index) => index !== idx);
      setEditPrimaryImageIndex((prevIndex) => {
        if (!nextImages.length) return 0;
        if (idx === prevIndex) {
          return Math.min(prevIndex, nextImages.length - 1);
        }
        if (prevIndex > idx) {
          return prevIndex - 1;
        }
        return prevIndex;
      });
      return nextImages;
    });
  };

  const submitEditForm = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditSaving(true);
    setEditError('');
    try {
      const payload = { ...editForm };
      if (editImages.length) {
        const normalizedImages = editImages.map((url, idx) => ({
          url,
          isPrimary: editPrimaryImageIndex === idx,
        }));
        const primaryImage =
          normalizedImages.find((img) => img.isPrimary)?.url ||
          normalizedImages[0]?.url ||
          editingItem.imageUrl ||
          '/images/placeholder.jpg';
        payload.images = normalizedImages;
        payload.imageUrl = primaryImage;
      }
      const res = await api.put(`/admin/items/${editingItem._id}`, payload);
      setItems((prev) => prev.map((it) => (it._id === editingItem._id ? res.data : it)));
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Could not update item');
    } finally {
      setEditSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container-fixed py-10">
        <div className="card p-6 text-center text-slate-600">Admins only.</div>
      </div>
    );
  }

  return (
    <div className="container-fixed py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Monitor reports and platform activity</p>
        </div>
        <button className="btn-secondary text-sm" onClick={fetchData}>
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-xs text-slate-500">Users</div>
            <div className="text-2xl font-semibold">{stats.totalUsers}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Items</div>
            <div className="text-2xl font-semibold">{stats.totalItems}</div>
            <div className="text-xs text-slate-500 mt-1">
              Available: {stats.itemsByStatus?.available || 0} / Reserved: {stats.itemsByStatus?.reserved || 0} / Given:{' '}
              {stats.itemsByStatus?.given || 0}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Reports</div>
            <div className="text-2xl font-semibold">{stats.totalReports}</div>
            <div className="text-xs text-amber-600 mt-1">Open: {stats.openReports}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Boost revenue</div>
            <div className="text-2xl font-semibold">
              {stats?.revenue?.currency || 'LKR'} {stats?.revenue?.total?.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Successful boosts: {stats?.revenue?.count || 0}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-slate-500">Latest items</div>
            <div className="text-sm text-slate-700">Showing recent 6</div>
          </div>
        </div>
      )}

      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Reports</h2>
        {reports.length === 0 ? (
          <div className="text-sm text-slate-500">No reports yet.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{r.item?.title || 'Item'}</div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                      r.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {r.reason} • {r.reporter?.name || r.reporterName} • {new Date(r.createdAt).toLocaleString()}
                </div>
                {r.message && <div className="text-sm text-slate-700 mt-1">{r.message}</div>}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="btn-secondary text-xs px-3 py-2"
                    disabled={updating === r._id}
                    onClick={() => updateReportStatus(r._id, 'resolved')}
                  >
                    Mark resolved
                  </button>
                  <button
                    className="text-xs text-slate-600 underline"
                    disabled={updating === r._id}
                    onClick={() => updateReportStatus(r._id, 'open')}
                  >
                    Mark open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        <div className="card p-4 space-y-3">
          <h2 className="text-lg font-semibold">Latest items</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="space-y-2">
                <ItemCard item={item} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.status === 'deleted'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}
                  >
                    {item.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary text-xs px-3 py-1"
                      onClick={() => openEditModal(item)}
                      disabled={itemActionId === item._id}
                    >
                      Edit
                    </button>
                    {item.status === 'deleted' ? (
                      <button
                        className="btn-secondary text-xs px-3 py-1"
                        disabled={itemActionId === item._id}
                        onClick={() => openConfirm(item, 'reactivate')}
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        className="text-xs text-red-600 hover:text-red-500"
                        disabled={itemActionId === item._id}
                        onClick={() => openConfirm(item, 'delete')}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      <div className="card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Recent payments</h2>
        {payments.length === 0 ? (
          <div className="text-sm text-slate-500">No payments yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p._id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">
                    {p.item?.title || 'Item'} • {p.orderId}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.user?.name || 'User'} • {new Date(p.createdAt).toLocaleString()}
                    {p.paidAt ? ` • Paid ${new Date(p.paidAt).toLocaleString()}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold">
                    {p.currency} {Number(p.amount || 0).toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      p.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : p.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEditModal} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 overflow-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Edit item</h3>
                <p className="text-sm text-slate-500">Update the title, location, or description.</p>
              </div>
              <button
                className="text-slate-500 hover:text-primary text-2xl leading-none"
                onClick={closeEditModal}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </div>
            <form onSubmit={submitEditForm} className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-700">Title</label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-700">{t('dashboard.categoryLabel')}</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">{t('dashboard.selectCategory')}</option>
                    {categories.map((c) => (
                      <option key={c.key} value={c.value}>
                        {t(c.key, c.value)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-slate-700">Condition</label>
                    <select
                      name="condition"
                      value={editForm.condition}
                      onChange={handleEditChange}
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
                      value={editForm.district}
                      onChange={handleEditChange}
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
                      district={editForm.district}
                      value={editForm.city}
                      name="editCity"
                      required
                      onChange={handleEditCityChange}
                      placeholder="e.g., Colombo"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-700">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary h-32"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImages}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Upload new images to replace the current preview (optional).
                  </div>
                </div>
                {editImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {editImages.map((img, idx) => (
                      <div
                        key={`edit-img-${idx}`}
                        className="relative border border-slate-200 rounded-lg overflow-hidden h-28"
                      >
                        <img src={img} alt={`New preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px]">
                          <input
                            type="radio"
                            name="editPrimaryImage"
                            checked={editPrimaryImageIndex === idx}
                            onChange={() => setEditPrimaryImage(idx)}
                          />
                          <span className="bg-white/90 px-2 py-1 rounded">Primary</span>
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-white/80 text-red-600 rounded-full w-6 h-6 text-sm leading-none"
                          onClick={() => removeEditImage(idx)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full" disabled={editSaving}>
                  {editSaving ? 'Saving…' : 'Save changes'}
                </button>
                {editError && <div className="text-sm text-red-600">{editError}</div>}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 space-y-3">
                <div className="text-sm text-slate-700">Current preview</div>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={editingItem.imageUrl || '/placeholder.jpg'}
                    alt={editingItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200.png?text=GodakPin.lk';
                    }}
                  />
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">{editingItem.title}</div>
                  <div className="text-xs text-slate-500">
                    {editingItem.category} • {editingItem.condition}
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    {editingItem.city ? `${editingItem.city}, ` : ''}
                    {editingItem.district}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                  {editingItem.description}
                </p>
                {editImages.length > 0 && (
                  <div className="text-xs text-slate-500">
                    New image(s) will replace this preview once you save the changes.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {confirmAction.type === 'delete' ? 'Confirm delete' : 'Reactivate item'}
            </h3>
            <p className="text-sm text-slate-600">
              {confirmAction.type === 'delete'
                ? 'The item will be hidden from public listings, but you can still reactivate it later.'
                : 'The item will be visible again to the community.'}
            </p>
            <p className="text-sm text-slate-500">
              <strong>{confirmAction.item.title}</strong> • {confirmAction.item._id}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-700"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-sm px-4 py-2"
                onClick={handleConfirm}
                disabled={itemActionId === confirmAction.item._id}
              >
                {confirmAction.type === 'delete' ? 'Soft delete' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
