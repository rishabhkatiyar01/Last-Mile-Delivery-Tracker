import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getQuote, createOrder } from '../api/orders';

export default function CreateOrder() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    pickupName: '', pickupAddress: '', pickupPincode: '', pickupPhone: '',
    dropName: '', dropAddress: '', dropPincode: '', dropPhone: '',
    weight: 2.5, length: 30, height: 15, width: 20,
    serviceType: 'B2B', paymentMethod: 'prepaid',
    fragile: false, insurance: false,
  });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const liveCharge = (() => {
    const base = 15;
    const wt = parseFloat(form.weight) || 0;
    const len = parseFloat(form.length) || 0;
    const h = parseFloat(form.height) || 0;
    return (base + wt * 5.5 + (len * h) * 0.02).toFixed(2);
  })();

  const handleQuote = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getQuote({
        pickupAddress: `${form.pickupName}, ${form.pickupAddress}, ${form.pickupPincode}`,
        destinationAddress: `${form.dropName}, ${form.dropAddress}, ${form.dropPincode}`,
        weight: parseFloat(form.weight) || 1,
        length: parseFloat(form.length) || 10,
        width: parseFloat(form.width) || 10,
        height: parseFloat(form.height) || 10,
      });
      setQuote(data);
    } catch {
      setQuote({ estimatedCost: liveCharge });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.pickupAddress || !form.dropAddress) {
      setError('Please fill in pickup and destination addresses.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const order = await createOrder({
        pickupAddress: `${form.pickupName}, ${form.pickupAddress}, ${form.pickupPincode}`,
        destinationAddress: `${form.dropName}, ${form.dropAddress}, ${form.dropPincode}`,
        weight: parseFloat(form.weight) || 1,
        length: parseFloat(form.length) || 10,
        width: parseFloat(form.width) || 10,
        height: parseFloat(form.height) || 10,
        serviceType: form.serviceType,
        paymentMethod: form.paymentMethod,
        fragile: form.fragile,
        insurance: form.insurance,
        pickupPhone: form.pickupPhone,
        dropPhone: form.dropPhone,
      });
      setSuccess(order);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-main flex flex-col items-center justify-center p-8 gap-8">
        <div className="w-32 h-32 rounded-full bg-accent-lime flex items-center justify-center shadow-2xl">
          <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-[32px] font-bold text-primary">Order Confirmed!</h1>
          <p className="text-text-muted text-body-lg">Your order <span className="font-bold text-primary">#{success.data?._id?.slice(-8) || '--------'}</span> has been placed.</p>
          <p className="text-text-muted text-body-md">A LogiSwift agent will pick up your package shortly.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/track" className="bg-primary text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-all">
            Track Order
          </Link>
          <Link to="/customer" className="border-2 border-outline-variant text-primary font-bold py-4 px-8 rounded-full hover:bg-surface-container transition-all">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-main font-body-md text-on-surface min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 w-full z-50 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
        <div className="flex justify-between items-center px-[16px] py-4 max-w-[1280px] mx-auto md:px-[40px]">
          <div className="flex items-center gap-2">
            <button className="material-symbols-outlined text-primary" onClick={() => navigate(-1)}>arrow_back</button>
            <Link to="/" className="text-headline-md font-black text-primary tracking-tighter">LOGISWIFT</Link>
          </div>
          <div className="md:hidden">
            <span className="text-label-md text-primary font-bold uppercase tracking-widest">New Order</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="text-text-muted hover:text-secondary transition-colors" to="/track">Track</Link>
            <Link className="bg-primary text-white px-6 py-2 rounded-full text-label-md font-bold" to="/customer">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow px-[16px] py-8 md:px-[40px] max-w-[540px] mx-auto w-full pb-32">
        <header className="mb-8">
          <h1 className="text-[24px] leading-[32px] font-bold text-primary mb-2">Create Last-Mile Order</h1>
          <p className="text-body-sm text-text-muted">Fill in the shipment details to get a live quote and schedule your delivery.</p>
        </header>

        {error && <div className="mb-6 p-4 rounded-xl bg-error-container text-error text-body-sm font-bold">{error}</div>}

        <div className="space-y-[24px]">
          {/* Order Config */}
          <section className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">category</span>
              <h2 className="text-headline-md font-bold text-primary">Order Configuration</h2>
            </div>
            <div>
              <label className="text-label-md text-on-primary-container block mb-3">Service Type</label>
              <div className="flex p-1 bg-white rounded-full border border-outline-variant shadow-sm">
                {['B2B', 'B2C'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, serviceType: v })}
                    className={`flex-1 py-2 px-4 rounded-full text-label-md transition-all ${form.serviceType === v ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-label-md text-on-primary-container block mb-3">Payment Mode</label>
              <div className="flex p-1 bg-white rounded-full border border-outline-variant shadow-sm">
                {[{ v: 'prepaid', label: 'Prepaid' }, { v: 'cod', label: 'COD' }].map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: v })}
                    className={`flex-1 py-2 px-4 rounded-full text-label-md transition-all ${form.paymentMethod === v ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pickup Point */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <h2 className="text-headline-md font-bold text-primary">Pickup Point</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'pickupName', label: 'Full Name / Warehouse Name', type: 'text' },
                { name: 'pickupAddress', label: 'Detailed Address', type: 'text' },
              ].map(({ name, label, type }) => (
                <div key={name} className="relative">
                  <input name={name} value={form[name]} onChange={handleChange} type={type}
                    className="peer w-full px-4 pt-6 pb-2 border-b-2 border-outline-variant focus:border-accent-lime outline-none transition-all bg-transparent text-body-md"
                    placeholder=" " />
                  <label className="absolute left-4 top-4 text-text-muted transition-all pointer-events-none text-label-md">{label}</label>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'pickupPincode', label: 'Pincode', type: 'text' },
                  { name: 'pickupPhone', label: 'Phone', type: 'tel' },
                ].map(({ name, label, type }) => (
                  <div key={name} className="relative">
                    <input name={name} value={form[name]} onChange={handleChange} type={type}
                      className="peer w-full px-4 pt-6 pb-2 border-b-2 border-outline-variant focus:border-accent-lime outline-none transition-all bg-transparent text-body-md"
                      placeholder=" " />
                    <label className="absolute left-4 top-4 text-text-muted transition-all pointer-events-none text-label-md">{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="py-2 flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-outline-variant"></div>
            <div className="bg-surface-container rounded-full p-2">
              <span className="material-symbols-outlined text-primary text-sm">straighten</span>
            </div>
            <div className="h-[1px] flex-grow bg-outline-variant"></div>
          </div>

          {/* Destination */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-lime" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
              <h2 className="text-headline-md font-bold text-primary">Destination</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'dropName', label: 'Receiver Name', type: 'text' },
                { name: 'dropAddress', label: 'Street Address, Apartment', type: 'text' },
              ].map(({ name, label, type }) => (
                <div key={name} className="relative">
                  <input name={name} value={form[name]} onChange={handleChange} type={type}
                    className="peer w-full px-4 pt-6 pb-2 border-b-2 border-outline-variant focus:border-accent-lime outline-none transition-all bg-transparent text-body-md"
                    placeholder=" " />
                  <label className="absolute left-4 top-4 text-text-muted transition-all pointer-events-none text-label-md">{label}</label>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'dropPincode', label: 'Pincode', type: 'text' },
                  { name: 'dropPhone', label: 'Phone', type: 'tel' },
                ].map(({ name, label, type }) => (
                  <div key={name} className="relative">
                    <input name={name} value={form[name]} onChange={handleChange} type={type}
                      className="peer w-full px-4 pt-6 pb-2 border-b-2 border-outline-variant focus:border-accent-lime outline-none transition-all bg-transparent text-body-md"
                      placeholder=" " />
                    <label className="absolute left-4 top-4 text-text-muted transition-all pointer-events-none text-label-md">{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Package Info */}
          <section className="bg-primary-container p-6 rounded-2xl text-on-primary-container space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-lime">package_2</span>
                <h2 className="text-headline-md font-bold text-white">Package Info</h2>
              </div>
              <span className="bg-accent-lime text-primary px-2 py-1 rounded text-label-sm font-bold">Standard Box</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'weight', label: 'Weight (Kg)', step: '0.1' },
                { name: 'length', label: 'Length (cm)', step: '1' },
                { name: 'height', label: 'Height (cm)', step: '1' },
              ].map(({ name, label, step }) => (
                <div key={name} className="text-center p-3 border border-on-primary-container/20 rounded-xl">
                  <span className="block text-[10px] uppercase font-bold text-on-primary-container/60 mb-1">{label}</span>
                  <input
                    name={name}
                    type="number"
                    step={step}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full bg-transparent text-center text-headline-md text-white font-bold border-none focus:ring-0 p-0 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input name="fragile" type="checkbox" checked={form.fragile} onChange={handleChange} className="rounded text-accent-lime focus:ring-accent-lime bg-transparent border-on-primary-container/30" />
                <span className="text-body-sm text-white">Fragile Item</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input name="insurance" type="checkbox" checked={form.insurance} onChange={handleChange} className="rounded text-accent-lime focus:ring-accent-lime bg-transparent border-on-primary-container/30" />
                <span className="text-body-sm text-white">Add Insurance</span>
              </label>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary-container shadow-[0px_-4px_20px_rgba(10,22,40,0.15)]">
        <div className="max-w-[1280px] mx-auto px-[16px] py-4 flex items-center justify-between gap-[24px] md:px-[40px]">
          <div className="flex flex-col">
            <span className="text-body-sm text-on-primary-container/70">Estimated Cost</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[36px] text-accent-lime font-black leading-none">${quote?.estimatedCost || liveCharge}</span>
              <span className="text-body-sm text-on-primary-container">USD</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleQuote}
              disabled={loading}
              className="border-2 border-accent-lime text-accent-lime px-5 py-3 rounded-full font-bold text-label-md hover:bg-accent-lime/10 transition-all disabled:opacity-60"
            >
              {loading ? '...' : 'Get Quote'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-accent-lime text-primary px-8 py-3 rounded-full font-headline-md font-bold hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? 'Placing...' : 'Confirm Order'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
