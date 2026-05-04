import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized lazy-loading image component
 * - Loads image only when visible in viewport
 * - Supports blur-up effect with placeholder
 * - Reduces initial bundle and improves performance
 */
export const LazyImage = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
  className,
  style,
  onLoad,
  onError,
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Load the actual image
          const img = new Image();

          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            onLoad?.();
          };

          img.onerror = () => {
            onError?.();
          };

          img.src = src;
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease-in-out',
      }}
      loading="lazy"
    />
  );
};

/**
 * Responsive image with srcset support
 */
interface ResponsiveImageProps extends LazyImageProps {
  srcSet?: string;
  sizes?: string;
}

export const ResponsiveImage = ({
  srcSet,
  sizes,
  ...props
}: ResponsiveImageProps) => {
  const [imageSrc, setImageSrc] = useState(props.placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();

          img.onload = () => {
            setImageSrc(props.src);
            setIsLoaded(true);
            props.onLoad?.();
          };

          img.onerror = () => {
            props.onError?.();
          };

          if (srcSet) {
            img.srcset = srcSet;
          }

          img.src = props.src;
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [props.src, srcSet, props]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={props.alt}
      className={props.className}
      style={{
        ...props.style,
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease-in-out',
      }}
      loading="lazy"
    />
  );
};

