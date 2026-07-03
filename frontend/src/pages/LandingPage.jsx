import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-main text-on-background selection:bg-accent-lime selection:text-primary">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full z-50 bg-background-main shadow-[0px_4px_20px_rgba(10,22,40,0.08)]">
        <div className="flex justify-between items-center px-[40px] py-4 max-w-[1280px] mx-auto">
          <Link className="text-headline-md font-black text-primary tracking-tighter" to="/">
            LOGISWIFT
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-primary font-bold border-b-2 border-accent-lime pb-1 text-label-md" href="#">Home</a>
            <Link className="text-text-muted hover:text-secondary transition-colors duration-200 text-label-md" to="/track">Track Order</Link>
            <a className="text-text-muted hover:text-secondary transition-colors duration-200 text-label-md" href="#">Services</a>
            <a className="text-text-muted hover:text-secondary transition-colors duration-200 text-label-md" href="#">Pricing</a>
            <a className="text-text-muted hover:text-secondary transition-colors duration-200 text-label-md" href="#">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden md:block bg-accent-lime text-primary font-bold py-2.5 px-6 rounded-full hover:opacity-90 active:scale-95 transition-all text-label-md"
            >
              Login / Sign Up
            </Link>
            <button className="md:hidden text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
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
                LogiSwift simplifies the final stretch. Our fleet and intelligent routing ensure your packages arrive exactly when and where they need to be.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/track')}
                  className="bg-primary text-white font-bold py-4 px-8 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-2"
                >
                  Track Shipment
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <Link
                  to="/login"
                  className="border-2 border-outline-variant text-primary font-bold py-4 px-8 rounded-full hover:bg-surface-container transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[40px] overflow-hidden shadow-2xl rotate-1">
                <div
                  className="aspect-[4/3] w-full bg-surface-container-low bg-cover bg-center"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASr3s5oVA7uoSTba1Cz1Ixl3ggMBdnj8AnVlsBF8WUhJvS5MnafwLUoKV69sy_C4CpFJ_OHYu1sCBf5jUUwQGZAN7ARDIz9sQl9Xmm5ii4ZSi5VsQ3RZ9eFXxD8PcFqn96YZSUJ_9PQ3k_uU2Ie7js09E5UGPnjbdova8uulg-GuTx1bq729Hs-aV05zINhMajIrytMU-ILzjIBpoGGOJRGnzRaqzVyCBtl7ajSNm1XXx8Pk1ggUiZ_g')" }}
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
              <a className="mt-auto inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all" href="#">Explore Service <span className="material-symbols-outlined">east</span></a>
            </div>
            <div className="bento-card-hover bg-accent-lime p-10 rounded-[32px] flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">monitoring</span>
              </div>
              <div>
                <h3 className="text-headline-md text-primary font-bold mb-3">Real-Time Precision</h3>
                <p className="text-primary/70 text-body-sm leading-relaxed">Full visibility with live-tracking for both merchants and customers, reducing "Where Is My Order" inquiries.</p>
              </div>
              <a className="mt-auto inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all" href="#">Explore Service <span className="material-symbols-outlined">east</span></a>
            </div>
            <div className="bento-card-hover bg-background-main border border-outline-variant p-10 rounded-[32px] flex flex-col items-start gap-6">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">package_2</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold mb-3">White Glove Care</h3>
                <p className="text-text-muted text-body-sm leading-relaxed">Specialized handling for fragile or high-value goods, ensuring they arrive in pristine showroom condition.</p>
              </div>
              <a className="mt-auto inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all" href="#">Explore Service <span className="material-symbols-outlined">east</span></a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-[40px] mb-24 max-w-[1280px] mx-auto">
          <div className="bg-primary rounded-[40px] p-12 md:p-20 text-center overflow-hidden relative">
            <div className="relative z-10 space-y-8">
              <h2 className="text-white text-[48px] leading-[56px] font-bold max-w-3xl mx-auto">Ready to accelerate your delivery performance?</h2>
              <p className="text-on-primary-container text-body-lg max-w-xl mx-auto">
                Join 500+ businesses using LogiSwift to power their last-mile success across the continent.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login" className="bg-accent-lime text-primary font-bold py-4 px-10 rounded-full hover:scale-105 transition-all">
                  Get Started Now
                </Link>
                <button className="bg-transparent border-2 border-white text-white font-bold py-4 px-10 rounded-full hover:bg-white hover:text-primary transition-all">
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary-container text-on-primary-container w-full mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px] px-[40px] py-16 max-w-[1280px] mx-auto">
          <div className="space-y-6">
            <h2 className="text-headline-md font-bold text-accent-lime">LOGISWIFT</h2>
            <p className="text-body-sm opacity-80 leading-relaxed">Building the next generation of logistics infrastructure with a focus on speed, sustainability, and transparency.</p>
            <div className="flex gap-4">
              {['public', 'share', 'alternate_email'].map((icon) => (
                <a key={icon} className="w-10 h-10 rounded-full border border-on-primary-container/20 flex items-center justify-center hover:bg-accent-lime hover:text-primary transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Services', links: ['Same-Day Delivery', 'Route Optimization', 'Warehouse Solutions', 'Reverse Logistics'] },
            { title: 'Company', links: ['About Us', 'Sustainability', 'Careers', 'Partner Program'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Safety Protocols', 'Compliance'] },
          ].map((col) => (
            <div key={col.title} className="space-y-6">
              <h4 className="text-white font-bold text-label-md uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-3 text-body-sm">
                {col.links.map((link) => (
                  <li key={link}><a className="hover:text-accent-lime transition-colors" href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-on-primary-container/10 py-8 px-[40px] max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-body-sm opacity-60">© 2024 LogiSwift Infrastructure. All rights reserved.</p>
          <div className="flex items-center gap-8 text-body-sm opacity-60">
            <a className="hover:text-accent-lime" href="#">Cookie Settings</a>
            <a className="hover:text-accent-lime" href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
