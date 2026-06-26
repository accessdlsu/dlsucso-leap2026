import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  House,
  BookOpen,
  Star,
  GraduationCap,
  MessageCircleQuestion,
  Search,
  CircleUser,
  Bookmark,
  LogOut,
  User,
  Bell,
  Zap,
} from "lucide-react";
import type { UserProfile } from "leapify/types";
import { getCachedProfile, restoreSession, signOutUser } from "../../services/auth";
import { leapifyApi } from "../../services/leapify";
import SearchOverlay from "../SearchOverlay";
import SavedClassesOverlay from "../SavedClassesOverlay";
import { SUPPORTED_LOCALES, setStoredLocale, type LocaleCode } from "../../lib/locale";
import { useLocale } from "../../hooks/useLocale";

const NAV_LINK_DEFS = [
  { href: "/",            key: "nav_home"   as const, icon: House },
  { href: "/about/",      key: "nav_about"  as const, icon: BookOpen },
  { href: "/main-events/",key: "nav_events" as const, icon: Star },
  { href: "/classes/",    key: "nav_classes"as const, icon: GraduationCap },
  { href: "/faq/",        key: "nav_faq"    as const, icon: MessageCircleQuestion },
];

const cubicBezier = "cubic-bezier(0.22, 1, 0.36, 1)";
const LOGO_HIDDEN_PATHS = new Set(["/", "/about/"]);

function pillIndicatorStyle(index: number): CSSProperties {
  // index 0→left:calc(0%+4px), 1→calc(20%+4px), 2→calc(40%+4px), 3→calc(60%+4px), 4→calc(80%+4px)
  return {
    left: `calc(${index * 20}% + 4px)`,
    top: 4,
    width: `calc(20% - 8px)`,
    height: 50,
  };
}

