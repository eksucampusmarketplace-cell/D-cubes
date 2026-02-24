/**
 * IMAGE CONFIGURATION
 * 
 * TO ADD YOUR OWN IMAGES:
 * 
 * Option 1: Using the Admin Panel (Recommended)
 * 1. Go to /admin and login with manager PIN (default: 0000)
 * 2. Click "Club Settings" tab
 * 3. Upload your image in the "Hero Image" section
 * 4. Or click "Gallery" tab to upload multiple images
 * 
 * Option 2: Direct URL Replacement (Manual)
 * 1. Upload your images to a hosting service (Cloudinary, Imgur, AWS S3, etc.)
 * 2. Replace the URLs below with your image URLs
 * 3. Save and refresh the page
 * 
 * ============================================
 * MAKING DAY PHOTOS LOOK LIKE COZY NIGHT:
 * 
 * The landing page automatically applies these filters to create
 * a cozy nightlife ambiance:
 * - Brightness reduction (darkens day photos)
 * - Warm color temperature (golden/cozy feel)
 * - Sepia tones (rich, warm atmosphere)
 * - Contrast enhancement (deep shadows)
 * - Purple/violet undertones (luxury night feel)
 * 
 * For best results:
 * - Use photos with warm lighting (yellows, oranges, ambers)
 * - Avoid photos with harsh white daylight
 * - Interior shots work better than exterior
 * - Photos with existing ambient lighting look best
 * ============================================
 */

// ============================================
// CHECK-IN SCREEN BACKGROUND IMAGES
// These appear on the welcome/login screen
// ============================================
export const HERO_IMAGES = {
  // Main background image - your club's best interior shot
  // TO CHANGE: Replace this URL with your own image URL
  primary: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
  
  // Alternative backgrounds (for carousel/slideshow - coming soon)
  // You can add multiple images here for a rotating background
  gallery: [
    'https://images.unsplash.com/photo-1514933651103-005ec06c04b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&auto=format&fit=crop&q=80',
  ]
};

// ============================================
// NIGHTLIFE CSS FILTER
// Applied to background images to create cozy night ambiance
// ============================================
export const NIGHTLIFE_FILTER = {
  // These CSS filters transform day photos into cozy night ambiance
  // brightness(0.4) - Darkens the image significantly
  // contrast(1.2) - Enhances contrast for drama
  // sepia(0.3) - Adds warm golden tones
  // saturate(1.3) - Makes colors more vibrant
  // hue-rotate(-10deg) - Shifts toward warmer colors
  filter: 'brightness(0.4) contrast(1.2) sepia(0.3) saturate(1.3) hue-rotate(-10deg)',
  
  // Alternative presets you can try:
  presets: {
    // Deep luxury - More dramatic, darker
    deepLuxury: 'brightness(0.35) contrast(1.3) sepia(0.4) saturate(1.2) hue-rotate(-15deg)',
    
    // Warm amber - Cozy, intimate feel
    warmAmber: 'brightness(0.45) contrast(1.1) sepia(0.5) saturate(1.1) hue-rotate(-5deg)',
    
    // Modern cool - Contemporary nightlife vibe
    modernCool: 'brightness(0.4) contrast(1.2) sepia(0.2) saturate(1.4) hue-rotate(5deg)',
    
    // Vintage gold - Classic upscale lounge
    vintageGold: 'brightness(0.38) contrast(1.25) sepia(0.6) saturate(0.9) hue-rotate(-20deg)',
  }
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
// QUICK IMAGE UPLOAD GUIDE
// ============================================
/*
METHOD 1: Using Your Phone
1. Take photos of your venue during evening hours
2. Upload to Google Drive, Dropbox, or iCloud
3. Get the direct image link
4. Paste it in the Admin Panel (/admin)

METHOD 2: Using Cloudinary (Best Quality)
1. Go to cloudinary.com and create a free account
2. Upload your images
3. Copy the URL (looks like: https://res.cloudinary.com/yourname/image/upload/...)
4. Paste in Admin Panel

METHOD 3: Using Imgur (Quick & Easy)
1. Go to imgur.com
2. Upload your image
3. Right-click → Copy Image Address
4. Paste in Admin Panel

IMAGE REQUIREMENTS:
- Format: JPG, PNG, or WebP
- Size: Minimum 1200px wide for backgrounds
- Aspect: 16:9 (landscape) works best
- File size: Under 5MB for fast loading

PHOTOGRAPHY TIPS for Best Results:
📸 Take photos during "golden hour" (just before sunset)
📸 Use warm lighting - turn on all ambient lights
📸 Focus on seating areas, bar, and decorative elements
📸 Avoid harsh flash photography
📸 Capture the mood: candles, LED strips, pendant lights
*/
