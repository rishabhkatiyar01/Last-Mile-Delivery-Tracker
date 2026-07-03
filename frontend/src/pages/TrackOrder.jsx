import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTracking, getOrder } from '../api/orders';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Order confirmed and being processed', icon: 'inventory_2' },
  { key: 'picked_up', label: 'Picked Up', desc: 'Parcel collected by LogiSwift courier', icon: 'local_shipping' },
  { key: 'in_transit', label: 'In Transit', desc: 'Departed from sorting facility', icon: 'moving' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Driver is on the way to your location', icon: 'directions_bike' },
  { key: 'delivered', label: 'Delivered', desc: 'Package received at destination', icon: 'check_circle' },
];

function getStepState(stepKey, currentStatus) {
  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === stepKey);
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  if (currentStatus === 'failed') return 'failed';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [inputId, setInputId] = useState(searchParams.get('id') || '');
  const [tracking, setTracking] = useState(null);
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
    setTracking(null);
    setOrder(null);
    try {
      const [trackRes, orderRes] = await Promise.all([
        getTracking(searchId).catch(() => null),
        getOrder(searchId).catch(() => null),
      ]);
      if (!orderRes) {
        setError('Order not found. Please check your tracking ID.');
      } else {
        setOrder(orderRes.data || orderRes);
        setTracking(trackRes?.data || trackRes);
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

  const currentStatus = order?.status || 'pending';

  return (
    <div className="bg-background-main font-body-md text-on-surface flex flex-col min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-50 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
        <nav className="flex justify-between items-center px-[40px] py-4 max-w-[1280px] mx-auto">
          <Link className="text-headline-md font-black text-primary tracking-tighter" to="/">LOGISWIFT</Link>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-primary font-bold border-b-2 border-accent-lime pb-1 text-label-md" href="#">Track</a>
            <a className="text-text-muted hover:text-secondary transition-colors text-label-md" href="#">Services</a>
            <a className="text-text-muted hover:text-secondary transition-colors text-label-md" href="#">Fleet</a>
            <a className="text-text-muted hover:text-secondary transition-colors text-label-md" href="#">Enterprise</a>
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
                      {currentStatus === 'delivered' ? 'Delivered Successfully' :
                        currentStatus === 'failed' ? 'Delivery Failed' :
                          'Out for Delivery Soon'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-outline-variant pt-6 md:pt-0 md:pl-8">
                  <span className="text-text-muted text-label-md uppercase tracking-wider">Destination</span>
                  <p className="text-headline-md font-bold text-primary mt-1">{order.destinationAddress?.split(',')[0] || '—'}</p>
                  <p className="text-on-surface-variant text-body-sm">{order.destinationAddress?.split(',').slice(1).join(',') || ''}</p>
                </div>
              </div>
            </section>

            {/* Timeline & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
              {/* Timeline */}
              <section className="lg:col-span-7 bg-background-main rounded-[20px] p-8 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                <h2 className="text-headline-md font-bold mb-10">Shipment Progress</h2>
                <div className="relative ml-4">
                  {/* Timeline Line */}
                  <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-outline-variant">
                    <div
                      className="absolute top-0 w-full bg-primary"
                      style={{
                        height: `${(STATUS_STEPS.findIndex(s => s.key === currentStatus) / (STATUS_STEPS.length - 1)) * 100}%`
                      }}
                    />
                    {currentStatus !== 'delivered' && currentStatus !== 'failed' && (
                      <div
                        className="absolute w-full bg-accent-lime animate-pulse"
                        style={{
                          top: `${(STATUS_STEPS.findIndex(s => s.key === currentStatus) / (STATUS_STEPS.length - 1)) * 100}%`,
                          height: '8%',
                        }}
                      />
                    )}
                  </div>

                  {[...STATUS_STEPS].reverse().map((step) => {
                    const state = getStepState(step.key, currentStatus);
                    const isDone = state === 'done';
                    const isActive = state === 'active';
                    const isPending = state === 'pending';

                    // Find tracking event for this step
                    const events = tracking?.timeline || [];
                    const event = events.find((e) => e.status === step.key);

                    return (
                      <div key={step.key} className={`relative flex mb-12 last:mb-0 ${isPending ? 'opacity-40' : ''}`}>
                        <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-background-main ${
                          isActive ? 'bg-accent-lime shadow-[0_0_15px_rgba(196,245,66,0.5)]' :
                            isDone ? 'bg-primary' :
                              'bg-outline-variant'
                        }`}>
                          <span
                            className={`material-symbols-outlined text-[16px] ${isActive ? 'text-primary' : 'text-accent-lime'}`}
                            style={isDone || isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            {isDone ? 'check_circle' : isActive ? step.icon : 'check'}
                          </span>
                        </div>
                        <div className="ml-6">
                          <h3 className="text-label-md text-primary flex items-center gap-2">
                            {step.label}
                            {isActive && (
                              <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-bold uppercase">Current</span>
                            )}
                          </h3>
                          <p className="text-on-surface-variant text-body-sm">{event?.description || step.desc}</p>
                          <span className="text-text-muted text-label-sm mt-1 block">
                            {event?.timestamp ? new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Sidebar */}
              <aside className="lg:col-span-5 space-y-6">
                {/* Package Details */}
                <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                  <h4 className="text-label-md text-primary font-bold mb-4">Package Details</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Order ID', value: `#${order._id?.slice(-8)}` },
                      { label: 'Weight', value: `${order.weight || '—'} kg` },
                      { label: 'Type', value: order.serviceType || 'Standard' },
                      { label: 'Payment', value: order.paymentMethod?.toUpperCase() || '—' },
                      { label: 'Status', value: order.status?.replace(/_/g, ' ') || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-body-sm">{label}</span>
                        <span className="text-primary text-label-md font-bold capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Info */}
                {order.agent && (
                  <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                    <h4 className="text-label-md text-primary font-bold mb-4">Your Delivery Agent</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-accent-lime flex items-center justify-center text-primary font-black text-lg">
                          {order.agent?.name?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="text-label-md font-bold text-primary">{order.agent?.name || 'Agent'}</p>
                          <p className="text-on-surface-variant text-[12px]">Your LogiSwift Runner</p>
                        </div>
                      </div>
                      <button className="bg-primary text-white p-2 rounded-full hover:opacity-90">
                        <span className="material-symbols-outlined text-[20px]">call</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Support */}
                <button className="w-full py-4 border-2 border-outline-variant text-primary font-bold rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">help_center</span>
                  Need help with this order?
                </button>
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-primary-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px] px-[40px] py-16 max-w-[1280px] mx-auto">
          <div className="flex flex-col space-y-4">
            <div className="text-headline-md font-bold text-accent-lime">LOGISWIFT</div>
            <p className="text-on-primary-container/70 text-body-sm">Accelerating the infrastructure of the future with intelligent last-mile solutions.</p>
          </div>
          {[
            { title: 'Company', links: ['About Us', 'Careers', 'Press'] },
            { title: 'Services', links: ['Tracking', 'Returns', 'Support'] },
            { title: 'Legal', links: ['Privacy', 'Terms'] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col space-y-4">
              <h5 className="text-white font-bold text-label-md">{col.title}</h5>
              <ul className="space-y-2">
                {col.links.map((l) => <li key={l}><a className="text-on-primary-container/70 hover:text-accent-lime transition-colors text-body-sm" href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="px-[40px] py-8 max-w-[1280px] mx-auto border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-primary-container/70 text-body-sm">© 2024 LogiSwift Infrastructure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
