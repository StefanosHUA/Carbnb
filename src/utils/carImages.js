/**
 * Utility functions for extracting and handling car images from various formats
 */

/**
 * Get the primary image URL from a car object
 * Priority: primary_image_url > primary media > first media > car.image > placeholder
 */
export const getPrimaryCarImage = (car) => {
  if (!car) return null;

  // 1. Check if primary_image_url is directly available
  if (car.primary_image_url) {
    return car.primary_image_url;
  }

  // 2. Check media array for primary image
  if (car.media && Array.isArray(car.media) && car.media.length > 0) {
    // Find primary image first
    const primaryMedia = car.media.find(m => m.is_primary && (m.media_type === 'image' || m.media_type === 'IMAGE'));
    if (primaryMedia && (primaryMedia.media_url || primaryMedia.url)) {
      return primaryMedia.media_url || primaryMedia.url;
    }
    // If no primary, use first image
    const firstImage = car.media.find(m => m.media_type === 'image' || m.media_type === 'IMAGE');
    if (firstImage && (firstImage.media_url || firstImage.url)) {
      return firstImage.media_url || firstImage.url;
    }
  }

  // 3. Check if images array exists and has items
  if (car.images && Array.isArray(car.images) && car.images.length > 0) {
    return car.images[0];
  }

  // 4. Fallback to car.image
  if (car.image) {
    return car.image;
  }

  // 5. Return placeholder
  return 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80';
};

/**
 * Get all car images from a car object
 * Priority: media array > images array > car.image > placeholder
 */
export const getAllCarImages = (car) => {
  if (!car) return [];

  const images = [];

  // 1. Check media array (prioritize primary, then all images)
  if (car.media && Array.isArray(car.media) && car.media.length > 0) {
    // Filter only image media
    const imageMedia = car.media.filter(m => m.media_type === 'image' || m.media_type === 'IMAGE');
    
    // Sort: primary first, then by uploaded_at or id
    imageMedia.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.id || 0) - (b.id || 0);
    });

    // Extract URLs
    imageMedia.forEach(m => {
      const url = m.media_url || m.url || m.image;
      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  }

  // 2. If no media, check images array
  if (images.length === 0 && car.images && Array.isArray(car.images) && car.images.length > 0) {
    car.images.forEach(img => {
      if (img && !images.includes(img)) {
        images.push(img);
      }
    });
  }

  // 3. Fallback to car.image
  if (images.length === 0 && car.image) {
    images.push(car.image);
  }

  // 4. If still no images, use placeholder
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80');
  }

  return images;
};

