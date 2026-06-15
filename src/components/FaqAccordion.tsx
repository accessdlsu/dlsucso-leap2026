import { useState, useEffect, type CSSProperties } from "react";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { leapifyApi } from "../services/leapify";
import type { Faq } from "leapify/types";

const cubicBezier = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function FaqAccordion() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    leapifyApi
      .getFaqs()
      .then((data) => {
        if (!cancelled) {
          setFaqs(data ?? []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load FAQs");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const glassCard: CSSProperties = {
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
    transition: `box-shadow 0.25s ${cubicBezier}`,
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "3rem 0",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.9rem",
        color: "rgba(255, 255, 255, 0.5)",
      }}>
        <Loader2 size={20} strokeWidth={1.75} style={{ animation: "faqSpin 0.8s linear infinite" }} />
        Loading FAQs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: "center",
        padding: "3rem 0",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.9rem",
        color: "rgba(255, 255, 255, 0.5)",
      }}>
        <p style={{ margin: "0 0 0.5rem", color: "rgba(255, 100, 100, 0.7)" }}>{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); leapifyApi.getFaqs().then(setFaqs).catch((e) => { setError(e.message); setLoading(false); }); }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "0.5rem 1.25rem",
            borderRadius: 9999,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.06)",
            color: "rgba(255, 255, 255, 0.7)",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "3rem 0",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.9rem",
        color: "rgba(255, 255, 255, 0.4)",
      }}>
        No FAQs available yet.
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: 720,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {faqs.map((faq, i) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            style={{
              ...glassCard,
              boxShadow: isOpen
                ? "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(250, 225, 133, 0.08)"
                : "0 4px 16px rgba(0, 0, 0, 0.12)",
            }}
          >
            <button
              onClick={() => toggle(faq.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "16px 18px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: isOpen
                  ? "rgba(255, 255, 255, 0.95)"
                  : "rgba(255, 255, 255, 0.75)",
                textAlign: "left",
                lineHeight: 1.4,
                WebkitTapHighlightColor: "transparent",
                transition: `color 0.2s ${cubicBezier}`,
              }}
            >
              <HelpCircle
                size={18}
                strokeWidth={1.75}
                style={{
                  flexShrink: 0,
                  color: isOpen
                    ? "rgba(250, 225, 133, 0.9)"
                    : "rgba(255, 255, 255, 0.3)",
                  transition: `color 0.2s ${cubicBezier}`,
                }}
              />
              <span style={{ flex: 1 }}>{faq.question}</span>
              <ChevronDown
                size={18}
                strokeWidth={2}
                style={{
                  flexShrink: 0,
                  color: "rgba(255, 255, 255, 0.3)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: `transform 0.25s ${cubicBezier}`,
                }}
              />
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: `grid-template-rows 0.3s ${cubicBezier}`,
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  padding: isOpen ? "0 18px 16px" : "0 18px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  lineHeight: 1.65,
                  color: "rgba(255, 255, 255, 0.6)",
                  borderTop: `1px solid rgba(255, 255, 255, ${isOpen ? 0.06 : 0})`,
                  paddingTop: isOpen ? 14 : 0,
                  transition: `padding 0.25s ${cubicBezier}, border-color 0.25s ${cubicBezier}`,
                }}>
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
