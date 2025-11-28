import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import ItemDetailSkeleton from '../components/ItemDetailSkeleton';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';

const ItemDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localStatus, setLocalStatus] = useState('available');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [reporting, setReporting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { openChatWith } = useChatContext();
  const [boosting, setBoosting] = useState(false);

  const showToast = (text, tone = 'info') => {
    setToast({ text, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('boostReturn')) {
      showToast('Thanks! We are confirming your payment. Boost will appear shortly.', 'success');
      fetchItem();
    }
    if (params.get('boostCancelled')) {
      showToast('Payment cancelled. Boost not activated.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const isOwner = user && item?.owner && (item.owner._id === user._id || item.owner === user._id);

  const handleStatusChange = async () => {
    if (!isOwner) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/items/${slug}/status`, { status: localStatus });
      setItem((prev) => (prev ? { ...prev, status: localStatus } : prev));
      showToast('Status updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusValue = item?.status || localStatus || 'available';
  const statusLabel = {
    available: 'Available / ලබා දීමට',
    reserved: 'Reserved / රඳවා ඇත',
    given: 'Given / ලබා දී ඇත',
  }[statusValue];
  const isBoosted = item?.isBoosted || (item?.boostedUntil && new Date(item.boostedUntil).getTime() > Date.now());

  const statusTone =
    statusValue === 'given'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : statusValue === 'reserved'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-blue-50 text-blue-700 border-blue-100';

  const toastTone =
    toast?.tone === 'success'
      ? 'bg-emerald-600 text-white'
      : toast?.tone === 'error'
      ? 'bg-red-600 text-white'
      : 'bg-slate-900 text-white';
  const formatTimeAgo = () => {
    if (!item?.createdAt) return '';
    const now = new Date();
    const created = new Date(item.createdAt);
    const diffMs = now - created;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.max(minutes, 1)} min ago`;
  };

  const shareUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), []);
  const sharePlatforms = useMemo(() => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(item?.title || 'GodakPin.lk item');
    return [
      {
        label: 'WhatsApp',
        href: `https://wa.me/?text=${text}%20${url}`,
        iconSrc: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png',
        iconAlt: 'WhatsApp logo',
      },
      {
        label: 'Facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        iconSrc: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
        iconAlt: 'Facebook logo',
      },
      {
        label: 'Twitter',
        href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        iconSrc: 'https://cdn-icons-png.flaticon.com/512/5968/5968958.png',
        iconAlt: 'Twitter logo',
      },
      {
        label: 'Telegram',
        href: `https://t.me/share/url?url=${url}&text=${text}`,
        iconSrc: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
        iconAlt: 'Telegram logo',
      },
    ];
  }, [item?.title, shareUrl]);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleReport = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setReporting(true);
    try {
      await api.post(`/items/${slug}/report`, { reason: reportReason, message: reportMessage });
      showToast('Report sent. Thank you.', 'success');
      setShowReport(false);
      setReportReason('');
      setReportMessage('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send report', 'error');
    } finally {
      setReporting(false);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: item?.title || 'GodakPin.lk item',
      text: item?.description?.slice(0, 120) || '',
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Shared', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copied', 'success');
      }
    } catch (err) {
      // ignore cancel
    }
  };

  const handleStartChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const conversationId = item?.owner?._id || `donor-${slug}`;
    openChatWith({
      id: conversationId,
      name: contact?.name || 'Donor',
    });
    showToast('Chat opened', 'success');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      showToast('Link copied', 'success');
      setTimeout(() => setCopiedLink(false), 1500);
    } catch (err) {
      showToast('Could not copy link', 'error');
    }
  };

  const handleBoost = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isOwner) {
      showToast('Only the owner can boost this ad', 'error');
      return;
    }
    if (!item?._id) {
      showToast('Item not ready yet', 'error');
      return;
    }
    setBoosting(true);
    try {
      const res = await api.post('/payments/boost/create', { itemId: item._id });
      const { checkoutUrl, payload } = res.data || {};
      if (!checkoutUrl || !payload) throw new Error('Invalid payment session');

      // Build a form and post to PayHere hosted checkout
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutUrl;
      Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value ?? '';
        form.appendChild(input);
      });
      document.body.appendChild(form);
      showToast('Redirecting to secure payment…', 'info');
      form.submit();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not boost ad', 'error');
    } finally {
      setBoosting(false);
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
    <>
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 md:right-6 md:left-auto z-40 transition duration-300 ease-out">
          <div className={`rounded-xl px-4 py-3 shadow-2xl border border-white/10 ${toastTone} animate-toast-pop`}>
            <div className="text-sm font-semibold">{toast.text}</div>
          </div>
        </div>
      )}
      <div className="container-fixed py-8 space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 font-semibold text-sm text-primary hover:text-primary-dark"
        >
          <span aria-hidden>←</span>
          <span>Back</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="card overflow-hidden">
            <img
              src={item.imageUrl || 'https://via.placeholder.com/600x400.png?text=GodakPin.lk'}
              alt={item.title}
              className="w-full h-[320px] md:h-[420px] object-cover"
            />
          </div>
          <div className="space-y-4">
          <div className="card p-4 space-y-4 h-full min-h-[320px] md:min-h-[420px] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-slate-900">
                    දායකයා: <span className="font-bold">{contact?.name || item.ownerName || 'සාමාජික'}</span>
                  </div>
                  {contact?.note && <div className="text-sm text-slate-700">{contact.note}</div>}
                  <div>
                    <span className=" text-primary px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
                      <span aria-hidden>📍</span>
                      <span>{item.city || item.location || 'Location not provided'}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${statusTone}`}>
                      {statusLabel}
                    </span>
                    {isBoosted && (
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                        style={{ border: '1px solid #f4b000', backgroundColor: '#fff6d5', color: '#7a4b00' }}
                      >
                        <span aria-hidden>★</span>
                        <span>Boosted</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">Published {formatTimeAgo()}</div>
                </div>
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
              {isOwner && (
                <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                    <span aria-hidden>⚡</span>
                    <span>{isBoosted ? 'Currently boosted' : 'Need this gone fast?'}</span>
                  </div>
                  {!isBoosted && (
                    <>
                      <p className="text-sm text-amber-900">
                        Boost your ad for 24 hours for <strong>Rs. 800.00</strong>. Move this item quickly and keep your home space free.
                      </p>
                      <p className="text-sm text-amber-900">
                        මෙම අයිතමය ඉතා ඉක්මනින් ලබා දීමට අවශ්‍යද? පහලින් Boost කරන්න.
                      </p>
                    </>
                  )}
                  {isBoosted && (
                    <>
                      <p className="text-sm text-amber-900">
                        Your ad is boosted and sitting at the top. Keep eyes on it and reply quickly to close the pickup.
                      </p>
                      <p className="text-sm text-amber-900">
                        ඔබේ දැන්වීම උසස් කර ඇත.. ඉක්මනින් ප්‍රතිචාර දී අවශ්‍ය අය අමතන්න.
                      </p>
                    </>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!isBoosted && (
                      <button
                        type="button"
                        onClick={handleBoost}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600 disabled:opacity-70"
                        disabled={boosting}
                      >
                        {boosting ? 'Boosting…' : 'Boost for 24 hours'}
                      </button>
                    )}
                    {isBoosted && item?.boostedUntil && (
                      <span className="text-xs text-amber-800">
                        Active until {new Date(item.boostedUntil).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-auto space-y-3 pt-2">
                <div className="grid grid-cols-2 mt-2 gap-3">
                  <a
                    href={contact?.mobile ? `tel:${contact.mobile}` : undefined}
                    className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed text-center"
                    onClick={(e) => !contact?.mobile && e.preventDefault()}
                  >
                    Call donor
                  </a>
                  <button type="button" onClick={handleStartChat} className="btn-secondary text-center">
                    Chat with donor
                  </button>
                </div>
                <div className="flex flex-wrap items-center mt-5 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowShare(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition"
                  >
                    <span aria-hidden>🔗</span>
                    <span>Share this item</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-500"
                  >
                    <span aria-hidden>⚠️</span> Report this item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{item.title}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-full font-semibold text-slate-700">
                Condition: {item.condition}
              </span>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed">{item.description}</p>
          <div className="text-xs text-amber-600">
            ⚠ Donor and receiver handle pickup/delivery. Meet in safe public places and verify items before taking.
          </div>
        </div>
      </div>
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowShare(false)} />
          <div className="relative w-full max-w-2xl">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/40 via-amber-400/40 to-primary/60 blur-2xl opacity-60"
            />
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 space-y-5 animate-toast-pop border border-white/60">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-slate-900">Spread the word</h3>
                  <p className="text-sm text-slate-600">
                    Send this ad to a friend or a community group and help it reach the right hands.
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-primary transition"
                  onClick={() => setShowShare(false)}
                  aria-label="Close share options"
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sharePlatforms.map((platform) => (
                    <a
                      key={platform.label}
                      href={platform.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5"
                    >
                      <img src={platform.iconSrc} alt={platform.iconAlt} className="h-11 w-11 object-contain" />
                      <span className="text-center leading-tight">{platform.label}</span>
                    </a>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 shadow-inner">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Share link</div>
                  <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-700 break-words">
                    {shareUrl}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-3 py-2 text-sm font-semibold shadow hover:bg-primary-dark"
                    >
                      {copiedLink ? 'Copied!' : 'Copy link'}
                    </button>
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-primary hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canNativeShare}
                    >
                      <span aria-hidden>📲</span>
                      {canNativeShare ? 'Quick share' : 'Share on device'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReport(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-3 animate-toast-pop">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Report this item</h3>
              <button className="text-slate-500 hover:text-primary" onClick={() => setShowReport(false)}>
                ✕
              </button>
            </div>
            <div>
              <label className="text-sm text-slate-700">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="spam">Spam / duplicates</option>
                <option value="safety">Safety concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-700">More details (optional)</label>
              <textarea
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary h-24 mt-1"
              />
            </div>
            <button
              type="button"
              onClick={handleReport}
              disabled={!reportReason || reporting}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {reporting ? 'Sending...' : 'Submit report'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemDetail;
