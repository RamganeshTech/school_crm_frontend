
// const THEME = {
//   brand: "#0d9488",       // Teal 500
//   brandHover: "#0f766e",  // Teal 600
//   brandSoft: "#f0fdfa",   // Teal 50
//   brandText: "#134e4a",   // Teal 900
//   accent: "#f59e0b",      // Amber 500
//   accentSoft: "#fffbeb",  // Amber 50
//   surface: "#ffffff",
//   background: "#f8fafc",  // Slate 50
// };


// SECOND VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../../shared/ui/Button';
import { useAuthData } from '../../hooks/useAuthData';
import RolesSection from './RolesSection';
import FeaturesSection from './FeaturesSection';
import { DOMAIN_IMG, DOMAIN_NAME } from '../../constants/constants';

// ==========================================
// PREMIUM SAAS THEME: OCEAN & CORAL
// ==========================================
const THEME = {
  brand: "#0284c7",       // Ocean Blue (Primary)
  brandHover: "#0369a1",  // Darker Blue
  brandSoft: "#f0f9ff",   // Very Light Blue
  brandText: "#075985",   // Deep Blue Text
  accent: "#f97316",      // Vibrant Coral/Orange (Accent)
  accentSoft: "#fff7ed",  // Light Coral
};

// Properly Typed Variants for Framer Motion
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Home = () => {
  const navigate = useNavigate();
  const { userId, currentRole } = useAuthData();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {

    console.log("currentRole", currentRole)
    if (!userId) {
      navigate('/login');
    } else if (currentRole === 'parent') {
      navigate('/dashboard/profile-selection');
    }
    else if (currentRole === "teacher") {
      navigate(`dashboard/attendance-report`)
    }
    else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        '--brand': THEME.brand,
        '--brand-hover': THEME.brandHover,
        '--brand-soft': THEME.brandSoft,
        '--accent': THEME.accent,
      } as React.CSSProperties}
      className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[var(--brand-soft)] overflow-x-hidden"
    >

      {/* --- NAVIGATION --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-4' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center
              group-hover:scale-105 transition-transform duration-300">
              {/* <i className="fa-solid fa-graduation-cap text-xl text-white"></i> */}
              <img
                src={DOMAIN_IMG}
                alt="Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {DOMAIN_NAME}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            {/* <a href="#ecosystem" className="hover:text-[var(--brand)] transition-colors">Ecosystem</a> */}
            <a href="#features" className="hover:text-[var(--brand)] transition-colors">Features</a>
            <a href="#roles" className="hover:text-[var(--brand)] transition-colors">Roles</a>
          </div>

          <div className="flex items-center gap-4">
            {!userId && (
              <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-[var(--brand)] transition-colors hidden sm:block">
                Sign In
              </button>
            )}
            <Button onClick={handleGetStarted} className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg shadow-sky-500/30 border-none rounded-lg px-3 sm:px-6 py-2 transition-all">
              {userId ? 'Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 lg:pt-16 overflow-hidden bg-white border-b border-slate-100">

        {/* Soft Background Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100 rounded-full blur-[120px] pointer-events-none opacity-60 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-[100px] pointer-events-none opacity-60 -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: Text Content */}
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="w-full lg:w-1/2 flex flex-col items-start text-left z-20"
          >
            {/* <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-xs font-bold tracking-wider uppercase border border-sky-100 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
              The Complete Learning OS
            </motion.div> */}

            <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.15] tracking-tight mb-6">
              Empower Learning. <br />
              <span className="text-[var(--brand)]">Simplify Operations.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-sm sm:text-lg text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              {DOMAIN_NAME} connects educators, students, accountants, and leadership into one beautifully organized, lightning-fast digital campus.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-4 bg-[var(--accent)] text-white text-base shadow-xl border-none rounded-xl font-bold transition-transform hover:-translate-y-1">
                {userId ? 'Enter Dashboard' : 'Start Your Journey'}
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Premium Cascading Smart Panels (Features Focused) */}
          <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[600px] hidden md:flex items-center justify-center">

            {/* Ambient Tech Background: Soft Glows + Radial Dot Grid */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60">
              <div className="absolute w-[400px] h-[400px] bg-sky-200/50 rounded-full blur-[80px]"></div>
              <div className="absolute w-[300px] h-[300px] bg-orange-100/40 rounded-full blur-[80px] translate-x-20 translate-y-20"></div>
              {/* Elegant dot grid fading out at the edges */}
              <div
                className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-70"
                style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}
              ></div>
            </div>

            {/* Container for the staggered feature cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
              className="relative z-10 w-full max-w-lg flex flex-col gap-5"
            >

              {/* Feature Panel 1: Attendance System (Shifted Left) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -30, y: 15 },
                  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="self-start w-[85%] bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-200/60 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>

                <div className="flex justify-between items-start mb-5 pl-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Attendance System</h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Automated Daily Tracking</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <i className="fa-solid fa-user-check text-lg"></i>
                  </div>
                </div>

                {/* Visual Representation of a week's attendance */}
                <div className="pl-2 flex items-center justify-between gap-2">
                  {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2 bg-slate-50 py-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                      {/* Using a dot to represent a clean UI rather than numbers */}
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 4 ? 'bg-slate-300' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Feature Panel 2: Mark Report (Dark Mode - Shifted Right) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 30, y: 15 },
                  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="self-end w-[90%] bg-slate-900 p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border border-slate-800 relative z-20 -mt-2"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shadow-inner text-sky-400 text-xl border border-sky-400/20">
                    <i className="fa-solid fa-chart-pie"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">Mark Reports</h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Comprehensive Term Analytics</p>
                  </div>
                </div>

                {/* Abstract UI representation of grade bars */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">Q1</div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-sky-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">Q2</div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-emerald-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature Panel 3: Clubs & Activities (Centered, overlapping bottom) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="self-center w-[85%] bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-200/80 flex items-center gap-4 -mt-4 z-30"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--accentSoft)] flex items-center justify-center text-[var(--accent)] text-lg shadow-sm border border-orange-100 shrink-0">
                  <i className="fa-solid fa-masks-theater"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extracurriculars</p>
                  <p className="text-sm font-bold text-slate-800">Clubs & Activities</p>
                </div>

                {/* Visual representation of different club types */}
                <div className="flex -space-x-2 mr-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border-2 border-white flex items-center justify-center text-rose-500 text-[10px] shadow-sm"><i className="fa-solid fa-palette"></i></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-500 text-[10px] shadow-sm"><i className="fa-solid fa-flask"></i></div>
                  <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center text-amber-500 text-[10px] shadow-sm"><i className="fa-solid fa-basketball"></i></div>
                </div>
              </motion.div>

            </motion.div>
          </div>


        </div>
      </section>


      <RolesSection />


      <FeaturesSection />

      {/* --- HIGH CONTRAST CTA --- */}
      {/* <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="bg-[var(--brand)] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400 rounded-full blur-[80px] opacity-30 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)] rounded-full blur-[80px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your school?</h2>
              <p className="text-sky-100 text-lg max-w-2xl mx-auto mb-10">
                Join modern educational institutions simplifying their workflows with {DOMAIN_NAME} today.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-[var(--accent)] hover:bg-orange-600 text-white font-bold text-base px-10 py-4 rounded-xl border-none shadow-xl transition-transform hover:scale-105">
                  {userId ? 'Go to Dashboard' : 'Get Started Now'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section> */}


      <section className="py:12 sm:py-24 bg-white relative overflow-hidden">
        {/* Subtle dot pattern background to make the white card stand out */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            // 🌟 The Premium White/Silver Gradient Card
            className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-[2rem] p-10 md:p-16 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 relative overflow-hidden"
          >
            {/* Extremely soft, professional blue lighting behind the text */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-[0.08] translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400 rounded-full blur-[120px] opacity-[0.08] -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10">
              {/* Dark text for perfect readability on a white background */}
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 mb-6">Ready to upgrade your school?</h2>

              <p className="text-slate-500 text-md sm:text-lg max-w-2xl mx-auto mb-10 font-medium">
                Join modern educational institutions simplifying their workflows with {DOMAIN_NAME} today.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {/* 🌟 Bold, solid Blue Button for maximum visibility */}
                <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto !bg-blue-600 hover:!bg-blue-700 text-white 
                font-bold text-base px-10 py-2 sm:py-4 rounded-xl border-none shadow-xl shadow-blue-600/20 transition-transform hover:scale-105">
                  {userId ? 'Go to Dashboard' : 'Get Started Now'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      


      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Top Section: Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

            {/* Column 1: Brand & Description */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  {/* <i className="fa-solid fa-graduation-cap text-sm text-white"></i> */}
                   <img
                src={DOMAIN_IMG}
                alt="Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">{DOMAIN_NAME}</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed font-medium">
                Empowering modern educational institutions with a comprehensive, role-based digital campus and streamlined workflow management.
              </p>
            </div>

            {/* Column 2: Quick Links (Scrolls to IDs) */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Platform</h4>
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-500">
                {/* These use href="#id" to smoothly scroll down the landing page */}
                <a href="#features" className="hover:text-blue-600 transition-colors duration-200 w-fit">Features</a>
                <a href="#roles" className="hover:text-blue-600 transition-colors duration-200 w-fit">The Ecosystem</a>
              </div>
            </div>

            {/* Column 3: Legal & Support (Moved to the upper section) */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Legal</h4>
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-500">
                <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors duration-200 w-fit">Privacy Policy</Link>
                {/* <Link to="/terms-and-conditions" className="hover:text-blue-600 transition-colors duration-200 w-fit">Terms & Conditions</Link> */}
                <Link to="/account-deletion" className="hover:text-blue-600 transition-colors duration-200 w-fit">Account Deletion</Link>
              </div>
            </div>

          </div>

          {/* Bottom Section: Copyright Bar Only */}
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} {DOMAIN_NAME} LMS. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;