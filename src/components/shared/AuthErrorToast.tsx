import { m, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface AuthErrorToastProps {
  message: string | null;
  onDismiss?: () => void;
}

export const AuthErrorToast = ({ message, onDismiss }: AuthErrorToastProps) => (
  <AnimatePresence>
    {message && (
      <m.div
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
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{ background: 'transparent', border: 'none', color: '#fae185', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: '0.5rem' }}
          >
            <X size={16} />
          </button>
        )}
      </m.div>
    )}
  </AnimatePresence>
);
