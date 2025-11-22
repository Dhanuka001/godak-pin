import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import ItemDetailSkeleton from '../components/ItemDetailSkeleton';
import { useAuthContext } from '../context/AuthContext';

const ItemDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localStatus, setLocalStatus] = useState('available');
  const [statusMessage, setStatusMessage] = useState('');

  const contact = useMemo(() => {
    if (!item?.owner) return null;
    return {
      name: item.owner.name || item.ownerName,
      mobile: item.owner.mobile || '',
      email: item.owner.email || '',
      city: item.owner.city || item.city,
      district: item.owner.district || item.district,
      note: item.owner.contactNote || '',
    };
  }, [item]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/${slug}`);
      setItem(res.data);
      setLocalStatus(res.data.status || 'available');
    } catch (err) {
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const isOwner = user && item?.owner && (item.owner._id === user._id || item.owner === user._id);

  const handleStatusChange = async () => {
    if (!isOwner) return;
    setUpdatingStatus(true);
    setStatusMessage('');
    try {
      await api.put(`/items/${slug}/status`, { status: localStatus });
      setItem((prev) => (prev ? { ...prev, status: localStatus } : prev));
      setStatusMessage('Status updated');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const chatLink = useMemo(() => {
    if (!contact?.mobile) return null;
    const digits = contact.mobile.replace(/\\D/g, '');
    return `https://wa.me/${digits}`;
  }, [contact]);

  const statusValue = item?.status || localStatus || 'available';
  const statusLabel = {
    available: 'Available / ලබා දීමට',
    reserved: 'Reserved / රඳවා ඇත',
    given: 'Given / ලබා දී ඇත',
  }[statusValue];

  const statusTone =
    statusValue === 'given'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : statusValue === 'reserved'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-blue-50 text-blue-700 border-blue-100';

  if (loading) return <ItemDetailSkeleton />;

  if (!item) {
    return (
      <div className="container-fixed py-8">
        <div className="card p-6 text-center text-slate-600">Item not found.</div>
      </div>
    );
  }

  return (
    <div className="container-fixed py-8 space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 font-semibold text-sm text-primary hover:text-primary-dark"
      >
        <span aria-hidden>←</span>
        <span>Back</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          <img
            src={item.imageUrl || 'https://via.placeholder.com/600x400.png?text=GodakPin.lk'}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-semibold">{item.title}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${statusTone}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              {item.district} • {item.city}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">{item.condition}</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{item.description}</p>
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                දායකයා: <strong>{contact?.name || item.ownerName || 'සාමාජික'}</strong>{' '}
                ({contact?.district || item.ownerDistrict || item.district})
              </div>
              {contact?.city && <div className="text-xs text-slate-500">{contact.city}</div>}
            </div>
            {contact?.note && <div className="text-sm text-slate-700">{contact.note}</div>}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={contact?.mobile ? `tel:${contact.mobile}` : undefined}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed text-center"
                onClick={(e) => !contact?.mobile && e.preventDefault()}
              >
                Call donor
              </a>
              <a
                href={chatLink || undefined}
                className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed text-center"
                onClick={(e) => {
                  if (!chatLink) e.preventDefault();
                }}
              >
                Chat with donor
              </a>
            </div>
            {isOwner && (
              <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">Status</label>
                  <select
                    value={localStatus}
                    onChange={(e) => setLocalStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="available">Available / ලබා දීමට</option>
                    <option value="reserved">Reserved / රඳවා ඇත</option>
                    <option value="given">Given / ලබා දී ඇත</option>
                  </select>
                </div>
                  <button
                    type="button"
                    onClick={handleStatusChange}
                    disabled={updatingStatus}
                    className="btn-secondary"
                  >
                    {updatingStatus ? 'Saving...' : 'Update status'}
                  </button>
                </div>
              )}
            {statusMessage && <div className="text-xs text-primary">{statusMessage}</div>}
            <div className="text-xs text-amber-600">
              ⚠ Donor and receiver handle pickup/delivery. Meet in safe public places and verify items before taking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
