/**
 * Skeleton loading components — visual placeholders that match
 * the shape of real content. Shown while data is fetching.
 */

/** Single class card skeleton — matches .gallery-card aspect ratio */
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-card-img" />
      <div className="skeleton skeleton-card-badge" />
      <div className="skeleton skeleton-card-logo" />
      <div className="skeleton-card-body">
        <div className="skeleton skeleton-card-tag" />
        <div className="skeleton skeleton-card-title" />
        <div className="skeleton skeleton-card-info" />
        <div className="skeleton-card-footer">
          <div className="skeleton skeleton-card-badge-sm" />
          <div className="skeleton skeleton-card-btn" />
        </div>
      </div>
    </div>
  );
}

/** Grid of skeleton cards — used in classes page while events load */
export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="classes-grid" aria-label="Loading classes" role="status">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Carousel row of skeleton cards — used in home/featured while events load */
export function SkeletonCarousel({ count = 4 }: { count?: number }) {
  return (
    <div
      className="gallery-track"
      aria-label="Loading events"
      role="status"
      style={{ display: 'flex', gap: '1rem', overflow: 'hidden' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Generic content skeleton — text blocks for pages */
export function SkeletonContent({ lines = 4 }: { lines?: number }) {
  return (
    <div className="skeleton-paragraph" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton skeleton-line"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}

/** Section skeleton — heading + content block */
export function SkeletonSection({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto' }} aria-hidden="true">
      <div className="skeleton skeleton-heading" />
      <SkeletonContent lines={lines} />
    </div>
  );
}
