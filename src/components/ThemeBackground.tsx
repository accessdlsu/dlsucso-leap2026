import { memo } from 'react';

interface ThemeBackgroundProps {
  selectedSubtheme: string | null;
}

export const ThemeBackground = memo((_props: ThemeBackgroundProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 12% 20%, rgba(22,164,96,0.04) 0%, transparent 55%),
          radial-gradient(ellipse 50% 30% at 90% 80%, rgba(191,110,25,0.06) 0%, transparent 50%),
          linear-gradient(180deg, #fffdf6 0%, #fdf7e8 30%, #f8efcf 65%, #f0e0b0 100%)
        `,
      }}
    />
  );
});
