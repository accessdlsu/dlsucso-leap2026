import { useState, useRef, useEffect } from 'react';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, [breakpoint]);
  return isMobile;
}
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, LogIn, LogOut, Bookmark, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types';
import styles from '../App.module.css';

interface NavbarProps {
  isLoggedIn: boolean;
  user: any;
  userProfile: UserProfile | null;
  currentView: string;
  scrolled: boolean;
  isMenuOpen: boolean;
  authError: string | null;
  onMenuToggle: (isOpen: boolean) => void;
  onSearchClick: () => void;
  onNavigate: (view: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onAdminClick: () => void;
  logoImg: string;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'Overview' },
  { id: 'major-events', label: 'Featured' },
  { id: 'classes', label: 'Classes' },
  { id: 'faq', label: 'FAQs' },
];

export const Navbar = ({
  isLoggedIn,
  user,
  userProfile,
  currentView,
  scrolled,
  isMenuOpen,
  authError,
  onMenuToggle,
  onSearchClick,
  onNavigate,
  onSignIn,
  onSignOut,
  onAdminClick,
  logoImg,
}: NavbarProps) => {
  const isMobile = useIsMobile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const isHeroNav = !scrolled && currentView === 'home';
  const navClass = scrolled ? 'scrolled-nav py-3' : currentView === 'home' ? 'py-5' : 'dark-page-nav py-5';

  return (
    <>
      {/* ── Auth error toast ── */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: '1.5rem', left: '50%', zIndex: 9999,
              background: '#803e2f', color: '#fae185',
              padding: '0.85rem 1.25rem', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              boxShadow: '0 12px 32px rgba(128,62,47,0.3)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem', fontWeight: 600,
              maxWidth: '90vw',
              border: '1px solid rgba(249,236,182,0.2)',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop/base navbar ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClass}`}
        style={isHeroNav ? {
          background: 'linear-gradient(180deg, #334b46 0%, #334b46 50%, #334b46 100%)',
          backdropFilter: 'none', WebkitBackdropFilter: 'none',
          boxShadow: 'none', border: 'none', borderBottom: 'none',
        } : undefined}
      >
        {/* Hero nav ambient glow */}
        {isHeroNav && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40%', height: '120%', background: 'radial-gradient(ellipse, rgba(222,154,73,0.08) 0%, transparent 70%)', animation: 'navGlowCenter 4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', top: 0, left: '-5%', width: '30%', height: '100%', background: 'radial-gradient(ellipse at 0% 50%, rgba(74,176,154,0.12) 0%, transparent 70%)', animation: 'navGlowSide 5s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', top: 0, right: '-5%', width: '30%', height: '100%', background: 'radial-gradient(ellipse at 100% 50%, rgba(74,176,154,0.1) 0%, transparent 70%)', animation: 'navGlowSide 5s ease-in-out infinite 1.5s' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(222,154,73,0.25), rgba(250,225,133,0.4), rgba(222,154,73,0.25), transparent)', animation: 'navShimmer 3s ease-in-out infinite' }} />
            {[15, 35, 55, 72, 88].map((x, i) => (
              <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${30 + (i % 3) * 20}%`, width: 2, height: 2, borderRadius: '50%', background: '#fae185', boxShadow: '0 0 4px 2px rgba(250,225,133,0.6)', animation: `navFirefly ${2.5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }} />
            ))}
            <style>{`
              @keyframes navGlowCenter { 0%,100%{opacity:.6;transform:translate(-50%,-50%) scaleX(1)} 50%{opacity:1;transform:translate(-50%,-50%) scaleX(1.1)} }
              @keyframes navGlowSide { 0%,100%{opacity:.5} 50%{opacity:1} }
              @keyframes navShimmer { 0%,100%{opacity:.4;transform:scaleX(.85)} 50%{opacity:.9;transform:scaleX(1)} }
              @keyframes navFirefly { 0%,100%{opacity:.1;transform:scale(.8)} 50%{opacity:.8;transform:scale(1.2)} }
            `}</style>
          </div>
        )}

        <div className={styles.navInner}>
          {/* Logo */}
          <div className={styles.navLogo} onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="LEAP 2026" width="74" height="42" className={styles.navLogoImg} style={{ mixBlendMode: 'screen' }} />
          </div>

          {/* Desktop nav links */}
          <div className={styles.navCenter}>
            {NAV_LINKS.map(link => (
              <button key={link.id} onClick={() => onNavigate(link.id)} className={`nav-link ${currentView === link.id ? 'active' : ''}`}>
                {link.label}
              </button>
            ))}
            {userProfile?.role === 'admin' && (
              <button onClick={onAdminClick} className="leap-admin-link">Admin</button>
            )}
          </div>

          {/* Desktop right actions — only rendered on non-mobile */}
          {!isMobile && <div className="leap-nav-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="nav-icon-btn" onClick={onSearchClick} title="Search classes">
              <Search size={17} />
            </button>
            {isLoggedIn ? (
              <div ref={profileDropdownRef} style={{ position: 'relative' }}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="nav-icon-btn" title={user.displayName || 'Profile'}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="Profile" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    : <User size={17} />
                  }
                </button>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                      background: '#f9ecb6', borderRadius: '0.75rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(222,154,73,0.22)',
                      zIndex: 1000, minWidth: '200px', overflow: 'hidden',
                    }}
                  >
                    {[
                      { label: 'Saved Classes', icon: <Bookmark size={15} />, action: () => { onNavigate('saved-classes'); setIsProfileOpen(false); } },
                      { label: 'Sign Out', icon: <LogOut size={15} />, action: () => { onSignOut(); setIsProfileOpen(false); } },
                    ].map((item, i) => (
                      <button key={item.label} onClick={item.action} style={{
                        width: '100%', padding: '0.75rem 1.25rem',
                        border: 'none', borderTop: i > 0 ? '1px solid rgba(222,154,73,0.15)' : 'none',
                        background: 'transparent', color: '#803e2f',
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(222,154,73,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        {item.icon}{item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <button className="nav-icon-btn" title="Sign in" onClick={onSignIn}><User size={17} /></button>
                <button onClick={onSignIn} className="btn-leap-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.76rem', borderRadius: 8, gap: '0.45rem' }}>
                  <LogIn size={14} /> Register
                </button>
              </>
            )}
          </div>}

          {/* Mobile toggle buttons — only rendered on mobile */}
          {isMobile && <div className={styles.navMobileToggle}>
            <button className={styles.navMobileBtn} onClick={onSearchClick} title="Search classes"
              style={{ color: isHeroNav ? '#f9ecb6' : '#334b46' }}>
              <Search size={22} />
            </button>
            <button className={styles.navMobileBtn} onClick={() => onMenuToggle(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              style={{ color: isHeroNav ? '#f9ecb6' : '#334b46' }}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>}
        </div>
      </nav>

      {/* ══════════════════════════════
          MOBILE MENU OVERLAY
      ══════════════════════════════ */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => onMenuToggle(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 998,
                background: 'rgba(10,8,5,0.55)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.9 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(320px, 88vw)',
                zIndex: 999,
                background: 'linear-gradient(175deg, #f9ecb6 0%, #e0b788 50%, #fae185 100%)',
                boxShadow: '-8px 0 40px rgba(128,62,47,0.18)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Drawer header */}
              <div style={{
                padding: '1.1rem 1.25rem 0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(222,154,73,0.18)',
                background: 'rgba(250,225,133,0.8)',
                flexShrink: 0,
              }}>
                {/* User info or brand */}
                {isLoggedIn ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile"
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(222,154,73,0.4)' }}
                        referrerPolicy="no-referrer" />
                    ) : (
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(222,154,73,0.15)', border: '1.5px solid rgba(222,154,73,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#de9a49',
                      }}>
                        <User size={16} />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#803e2f', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.displayName || 'Signed in'}
                      </p>
                      <p style={{ fontSize: '0.68rem', color: '#7c6b4b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontFamily: "'Tropikal', 'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#803e2f', margin: 0 }}>
                    LEAP 2026
                  </p>
                )}

                {/* Close button */}
                <button
                  onClick={() => onMenuToggle(false)}
                  aria-label="Close menu"
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1px solid rgba(222,154,73,0.25)',
                    background: 'rgba(250,225,133,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#803e2f', flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                  onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(222,154,73,0.12)'; }}
                  onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(250,225,133,0.9)'; }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <nav style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <p style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#de9a49', padding: '0.5rem 0.6rem 0.25rem', margin: 0 }}>
                  Navigate
                </p>
                {NAV_LINKS.map(link => {
                  const isActive = currentView === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => { onNavigate(link.id); onMenuToggle(false); }}
                      style={{
                        width: '100%', padding: '0.8rem 0.9rem',
                        border: isActive ? '1px solid rgba(222,154,73,0.35)' : '1px solid transparent',
                        borderRadius: 12,
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(250,225,133,0.95), rgba(224,183,136,0.9))'
                          : 'transparent',
                        color: isActive ? '#803e2f' : '#7c6b4b',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.95rem', fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s',
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: isActive ? '0 2px 8px rgba(222,154,73,0.1)' : 'none',
                      }}
                      onTouchStart={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(222,154,73,0.07)'; }}
                      onTouchEnd={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <span>{link.label}</span>
                      {isActive && <ChevronRight size={14} style={{ color: '#de9a49', flexShrink: 0 }} />}
                    </button>
                  );
                })}

                {/* Saved Classes (logged in only) */}
                {isLoggedIn && (
                  <>
                    <div style={{ height: 1, background: 'rgba(222,154,73,0.15)', margin: '0.4rem 0.6rem' }} />
                    <p style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#de9a49', padding: '0.25rem 0.6rem', margin: 0 }}>
                      My Account
                    </p>
                    <button
                      onClick={() => { onNavigate('saved-classes'); onMenuToggle(false); }}
                      style={{
                        width: '100%', padding: '0.8rem 0.9rem',
                        border: currentView === 'saved-classes' ? '1px solid rgba(222,154,73,0.35)' : '1px solid transparent',
                        borderRadius: 12,
                        background: currentView === 'saved-classes' ? 'linear-gradient(135deg, rgba(250,225,133,0.95), rgba(224,183,136,0.9))' : 'transparent',
                        color: currentView === 'saved-classes' ? '#803e2f' : '#7c6b4b',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.95rem', fontWeight: currentView === 'saved-classes' ? 700 : 500,
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        transition: 'all 0.15s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Bookmark size={16} style={{ color: '#de9a49', flexShrink: 0 }} />
                      Saved Classes
                    </button>
                  </>
                )}

                {/* Admin link */}
                {userProfile?.role === 'admin' && (
                  <button
                    onClick={() => { onAdminClick(); onMenuToggle(false); }}
                    style={{
                      width: '100%', padding: '0.8rem 0.9rem',
                      border: '1px solid rgba(128,62,47,0.2)',
                      borderRadius: 12,
                      background: 'rgba(128,62,47,0.07)',
                      color: '#803e2f',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.88rem', fontWeight: 700,
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      transition: 'all 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                    Admin Dashboard
                  </button>
                )}
              </nav>

              {/* Drawer footer: auth action */}
              <div style={{
                padding: '0.85rem 1rem',
                borderTop: '1px solid rgba(222,154,73,0.18)',
                background: 'rgba(250,225,133,0.7)',
                flexShrink: 0,
              }}>
                {isLoggedIn ? (
                  <button
                    onClick={() => { onSignOut(); onMenuToggle(false); }}
                    style={{
                      width: '100%', padding: '0.85rem',
                      borderRadius: 13,
                      border: '1px solid rgba(128,62,47,0.2)',
                      background: 'rgba(128,62,47,0.06)',
                      color: '#803e2f',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.9rem', fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                      transition: 'all 0.18s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,62,47,0.12)'; }}
                    onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(128,62,47,0.06)'; }}
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { onSignIn(); onMenuToggle(false); }}
                    className="btn-leap-primary"
                    style={{
                      width: '100%', padding: '0.9rem',
                      borderRadius: 13, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    }}
                  >
                    <LogIn size={17} />
                    Sign in with DLSU
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};