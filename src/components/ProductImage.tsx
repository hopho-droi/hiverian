import React, { useEffect, useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Charge en priorité haute (utile dans la fiche produit ouverte) */
  priority?: boolean;
}

/**
 * Rendu résilient des visuels produits avec `referrerPolicy="no-referrer"`,
 * décodage asynchrone et visuel de secours vert sapin & or champagne si vide ou indisponible.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showFallback = !src || !src.trim() || hasError;

  if (showFallback) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#071E18] via-[#0B2B22] to-[#123D31] p-6 text-center ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 border border-[#E5B85B]/30"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          className="h-10 w-10 text-[#E5B85B]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M32 8L37 22H52L40 31L44.5 46L32 37L19.5 46L24 31L12 22H27L32 8Z" />
          <circle cx="32" cy="30" r="3" fill="currentColor" />
        </svg>
        <p className="mt-3 font-serif text-sm text-[#FFF9F0]">Maison Hiveria</p>
        <p className="mt-1 max-w-[200px] truncate text-[11px] text-[#D4CFC4]">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setHasError(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
};