export default function Navbar({ hideSearch = false }: { hideSearch?: boolean }) {
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverIndicatorStyle, setHoverIndicatorStyle] = useState<CSSProperties>(
    {},
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuRendered, setMenuRendered] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; right: number } | null>(null);
  const [windowWidth, setWindowWidth] = useState(1400);
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNavLogo, setShowNavLogo] = useState(() => {
    if (typeof window !== "undefined") {
      const norm = window.location.pathname.replace(/\/$/, "") || "/";
      return !LOGO_HIDDEN_PATHS.has(norm);
    }
    return false;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const { locale, t } = useLocale();
  const links = NAV_LINK_DEFS.map(def => ({ ...def, label: t(def.key) }));
  const isMobile = windowWidth <= 968;

  useEffect(() => {
    const normalizedPath = currentPath.replace(/\/$/, "") || "/";
    if (!LOGO_HIDDEN_PATHS.has(normalizedPath)) {
      setShowNavLogo(true);
      return;
    }

    const checkScroll = () => {
      const bg = document.querySelector(".home-bg");
      if (bg) {
        setShowNavLogo(bg.scrollTop > 80);
      } else {
        setShowNavLogo(false); // Default to false if home-bg is loading
      }
    };

    // Check scroll position immediately
    checkScroll();

    // Secondary fallback in case container takes a frame to render
    const timer = setTimeout(checkScroll, 50);

    const bg = document.querySelector(".home-bg");
    if (bg) {
      bg.addEventListener("scroll", checkScroll, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      if (bg) {
        bg.removeEventListener("scroll", checkScroll);
      }
    };
  }, [currentPath]);

  useEffect(() => {
    const check = () => setWindowWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const THRESHOLD = 80;
    const checkBottom = () => {
      const bg = document.querySelector(".home-bg");
      if (bg) {
        // snap scroll container on home page
        setAtBottom(bg.scrollHeight - bg.scrollTop - bg.clientHeight < THRESHOLD);
      } else {
        // normal page scroll
        setAtBottom(
          document.documentElement.scrollHeight - window.scrollY - window.innerHeight < THRESHOLD
        );
      }
    };
    // Delay initial check so footer doesn't falsely trigger on page load
    const initTimer = setTimeout(checkBottom, 1500);
    const bg = document.querySelector(".home-bg");
    if (bg) {
      bg.addEventListener("scroll", checkBottom, { passive: true });
    } else {
      window.addEventListener("scroll", checkBottom, { passive: true });
    }
    return () => {
      clearTimeout(initTimer);
      if (bg) {
        bg.removeEventListener("scroll", checkBottom);
      } else {
        window.removeEventListener("scroll", checkBottom);
      }
    };
  }, [currentPath]);

  useEffect(() => {
    const check = () => {
      const cached = getCachedProfile();
      setUser(cached);
    };
    window.addEventListener("storage", check);
    window.addEventListener("leapify-auth-change", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("leapify-auth-change", check);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedProfile();
    if (cached) {
      setUser(cached);
      setUserLoading(false);
    }
    restoreSession().then((profile) => {
      if (cancelled) return;
      setUser(profile);
      setUserLoading(false);
    }).catch(() => { if (!cancelled) setUserLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setMounted(true); return; }
    requestAnimationFrame(() => {
      setMounted(true);
      void document.body.offsetHeight;
    });
  }, []);


  useEffect(() => {
    const check = () => setDrawerOpen(document.documentElement.getAttribute('data-drawer-open') === 'true');
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-drawer-open'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const onSwap = () => setCurrentPath(window.location.pathname);
    document.addEventListener("astro:after-swap", onSwap);
    return () => document.removeEventListener("astro:after-swap", onSwap);
  }, []);

  const normalizedPath = currentPath.replace(/\/$/, "") || "/";
  const activeIndex = links.findIndex((l) => {
    const norm = l.href.replace(/\/$/, "") || "/";
    return norm === normalizedPath;
  });

  const clamp = (min: number, val: number, max: number) =>
    Math.max(min, Math.min(val, max));
  const denom = 1400 - 769;
  const lerp = clamp(0, (windowWidth - 769) / denom, 1);
  const desktopFontSize = (0.8 + lerp * 0.2).toFixed(2);
  const desktopIconSize = Math.round(14 + lerp * 2);



  const indicatorStyle = pillIndicatorStyle(activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    if (hoveredIndex !== null) setHoverIndicatorStyle(pillIndicatorStyle(hoveredIndex));
  }, [hoveredIndex]);

  const glassStyle: CSSProperties = {
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(var(--blur, 0px))",
    WebkitBackdropFilter: "blur(var(--blur, 0px))",
    borderRadius: 9999,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease, transform 0.2s ease",
  };

  const pillContainer: CSSProperties = {
    position: "fixed",
    top: 24,
    left: 24,
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 24px",
    ...glassStyle,
  };

  const pillStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 58,
    padding: "0 2px",
    minWidth: 400,
    maxWidth: "min(680px, calc(100vw - 320px))", // leave room for right cluster
    width: "100%",
    ...glassStyle,
  };

  const linkStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: 500,
    textDecoration: "none",
    padding: "6px 0",
    borderRadius: 9999,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "none",
    border: "none",
    transition: "color 0.1s",
  };

  const profileMenuStyle: CSSProperties = {
    minWidth: 200,
    width: "max-content",
    maxWidth: 320,
    borderRadius: 16,
    padding: 8,
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(var(--blur, 0px))",
    WebkitBackdropFilter: "blur(var(--blur, 0px))",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    zIndex: 1000,
  };

  const menuItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.85)",
    cursor: "pointer",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    textDecoration: "none",
    transition: "background 0.15s, border-color 0.15s",
    width: "100%",
    boxSizing: "border-box" as const,
    textAlign: "left" as const,
  };

  const signOutStyle: CSSProperties = {
    ...menuItemStyle,
    background: "rgba(180,40,40,0.18)",
    border: "1px solid rgba(220,60,60,0.3)",
    color: "rgba(255,140,140,0.95)",
  };

  useEffect(() => {
    if (profileOpen) void document.body.offsetHeight;
  }, [profileOpen]);

  useLayoutEffect(() => {
    if (profileOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [profileOpen]);

  const toggleProfile = () => {
    if (profileOpen) {
      setMenuClosing(true);
      setProfileOpen(false);
      setTimeout(() => {
        setMenuRendered(false);
      }, 200);
    } else {
      setMenuClosing(false);
      setMenuRendered(true);
      setProfileOpen(true);
    }
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const isPopup = (e.target as HTMLElement).closest('.profile-popup');
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node) &&
        !isPopup
      ) {
        setMenuClosing(true);
        setProfileOpen(false);
        setTimeout(() => {
          setMenuRendered(false);
        }, 200);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  const indicatorBase: CSSProperties = {
    position: "absolute",
    borderRadius: 9999,
    pointerEvents: "none",
    transition: `left 0.15s ${cubicBezier}, top 0.15s ${cubicBezier}, width 0.15s ${cubicBezier}, height 0.15s ${cubicBezier}`,
  };

  const topPills = (
    <div className="nav-top-pills">
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-glass-pill {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease, transform 0.2s ease !important;
        }
        .nav-glass-pill:hover {
          border-color: rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
        }
      `}} />
      <div
        className="nav-glass-pill"
        style={{
          position: "fixed",
          top: isMobile ? 12 : 24,
          left: isMobile ? 12 : 24,
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 58,
          boxSizing: "border-box",
          padding: isMobile ? "0 16px" : "0 24px",
          ...glassStyle,
          opacity: (mounted && showNavLogo && (!isMobile || !atBottom)) ? 1 : 0,
          pointerEvents: (showNavLogo && (!isMobile || !atBottom)) ? "auto" : "none",
          transform: (mounted && showNavLogo && (!isMobile || !atBottom)) ? "translateY(0) scale(1)" : "translateY(-15px) scale(0.9)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        } as CSSProperties}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/favicon.png"
            alt="LEAP 2026"
            width={isMobile ? 48 : 72}
            style={{ height: "auto", display: "block" }}
          />
        </a>
      </div>

      <div
        className="nav-right-cluster"
        style={{
          position: "fixed",
          top: isMobile ? 12 : 24,
          right: isMobile ? 12 : 24,
          zIndex: 1001,
          display: "flex",
          gap: isMobile ? 8 : 12,
        }}
      >
        {!hideSearch && (
        <div
          className="nav-glass-pill"
          style={{
            ...pillContainer,
            position: "relative",
            top: "auto",
            left: "auto",
            width: 58,
            height: 58,
            padding: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.9)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255, 255, 255, 0.7)",
                  WebkitTapHighlightColor: "transparent",
                  width: "100%",
                  height: "100%",
                  borderRadius: 9999,
                }}
              >
                <Search size={isMobile ? 22 : 24} strokeWidth={1.75} />
          </button>
        </div>
        )}

        {/* Bookmark pill — always visible in nav */}
        {user && (
          <div
            className="nav-glass-pill"
            style={{
              ...pillContainer,
              position: "relative",
              top: "auto",
              left: "auto",
              width: 58,
              height: 58,
              padding: 0,
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
          >
            <button
              onClick={() => setSavedOpen(true)}
              aria-label={t('profile_saved')}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                WebkitTapHighlightColor: "transparent",
                width: "100%",
                height: "100%",
                borderRadius: 9999,
              }}
            >
              <Bookmark size={isMobile ? 22 : 24} strokeWidth={1.75} />
            </button>
          </div>
        )}

        <div
          ref={profileRef}
          className="nav-glass-pill"
          style={{
            ...pillContainer,
            position: "relative",
            top: "auto",
            left: "auto",
            width: 58,
            height: 58,
            padding: 0,
            opacity: mounted ? 1 : 0,
            marginTop: mounted ? 0 : -20,
            transition: "opacity 0.15s ease, margin-top 0.15s ease",
          }}
        >
          <button
            onClick={toggleProfile}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
              height: "100%",
              borderRadius: 9999,
              overflow: "hidden",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={String(user.name ?? "")}
                width={isMobile ? 38 : 46}
                height={isMobile ? 38 : 46}
                style={{
                  display: "block",
                  objectFit: "cover",
                  width: isMobile ? 38 : 46,
                  height: isMobile ? 38 : 46,
                  borderRadius: 9999,
                  flexShrink: 0,
                }}
              />
            ) : (
              user ? (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9999,
                  background: "rgba(255, 255, 255, 0.12)",
                }}>
                  <User
                    size={isMobile ? 32 : 38}
                    strokeWidth={1.5}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </div>
              ) : (
                <CircleUser
                  size={isMobile ? 38 : 46}
                  strokeWidth={1.5}
                  color="rgba(255, 255, 255, 0.7)"
                />
              )
            )}
          </button>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SavedClassesOverlay open={savedOpen} onClose={() => setSavedOpen(false)} />
      {menuRendered && popupPos && createPortal(
        <div 
          className={`profile-popup ${menuClosing ? 'closing' : ''}`}
          style={{
            ...profileMenuStyle,
            position: "fixed",
            top: popupPos.top,
            right: popupPos.right,
          }}
        >
          {user && (
            <div style={{
              padding: "10px 14px 8px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: 4,
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.95)",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user.name}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.5)",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {user.email}
              </div>
            </div>
          )}
          <a
            href="/access/"
            onClick={toggleProfile}
            style={menuItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <img
              src="/logo/access/access-logo.png"
              alt="ACCESS DLSU Logo"
              loading="eager"
              fetchPriority="high"
              style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }}
            />
            {t('profile_access')}
          </a>
          <button
            style={menuItemStyle}
            onClick={() => { toggleProfile(); window.dispatchEvent(new CustomEvent('leap:open-announcements')); }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <Bell size={18} strokeWidth={1.75} />
            {t('profile_announcements')}
          </button>
          <button
            style={menuItemStyle}
            onClick={() => { toggleProfile(); window.dispatchEvent(new CustomEvent('leap:open-changelog')); }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <Zap size={18} strokeWidth={1.75} />
            {t('profile_changelog')}
          </button>
          {/* Locale selector */}
          <div style={{
            padding: "8px 10px 6px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 6,
              paddingLeft: 4,
            }}>
              {t('language_label')}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {SUPPORTED_LOCALES.map(({ code, short, label }) => (
                <button
                  key={code}
                  title={label}
                  aria-pressed={locale === code}
                  onClick={() => setStoredLocale(code)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: `1px solid ${locale === code ? "rgba(250,225,133,0.5)" : "rgba(255,255,255,0.1)"}`,
                    background: locale === code ? "rgba(250,225,133,0.12)" : "transparent",
                    color: locale === code ? "rgba(250,225,133,0.95)" : "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: locale === code ? 700 : 500,
                    cursor: "pointer",
                    transition: "background 0.1s, color 0.1s, border-color 0.1s",
                    lineHeight: 1.4,
                  }}
                >
                  {short}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <>
              <div style={{
                height: "1px",
                background: "rgba(255, 255, 255, 0.06)",
                margin: "0 4px",
              }} />
              <button
                style={signOutStyle}
                onClick={() => { signOutUser(); toggleProfile(); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(200,40,40,0.32)";
                  e.currentTarget.style.borderColor = "rgba(220,60,60,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(180,40,40,0.18)";
                  e.currentTarget.style.borderColor = "rgba(220,60,60,0.3)";
                }}
              >
                <LogOut size={18} strokeWidth={1.75} />
                {t('profile_signout')}
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );

  const ib = indicatorBase;

  if (isMobile) {
    return (
      <>
        {topPills}

        <nav
          className="nav-bottom-bar"
          style={{
            position: "fixed",
            bottom: 12,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            padding: "0 12px",
            boxSizing: "border-box",
            width: "100%",
            willChange: "transform",
            contain: "layout style",
          }}
        >
          <div
            className="nav-glass-pill"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 58,
              width: "100%",
              padding: "0",
              borderRadius: 9999,
              overflow: "hidden",
              background: "rgba(0, 0, 0, 0.25)",
              backdropFilter: "blur(var(--blur, 0px))",
              WebkitBackdropFilter: "blur(var(--blur, 0px))",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              opacity: (mounted && !atBottom) ? 1 : 0,
              pointerEvents: (mounted && !atBottom) ? "auto" : "none",
              transform: (mounted && !atBottom) ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease, transform 0.2s ease",
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              style={{
                ...ib,
                ...indicatorStyle,
                background: "rgba(255, 255, 255, 0.08)",
              }}
            />
            <div
              style={{
                ...ib,
                ...hoverIndicatorStyle,
                background: "rgba(255, 255, 255, 0.05)",
                opacity:
                  hoveredIndex !== null && hoveredIndex !== activeIndex ? 1 : 0,
                transition: `opacity 0.1s, left 0.1s ease, top 0.1s ease, width 0.1s ease, height 0.1s ease`,
              }}
            />

            {links.map((link, i) => {
              const normHref = link.href.replace(/\/$/, "") || "/";
              const isActive = normHref === normalizedPath;
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={(e) => { if (isActive) e.preventDefault(); }}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    padding: "6px 4px",
                    borderRadius: 9999,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    WebkitTapHighlightColor: "transparent",
                    color: isActive
                      ? "rgba(255, 255, 255, 0.95)"
                      : hoveredIndex === i
                        ? "rgba(255, 255, 255, 0.85)"
                        : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      {drawerOpen ? null : topPills}

      <nav
        className="nav-desktop"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: drawerOpen ? "none" : "flex",
          justifyContent: "center",
          padding: "24px 24px",
        }}
      >
        <div 
          className="nav-glass-pill"
          style={{ 
            ...pillStyle, 
            opacity: mounted ? 1 : 0, 
            transform: mounted ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s" 
          }} 
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            style={{
              ...indicatorBase,
              ...indicatorStyle,
              background: "rgba(255, 255, 255, 0.08)",
            }}
          />
          <div
            style={{
              ...indicatorBase,
              ...hoverIndicatorStyle,
              background: "rgba(255, 255, 255, 0.05)",
              opacity:
                hoveredIndex !== null && hoveredIndex !== activeIndex ? 1 : 0,
              transition: `opacity 0.1s, left 0.1s ease, top 0.1s ease, width 0.1s ease, height 0.1s ease`,
            }}
          />

          {links.map((link, i) => {
            const normHref = link.href.replace(/\/$/, "") || "/";
            const isActive = normHref === normalizedPath;
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={(e) => { if (isActive) e.preventDefault(); }}
                style={{
                  ...linkStyle,
                  flex: 1,
                  minWidth: 0,
                  flexDirection: "column",
                  gap: "3px",
                  fontSize: "0.65rem",
                  color: isActive
                    ? "rgba(255, 255, 255, 0.95)"
                    : hoveredIndex === i
                      ? "rgba(255, 255, 255, 0.85)"
                      : "rgba(255, 255, 255, 0.6)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <Icon size={desktopIconSize} strokeWidth={1.75} />
                {link.label}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
