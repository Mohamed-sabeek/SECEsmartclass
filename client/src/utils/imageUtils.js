import defaultAvatar from '../assets/default-avatar.webp';

/**
 * Optimizes a Cloudinary image URL for fast, lightweight delivery
 * and falls back to a default avatar if empty.
 * 
 * @param {string} avatarUrl - The raw avatar URL
 * @returns {string} The optimized image source URL
 */
export const getOptimizedAvatar = (avatarUrl) => {
  if (!avatarUrl) return defaultAvatar;
  
  if (avatarUrl.includes('/upload/')) {
    const optimized = avatarUrl.replace(
      '/upload/',
      '/upload/w_200,h_200,c_fill,q_auto,f_auto/'
    );
    return optimized;
  }
  
  return avatarUrl;
};
