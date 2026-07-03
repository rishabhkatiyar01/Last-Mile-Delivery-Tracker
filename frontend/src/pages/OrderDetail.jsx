import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrder, getTracking, updateStatus, overrideStatus } from '../api/orders';

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

const ALL_STATUSES = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED'];

// Modal for status updates (admin/agent)
function StatusModal({ orderId, currentStatus, isOverride, onClose, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const AGENT_NEXT = { ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
  const availableStatuses = isOverride ? ALL_STATUSES : Object.values(AGENT_NEXT).filter((_, i) => Object.keys(AGENT_NEXT)[i] === currentStatus);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) { setError('Please select a status.'); return; }
    if (!note.trim() && isOverride) { setError('A note is required for overrides.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isOverride) {
        await overrideStatus(orderId, { status: selectedStatus, note });
      } else {
        await updateStatus(orderId, { status: selectedStatus, note });
      }
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md font-bold text-primary">{isOverride ? 'Override Status' : 'Update Status'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-error text-body-sm font-bold border border-error/20">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-md text-primary mb-2">New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(isOverride ? ALL_STATUSES : [AGENT_NEXT[currentStatus]].filter(Boolean)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-2 rounded-xl border text-label-sm font-bold transition-all text-left ${
                    selectedStatus === s ? 'bg-primary text-white border-primary' : 'border-outline-variant hover:border-accent-lime'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-label-md text-primary mb-2">
              Note {isOverride ? <span className="text-error">*</span> : <span className="text-text-muted">(optional)</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl focus:border-accent-lime outline-none text-body-md resize-none"
              placeholder={isOverride ? 'Reason for override...' : 'Add a note (optional)...'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-outline-variant rounded-full font-bold text-primary hover:bg-surface-container transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-accent-lime text-primary rounded-full font-bold hover:opacity-90 disabled:opacity-60 transition-all">
              {loading ? 'Saving...' : isOverride ? 'Override' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'update' | 'override' | null

  const loadData = async () => {
    try {
      const [orderRes, trackRes] = await Promise.all([
        getOrder(orderId).catch(() => null),
        getTracking(orderId).catch(() => null),
      ]);
      if (!orderRes?.success) {
        setError('Order not found or access denied.');
      } else {
        setOrder(orderRes.data);
        setTracking(trackRes?.data || []);
      }
    } catch {
      setError('Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderId]);

  const handleModalSuccess = () => {
    setModal(null);
    setLoading(true);
    loadData();
  };

  const sortedHistory = [...tracking].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const canUpdateStatus = user && (user.role === 'admin' || user.role === 'agent');
  const isAdmin = user?.role === 'admin';

  const AGENT_NEXT = { ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
  const agentHasNextStep = order && AGENT_NEXT[order.currentStatus];

  const backPath = user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/agent' : user?.role === 'customer' ? '/customer' : '/';

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
        <div className="flex items-center gap-4 px-[24px] md:px-[40px] py-4 max-w-[1280px] mx-auto">
          <button onClick={() => navigate(backPath)} className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <Link to="/" className="text-headline-md font-black text-primary tracking-tighter">Last Mile</Link>
          <span className="text-text-muted">·</span>
          <span className="text-body-md text-text-muted font-medium">Order Detail</span>
          {order && <div className="ml-auto"><StatusBadge status={order.currentStatus} /></div>}
        </div>
      </header>

      <main className="flex-grow max-w-[1100px] mx-auto w-full px-[16px] md:px-[40px] py-10">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-lime"></div>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center py-24 gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-error">error</span>
            <p className="text-headline-md font-bold text-primary">{error}</p>
            <button onClick={() => navigate(backPath)} className="mt-2 px-6 py-3 bg-primary text-white rounded-full font-bold">Go Back</button>
          </div>
        )}

        {order && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Summary + Timeline */}
            <div className="lg:col-span-8 space-y-6">
              {/* Order Summary Card */}
              <div className="bg-background-main rounded-[20px] p-6 md:p-8 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div>
                    <p className="text-label-sm text-text-muted uppercase tracking-wider mb-1">Tracking Number</p>
                    <h1 className="text-headline-md font-bold text-primary break-all">{order._id}</h1>
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <StatusBadge status={order.currentStatus} />
                      <span className="text-body-sm text-text-muted">Created {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  {canUpdateStatus && (
                    <div className="flex flex-wrap gap-2">
                      {(user.role === 'agent' && agentHasNextStep) && (
                        <button
                          onClick={() => setModal('update')}
                          className="px-5 py-2 bg-accent-lime text-primary rounded-full font-bold text-label-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          Update Status
                        </button>
                      )}
                      {(user.role === 'agent' && ['ASSIGNED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY'].includes(order.currentStatus)) && (
                        <button
                          onClick={() => setModal('fail')}
                          className="px-5 py-2 bg-error/10 text-error rounded-full font-bold text-label-sm hover:bg-error hover:text-white transition-all"
                        >
                          Mark Failed
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => setModal('override')}
                          className="px-5 py-2 border border-outline-variant text-primary rounded-full font-bold text-label-sm hover:bg-surface-container transition-all"
                        >
                          Override Status
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low/50 rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Pickup</p>
                    <p className="font-bold text-primary text-body-sm">{order.pickupAddress?.line || '—'}</p>
                    <p className="text-text-muted text-[12px]">Pincode: {order.pickupAddress?.pincode || '—'}</p>
                  </div>
                  <div className="bg-surface-container-low/50 rounded-2xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Destination</p>
                    <p className="font-bold text-primary text-body-sm">{order.dropAddress?.line || '—'}</p>
                    <p className="text-text-muted text-[12px]">Pincode: {order.dropAddress?.pincode || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-background-main rounded-[20px] p-6 md:p-8 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                <h2 className="text-headline-sm font-bold text-primary mb-6">Shipment Timeline</h2>
                {sortedHistory.length === 0 ? (
                  <p className="text-text-muted text-body-md py-4 text-center">No status events recorded yet.</p>
                ) : (
                  <div className="relative ml-2 border-l-2 border-outline-variant/40">
                    {sortedHistory.map((event, index) => {
                      const isLatest = index === 0;
                      return (
                        <div key={event._id || index} className="relative pl-6 pb-8 last:pb-0">
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background-main ${isLatest ? 'bg-accent-lime shadow-[0_0_10px_rgba(196,245,66,0.6)]' : 'bg-primary'}`} />
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <StatusBadge status={event.status} />
                            {isLatest && <span className="px-2 py-0.5 rounded-full bg-accent-lime/20 text-primary text-[10px] font-bold uppercase">Latest</span>}
                          </div>
                          <p className="text-[12px] text-text-muted mb-1">
                            {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {event.changedBy?.name ? ` · by ${event.changedBy.name}` : ''}
                          </p>
                          {event.note && (
                            <p className="text-body-sm text-primary bg-surface-container-low/60 rounded-lg px-3 py-2 border border-outline-variant/20 italic mt-1">
                              "{event.note}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Package details + Agent */}
            <div className="lg:col-span-4 space-y-5">
              {/* Package Details */}
              <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                <h4 className="text-label-md font-bold text-primary mb-4">Package Details</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Order Type', value: order.orderType || '—' },
                    { label: 'Weight', value: order.actualWeight ? `${order.actualWeight} kg` : '—' },
                    { label: 'Payment', value: order.paymentType || '—' },
                    { label: 'Charge', value: order.charge != null ? `₹${order.charge.toFixed(2)}` : '—' },
                    { label: 'COD Amount', value: order.codAmount ? `₹${order.codAmount}` : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center border-b border-outline-variant/10 pb-2 last:border-0">
                      <span className="text-body-sm text-text-muted">{label}</span>
                      <span className="text-label-sm font-bold text-primary capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer */}
              {order.customer && (
                <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                  <h4 className="text-label-md font-bold text-primary mb-3">Customer</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-black">
                      {order.customer.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-bold text-body-sm text-primary">{order.customer.name}</p>
                      <p className="text-[12px] text-text-muted">{order.customer.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Agent */}
              {order.assignedAgent && (
                <div className="bg-background-main rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
                  <h4 className="text-label-md font-bold text-primary mb-3">Delivery Agent</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-lime flex items-center justify-center text-primary font-black">
                      {order.assignedAgent.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-body-sm text-primary">{order.assignedAgent.name}</p>
                      <p className="text-[12px] text-text-muted">{order.assignedAgent.phone || 'Runner assigned'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      {modal === 'update' && order && (
        <StatusModal
          orderId={order._id}
          currentStatus={order.currentStatus}
          isOverride={false}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {modal === 'fail' && order && (
        <StatusModal
          orderId={order._id}
          currentStatus={order.currentStatus}
          isOverride={false}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {modal === 'override' && order && (
        <StatusModal
          orderId={order._id}
          currentStatus={order.currentStatus}
          isOverride={true}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
