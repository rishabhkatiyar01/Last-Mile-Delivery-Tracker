import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import landingImg from '../assets/lastMIleLanding.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/agent' : '/customer';

  return (
    <div className="bg-background-main text-on-background selection:bg-accent-lime selection:text-primary">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full z-50 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
        <div className="flex justify-between items-center px-[40px] py-4 max-w-[1280px] mx-auto">
          <Link className="text-headline-md font-black text-primary tracking-tighter" to="/">
            Last Mile
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-primary font-bold border-b-2 border-accent-lime pb-1 text-label-md" to="/">Home</Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to={dashboardPath}
                className="hidden md:block bg-accent-lime text-primary font-bold py-2.5 px-6 rounded-full hover:opacity-90 active:scale-95 transition-all text-label-md"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden md:block bg-accent-lime text-primary font-bold py-2.5 px-6 rounded-full hover:opacity-90 active:scale-95 transition-all text-label-md"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="px-[40px] py-16 md:py-24 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-secondary px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-accent-lime rounded-full animate-pulse"></span>
                <span className="text-label-md uppercase tracking-wider">Fastest Last-Mile Infrastructure</span>
              </div>
              <h1 className="text-[48px] leading-[56px] tracking-[-0.02em] font-bold">
                Precision delivery that <br />
                <span className="text-secondary">moves at your speed.</span>
              </h1>
              <p className="text-text-muted text-body-lg max-w-xl">
                Last Mile simplifies the final stretch. Our fleet and intelligent routing ensure your packages arrive exactly when and where they need to be.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                {user ? (
                  <Link
                    to={dashboardPath}
                    className="bg-primary text-white font-bold py-4 px-8 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-2"
                  >
                    Go to Dashboard
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="bg-primary text-white font-bold py-4 px-8 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-2"
                    >
                      Get Started
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="border-2 border-outline-variant text-primary font-bold py-4 px-8 rounded-full hover:bg-surface-container transition-all"
                    >
                      Register Free
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[40px] overflow-hidden shadow-2xl rotate-1">
                <div
                  className="aspect-[4/3] w-full bg-surface-container-low bg-cover bg-center"
                  style={{ backgroundImage: `url(${landingImg})` }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent-lime p-6 rounded-2xl shadow-xl hidden md:block">
                <span className="material-symbols-outlined text-4xl text-primary">local_shipping</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary-container py-20 px-[40px]">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '50K+', label: 'Deliveries Completed' },
              { value: '99%', label: 'On-Time Rate' },
              { value: '150+', label: 'Active Fleet Units' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 border-r border-on-primary-container/20 last:border-0">
                <h3 className="text-accent-lime text-[48px] leading-[56px] font-bold mb-2">{stat.value}</h3>
                <p className="text-on-primary-container text-label-md uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service Grid */}
        <section className="py-24 px-[40px] max-w-[1280px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-headline-lg text-primary font-bold">Our Core Logistics Pillars</h2>
            <p className="text-text-muted text-body-md max-w-2xl mx-auto">
              We offer specialized last-mile solutions tailored to modern commerce, focusing on speed, visibility, and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            <div className="bento-card-hover bg-background-main border border-outline-variant p-10 rounded-[32px] flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">bolt</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold mb-3">Hyper-Local Speed</h3>
                <p className="text-text-muted text-body-sm leading-relaxed">Under 2-hour delivery windows for urban centers using our micro-fulfillment network and optimized routing.</p>
              </div>
            </div>
            <div className="bento-card-hover bg-accent-lime p-10 rounded-[32px] flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">monitoring</span>
              </div>
              <div>
                <h3 className="text-headline-md text-primary font-bold mb-3">Real-Time Precision</h3>
                <p className="text-primary/70 text-body-sm leading-relaxed">Full visibility with live-tracking for both merchants and customers, reducing "Where Is My Order" inquiries.</p>
              </div>
            </div>
            <div className="bento-card-hover bg-background-main border border-outline-variant p-10 rounded-[32px] flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">package_2</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold mb-3">White Glove Care</h3>
                <p className="text-text-muted text-body-sm leading-relaxed">Specialized handling for fragile or high-value goods, ensuring they arrive in pristine showroom condition.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="px-[40px] mb-24 max-w-[1280px] mx-auto">
            <div className="bg-primary rounded-[40px] p-12 md:p-20 text-center overflow-hidden relative">
              <div className="relative z-10 space-y-8">
                <h2 className="text-white text-[48px] leading-[56px] font-bold max-w-3xl mx-auto">Ready to accelerate your delivery performance?</h2>
                <p className="text-on-primary-container text-body-lg max-w-xl mx-auto">
                  Join 500+ businesses using Last Mile to power their last-mile success across the continent.
                </p>
                <div className="flex justify-center gap-4">
                  <Link to="/signup" className="bg-accent-lime text-primary font-bold py-4 px-10 rounded-full hover:scale-105 transition-all">
                    Get Started Now
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary-container text-on-primary-container w-full mt-auto">
        <div className="border-t border-on-primary-container/10 py-8 px-[40px] max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-headline-sm font-bold text-accent-lime">Last Mile</span>
          <p className="text-body-sm opacity-60">© {new Date().getFullYear()} Last Mile Infrastructure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
