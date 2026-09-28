/**
 * Cloudinary & News Image Optimization Helper
 * Automatically normalizes relative Cloudinary public IDs, local paths, or CDN links.
 */
export function getOptimizedImageUrl(img: string | null | undefined): string {
  if (!img) return '/placeholder-news.jpg'

  // Already a complete HTTP/HTTPS URL
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'da0r9kmia'

  // If path already starts with image/upload or blog/
  if (img.startsWith('image/upload/') || img.startsWith('blog/')) {
    return `https://res.cloudinary.com/${cloudName}/${img}`
  }

  // Fallback: prepend standard Cloudinary image path
  return `https://res.cloudinary.com/${cloudName}/image/upload/${img}`
}
