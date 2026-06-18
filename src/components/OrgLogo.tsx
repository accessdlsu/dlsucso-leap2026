interface OrgLogoProps {
  logoUrl: string | null;
  acronym: string;
  /** Size in pixels (default 24) */
  size?: number;
}

export default function OrgLogo({ logoUrl, acronym, size = 24 }: OrgLogoProps) {
  if (!logoUrl) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          fontSize: `${Math.max(size * 0.23, 7)}px`,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          flexShrink: 0,
        }}
      >
        {acronym.slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={acronym}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
      }}
      loading="lazy"
    />
  );
}
