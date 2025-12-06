import React, { useState } from 'react';

function ImageGallery({ images, currentIndex = 0, onClose }) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const handlePrevious = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div className="image-gallery-overlay" onClick={onClose}>
      <div className="image-gallery-container" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-close-btn" onClick={onClose} aria-label="Close gallery">
          <i className="fas fa-times"></i>
        </button>
        
        <button 
          className="gallery-nav-btn gallery-prev" 
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="gallery-main-image">
          <img src={images[activeIndex]} alt={`Image ${activeIndex + 1}`} />
          <div className="gallery-counter">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
        
        <button 
          className="gallery-nav-btn gallery-next" 
          onClick={handleNext}
          aria-label="Next image"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        
        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={index === activeIndex ? 'active' : ''}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGallery;

