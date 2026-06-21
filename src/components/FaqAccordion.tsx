import { useState, useEffect, useCallback, memo, type CSSProperties } from "react";
import { useLocale } from "../hooks/useLocale";
import { ChevronDown, HelpCircle } from "lucide-react";
import { leapifyApi } from "../services/leapify";
import type { Faq } from "leapify/types";

const glassCard: CSSProperties = {
  background: "rgba(0, 0, 0, 0.25)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 16,
  border: "1px solid rgba(255, 255, 255, 0.06)",
  overflow: "hidden",
};

interface FaqItemProps {
  faq: Faq;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

const FaqItem = memo(function FaqItem({ faq, isOpen, onToggle }: FaqItemProps) {
  return (
    <div
      style={{
        ...glassCard,
        boxShadow: isOpen
          ? "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(250,225,133,0.08)"
          : "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <button
        onClick={() => onToggle(faq.id)}
        aria-expanded={isOpen}
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
          color: isOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
          textAlign: "left",
          lineHeight: 1.4,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <HelpCircle
          size={18}
          strokeWidth={1.75}
          style={{
            flexShrink: 0,
            color: isOpen ? "rgba(250,225,133,0.9)" : "rgba(255,255,255,0.3)",
          }}
        />
        <span style={{ flex: 1 }}>{faq.question}</span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            color: "rgba(255,255,255,0.3)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.1s ease",
          }}
        />
      </button>

      {isOpen && (
        <div style={{
          padding: "0 18px 16px",
          paddingTop: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.85rem",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.6)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {faq.answer}
        </div>
      )}
    </div>
  );
});

export default function FaqAccordion() {
  const { t } = useLocale();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    leapifyApi.getFaqs()
      .then((data) => { if (!cancelled) { setFaqs(data ?? []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : "Failed to load FAQs"); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }} role="status" aria-label="Loading FAQs">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: 14, marginBottom: 10, opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
        <p style={{ margin: "0 0 0.5rem", color: "rgba(255,100,100,0.7)" }}>{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); leapifyApi.getFaqs().then(setFaqs).catch((e) => { setError(e instanceof Error ? e.message : "Error"); setLoading(false); }); }}
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, padding: "0.5rem 1.25rem", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>
        {t('no_faqs')}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 10 }}>
      {faqs.map((faq) => (
        <FaqItem key={faq.id} faq={faq} isOpen={openId === faq.id} onToggle={toggle} />
      ))}
    </div>
  );
}
