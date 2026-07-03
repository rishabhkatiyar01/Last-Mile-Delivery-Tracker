import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getQuote, createOrder, rescheduleOrder, getOrders } from '../api/orders';

function Sidebar({ activeTab, setActiveTab, user, logout }) {
  const tabs = [
    { id: 'create', icon: 'add_circle', label: 'Create Order' },
    { id: 'orders', icon: 'package_2', label: 'My Orders' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-surface-dark text-white p-6 sticky top-0 h-screen z-40">
      <div className="mb-12">
        <Link to="/" className="text-headline-md font-black tracking-tighter text-accent-lime block">Last Mile</Link>
        <p className="text-[10px] uppercase tracking-widest text-on-primary-container/60 mt-1">Customer Portal</p>
      </div>
      <nav className="flex-1 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-accent-lime text-primary'
                : 'text-on-primary-container/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent-lime flex items-center justify-center text-primary font-black text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-label-md font-bold text-white">{user?.name || 'Customer'}</p>
            <p className="text-[11px] text-on-primary-container/60 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-primary-container/70 hover:bg-white/5 hover:text-white transition-all text-label-md"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'CREATED': 'bg-surface-container text-text-muted',
    'ASSIGNED': 'bg-primary/10 text-primary',
    'PICKED_UP': 'bg-primary/20 text-primary',
    'IN_TRANSIT': 'bg-warning-amber/10 text-warning-amber',
    'OUT_FOR_DELIVERY': 'bg-secondary-container/20 text-on-secondary-container',
    'DELIVERED': 'bg-success-green/10 text-success-green',
    'FAILED': 'bg-error/10 text-error',
    'RESCHEDULED': 'bg-warning-amber/10 text-warning-amber',
  };
  const labels = {
    'CREATED': 'Created',
    'ASSIGNED': 'Assigned',
    'PICKED_UP': 'Picked Up',
    'IN_TRANSIT': 'In Transit',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered',
    'FAILED': 'Failed',
    'RESCHEDULED': 'Rescheduled',
  };
  const dots = {
    'CREATED': 'bg-text-muted',
    'ASSIGNED': 'bg-primary',
    'PICKED_UP': 'bg-primary animate-pulse',
    'IN_TRANSIT': 'bg-warning-amber animate-pulse',
    'OUT_FOR_DELIVERY': 'bg-secondary-container',
    'DELIVERED': 'bg-success-green',
    'FAILED': 'bg-error',
    'RESCHEDULED': 'bg-warning-amber',
  };
  const cls = styles[status] || 'bg-surface-container text-text-muted';
  const dot = dots[status] || 'bg-text-muted';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-bold ${cls}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`}></span>
      {labels[status] || status}
    </span>
  );
}

function CreateOrderTab() {
  const [form, setForm] = useState({
    pickupLine: '', pickupPincode: '',
    dropLine: '', dropPincode: '',
    weight: '', length: '', width: '', height: '',
    orderType: 'B2C', paymentType: 'Prepaid',
  });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const buildQuotePayload = () => ({
    pickupPincode: form.pickupPincode,
    dropPincode: form.dropPincode,
    dimensions: {
      l: parseFloat(form.length) || 10,
      b: parseFloat(form.width) || 10,
      h: parseFloat(form.height) || 10,
    },
    actualWeight: parseFloat(form.weight) || 1,
    orderType: form.orderType,
    paymentType: form.paymentType,
  });

  const buildCreatePayload = () => ({
    pickupAddress: { line: form.pickupLine, pincode: form.pickupPincode, lat: 28.6139, lng: 77.2090 }, // Mocked lat/lng for now
    dropAddress: { line: form.dropLine, pincode: form.dropPincode, lat: 28.6250, lng: 77.2200 },
    dimensions: {
      l: parseFloat(form.length) || 10,
      b: parseFloat(form.width) || 10,
      h: parseFloat(form.height) || 10,
    },
    actualWeight: parseFloat(form.weight) || 1,
    orderType: form.orderType,
    paymentType: form.paymentType,
  });

  const handleQuote = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getQuote(buildQuotePayload());
      setQuote(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to get quote (check if zone/rate card exists for these pincodes).');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const order = await createOrder(buildCreatePayload());
      setSuccess(order);
      setQuote(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-24 h-24 rounded-full bg-accent-lime flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-headline-lg font-bold text-primary">Order Created!</h2>
        <p className="text-text-muted text-body-md">Your order <span className="font-bold text-primary">#{success.data?._id?.slice(-6) || '------'}</span> has been placed successfully.</p>
        <button onClick={() => setSuccess(null)} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-all">
          Create Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-background-main rounded-[20px] shadow-[0px_4px_20px_rgba(10,22,40,0.08)] p-6 md:p-8 border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-accent-lime bg-surface-dark rounded-lg p-1">edit_square</span>
            <h3 className="text-headline-md font-bold text-primary">Order Configuration</h3>
          </div>

          {error && <div className="mb-4 p-4 bg-error-container text-error rounded-xl text-body-sm font-bold">{error}</div>}

          <div className="space-y-8">
            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-label-md text-primary uppercase tracking-wider">Order Type</label>
                <div className="bg-surface-container rounded-full p-1 flex">
                  {['B2B', 'B2C'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setForm({ ...form, orderType: v })}
                      className={`flex-1 py-2 px-4 rounded-full text-label-md transition-all ${form.orderType === v ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-label-md text-primary uppercase tracking-wider">Payment Method</label>
                <div className="bg-surface-container rounded-full p-1 flex">
                  {['Prepaid', 'COD'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setForm({ ...form, paymentType: v })}
                      className={`flex-1 py-2 px-4 rounded-full text-label-md transition-all ${form.paymentType === v ? 'bg-primary text-white' : 'text-text-muted hover:text-primary'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-label-md text-primary">Pickup Details</label>
                <input name="pickupLine" value={form.pickupLine} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-accent-lime outline-none transition-all text-body-md" placeholder="Pickup Address Line..." />
                <input name="pickupPincode" value={form.pickupPincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-accent-lime outline-none transition-all text-body-md" placeholder="Pickup Pincode (e.g. 110001)" />
              </div>
              <div className="space-y-4">
                <label className="text-label-md text-primary">Destination Details</label>
                <input name="dropLine" value={form.dropLine} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-accent-lime outline-none transition-all text-body-md" placeholder="Drop Address Line..." />
                <input name="dropPincode" value={form.dropPincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-accent-lime outline-none transition-all text-body-md" placeholder="Drop Pincode (e.g. 110003)" />
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <label className="text-label-md text-primary">Package Dimensions & Weight</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'length', placeholder: 'L (cm)' },
                  { key: 'width', placeholder: 'B (cm)' },
                  { key: 'height', placeholder: 'H (cm)' },
                  { key: 'weight', placeholder: 'Wt (kg)' },
                ].map(({ key, placeholder }) => (
                  <input
                    key={key} name={key} value={form[key]} onChange={handleChange} type="number" placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-accent-lime outline-none transition-all text-body-md"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleQuote} disabled={loading}
                className="flex-1 py-4 border-2 border-primary text-primary rounded-full font-bold hover:bg-surface-container transition-all active:scale-95 disabled:opacity-60"
              >
                {loading ? 'Getting Quote...' : '1. Get Quote'}
              </button>
              <button
                onClick={handleSubmit} disabled={submitting || !quote?.success}
                className="flex-1 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg disabled:opacity-60"
              >
                {submitting ? 'Placing Order...' : '2. Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Quote Viewer */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-accent-lime rounded-[20px] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>
          <div className="relative z-10">
            <h4 className="text-label-md text-primary/60 uppercase tracking-widest mb-1">Estimated Charge</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-black text-primary">₹</span>
              <span className="text-[48px] font-black text-primary">{quote?.data?.totalRate || '0.00'}</span>
            </div>
            {quote?.data && (
              <div className="mt-6 pt-6 border-t border-primary/10 space-y-3">
                <div className="flex justify-between text-body-sm text-primary/70">
                  <span>Base Rate</span><span className="font-bold">₹{quote.data.baseRate}</span>
                </div>
                <div className="flex justify-between text-body-sm text-primary/70">
                  <span>Per Kg Rate (×{quote.data.billedWeight})</span><span className="font-bold">₹{(quote.data.billedWeight * quote.data.perKgRate).toFixed(2)}</span>
                </div>
                {quote.data.codSurcharge > 0 && (
                  <div className="flex justify-between text-body-sm text-primary/70">
                    <span>COD Surcharge</span><span className="font-bold">₹{quote.data.codSurcharge}</span>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 bg-primary/5 rounded-xl p-3 border border-primary/10">
              <span className="material-symbols-outlined text-primary text-[18px]">info</span>
              <p className="text-[12px] text-primary/80">Get Quote first to enable Confirm Order.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-background min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={handleLogout} />

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-surface-dark text-white sticky top-0 z-50">
        <h1 className="text-headline-md font-black tracking-tighter text-accent-lime">Last Mile</h1>
        <button className="material-symbols-outlined text-white">menu</button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-[16px] md:p-[40px] space-y-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg font-bold text-primary">
              {activeTab === 'create' ? 'New Shipment' : activeTab === 'orders' ? 'My Orders' : 'Track Order'}
            </h2>
            <p className="text-body-md text-text-muted mt-1">
              {activeTab === 'create' ? 'Configure your last-mile delivery parameters below.' : 'View and manage your deliveries.'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-surface-container rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
              <span className="text-label-md text-primary">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {activeTab === 'create' && <CreateOrderTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </main>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadOrders = () => {
    getOrders()
      .then((data) => setOrders(data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReschedule = async (orderId) => {
    const dateInput = prompt('Enter rescheduling date (YYYY-MM-DD):', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    if (!dateInput) return;
    try {
      await rescheduleOrder(orderId, { rescheduledDate: new Date(dateInput).toISOString() });
      alert('Order rescheduled successfully!');
      loadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reschedule order.');
    }
  };

  const filtered = orders.filter((o) =>
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    o.dropAddress?.line?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-background-main rounded-[20px] shadow-[0px_4px_20px_rgba(10,22,40,0.08)] border border-outline-variant/30 overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          <h3 className="text-headline-md font-bold text-primary">Recent Orders</h3>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest focus:ring-1 focus:ring-accent-lime outline-none text-body-sm w-full md:w-64"
            placeholder="Search orders..."
          />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-lime"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4 text-text-muted">
          <span className="material-symbols-outlined text-5xl">package_2</span>
          <p className="text-body-md">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr className="text-label-sm text-text-muted uppercase tracking-wider">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-8 py-5"><span className="text-label-md text-primary font-bold">#{order._id?.slice(-6)}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-body-md text-primary">{order.dropAddress?.line || '—'}</span>
                      <span className="text-[12px] text-text-muted">Pincode: {order.dropAddress?.pincode || ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5"><span className="text-body-sm text-primary">{new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></td>
                  <td className="px-6 py-5"><span className="px-3 py-1 rounded-full bg-surface-container text-primary text-[11px] uppercase font-bold">{order.orderType || 'B2C'}</span></td>
                  <td className="px-6 py-5"><StatusBadge status={order.currentStatus} /></td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex gap-2 justify-end items-center">
                      <Link to={`/orders/${order._id}`} className="text-primary hover:text-accent-lime transition-colors">
                        <span className="material-symbols-outlined">visibility</span>
                      </Link>
                      {order.currentStatus === 'FAILED' && (
                        <button
                          onClick={() => handleReschedule(order._id)}
                          className="px-3 py-1 bg-accent-lime text-primary rounded-full font-bold text-label-sm"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
