import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const registeredUser = await register({ name, email, password, phone, address });
      if (registeredUser.role === 'admin') navigate('/admin');
      else if (registeredUser.role === 'agent') navigate('/agent');
      else navigate('/customer');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-main text-on-background min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-background-main shadow-sm h-16 flex items-center px-[16px] md:px-[40px]">
        <div className="max-w-[1280px] mx-auto w-full flex justify-center md:justify-start">
          <Link to="/" className="text-headline-md font-black text-primary tracking-tighter">Last Mile</Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow w-full flex items-center justify-center p-[16px] py-8 relative overflow-hidden">
        <div className="z-10 w-full max-w-[440px]">
          {/* Card */}
          <div className="bg-white rounded-[20px] p-8 border border-outline-variant/30 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
            <div className="mb-6">
              <h1 className="text-[24px] leading-[32px] font-bold text-primary mb-2 text-center md:text-left">Create Account</h1>
              <p className="text-body-md text-text-muted text-center md:text-left">Register to start managing deliveries</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error-container text-error text-body-sm font-bold border border-error/20">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-label-md text-primary mb-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-primary mb-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">alternate_email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-primary mb-1">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-2.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-label-md text-primary mb-1">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">lock_reset</span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-2.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
                    <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-label-md text-primary mb-1">Phone Number <span className="text-text-muted">(optional)</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">call</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-primary mb-1">Address <span className="text-text-muted">(optional)</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">home</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="123 Logistics St, New Delhi"
                    autoComplete="street-address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-accent-lime text-primary font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Register as Customer'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-body-sm text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:text-secondary transition-colors underline-offset-4 underline decoration-accent-lime/50">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-primary-container mt-auto">
        <div className="max-w-[1280px] mx-auto px-[40px] py-6 flex justify-center text-on-primary-container/70 text-body-sm">
          <span>© 2024 Last Mile Infrastructure. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
