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
} from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/about", label: "Overview", icon: BookOpen },
  { href: "/events", label: "Featured", icon: Star },
  { href: "/classes", label: "Classes", icon: GraduationCap },
  { href: "/faq", label: "FAQs", icon: MessageCircleQuestion },
];

const cubicBezier = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function Navbar() {
  const [currentPath, setCurrentPath] = useState("/");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});
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
      return window.location.pathname !== "/";
    }
    return false;
  });
  const isMobile = windowWidth <= 968;

  useEffect(() => {
    if (currentPath !== "/") {
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

  const activeIndex = links.findIndex((l) => l.href === currentPath);

  const clamp = (min: number, val: number, max: number) =>
    Math.max(min, Math.min(val, max));
  const denom = 1400 - 769;
  const t = clamp(0, (windowWidth - 769) / denom, 1);
  const desktopFontSize = (0.8 + t * 0.2).toFixed(2);
  const desktopIconSize = Math.round(14 + t * 2);



  const getIndicatorStyle = useCallback((index: number) => {
    const targetHeight = 50; // Centered height (58 - 8)
    const targetTop = 4;
    
    // Stretch to the full width allocated for the item (20%) minus a small inset margin (4px on each side)
    const targetLeft = `calc(${index * 20}% + 4px)`;
    const targetWidth = `calc(20% - 8px)`;
    
    return {
      left: targetLeft,
      top: targetTop,
      width: targetWidth,
      height: targetHeight,
    } as CSSProperties;
  }, []);

  useEffect(() => {
    setIndicatorStyle(getIndicatorStyle(activeIndex));
  }, [activeIndex, getIndicatorStyle]);

  useEffect(() => {
    if (hoveredIndex !== null) {
      setHoverIndicatorStyle(getIndicatorStyle(hoveredIndex));
    }
  }, [hoveredIndex, getIndicatorStyle]);

  const glassStyle: CSSProperties = {
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 9999,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
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
    width: "100%",
    maxWidth: 680,
    ...glassStyle,
  };

  const linkStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: 500,
    textDecoration: "none",
    padding: "17px 0",
    borderRadius: 9999,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "none",
    border: "none",
    transition: "color 0.25s",
  };

  const profileMenuStyle: CSSProperties = {
    minWidth: 200,
    borderRadius: 16,
    padding: 6,
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    zIndex: 1000,
  };

  const menuItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.85)",
    cursor: "pointer",
    background: "none",
    border: "none",
    textDecoration: "none",
    transition: "background 0.15s",
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
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
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
    <>
      <div style={{
        position: "fixed",
        top: isMobile ? 12 : 24,
        left: isMobile ? 12 : 24,
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "9px 16px" : "9px 24px",
        ...glassStyle,
        opacity: (mounted && showNavLogo) ? 1 : 0,
        pointerEvents: showNavLogo ? "auto" : "none",
        transform: (mounted && showNavLogo) ? "translateY(0) scale(1)" : "translateY(-15px) scale(0.9)",
        transition: "opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      } as CSSProperties}>
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
        style={{
          position: "fixed",
          top: isMobile ? 12 : 24,
          right: isMobile ? 12 : 24,
          zIndex: 1001,
          display: "flex",
          gap: isMobile ? 8 : 12,
        }}
      >
        <div
          style={{
            ...pillContainer,
            position: "relative",
            top: "auto",
            left: "auto",
            width: isMobile ? 44 : 58,
            height: isMobile ? 44 : 58,
            padding: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.9)",
            transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s",
          }}
        >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255, 255, 255, 0.7)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Search size={isMobile ? 18 : 24} strokeWidth={1.75} />
          </button>
        </div>

        <div
          ref={profileRef}
          style={{
            ...pillContainer,
            position: "relative",
            top: "auto",
            left: "auto",
            width: isMobile ? 44 : 58,
            height: isMobile ? 44 : 58,
            padding: 0,
            opacity: mounted ? 1 : 0,
            marginTop: mounted ? 0 : -20,
            transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, margin-top 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
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
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <CircleUser
              size={isMobile ? 28 : 40}
              strokeWidth={1.5}
              color="rgba(255, 255, 255, 0.7)"
            />
          </button>
        </div>
      </div>

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
          <a
            href="/saved"
            style={menuItemStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <Bookmark size={18} strokeWidth={1.75} />
            Saved Classes
          </a>
          <button
            style={menuItemStyle}
            onClick={() => {}}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <LogOut size={18} strokeWidth={1.75} />
            Signout
          </button>
        </div>,
        document.body
      )}
    </>
  );

  const ib = indicatorBase;

  if (isMobile) {
    return (
      <>
        {topPills}

        <nav
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
          }}
        >
          <div
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
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
              transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
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
                transition: `opacity 0.2s, left 0.15s ${cubicBezier}, top 0.15s ${cubicBezier}, width 0.15s ${cubicBezier}, height 0.15s ${cubicBezier}`,
              }}
            />

            {links.map((link, i) => {
              const isActive = link.href === currentPath;
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(i)}
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
          style={{ 
            ...pillStyle, 
            opacity: mounted ? 1 : 0, 
            transform: mounted ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)",
            transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s" 
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
              transition: `opacity 0.2s, left 0.3s ${cubicBezier}, top 0.3s ${cubicBezier}, width 0.3s ${cubicBezier}, height 0.3s ${cubicBezier}`,
            }}
          />

          {links.map((link, i) => {
            const isActive = link.href === currentPath;
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(i)}
                style={{
                  ...linkStyle,
                  flex: 1,
                  fontSize: `${desktopFontSize}rem`,
                  gap: "6px",
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
