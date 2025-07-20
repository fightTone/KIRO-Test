import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type: 'text' | 'title' | 'avatar' | 'thumbnail' | 'card' | 'list';
  count?: number;
  width?: string;
  height?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  count = 1,
  width,
  height,
  className = '',
}) => {
  const getSkeletonStyle = () => {
    const style: React.CSSProperties = {};
    
    if (width) style.width = width;
    if (height) style.height = height;
    
    return style;
  };

  const renderSkeleton = () => {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      skeletons.push(
        <div 
          key={i}
          className={`skeleton-item skeleton-${type} ${className}`}
          style={getSkeletonStyle()}
          aria-hidden="true"
        />
      );
    }
    
    return skeletons;
  };

  return <div className="skeleton-wrapper">{renderSkeleton()}</div>;
};

export default LoadingSkeleton;