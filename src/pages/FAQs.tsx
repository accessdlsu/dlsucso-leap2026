import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronRight, Mail } from 'lucide-react';
import { useFaqs } from '../hooks';
import { PageWrapper, PageHero } from '../components/PageCommon';

export default function FAQs() {
  const [open, setOpen] = useState<number | null>(null);
  const { data: faqs, loading } = useFaqs();

  if (loading) {
    return (
      <PageWrapper>
        <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know before you register" accent="LEAP 2026 · Help Center" />
        <main className="container mx-auto px-4 pb-24 max-w-3xl">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
            <div className="leap-spinner" />
          </div>
        </main>
      </PageWrapper>
    );
  }

  const displayFaqs = faqs.map(f => ({ q: f.question, a: f.answer }));

  return (
    <PageWrapper>
      <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know before you register" accent="LEAP 2026 · Help Center" />
      <main className="container mx-auto px-4 pb-24 max-w-3xl">
        <div className="faq-list">
          {displayFaqs.map((faq, i) => {
            const answerId = `faq-answer-${i}`;
            const buttonId = `faq-question-${i}`;
            return (
              <m.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`faq-item ${open === i ? 'faq-open' : ''}`}>
                <button
                  id={buttonId}
                  className="faq-question"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={answerId}
                >
                  <span>{faq.q}</span>
                  <div className={`faq-chevron ${open === i ? 'faq-chevron-open' : ''}`}>
                    <ChevronRight size={18} />
                  </div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <m.div
                      id={answerId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
                      <p className="faq-answer">{faq.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>
        <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="faq-cta-card">
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 700, color: '#334b46', marginBottom: '0.5rem' }}>Still have questions?</p>
          <p style={{ color: 'rgba(51,75,70,0.7)', marginBottom: '1.5rem' }}>Our team is always happy to help. Drop us a message.</p>
          <a href="mailto:leap@dlsu.edu.ph" className="btn-leap-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <Mail size={16} /> Contact the Team
          </a>
        </m.div>
      </main>
    </PageWrapper>
  );
}
