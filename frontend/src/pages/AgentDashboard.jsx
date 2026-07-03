import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrders, updateStatus } from '../api/orders';

function StatusBadge({ status }) {
  const styles = {
    'in_transit': 'bg-warning-amber/10 text-warning-amber',
    'out_for_delivery': 'bg-secondary-container/20 text-on-secondary-container',
    'delivered': 'bg-success-green/10 text-success-green',
    'failed': 'bg-error/10 text-error',
    'pending': 'bg-surface-container text-text-muted',
    'picked_up': 'bg-primary/10 text-primary',
  };
  const labels = {
    'in_transit': 'In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'failed': 'Failed',
    'pending': 'Pending',
    'picked_up': 'Picked Up',
  };
  return (
    <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${styles[status] || 'bg-surface-container text-text-muted'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function AgentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const activeOrders = orders.filter((o) => ['pending', 'picked_up', 'in_transit', 'out_for_delivery'].includes(o.status));
  const completedOrders = orders.filter((o) => ['delivered', 'failed'].includes(o.status));

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatus = (current) => {
    const flow = { pending: 'picked_up', picked_up: 'in_transit', in_transit: 'out_for_delivery', out_for_delivery: 'delivered' };
    return flow[current] || null;
  };

  const nextStatusLabel = (current) => {
    const labels = { pending: 'Mark Picked Up', picked_up: 'Mark In Transit', in_transit: 'Mark Out for Delivery', out_for_delivery: 'Mark Delivered' };
    return labels[current] || null;
  };

  return (
    <div className="bg-background-main text-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)] px-[16px] py-4">
        <div className="flex justify-between items-center max-w-[1280px] mx-auto">
          <div className="text-headline-md font-black text-primary tracking-tighter uppercase">LOGISWIFT</div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-label-md font-bold text-primary">{user?.name || 'Agent'}</p>
              <p className="text-[11px] text-text-muted capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-primary text-on-primary text-label-md px-6 py-2 rounded-full active:opacity-80 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1280px] mx-auto px-[16px] md:px-[40px] pb-12">
        {/* Hero Section */}
        <section className="pt-6 pb-10">
          <div className="w-full relative h-[200px] md:h-[280px] rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgWkawVOH2IYct7JlLaoYFhayvLIi7MnVysvMD93k76Y8I5VE1ZUh4JC6ZuJn-JmQ_Qf5HRmr3l7zPFdxuPD8zPu1WIuM8cD4TjTPzhGCHfEWSKRECkBrH41yzk3ADWmyGJh1nd4M1-v6jh3tASvSJJyrZV8lftv00V88MrHaFm9esUTcLTQfOin0R4QaA7aNYBjSTJ2Lgsfp90ItwgTeE76tdE7a6dBwVdOU-6VcNxj_UoQ75Zyl2Gw"
              alt="Delivery"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
              <h1 className="text-white text-[24px] font-bold">
                Welcome back, <span className="text-accent-lime">{user?.name?.split(' ')[0] || 'Agent'}</span>!
              </h1>
              <p className="text-white/80 text-body-sm mt-1">Your delivery missions for today.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active', value: activeOrders.length, icon: 'local_shipping', color: 'text-warning-amber' },
              { label: 'Delivered', value: completedOrders.filter(o => o.status === 'delivered').length, icon: 'check_circle', color: 'text-success-green' },
              { label: 'Total', value: orders.length, icon: 'package_2', color: 'text-primary' },
            ].map((s) => (
              <div key={s.label} className="bg-background-main p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-outline-variant/30">
                <div className="w-12 h-12 bg-accent-lime/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <div className="text-headline-md font-bold text-primary">{s.value}</div>
                  <div className="text-label-sm text-text-muted uppercase tracking-wider">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders */}
        <section className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'active', label: `Active (${activeOrders.length})` },
              { id: 'completed', label: `Completed (${completedOrders.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full font-bold text-label-md transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'border border-outline-variant text-text-muted hover:border-accent-lime'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-lime"></div>
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4 text-text-muted">
              <span className="material-symbols-outlined text-5xl">package_2</span>
              <p className="text-body-md">No {activeTab} orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayOrders.map((order) => {
                const next = nextStatus(order.status);
                const nextLabel = nextStatusLabel(order.status);
                return (
                  <div key={order._id} className="bg-background-main rounded-2xl p-6 shadow-sm border border-outline-variant/30 hover:border-accent-lime/40 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-bold text-primary text-label-md">#{order._id?.slice(-8)}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] text-text-muted mt-0.5">location_on</span>
                            <div>
                              <p className="text-[10px] text-text-muted uppercase tracking-wide">Pickup</p>
                              <p className="text-primary font-medium">{order.pickupAddress || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] text-accent-lime mt-0.5">flag</span>
                            <div>
                              <p className="text-[10px] text-text-muted uppercase tracking-wide">Destination</p>
                              <p className="text-primary font-medium">{order.destinationAddress || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {next && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, next)}
                          disabled={updatingId === order._id}
                          className="bg-accent-lime text-primary px-5 py-2 rounded-full font-bold text-label-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-60"
                        >
                          {updatingId === order._id ? '...' : nextLabel}
                        </button>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[12px] text-text-muted">
                      <span>{new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <Link to={`/track?id=${order._id}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        View Tracking
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
