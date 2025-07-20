import React, { useState, useEffect } from 'react';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  placeholderSrc?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderSrc,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || '');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Create new image object to preload the image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      // Keep placeholder if loading fails
    };
    
    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div 
      className={`lazy-image-container ${!imageLoaded ? 'loading' : ''}`}
      style={{ width, height }}
    >
      {!imageLoaded && !placeholderSrc && (
        <div className="lazy-image-placeholder" />
      )}
      <img
        src={imageSrc || placeholderSrc}
        alt={alt}
        className={`lazy-image ${className} ${imageLoaded ? 'loaded' : ''}`}
        width={width}
        height={height}
        loading="lazy"
      />
    </div>
  );
};

export default LazyImage;