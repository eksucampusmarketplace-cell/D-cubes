/**
 * IMAGE CONFIGURATION
 * 
 * To replace these images with your own club photos:
 * 1. Upload your images to a hosting service (Cloudinary, Imgur, AWS S3, etc.)
 * 2. Replace the URLs below with your image URLs
 * 3. Save and refresh the page
 * 
 * Recommended image sizes:
 * - HERO_IMAGES: 1200px wide minimum (16:9 aspect ratio)
 * - CATEGORY_IMAGES: 800px wide minimum (16:9 aspect ratio)
 * - ITEM_IMAGES: 400px wide minimum (square or 4:3)
 */

// ============================================
// CHECK-IN SCREEN BACKGROUND IMAGES
// These appear on the welcome/login screen
// ============================================
export const HERO_IMAGES = {
  // Main background image - your club's best interior shot
  primary: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
  
  // Alternative backgrounds (for carousel if needed)
  secondary: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&auto=format&fit=crop&q=80',
};

// ============================================
// CUSTOMER PAGE HERO
// Top banner image on the menu page
// ============================================
export const CUSTOMER_HERO = {
  background: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
};

// ============================================
// CATEGORY IMAGES
// These appear at the top of each category section
// ============================================
export const CATEGORY_IMAGES = {
  // Cocktails - bar counter with cocktails being prepared
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
  
  // Spirits - premium bottles display
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&auto=format&fit=crop&q=80',
  
  // Wine - wine rack or wine glasses
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
  
  // Food - your best food platter or dish
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
  
  // Shisha - shisha lounge setup
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=800&auto=format&fit=crop&q=80',
  
  // Non-alcoholic - fresh juices or mocktails
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop&q=80',
};

// ============================================
// POPULAR ITEMS CAROUSEL
// Featured items on the customer page
// ============================================
export const POPULAR_ITEMS_IMAGES = {
  // These will use CATEGORY_IMAGES by default
  // Add specific item images here if you have them
};

// ============================================
// HOW TO REPLACE IMAGES:
// 
// Option 1: Direct URL Replacement
// Replace the URL above with your image URL:
// primary: 'https://your-domain.com/your-image.jpg',
//
// Option 2: Local Images
// 1. Place images in client/public/images/
// 2. Reference them as: '/images/your-image.jpg'
//
// Option 3: Cloudinary (Recommended)
// 1. Upload to Cloudinary
// 2. Copy the URL and paste above
// ============================================
