import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrders, updateStatus } from '../api/orders';

function StatusBadge({ status }) {
  const styles = {
    CREATED: 'bg-surface-container text-text-muted',
    ASSIGNED: 'bg-primary/10 text-primary',
    PICKED_UP: 'bg-primary/20 text-primary',
    IN_TRANSIT: 'bg-warning-amber/10 text-warning-amber',
    OUT_FOR_DELIVERY: 'bg-secondary-container/20 text-on-secondary-container',
    DELIVERED: 'bg-success-green/10 text-success-green',
    FAILED: 'bg-error/10 text-error',
    RESCHEDULED: 'bg-warning-amber/10 text-warning-amber',
  };
  const labels = {
    CREATED: 'Created', ASSIGNED: 'Assigned', PICKED_UP: 'Picked Up',
    IN_TRANSIT: 'In Transit', OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered', FAILED: 'Failed', RESCHEDULED: 'Rescheduled',
  };
  return (
    <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${styles[status] || 'bg-surface-container text-text-muted'}`}>
      {labels[status] || status}
    </span>
  );
}

// Inline failure reason modal
function FailModal({ orderId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Failure reason is required.'); return; }
    setLoading(true);
    try {
      await updateStatus(orderId, { status: 'FAILED', note: reason });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md font-bold text-error">Mark as Failed</h2>
          <button onClick={onClose}><span className="material-symbols-outlined text-text-muted">close</span></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-error-container text-error text-body-sm font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-primary mb-2">Failure Reason <span className="text-error">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:border-error outline-none text-body-md resize-none"
              placeholder="e.g. Customer not available, wrong address..."
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-outline-variant rounded-full font-bold text-primary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-error text-white rounded-full font-bold disabled:opacity-60">
              {loading ? 'Saving...' : 'Mark Failed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [updatingId, setUpdatingId] = useState(null);
  const [failModalOrderId, setFailModalOrderId] = useState(null);

  const loadOrders = () => {
    getOrders()
      .then((data) => setOrders(data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const ACTIVE_STATUSES = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'];
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.currentStatus));
  const completedOrders = orders.filter((o) => ['DELIVERED', 'FAILED', 'RESCHEDULED'].includes(o.currentStatus));
  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  // Auto-availability: if agent has active orders they're "busy", otherwise "available"
  const autoAvailability = activeOrders.length > 0 ? 'busy' : 'available';

  const NEXT_STATUS = { ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
  const NEXT_LABEL = { ASSIGNED: 'Mark Picked Up', PICKED_UP: 'Mark In Transit', IN_TRANSIT: 'Mark Out for Delivery', OUT_FOR_DELIVERY: 'Mark Delivered' };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, currentStatus: newStatus } : o));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFailSuccess = () => {
    setFailModalOrderId(null);
    setLoading(true);
    loadOrders();
  };

  return (
    <div className="bg-background min-h-screen flex overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-primary-container text-white sticky top-0 h-screen z-40 pt-8">
        <div className="px-8 mb-10">
          <Link to="/" className="text-headline-md font-black text-accent-lime tracking-tighter">Last Mile</Link>
          <p className="text-on-primary-container text-label-sm mt-1 uppercase tracking-widest opacity-60">Agent Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'active', icon: 'local_shipping', label: `Active (${activeOrders.length})` },
            { id: 'completed', icon: 'check_circle', label: `Completed (${completedOrders.length})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === item.id ? 'bg-on-primary-container/10 text-accent-lime' : 'text-on-primary-container hover:bg-on-primary-container/5'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Agent Status Indicator */}
        <div className="mx-4 mb-4 p-3 rounded-2xl bg-black/10 flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${autoAvailability === 'available' ? 'bg-success-green' : 'bg-warning-amber'}`} />
          <span className="text-on-primary-container/80 text-label-sm capitalize">{autoAvailability}</span>
        </div>

        <div className="p-6 bg-black/20 m-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-lime flex items-center justify-center text-primary font-black text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-body-sm font-bold">{user?.name || 'Agent'}</p>
              <p className="text-[10px] text-on-primary-container/70">Delivery Runner</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-2 text-on-primary-container/70 hover:text-white text-label-sm">
            <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)] sticky top-0 z-40">
          <div className="flex justify-between items-center px-[24px] md:px-[40px] py-4 max-w-full">
            <div>
              <h1 className="text-headline-md font-bold text-primary">
                {activeTab === 'active' ? 'Active Orders' : 'Completed Orders'}
              </h1>
              <p className="text-text-muted text-[12px] mt-0.5">Welcome back, {user?.name?.split(' ')[0] || 'Agent'}</p>
            </div>
            {/* Mobile logout */}
            <button onClick={handleLogout} className="lg:hidden flex items-center gap-2 text-primary font-bold text-label-sm">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </header>

        <div className="p-[24px] md:p-[40px] flex-1">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active', value: activeOrders.length, icon: 'local_shipping', color: 'text-warning-amber' },
              { label: 'Delivered', value: completedOrders.filter(o => o.currentStatus === 'DELIVERED').length, icon: 'check_circle', color: 'text-success-green' },
              { label: 'Total', value: orders.length, icon: 'package_2', color: 'text-primary' },
            ].map((s) => (
              <div key={s.label} className="bg-background-main rounded-xl p-4 shadow-sm border border-outline-variant/30 flex items-center gap-3">
                <span className={`material-symbols-outlined text-2xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div>
                  <p className="text-[24px] font-black text-primary leading-none">{s.value}</p>
                  <p className="text-[11px] text-text-muted uppercase tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 mb-6">
            {[
              { id: 'active', label: `Active (${activeOrders.length})` },
              { id: 'completed', label: `Completed (${completedOrders.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full font-bold text-label-sm transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'border border-outline-variant text-text-muted hover:border-accent-lime'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-lime"></div>
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4 text-text-muted">
              <span className="material-symbols-outlined text-5xl">package_2</span>
              <p className="text-body-md">No {activeTab} orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayOrders.map((order) => {
                const next = NEXT_STATUS[order.currentStatus];
                const nextLabel = NEXT_LABEL[order.currentStatus];
                const canFail = ACTIVE_STATUSES.includes(order.currentStatus);
                return (
                  <div key={order._id} className="bg-background-main rounded-2xl p-6 shadow-sm border border-outline-variant/30 hover:border-accent-lime/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-bold text-primary text-label-md">#{order._id?.slice(-6)}</span>
                          <StatusBadge status={order.currentStatus} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] text-text-muted mt-0.5">location_on</span>
                            <div>
                              <p className="text-[10px] text-text-muted uppercase tracking-wide">Pickup</p>
                              <p className="text-primary font-medium">{order.pickupAddress?.line || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] text-accent-lime mt-0.5">flag</span>
                            <div>
                              <p className="text-[10px] text-text-muted uppercase tracking-wide">Destination</p>
                              <p className="text-primary font-medium">{order.dropAddress?.line || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {next && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, next)}
                            disabled={updatingId === order._id}
                            className="bg-accent-lime text-primary px-5 py-2 rounded-full font-bold text-label-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-60"
                          >
                            {updatingId === order._id ? '...' : nextLabel}
                          </button>
                        )}
                        {canFail && (
                          <button
                            onClick={() => setFailModalOrderId(order._id)}
                            disabled={updatingId === order._id}
                            className="bg-error/10 text-error hover:bg-error hover:text-white px-5 py-2 rounded-full font-bold text-label-sm transition-all whitespace-nowrap disabled:opacity-60"
                          >
                            Mark Failed
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[12px] text-text-muted">
                      <span>{new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <Link to={`/orders/${order._id}`} className="flex items-center gap-1 hover:text-primary transition-colors font-bold">
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        View Detail
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Fail Modal */}
      {failModalOrderId && (
        <FailModal
          orderId={failModalOrderId}
          onClose={() => setFailModalOrderId(null)}
          onSuccess={handleFailSuccess}
        />
      )}
    </div>
  );
}
