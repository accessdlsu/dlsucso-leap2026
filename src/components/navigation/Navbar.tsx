import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
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
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});
  const [hoverIndicatorStyle, setHoverIndicatorStyle] = useState<CSSProperties>(
    {},
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(1400);
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    const check = () => setWindowWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
  const desktopLinkPadH = Math.round(10 + t * 10);
  const desktopFontSize = (0.8 + t * 0.2).toFixed(2);
  const desktopIconSize = Math.round(14 + t * 2);

  const positionIndicator = useCallback((index: number) => {
    const el = linkRefs.current[index];
    if (!el) return;
    return {
      left: el.offsetLeft + 4,
      top: el.offsetTop + 4,
      width: el.offsetWidth - 8,
      height: el.offsetHeight - 8,
    };
  }, []);

  const mobilePositionIndicator = useCallback((index: number) => {
    const el = linkRefs.current[index];
    if (!el) return;
    return {
      left: el.offsetLeft + 6,
      top: el.offsetTop,
      width: el.offsetWidth - 12,
      height: el.offsetHeight,
    };
  }, []);

  useEffect(() => {
    const pos = (isMobile ? mobilePositionIndicator : positionIndicator)(activeIndex);
    if (pos) setIndicatorStyle(pos);
  }, [activeIndex, positionIndicator, mobilePositionIndicator, isMobile, windowWidth]);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const pos = (isMobile ? mobilePositionIndicator : positionIndicator)(hoveredIndex);
      if (pos) setHoverIndicatorStyle(pos);
    }
  }, [hoveredIndex, positionIndicator, mobilePositionIndicator, isMobile, windowWidth]);

  const pillContainer: CSSProperties = {
    position: "fixed",
    top: 24,
    left: 24,
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 24px",
    borderRadius: 9999,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  };

  const pillStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 58,
    padding: "0 2px",
    borderRadius: 9999,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  };

  const linkStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: 500,
    textDecoration: "none",
    padding: "17px 32px",
    borderRadius: 9999,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    background: "none",
    border: "none",
    transition: "color 0.25s",
  };

  const profileMenuStyle: CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: 200,
    borderRadius: 16,
    padding: 6,
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
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
    color: "rgba(0, 0, 0, 0.75)",
    cursor: "pointer",
    background: "none",
    border: "none",
    textDecoration: "none",
    transition: "background 0.15s",
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
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

  const mobileIndicatorBase: CSSProperties = {
    position: "absolute",
    borderRadius: 9999,
    pointerEvents: "none",
    transition: `left 0.15s ${cubicBezier}, top 0.15s ${cubicBezier}, width 0.15s ${cubicBezier}, height 0.15s ${cubicBezier}`,
  };

  const topPills = (
    <>
      <div style={{
        ...pillContainer,
        top: isMobile ? 12 : 24,
        left: isMobile ? 12 : 24,
        padding: isMobile ? "9px 16px" : "9px 24px",
      }}>
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
                  color: "rgba(0, 0, 0, 0.6)",
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
          }}
        >
          <button
            onClick={() => setProfileOpen((v) => !v)}
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
              color="rgba(0, 0, 0, 0.6)"
            />
          </button>

          {profileOpen && (
            <div style={profileMenuStyle}>
              <a
                href="/saved"
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(0, 0, 0, 0.06)")
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
                  (e.currentTarget.style.background = "rgba(0, 0, 0, 0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <LogOut size={18} strokeWidth={1.75} />
                Signout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const ib = isMobile ? mobileIndicatorBase : indicatorBase;

  if (isMobile) {
    return (
      <>
        {topPills}

        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            padding: "8px 4px",
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
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              style={{
                ...ib,
                ...indicatorStyle,
                background: "rgba(0, 0, 0, 0.08)",
              }}
            />
            <div
              style={{
                ...ib,
                ...hoverIndicatorStyle,
                background: "rgba(0, 0, 0, 0.05)",
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
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
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
                    padding: "6px 8px",
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
                      ? "rgba(0, 0, 0, 0.95)"
                      : hoveredIndex === i
                        ? "rgba(0, 0, 0, 0.9)"
                        : "rgba(0, 0, 0, 0.6)",
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
      {topPills}

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          padding: "24px 24px",
        }}
      >
        <div style={pillStyle} onMouseLeave={() => setHoveredIndex(null)}>
          <div
            style={{
              ...indicatorBase,
              ...indicatorStyle,
              background: "rgba(0, 0, 0, 0.08)",
            }}
          />
          <div
            style={{
              ...indicatorBase,
              ...hoverIndicatorStyle,
              background: "rgba(0, 0, 0, 0.05)",
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
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                style={{
                  ...linkStyle,
                  padding: `17px ${desktopLinkPadH}px`,
                  fontSize: `${desktopFontSize}rem`,
                  gap: "6px",
                  color: isActive
                    ? "rgba(0, 0, 0, 0.95)"
                    : hoveredIndex === i
                      ? "rgba(0, 0, 0, 0.9)"
                      : "rgba(0, 0, 0, 0.6)",
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
