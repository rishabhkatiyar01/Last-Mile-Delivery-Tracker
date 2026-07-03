import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['customer', 'agent', 'admin'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      // Redirect based on role from token
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'admin') navigate('/admin');
      else if (payload.role === 'agent') navigate('/agent');
      else navigate('/customer');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSliderTranslate = () => {
    const idx = roles.indexOf(role);
    return `translateX(${idx * 101}%)`;
  };

  return (
    <div className="bg-background-main text-on-background min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-background-main shadow-sm h-16 flex items-center px-[16px] md:px-[40px]">
        <div className="max-w-[1280px] mx-auto w-full flex justify-center md:justify-start">
          <Link to="/" className="text-headline-md font-black text-primary tracking-tighter">LOGISWIFT</Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow w-full flex items-center justify-center p-[16px] relative overflow-hidden">
        <div className="z-10 w-full max-w-[440px]">
          {/* Login Card */}
          <div className="bg-white rounded-[20px] p-8 border border-outline-variant/30 shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
            <div className="mb-8">
              <h1 className="text-[24px] leading-[32px] font-bold text-primary mb-2 text-center md:text-left">Welcome Back</h1>
              <p className="text-body-md text-text-muted text-center md:text-left">Access your last-mile logistics dashboard</p>
            </div>

            {/* Role Selector */}
            <div className="mb-8">
              <label className="block text-label-md text-primary mb-3">Login as</label>
              <div className="bg-surface-container-low p-1 rounded-full flex relative">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-full text-label-md z-10 transition-colors duration-200 capitalize ${role === r ? 'text-primary' : 'text-on-surface-variant'}`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
                <div
                  className="absolute top-1 left-1 bottom-1 w-[32.5%] bg-white rounded-full shadow-sm transition-all duration-300"
                  style={{ transform: getSliderTranslate() }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error-container text-error text-body-sm font-bold border border-error/20">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <label className="block text-label-md text-primary mb-2">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">alternate_email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="name@logiswift.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-label-md text-primary">Password</label>
                  <a className="text-label-sm text-text-muted hover:text-primary transition-colors" href="#">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant rounded-xl focus:border-accent-lime focus:ring-0 transition-all outline-none text-body-md text-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant text-accent-lime focus:ring-accent-lime transition-colors"
                />
                <span className="ml-3 text-body-sm text-text-muted group-hover:text-primary transition-colors">Keep me signed in</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent-lime text-primary font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Login to Portal'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-body-sm text-text-muted">
                Don't have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:text-secondary transition-colors underline-offset-4 underline decoration-accent-lime/50">Register</Link>
              </p>
            </div>
          </div>

          {/* Decorative */}
          <div className="mt-12 flex justify-center items-center space-x-4 opacity-40">
            <div className="w-2 h-2 rounded-full bg-accent-lime"></div>
            <div className="h-px w-8 bg-outline-variant"></div>
            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
            <div className="h-px w-8 bg-outline-variant"></div>
            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-primary-container mt-auto">
        <div className="max-w-[1280px] mx-auto px-[40px] py-8 flex flex-col md:flex-row justify-between items-center text-on-primary-container/70 text-body-sm space-y-4 md:space-y-0">
          <span>© 2024 LogiSwift Infrastructure. All rights reserved.</span>
          <div className="flex space-x-6">
            <a className="hover:text-accent-lime transition-colors" href="#">Support</a>
            <a className="hover:text-accent-lime transition-colors" href="#">Privacy</a>
            <a className="hover:text-accent-lime transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
