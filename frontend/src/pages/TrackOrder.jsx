import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTracking, getOrder } from '../api/orders';

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
  return (
    <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${styles[status] || 'bg-surface-container text-text-muted'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [inputId, setInputId] = useState(searchParams.get('id') || '');
  const [tracking, setTracking] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) handleSearch(orderId);
  }, []);

  const handleSearch = async (id) => {
    const searchId = id || inputId;
    if (!searchId.trim()) return;
    setError('');
    setLoading(true);
    setTracking([]);
    setOrder(null);
    try {
      const [trackRes, orderRes] = await Promise.all([
        getTracking(searchId).catch(() => null),
        getOrder(searchId).catch(() => null),
      ]);
      if (!orderRes || !orderRes.success) {
        setError('Order not found. Please check your tracking ID.');
      } else {
        setOrder(orderRes.data);
        setTracking(trackRes?.data || []);
      }
    } catch {
      setError('Order not found. Please check your tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrderId(inputId);
    handleSearch(inputId);
  };

  const currentStatus = order?.currentStatus || 'CREATED';

  // Sort tracking history descending by timestamp
  const sortedHistory = [...tracking].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="bg-background-main font-body-md text-on-surface flex flex-col min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
        <nav className="flex justify-between items-center px-[40px] py-4 max-w-[1280px] mx-auto">
          <Link className="text-headline-md font-black text-primary tracking-tighter" to="/">Last Mile</Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-primary font-bold border-b-2 border-accent-lime pb-1 text-label-md" to="/track">Track</Link>
          </div>
          <Link to="/login" className="bg-accent-lime text-primary font-bold py-2.5 px-6 rounded-full hover:opacity-90 active:scale-95 transition-all text-label-md shadow-sm">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-[900px] mx-auto px-[16px] md:px-[40px] py-12">
        {/* Search Bar */}
        <div className="mb-10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">search</span>
              <input
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Enter your tracking ID or order number..."
                className="w-full pl-12 pr-4 py-4 rounded-full border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-accent-lime focus:border-accent-lime outline-none text-body-md text-primary shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-bold px-8 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60"
            >
              {loading ? '...' : 'Track'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-error-container text-error text-body-sm font-bold border border-error/20">
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-lime"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !order && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-text-muted">local_shipping</span>
            </div>
            <h2 className="text-headline-md font-bold text-primary">Track Your Shipment</h2>
            <p className="text-text-muted text-body-md max-w-md">Enter your tracking ID above to get real-time updates on your delivery status and estimated arrival time.</p>
          </div>
        )}

        {/* Order Found */}
        {order && !loading && (
          <>
            {/* Summary Card */}
            <section className="mb-10 bg-background-main rounded-[20px] p-8 shadow-[0px_4px_20px_rgba(10,22,40,0.08)] hover:-translate-y-1 transition-transform">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="text-text-muted text-label-md uppercase tracking-wider">Tracking Number</span>
                  <h1 className="text-headline-lg font-bold text-primary mt-1">{order._id}</h1>
                  <div className="flex items-center mt-4 text-success-green text-label-md">
                    <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                    <span>
                      {currentStatus === 'DELIVERED' ? 'Delivered Successfully' :
                        currentStatus === 'FAILED' ? 'Delivery Failed' :
                          'In Transit'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-outline-variant pt-6 md:pt-0 md:pl-8">
                  <span className="text-text-muted text-label-md uppercase tracking-wider">Destination</span>
                  <p className="text-headline-md font-bold text-primary mt-1">{order.dropAddress?.line || '—'}</p>
                  <p className="text-on-surface-variant text-body-sm">Pincode: {order.dropAddress?.pincode || ''}</p>
                </div>
              </div>
            </section>

            {/* Timeline & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
              {/* Timeline */}
              <section className="lg:col-span-7 bg-background-main rounded-[20px] p-8 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                <h2 className="text-headline-md font-bold mb-10">Shipment Progress</h2>
                {sortedHistory.length === 0 ? (
                  <p className="text-text-muted text-body-md text-center py-6">No progress logs found.</p>
                ) : (
                  <div className="relative ml-4 border-l border-outline-variant">
                    {sortedHistory.map((event, index) => {
                      const isLatest = index === 0;
                      return (
                        <div key={event._id || index} className="relative pl-8 pb-10 last:pb-0">
                          {/* Indicator Dot */}
                          <div className={`absolute -left-[9px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-background-main ${
                            isLatest ? 'bg-accent-lime ring-4 ring-accent-lime/30 animate-pulse' : 'bg-primary'
                          }`} />
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <StatusBadge status={event.status} />
                              {isLatest && (
                                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-bold uppercase">Latest</span>
                              )}
                            </div>
                            <span className="text-text-muted text-label-sm block mb-1">
                              {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {event.note && (
                              <p className="text-primary font-medium text-body-sm mt-1 bg-surface-container-low p-2 rounded-lg border border-outline-variant/20 italic">
                                "{event.note}"
                              </p>
                            )}
                            <p className="text-text-muted text-[10px] mt-1 uppercase tracking-wide">
                              Updated by: {event.changedBy?.role || 'System'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Sidebar */}
              <aside className="lg:col-span-5 space-y-6">
                {/* Package Details */}
                <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                  <h4 className="text-label-md text-primary font-bold mb-4">Package Details</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Weight', value: `${order.actualWeight || '—'} kg` },
                      { label: 'Type', value: order.orderType || 'Standard' },
                      { label: 'Payment', value: order.paymentType || '—' },
                      { label: 'Total Charge', value: `₹${order.charge?.toFixed(2) || '0.00'}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-body-sm">{label}</span>
                        <span className="text-primary text-label-md font-bold capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Info */}
                {order.assignedAgent && (
                  <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                    <h4 className="text-label-md text-primary font-bold mb-4">Your Delivery Agent</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent-lime flex items-center justify-center text-primary font-black text-lg">
                        {order.assignedAgent.name?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="text-label-md font-bold text-primary">{order.assignedAgent.name}</p>
                        <p className="text-on-surface-variant text-[12px]">{order.assignedAgent.phone || 'Runner Assigned'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-primary-container">
        <div className="px-[40px] py-8 max-w-[1280px] mx-auto flex justify-center items-center">
          <p className="text-on-primary-container/70 text-body-sm">© 2024 Last Mile Infrastructure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
