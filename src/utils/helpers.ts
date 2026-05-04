/**
 * Utility helper functions for common tasks
 */

/**
 * Scroll to element with offset
 */
export function scrollToElement(elementId: string, offset = 104): void {
  const element = document.getElementById(elementId);
  if (!element) return;
  const position = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: position, behavior: 'smooth' });
}

/**
 * Scroll to top of page
 */
export function scrollToTop(behavior: 'smooth' | 'auto' = 'smooth'): void {
  window.scrollTo({ top: 0, behavior });
}

/**
 * Manage body overflow when modal/overlay is open
 */
export function setBodyOverflow(hidden: boolean): void {
  if (hidden) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time string
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get class names conditionally
 */
export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter((c) => typeof c === 'string').join(' ');
}

/**
 * Check if value is mobile screen width
 */
export function isMobileScreen(width: number): boolean {
  return width < 768;
}

/**
 * Extract image URL from Contentful asset
 */
export function extractImageUrl(asset: any): string {
  if (!asset || !asset.fields || !asset.fields.file) {
    return 'https://placehold.co/420x260?text=No+Image';
  }

  const url = asset.fields.file.url;
  if (url.startsWith('http')) return url;
  return `https:${url}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Sleep for async/await
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get random item from array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}
