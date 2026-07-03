import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrders, updateStatus, assignAgent } from '../api/orders';
import api from '../api';

function StatusBadge({ status }) {
  const styles = {
    'in_transit': 'bg-secondary-container/20 text-on-secondary-container',
    'out_for_delivery': 'bg-secondary-container/20 text-on-secondary-container',
    'delivered': 'bg-success-green/10 text-success-green',
    'failed': 'bg-error/10 text-error',
    'pending': 'bg-warning-amber/10 text-warning-amber',
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

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      getOrders().catch(() => ({ data: [] })),
      api.get('/admin/agents').catch(() => ({ data: { data: [] } })),
    ]).then(([ordersRes, agentsRes]) => {
      setOrders(ordersRes.data || []);
      setAgents(agentsRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const filtered = orders.filter((o) => {
    const matchSearch = o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.destinationAddress?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAssign = async (orderId, agentId) => {
    try {
      await assignAgent(orderId, agentId);
      const updated = await getOrders();
      setOrders(updated.data || []);
      setAssignModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      alert('Failed to assign agent.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    inTransit: orders.filter((o) => ['in_transit', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div className="bg-background min-h-screen flex overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-primary-container text-white sticky top-0 h-screen z-40 pt-8">
        <div className="px-8 mb-10">
          <span className="text-headline-md font-black text-accent-lime tracking-tighter">LOGISWIFT</span>
          <p className="text-on-primary-container text-label-sm mt-1 uppercase tracking-widest opacity-60">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <div className="group">
            <a className="flex items-center gap-4 px-4 py-3 rounded-xl bg-on-primary-container/10 text-accent-lime font-bold" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span className="text-label-md">Dashboard</span>
            </a>
          </div>
          <div className="pt-4 pb-2 px-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container/50">Management</span>
          </div>
          {[
            { icon: 'map', label: 'Zone & Rate Card' },
            { icon: 'badge', label: 'Agent Assignment' },
            { icon: 'analytics', label: 'Fleet Analytics' },
          ].map((item) => (
            <a key={item.label} className="flex items-center gap-4 px-4 py-3 rounded-xl text-on-primary-container hover:bg-on-primary-container/5 hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-6 bg-black/20 m-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-lime flex items-center justify-center text-primary font-black text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-body-sm font-bold">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-on-primary-container/70">Operation Manager</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-2 text-on-primary-container/70 hover:text-white text-label-sm">
            <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)] sticky top-0 z-40">
          <div className="flex justify-between items-center px-[40px] py-4 max-w-[1280px] mx-auto w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-headline-md font-bold text-primary">Last-Mile Orders</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-body-sm w-48 ml-2 outline-none"
                  placeholder="Track shipment ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-[40px] flex gap-[24px] flex-col xl:flex-row max-w-[1280px] mx-auto w-full flex-1">
          {/* Orders Table */}
          <div className="flex-1 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: stats.total, icon: 'package_2', color: 'text-primary' },
                { label: 'Pending', value: stats.pending, icon: 'schedule', color: 'text-warning-amber' },
                { label: 'In Transit', value: stats.inTransit, icon: 'local_shipping', color: 'text-secondary' },
                { label: 'Delivered', value: stats.delivered, icon: 'check_circle', color: 'text-success-green' },
              ].map((s) => (
                <div key={s.label} className="bg-background-main rounded-xl p-4 shadow-sm border border-outline-variant/30 flex items-center gap-4">
                  <span className={`material-symbols-outlined text-3xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <div>
                    <p className="text-[28px] font-black text-primary leading-none">{s.value}</p>
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mt-1">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {['all', 'pending', 'in_transit', 'delivered', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-full border text-label-md transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-background-main border-outline-variant hover:border-accent-lime'}`}
                >
                  {s === 'all' ? 'All Orders' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-background-main rounded-[20px] shadow-[0px_4px_20px_rgba(10,22,40,0.08)] overflow-hidden">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-lime"></div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/50">
                        {['Order ID', 'Recipient / Address', 'Status', 'Agent', 'Action'].map((h) => (
                          <th key={h} className="px-6 py-4 text-label-md text-on-surface-variant font-bold border-b border-outline-variant/30">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-12 text-text-muted text-body-md">No orders found.</td></tr>
                      ) : filtered.map((order) => (
                        <tr key={order._id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-text-muted">package_2</span>
                              <span className="font-bold text-body-sm">#{order._id?.slice(-6)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <p className="text-body-sm font-bold">{order.customer?.name || 'Customer'}</p>
                              <p className="text-[12px] text-text-muted">{order.destinationAddress?.slice(0, 30)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5"><StatusBadge status={order.status} /></td>
                          <td className="px-6 py-5">
                            {order.agent ? (
                              <span className="text-body-sm">{order.agent?.name || 'Assigned'}</span>
                            ) : (
                              <span className="text-body-sm text-error italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setSelectedOrder(order); setAssignModalOpen(true); }}
                                className="px-3 py-1 text-[11px] font-bold rounded-full bg-accent-lime text-primary hover:opacity-90 transition-all"
                              >
                                Assign
                              </button>
                              <select
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                defaultValue={order.status}
                                className="text-[11px] rounded-full px-2 py-1 border border-outline-variant bg-surface-container-lowest outline-none"
                              >
                                {['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'].map((s) => (
                                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {!loading && (
                <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/20">
                  <span className="text-body-sm text-text-muted">Showing {filtered.length} of {orders.length} orders</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Assignment Panel */}
          <div className="w-full xl:w-80">
            <div className="bg-background-main rounded-[20px] shadow-[0px_4px_20px_rgba(10,22,40,0.08)] overflow-hidden flex flex-col max-h-[600px] sticky top-[100px]">
              <div className="p-6 border-b border-outline-variant/30 bg-primary-container">
                <h2 className="text-headline-md font-bold text-white">Available Agents</h2>
                <p className="text-[12px] text-on-primary-container/70 mt-1">Click Assign after selecting an order</p>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {agents.length === 0 ? (
                  <p className="text-text-muted text-body-sm text-center py-8">No agents available.</p>
                ) : agents.map((agent) => (
                  <div key={agent._id} className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 hover:border-accent-lime transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-body-sm">{agent.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-text-muted mt-1">
                          <span className="material-symbols-outlined text-[12px] text-success-green" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                          {agent.rating || '4.5'} Rating
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-success-green/10 text-success-green text-[10px] font-bold rounded">ONLINE</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[11px] text-text-muted">
                        <span className="font-bold text-primary">{agent.activeOrders || 0}</span> active orders
                      </div>
                      <button
                        onClick={() => selectedOrder && handleAssign(selectedOrder._id, agent._id)}
                        disabled={!selectedOrder}
                        className="bg-accent-lime text-primary px-4 py-1.5 rounded-full font-bold text-label-sm hover:bg-secondary-fixed transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {selectedOrder && (
                <div className="p-4 bg-accent-lime/10 border-t border-outline-variant/20">
                  <p className="text-[11px] text-primary font-bold">Selected: #{selectedOrder._id?.slice(-6)}</p>
                  <button onClick={() => setSelectedOrder(null)} className="text-[11px] text-text-muted hover:text-primary">Clear selection</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
