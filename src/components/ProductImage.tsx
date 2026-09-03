import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { checkImageCached, markImageLoaded } from '@/lib/imageUtils';

interface ProductImageProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductImage({ images, alt, className = '' }: ProductImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setLoading(true);
    setFailed(false);
  }, [images]);

  const currentUrl = images[currentIndex];

  useEffect(() => {
    if (!currentUrl) {
      setFailed(true);
      setLoading(false);
      return;
    }

    const cached = checkImageCached(currentUrl);
    if (cached === true) {
      setLoading(false);
      setFailed(false);
      return;
    }
    if (cached === false) {
      tryNextImage();
      return;
    }

    setLoading(true);
    const img = new Image();
    const timeout = setTimeout(() => {
      markImageLoaded(currentUrl, false);
      tryNextImage();
    }, 8000);

    img.onload = () => {
      clearTimeout(timeout);
      markImageLoaded(currentUrl, true);
      setLoading(false);
      setFailed(false);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      markImageLoaded(currentUrl, false);
      tryNextImage();
    };

    img.src = currentUrl;

    return () => {
      clearTimeout(timeout);
    };
  }, [currentUrl]);

  function tryNextImage() {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setLoading(false);
      setFailed(true);
    }
  }

  if (loading) {
    return (
      <div className={`relative bg-stone-100 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-stone-300" />
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className={`relative bg-stone-50 border border-stone-200 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8 text-stone-300" />
          <span className="text-xs text-stone-400">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-stone-50 ${className}`}>
      <img
        src={currentUrl}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
