// fallow-ignore-file unused-file
import { useOptimizedScrollProgress } from '../../hooks';

/**
 * Scroll progress bar shown at top of page
 */
export const ScrollProgress = () => {
  const progress = useOptimizedScrollProgress();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'rgba(222,154,73,0.12)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg,#803e2f,#de9a49,#803e2f)',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(222,154,73,0.8)',
        }}
      />
    </div>
  );
};
