import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrders, assignAgent, autoAssignAgent, overrideStatus } from '../api/orders';
import { getZones, createZone, deleteZone, getRateCards, createRateCard, getAgents, createAgent, getCustomers, createCustomer } from '../api/admin';

const ALL_STATUSES = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED'];

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

// ─── Override Status Modal ───────────────────────────────────────────────────
function OverrideModal({ orderId, onClose, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) { setError('Please select a status.'); return; }
    if (!note.trim()) { setError('A note is required for overrides.'); return; }
    setLoading(true);
    try {
      await overrideStatus(orderId, { status: selectedStatus, note });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Override failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md font-bold text-primary">Override Order Status</h2>
          <button onClick={onClose}><span className="material-symbols-outlined text-text-muted hover:text-primary">close</span></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-error-container text-error text-body-sm font-bold border border-error/20">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-primary mb-2">Select New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-2 rounded-xl border text-label-sm font-bold transition-all text-left ${selectedStatus === s ? 'bg-primary text-white border-primary' : 'border-outline-variant hover:border-accent-lime'}`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-label-md text-primary mb-2">Override Note <span className="text-error">*</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:border-accent-lime outline-none text-body-md resize-none"
              placeholder="Reason for override..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-outline-variant rounded-full font-bold text-primary hover:bg-surface-container">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-accent-lime text-primary rounded-full font-bold hover:opacity-90 disabled:opacity-60">
              {loading ? 'Saving...' : 'Override Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add User Modal ──────────────────────────────────────────────────────────
function AddUserModal({ zones, onClose, onSuccess }) {
  const [tab, setTab] = useState('agent'); // 'agent' | 'customer'
  const [agentForm, setAgentForm] = useState({ name: '', email: '', password: '', phone: '', zone: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createAgent({ ...agentForm, zone: agentForm.zone || undefined });
      onSuccess('Agent created successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create agent.');
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createCustomer(customerForm);
      onSuccess('Customer created successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create customer.');
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:border-accent-lime outline-none text-body-md bg-surface-container-lowest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md font-bold text-primary">Add New User</h2>
          <button onClick={onClose}><span className="material-symbols-outlined text-text-muted hover:text-primary">close</span></button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-full border border-outline-variant p-1 mb-6">
          {[{ id: 'agent', label: 'Delivery Agent' }, { id: 'customer', label: 'Customer' }].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); }}
              className={`flex-1 py-2 rounded-full font-bold text-label-sm transition-all ${tab === t.id ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-error-container text-error text-body-sm font-bold border border-error/20">{error}</div>}

        {tab === 'agent' && (
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div><label className="block text-label-sm text-primary mb-1">Name</label><input type="text" required value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} className={inputCls} placeholder="Agent Name" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Email</label><input type="email" required value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} className={inputCls} placeholder="agent@example.com" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Password</label><input type="password" required value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })} className={inputCls} placeholder="Min. 6 characters" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Phone</label><input type="tel" value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })} className={inputCls} placeholder="+91 98765 43210" /></div>
            <div>
              <label className="block text-label-sm text-primary mb-1">Zone</label>
              <select value={agentForm.zone} onChange={(e) => setAgentForm({ ...agentForm, zone: e.target.value })} className={inputCls}>
                <option value="">Select Zone...</option>
                {zones.map((z) => <option key={z._id} value={z._id}>{z.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-accent-lime text-primary font-bold rounded-full disabled:opacity-60 hover:opacity-90">
              {loading ? 'Creating...' : 'Register Agent'}
            </button>
          </form>
        )}

        {tab === 'customer' && (
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div><label className="block text-label-sm text-primary mb-1">Name</label><input type="text" required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className={inputCls} placeholder="Customer Name" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Email</label><input type="email" required value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className={inputCls} placeholder="customer@example.com" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Password</label><input type="password" required value={customerForm.password} onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })} className={inputCls} placeholder="Min. 6 characters" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Phone</label><input type="tel" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className={inputCls} placeholder="+91 98765 43210" /></div>
            <div><label className="block text-label-sm text-primary mb-1">Address</label><input type="text" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} className={inputCls} placeholder="123 Main St, New Delhi" /></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-accent-lime text-primary font-bold rounded-full disabled:opacity-60 hover:opacity-90">
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [zones, setZones] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null); // for manual assign panel
  const [overrideOrderId, setOverrideOrderId] = useState(null); // override modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'agent' | 'customer'
  const [successMsg, setSuccessMsg] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Zone / Rate card forms
  const [zoneForm, setZoneForm] = useState({ name: '', pincodes: '' });
  const [rateForm, setRateForm] = useState({ orderType: 'B2C', zoneRelation: 'intra', baseRate: '', perKgRate: '', codSurchargeFlat: '0', codSurchargePercent: '0' });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getOrders().catch(() => ({ data: [] })),
      getAgents().catch(() => ({ data: [] })),
      getCustomers().catch(() => ({ data: [] })),
      getZones().catch(() => ({ data: [] })),
      getRateCards().catch(() => ({ data: [] })),
    ]).then(([ordersRes, agentsRes, customersRes, zonesRes, rateCardsRes]) => {
      setOrders(ordersRes.data || []);
      setAgents(agentsRes.data || []);
      setCustomers(customersRes.data || []);
      setZones(zonesRes.data || []);
      setRateCards(rateCardsRes.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // Orders
  const handleManualAssign = async (orderId, agentId) => {
    try {
      await assignAgent(orderId, agentId);
      loadData();
      setSelectedOrder(null);
      showSuccess('Agent assigned!');
    } catch (err) {
      alert('Failed to assign agent: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleAutoAssign = async (orderId) => {
    try {
      await autoAssignAgent(orderId);
      loadData();
      showSuccess('Auto-assign triggered successfully!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to auto-assign agent.');
    }
  };

  // Zones
  const handleCreateZone = async (e) => {
    e.preventDefault();
    try {
      const pinArray = zoneForm.pincodes.split(',').map((p) => p.trim()).filter(Boolean);
      await createZone({ name: zoneForm.name, pincodes: pinArray });
      setZoneForm({ name: '', pincodes: '' });
      loadData();
      showSuccess('Zone created!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create zone.');
    }
  };

  const handleDeleteZone = async (id) => {
    if (!confirm('Delete this zone?')) return;
    try {
      await deleteZone(id);
      loadData();
    } catch (err) {
      alert('Failed to delete zone.');
    }
  };

  // Rate cards
  const handleCreateRateCard = async (e) => {
    e.preventDefault();
    try {
      await createRateCard({
        orderType: rateForm.orderType,
        zoneRelation: rateForm.zoneRelation,
        baseRate: parseFloat(rateForm.baseRate),
        perKgRate: parseFloat(rateForm.perKgRate),
        codSurchargeFlat: parseFloat(rateForm.codSurchargeFlat) || 0,
        codSurchargePercent: parseFloat(rateForm.codSurchargePercent) || 0,
      });
      setRateForm({ orderType: 'B2C', zoneRelation: 'intra', baseRate: '', perKgRate: '', codSurchargeFlat: '0', codSurchargePercent: '0' });
      loadData();
      showSuccess('Rate card created!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create rate card.');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch = o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.dropAddress?.line?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.currentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.currentStatus === 'CREATED').length,
    inTransit: orders.filter((o) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.currentStatus)).length,
    delivered: orders.filter((o) => o.currentStatus === 'DELIVERED').length,
  };

  // Combined users list
  const allUsers = [
    ...agents.map((a) => ({ ...a, _role: 'agent' })),
    ...customers.map((c) => ({ ...c, _role: 'customer' })),
  ];
  const filteredUsers = allUsers.filter((u) => {
    const matchRole = userFilter === 'all' || u._role === userFilter;
    const matchSearch = !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const inputCls = 'w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest outline-none text-body-md focus:border-accent-lime transition-colors';

  return (
    <div className="bg-background min-h-screen flex overflow-x-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-primary-container text-white sticky top-0 h-screen z-40 pt-8">
        <div className="px-8 mb-10">
          <Link to="/" className="text-headline-md font-black text-accent-lime tracking-tighter">Last Mile</Link>
          <p className="text-on-primary-container text-label-sm mt-1 uppercase tracking-widest opacity-60">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'dashboard' ? 'bg-on-primary-container/10 text-accent-lime' : 'text-on-primary-container hover:bg-on-primary-container/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="text-label-md">Dashboard</span>
          </button>
          <div className="pt-4 pb-2 px-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container/50">Management</span>
          </div>
          {[
            { id: 'zones', icon: 'map', label: 'Zones' },
            { id: 'rateCards', icon: 'payments', label: 'Rate Cards' },
            { id: 'users', icon: 'group', label: 'User Management' },
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
        <header className="bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)] sticky top-0 z-40">
          <div className="flex justify-between items-center px-[40px] py-4 max-w-[1280px] mx-auto w-full">
            <h1 className="text-headline-md font-bold text-primary capitalize">
              {activeTab === 'dashboard' ? 'Orders Dashboard' : activeTab === 'rateCards' ? 'Rate Cards' : activeTab === 'users' ? 'User Management' : 'Zones'}
            </h1>
            {successMsg && (
              <div className="flex items-center gap-2 px-4 py-2 bg-success-green/10 text-success-green rounded-full text-body-sm font-bold border border-success-green/20">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {successMsg}
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-lime"></div>
          </div>
        ) : (
          <div className="p-[40px] max-w-[1280px] mx-auto w-full flex-1">

            {/* ── TAB: DASHBOARD ─────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <div className="flex gap-[24px] flex-col xl:flex-row">
                <div className="flex-1 space-y-6">
                  {/* Stats */}
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
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {['all', ...ALL_STATUSES].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-full border text-label-sm font-bold transition-all ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-background-main border-outline-variant hover:border-accent-lime'}`}
                        >
                          {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
                      <input
                        className="pl-9 pr-4 py-1.5 rounded-full border border-outline-variant text-body-sm outline-none w-48 focus:border-accent-lime"
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-background-main rounded-[20px] shadow-[0px_4px_20px_rgba(10,22,40,0.08)] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low/50">
                            {['Order ID', 'Customer / Address', 'Status', 'Agent', 'Actions'].map((h) => (
                              <th key={h} className="px-6 py-4 text-label-md text-on-surface-variant font-bold border-b border-outline-variant/30">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {filteredOrders.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-text-muted text-body-md">No orders found.</td></tr>
                          ) : filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-6 py-5">
                                <Link to={`/orders/${order._id}`} className="font-bold text-body-sm text-primary hover:text-accent-lime transition-colors">
                                  #{order._id?.slice(-6)}
                                </Link>
                              </td>
                              <td className="px-6 py-5">
                                <p className="text-body-sm font-bold">{order.customer?.name || '—'}</p>
                                <p className="text-[12px] text-text-muted">{order.dropAddress?.line || '—'}</p>
                              </td>
                              <td className="px-6 py-5"><StatusBadge status={order.currentStatus} /></td>
                              <td className="px-6 py-5 text-body-sm">
                                {order.assignedAgent ? order.assignedAgent.name : <span className="text-error italic font-bold">Unassigned</span>}
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex gap-2 items-center">
                                  {(order.currentStatus === 'CREATED' || order.currentStatus === 'RESCHEDULED') && (
                                    <>
                                      <button onClick={() => handleAutoAssign(order._id)} className="px-3 py-1 bg-accent-lime text-primary rounded-full font-bold text-label-sm">Auto</button>
                                      <button onClick={() => setSelectedOrder(order)} className="px-3 py-1 bg-primary text-white rounded-full font-bold text-label-sm">Assign</button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setOverrideOrderId(order._id)}
                                    className="px-3 py-1 border border-outline-variant rounded-full text-label-sm hover:bg-surface-container-low"
                                  >
                                    Override
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right: Manual Assign Panel */}
                {selectedOrder && (
                  <div className="w-full xl:w-80">
                    <div className="bg-background-main rounded-[20px] shadow-[0px_4px_20px_rgba(10,22,40,0.08)] overflow-hidden flex flex-col max-h-[600px] border border-outline-variant/30">
                      <div className="p-6 border-b border-outline-variant/30 bg-primary-container text-white flex justify-between items-center">
                        <div>
                          <h2 className="text-headline-md font-bold">Manual Assign</h2>
                          <p className="text-[11px] text-on-primary-container/70 mt-1">Order #{selectedOrder._id?.slice(-6)}</p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="material-symbols-outlined text-white hover:text-accent-lime">close</button>
                      </div>
                      <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {agents.map((agent) => (
                          <div key={agent._id} className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-body-sm">{agent.name}</p>
                              <p className="text-[11px] text-text-muted">Zone: {agent.zone?.name || '—'}</p>
                            </div>
                            <button onClick={() => handleManualAssign(selectedOrder._id, agent._id)} className="bg-accent-lime text-primary px-4 py-1.5 rounded-full font-bold text-label-sm">
                              Assign
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: ZONES ─────────────────────────────────────────────── */}
            {activeTab === 'zones' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-headline-md font-bold text-primary">All Zones</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zones.length === 0 ? <p className="text-text-muted">No zones created yet.</p> : zones.map((zone) => (
                      <div key={zone._id} className="bg-background-main rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-headline-sm text-primary">{zone.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {zone.pincodes.map((pin) => (
                              <span key={pin} className="px-2 py-0.5 bg-surface-container text-primary rounded text-[11px] font-medium">{pin}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end pt-3 border-t border-outline-variant/10">
                          <button onClick={() => handleDeleteZone(zone._id)} className="text-error flex items-center gap-1 text-label-sm font-bold hover:underline">
                            <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-background-main rounded-2xl p-6 border border-outline-variant/30 shadow-sm h-fit">
                  <h3 className="font-bold text-headline-sm text-primary mb-6">Create New Zone</h3>
                  <form onSubmit={handleCreateZone} className="space-y-4">
                    <div>
                      <label className="block text-label-md text-primary mb-1">Zone Name</label>
                      <input type="text" required value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} className={inputCls} placeholder="e.g. Delhi South" />
                    </div>
                    <div>
                      <label className="block text-label-md text-primary mb-1">Pincodes (Comma separated)</label>
                      <textarea required rows={3} value={zoneForm.pincodes} onChange={(e) => setZoneForm({ ...zoneForm, pincodes: e.target.value })} className={inputCls} placeholder="e.g. 110001, 110002" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-accent-lime text-primary font-bold rounded-full">Save Zone</button>
                  </form>
                </div>
              </div>
            )}

            {/* ── TAB: RATE CARDS ────────────────────────────────────────── */}
            {activeTab === 'rateCards' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-headline-md font-bold text-primary">Configured Rate Cards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rateCards.length === 0 ? <p className="text-text-muted">No rate cards configured yet.</p> : rateCards.map((card) => (
                      <div key={card._id} className="bg-background-main rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full uppercase">{card.orderType}</span>
                          <span className="px-3 py-1 bg-accent-lime/20 text-primary text-[11px] font-bold rounded-full uppercase">{card.zoneRelation}</span>
                        </div>
                        <div className="space-y-1.5 pt-3 text-body-md text-primary">
                          <div className="flex justify-between"><span>Base Rate:</span><span className="font-bold">₹{card.baseRate}</span></div>
                          <div className="flex justify-between"><span>Per Kg Rate:</span><span className="font-bold">₹{card.perKgRate}</span></div>
                          <div className="flex justify-between"><span>COD Flat:</span><span className="font-bold">₹{card.codSurchargeFlat || 0}</span></div>
                          <div className="flex justify-between"><span>COD %:</span><span className="font-bold">{card.codSurchargePercent || 0}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-background-main rounded-2xl p-6 border border-outline-variant/30 shadow-sm h-fit">
                  <h3 className="font-bold text-headline-sm text-primary mb-6">Create Rate Card</h3>
                  <form onSubmit={handleCreateRateCard} className="space-y-4">
                    <div>
                      <label className="block text-label-md text-primary mb-1">Order Type</label>
                      <select value={rateForm.orderType} onChange={(e) => setRateForm({ ...rateForm, orderType: e.target.value })} className={inputCls}>
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-md text-primary mb-1">Zone Relation</label>
                      <select value={rateForm.zoneRelation} onChange={(e) => setRateForm({ ...rateForm, zoneRelation: e.target.value })} className={inputCls}>
                        <option value="intra">Intra-Zone</option>
                        <option value="inter">Inter-Zone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-md text-primary mb-1">Base Rate (₹)</label>
                      <input type="number" required value={rateForm.baseRate} onChange={(e) => setRateForm({ ...rateForm, baseRate: e.target.value })} className={inputCls} placeholder="e.g. 50" />
                    </div>
                    <div>
                      <label className="block text-label-md text-primary mb-1">Per Kg Surcharge (₹)</label>
                      <input type="number" required value={rateForm.perKgRate} onChange={(e) => setRateForm({ ...rateForm, perKgRate: e.target.value })} className={inputCls} placeholder="e.g. 10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-sm text-primary mb-1">COD Flat (₹)</label>
                        <input type="number" value={rateForm.codSurchargeFlat} onChange={(e) => setRateForm({ ...rateForm, codSurchargeFlat: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-label-sm text-primary mb-1">COD % </label>
                        <input type="number" value={rateForm.codSurchargePercent} onChange={(e) => setRateForm({ ...rateForm, codSurchargePercent: e.target.value })} className={inputCls} />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-accent-lime text-primary font-bold rounded-full">Save Rate Card</button>
                  </form>
                </div>
              </div>
            )}

            {/* ── TAB: USERS ─────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {[{ id: 'all', label: `All (${allUsers.length})` }, { id: 'agent', label: `Agents (${agents.length})` }, { id: 'customer', label: `Customers (${customers.length})` }].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setUserFilter(f.id)}
                        className={`px-4 py-2 rounded-full border font-bold text-label-sm transition-all ${userFilter === f.id ? 'bg-primary text-white border-primary' : 'border-outline-variant text-text-muted hover:border-accent-lime'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
                      <input
                        className="pl-9 pr-4 py-2 rounded-full border border-outline-variant text-body-sm outline-none w-48 focus:border-accent-lime"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setShowAddUser(true)}
                      className="flex items-center gap-2 px-5 py-2 bg-accent-lime text-primary rounded-full font-bold text-label-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      Add User
                    </button>
                  </div>
                </div>

                {/* Users Grid */}
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-4 text-text-muted">
                    <span className="material-symbols-outlined text-5xl">group</span>
                    <p className="text-body-md">No users found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredUsers.map((u) => (
                      <div key={u._id} className="bg-background-main rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${u._role === 'agent' ? 'bg-accent-lime text-primary' : 'bg-primary/10 text-primary'}`}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-body-md text-primary truncate">{u.name}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase flex-shrink-0 ${u._role === 'agent' ? 'bg-accent-lime/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                              {u._role}
                            </span>
                          </div>
                          <p className="text-body-sm text-text-muted truncate">{u.email}</p>
                          {u._role === 'agent' ? (
                            <p className="text-[11px] text-text-muted mt-0.5">Zone: {u.zone?.name || 'Unassigned'}</p>
                          ) : (
                            <p className="text-[11px] text-text-muted mt-0.5 truncate">{u.address || 'No address'}</p>
                          )}
                        </div>
                        {u._role === 'agent' && (
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.availabilityStatus === 'available' ? 'bg-success-green' : 'bg-warning-amber'}`} title={u.availabilityStatus} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Override Modal */}
      {overrideOrderId && (
        <OverrideModal
          orderId={overrideOrderId}
          onClose={() => setOverrideOrderId(null)}
          onSuccess={() => { setOverrideOrderId(null); loadData(); showSuccess('Status overridden!'); }}
        />
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          zones={zones}
          onClose={() => setShowAddUser(false)}
          onSuccess={(msg) => { setShowAddUser(false); loadData(); showSuccess(msg); }}
        />
      )}
    </div>
  );
}
