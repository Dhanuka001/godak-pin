import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

const Admin = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statRes, reportRes, itemRes, paymentRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/reports'),
        api.get('/items', { params: { limit: 6 } }),
        api.get('/admin/payments'),
      ]);
      setStats(statRes.data);
      setReports(reportRes.data);
      setItems(itemRes.data.slice(0, 6));
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
            <ItemCard key={item._id} item={item} />
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

      {loading && <div className="text-sm text-slate-500">Loading…</div>}
    </div>
  );
};

export default Admin;
