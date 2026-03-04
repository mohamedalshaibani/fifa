"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSeed?: string;
  className?: string;
}

export default function SafeImage({ src, alt, fallbackSeed, className }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSeed) {
      setHasError(true);
      setImgSrc(`https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
