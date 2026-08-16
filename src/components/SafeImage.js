'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const DEFAULT_FALLBACK = '/saree_kanjivaram.png';

/**
 * SafeImage - Resilient image wrapper with automatic fallback handling.
 * Prevents broken image icons or blank boxes when an image URL fails to load.
 */
export default function SafeImage({
  src,
  alt = 'Saree Image',
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  style = {},
  priority = false,
  fill = false,
  width,
  height,
  sizes,
  unoptimized = true,
  onClick,
  ...rest
}) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    // Check if the URL points to the known dead domain or is empty
    if (!src || (typeof src === 'string' && src.includes('eilxtuedgtimrxfvqojv'))) {
      setError(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setError(false);
      setCurrentSrc(src);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt}
      onError={handleError}
      className={className}
      style={style}
      onClick={onClick}
      loading={priority ? 'eager' : 'lazy'}
      {...rest}
    />
  );
}
