import type { MenuItem, ZoneType } from '@/types';

/** Zone-specific prices - if not specified, uses base price */
export const ZONE_PRICES: Partial<Record<ZoneType, Record<number, number>>> = {
  lounge: {
    // Brandy
    101: 115000, // Hennessy VS
    102: 190000, // Hennessy VSOP
    103: 480000, // Remy Martins XO
    104: 145000, // Remy Martins VSOP
    105: 610000, // Martel XO
    106: 165000, // Martel Blueswift
    // Whisky
    201: 570000, // Glendiffich 21
    202: 270000, // Glendiffich 18
    203: 180000, // Glendiffich 15
    204: 405000, // Blue Label
    205: 35000,  // Red Label
    206: 80000,  // Black Label
    207: 70000,  // Jack Daniels
    208: 65000,  // Jack Daniels (1L)
    209: 45000,  // Jameson Black
    210: 80000,  // Jameson Green
    211: 80000,  // Ciroc
    212: 40000,  // Black Stone Gold
    // Tequila
    301: 55000,  // Tequila Siera
    302: 60000,  // Olmecca
    303: 390000, // Casamigos Black
    304: 390000, // Casamigos Gold
    305: 390000, // Casamigos White
    306: 425000, // Casamigos White (1L)
    307: 700000, // Don Julio
    308: 650000, // Azul
    // Liquor
    401: 35000,  // Baileys
    // Mixers
    501: 12000,  // Cranberry
    502: 4000,   // Red Bull
    503: 4000,   // Power Horse
    504: 4000,   // Monster
    505: 700,    // Water
    506: 1500,   // Coke
    507: 1000,   // Schweppes
    508: 4000,   // Hollandia
    509: 2000,   // Malt Drink
    // Red Wine
    601: 20000,  // Carlo Rossi
    602: 25000,  // Four Cousin Red
    603: 20000,  // Agor
    // Sparkling Wine
    701: 235000, // Moet Rose
    702: 130000, // Belaire Rose
    703: 130000, // Belaire Brut
    704: 130000, // Belaire White
    705: 40000,  // Martini
    706: 30000,  // Andre
    707: 55000,  // Blue Nun Rose
    // Vodka
    801: 12000,  // Petrovskaia
    802: 8000,   // Absolute Water Melon
    // Shisha
    901: 12000,  // Double Pipe
    902: 8000,   // Single Pipe
    903: 15000,  // Special
  }
};

/** Get price for an item based on zone */
export function getItemPrice(item: MenuItem, zone: ZoneType): number {
  const zoneOverride = ZONE_PRICES[zone]?.[item.id];
  return zoneOverride ?? item.price;
}

export const MENU_ITEMS: MenuItem[] = [
  // ========== BRANDY ==========
  {
    id: 101,
    name: 'Hennessy VS',
    description: 'A remarkable blend of over 40 distinct eaux de vie, aged in French oak barrels to create a bold, fragrant cognac with notes of toasted almond and fresh grapes',
    price: 115000,
    category: 'brandy',
    tags: ['Cognac', 'Premium', 'French'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 102,
    name: 'Hennessy VSOP',
    description: 'Very Superior Old Pale, matured entirely in oak casks to develop a harmonious blend of character and finesse with rich fruit and subtle spice notes',
    price: 190000,
    category: 'brandy',
    tags: ['Cognac', 'Premium', 'Aged'],
    image: 'https://images.unsplash.com/photo-1598018553943-93a5d5df6393?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 103,
    name: 'Remy Martins XO',
    description: 'Extra Old Fine Champagne Cognac, a masterpiece of blending with opulent textures and exquisite notes of jasmine, iris, and ripe fig',
    price: 480000,
    category: 'brandy',
    tags: ['Cognac', 'Luxury', 'XO'],
    image: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 104,
    name: 'Remy Martins VSOP',
    description: 'Fine Champagne Cognac matured in French oak barrels, revealing elegant aromas of vanilla, ripe apricot, and delicate floral undertones',
    price: 145000,
    category: 'brandy',
    tags: ['Cognac', 'Premium', 'VSOP'],
    image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 105,
    name: 'Martel XO',
    description: 'Extra Old cognac representing the pinnacle of the House of Martell, with complex layers of blackcurrant, gingerbread, and precious wood',
    price: 610000,
    category: 'brandy',
    tags: ['Cognac', 'Luxury', 'XO'],
    image: 'https://images.unsplash.com/photo-1604228840865-c3cf4d6e8a7b?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 106,
    name: 'Martel Blueswift',
    description: 'An innovative VSOP finished in bourbon casks, creating a unique fusion of French elegance and American boldness with vanilla and candied fruit notes',
    price: 165000,
    category: 'brandy',
    tags: ['Cognac', 'Innovation', 'Bourbon Finish'],
    image: 'https://images.unsplash.com/photo-1600243882192-936aa9d0a6a0?w=400&auto=format&fit=crop&q=80',
  },

  // ========== WHISKY ==========
  {
    id: 201,
    name: 'Glendiffich 21',
    description: 'A rare single malt Scotch whisky aged for twenty one years, presenting an extraordinary depth of character with honeyed oak, dark chocolate, and dried fruit',
    price: 570000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Luxury', 'Aged'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 202,
    name: 'Glendiffich 18',
    description: 'Eighteen years of patient maturation in Spanish oak and American bourbon casks, resulting in a rich, full bodied whisky with baked apple and cinnamon spice',
    price: 270000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Premium'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 203,
    name: 'Glendiffich 15',
    description: 'Fifteen years of aging in sherry and bourbon casks creates a whisky of remarkable smoothness with notes of marzipan, tropical fruits, and gentle spice',
    price: 180000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Premium'],
    image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 204,
    name: 'Blue Label',
    description: 'Johnnie Walker Blue Label, an extraordinary blend of Scotland\'s rarest and most exceptional whiskies, crafted in the tradition of the original 19th century blends',
    price: 405000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1566440695148-74c457d0c122?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 205,
    name: 'Red Label',
    description: 'Johnnie Walker Red Label, a vibrant blend of up to thirty five whiskies, delivering a bold, characterful experience with fresh citrus and spicy cinnamon',
    price: 35000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Blended'],
    image: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 206,
    name: 'Black Label',
    description: 'Johnnie Walker Black Label, an iconic blend of over forty whiskies aged for at least twelve years, offering a perfectly balanced symphony of smoky and sweet',
    price: 80000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Aged'],
    image: 'https://images.unsplash.com/photo-1544725051-bc5c0cce9bf5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 207,
    name: 'Jack Daniels',
    description: 'Old No. 7 Tennessee Whiskey, charcoal mellowed drop by drop through ten feet of sugar maple charcoal for its signature smoothness and hints of vanilla and caramel',
    price: 70000,
    category: 'spirits',
    tags: ['Whisky', 'Tennessee', 'Classic'],
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 208,
    name: 'Jack Daniels (1L)',
    description: 'The legendary Old No. 7 in a generous one liter bottle, perfect for sharing with friends as you enjoy the smooth Tennessee whiskey experience',
    price: 65000,
    category: 'spirits',
    tags: ['Whisky', 'Tennessee', 'Large Format'],
    image: 'https://images.unsplash.com/photo-1583120394007-4e0d9744f005?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 209,
    name: 'Jameson Black',
    description: 'Jameson Black Barrel, a triple distilled Irish whiskey matured in double charred bourbon barrels for exceptional smoothness with intense notes of butterscotch and fudge',
    price: 45000,
    category: 'spirits',
    tags: ['Whisky', 'Irish', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 210,
    name: 'Jameson Green',
    description: 'Jameson Crested, a rich and full bodied Irish whiskey with a higher proportion of pot still whiskey, delivering complex flavors of spice, nuts, and dark chocolate',
    price: 80000,
    category: 'spirits',
    tags: ['Whisky', 'Irish', 'Premium'],
    image: 'https://images.unsplash.com/photo-1528740561668-2779c7c5e2e5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 211,
    name: 'Ciroc',
    description: 'Ciroc Premium Vodka, distilled five times from fine French grapes for an exceptionally smooth and innovative spirit with subtle citrus and natural sweetness',
    price: 80000,
    category: 'spirits',
    tags: ['Vodka', 'Premium', 'French'],
    image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 212,
    name: 'Black Stone Gold',
    description: 'A sophisticated blended whisky with a golden amber hue, offering a harmonious balance of grain and malt whiskies with gentle smoke and sweet honey notes',
    price: 40000,
    category: 'spirits',
    tags: ['Whisky', 'Blended', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1577066703745-3e0770de0f64?w=400&auto=format&fit=crop&q=80',
  },

  // ========== TEQUILA ==========
  {
    id: 301,
    name: 'Tequila Siera',
    description: 'A premium gold tequila crafted from the finest blue agave in the highlands of Jalisco, offering smooth caramel notes with a hint of warm spice and vanilla',
    price: 55000,
    category: 'tequila',
    tags: ['Tequila', 'Gold', 'Mexican'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 302,
    name: 'Olmecca White',
    description: 'Crystal clear and exceptionally smooth silver tequila, distilled from hand harvested blue agave with bright citrus notes and a crisp, clean finish',
    price: 60000,
    category: 'tequila',
    tags: ['Tequila', 'Silver', 'Premium'],
    image: 'https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 303,
    name: 'Casamigos Black',
    description: 'Anejo tequila aged for fourteen months in premium American white oak barrels, developed by George Clooney and friends, with rich notes of caramel and cocoa',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Anejo', 'Celebrity', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1619451339517-4780115ab39d?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 304,
    name: 'Casamigos Gold',
    description: 'Reposado tequila rested for seven months in American white oak barrels, delivering a perfectly balanced spirit with notes of oak, vanilla, and sweet agave',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Reposado', 'Celebrity', 'Luxury'],
    image: 'https://images.unsplash.com/photo-155b4t20-b9f3-48cd-a6a9-5c55f0c2d58d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 305,
    name: 'Casamigos White',
    description: 'Blanco tequila with a beautifully pure expression of fresh agave, featuring bright citrus notes and a long, smooth finish that defines ultra premium quality',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Blanco', 'Celebrity', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 306,
    name: 'Casamigos White (1L)',
    description: 'The exceptional Casamigos Blanco in a generous one liter format, perfect for celebrations and sharing the smooth, agave forward character with friends',
    price: 425000,
    category: 'tequila',
    tags: ['Tequila', 'Blanco', 'Large Format', 'Luxury'],
    image: 'https://images.unsplash.com/photo-15g70f8635b-46f9dd3bc08c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 307,
    name: 'Don Julio',
    description: 'Don Julio 1942, an ultra premium anejo tequila crafted in honor of the founder\'s legacy, aged for at least two and a half years with notes of tropical fruit and spice',
    price: 700000,
    category: 'tequila',
    tags: ['Tequila', 'Anejo', 'Ultra Luxury'],
    image: 'https://images.unsplash.com/photo-159619g803-58c4d42fde2f?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 308,
    name: 'Azul',
    description: 'Clase Azul Reposado, a masterpiece presented in handcrafted ceramic decanters, aged for eight months in bourbon barrels with rich notes of hazelnut and vanilla',
    price: 650000,
    category: 'tequila',
    tags: ['Tequila', 'Reposado', 'Artisan', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1584225064-h5tc1cb86a62?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },

  // ========== LIQUOR ==========
  {
    id: 401,
    name: 'Baileys',
    description: 'The original Irish Cream Liqueur, a luxurious blend of triple distilled Irish whiskey and rich dairy cream with notes of chocolate, vanilla, and caramel',
    price: 35000,
    category: 'liquor',
    tags: ['Cream Liqueur', 'Irish', 'Sweet'],
    image: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },

  // ========== MIXERS ==========
  {
    id: 501,
    name: 'Cranberry',
    description: 'Premium cranberry juice blend with the perfect balance of tart and sweet flavors. Ideal for mixing with vodka, whiskey, or champagne. Served chilled.',
    price: 12000,
    category: 'mixers',
    tags: ['Mixer', 'Juice', 'Cocktail Essential'],
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 502,
    name: 'Red Bull',
    description: 'The original Austrian energy drink with a unique blend of caffeine, taurine, B-vitamins, and sugars. Perfect as a mixer or for an energizing boost.',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Mixer', 'Premium'],
    image: 'https://images.unsplash.com/photo-1613424188715-165f62092b30?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 503,
    name: 'Power Horse',
    description: 'High-energy drink packed with taurine, caffeine, and essential vitamins. Delivers a refreshing boost with a smooth taste profile.',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 504,
    name: 'Monster',
    description: 'The legendary energy drink with a bold flavor and powerful blend of caffeine, ginseng, taurine, and B-vitamins. Unleash the beast.',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Intense'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 505,
    name: 'Water',
    description: 'Pure, refreshing bottled still water. Perfect for staying hydrated and cleansing the palate between drinks.',
    price: 700,
    category: 'mixers',
    tags: ['Water', 'Essential', 'Refreshing'],
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 506,
    name: 'Coke',
    description: 'The original Coca-Cola with its signature refreshing taste. Perfect on its own over ice or as a classic mixer with spirits.',
    price: 1500,
    category: 'mixers',
    tags: ['Soft Drink', 'Classic', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 507,
    name: 'Schweppes',
    description: 'Premium carbonated tonic water with a distinctive bitter-sweet taste and fine bubbles. The perfect companion for gin and vodka.',
    price: 1000,
    category: 'mixers',
    tags: ['Tonic', 'Mixer', 'Premium'],
    image: 'https://images.unsplash.com/photo-1603967606626-e1ih6cb5c0a3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 508,
    name: 'Hollandia',
    description: 'Rich and creamy non-alcoholic malt drink from the Netherlands. Smooth, satisfying, and perfect for those who prefer a wholesome alternative.',
    price: 4000,
    category: 'mixers',
    tags: ['Malt Drink', 'Nourishing', 'Creamy'],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 509,
    name: 'Malt Drink',
    description: 'Refreshing non-alcoholic malt beverage with a distinctive sweet, malty taste. A popular Nigerian favorite for any occasion.',
    price: 2000,
    category: 'mixers',
    tags: ['Malt', 'Non Alcoholic', 'Refreshing'],
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&auto=format&fit=crop&q=80',
  },

  // ========== RED WINE ==========
  {
    id: 601,
    name: 'Carlo Rossi',
    description: 'California red wine with smooth, approachable flavors of ripe berries, cherry, and subtle oak. A versatile wine that pairs well with grilled meats and casual dining.',
    price: 20000,
    category: 'wine',
    tags: ['Red Wine', 'California', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 602,
    name: 'Four Cousin Red',
    description: 'South African red blend combining Merlot, Cabernet Sauvignon, Shiraz, and Pinotage. Rich fruit flavors with hints of spice and a velvety smooth finish.',
    price: 25000,
    category: 'wine',
    tags: ['Red Wine', 'South African', 'Blend'],
    image: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 603,
    name: 'Agor',
    description: 'Premium red wine with deep ruby color, complex aromas of dark fruits and subtle earthiness. Smooth tannins lead to an elegant, lasting finish.',
    price: 20000,
    category: 'wine',
    tags: ['Red Wine', 'Premium', 'Elegant'],
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&auto=format&fit=crop&q=80',
  },

  // ========== SPARKLING WINE ==========
  {
    id: 701,
    name: 'Moet Rose',
    description: 'Moet & Chandon Rose Imperial Champagne. A glamorous rose with vibrant bubbles, seductive notes of wild strawberries, raspberries, and a hint of pink peppercorn.',
    price: 235000,
    category: 'sparkling-wine',
    tags: ['Champagne', 'Rose', 'Luxury', 'French'],
    image: 'https://images.unsplash.com/photo-1549804947-0be5f5abbd47?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 702,
    name: 'Belaire Rose',
    description: 'Luc Belaire Rare Rose from Provence. Beautiful salmon-pink color with fresh strawberry, blackcurrant, and delicate floral notes. Presented in an iconic black bottle.',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Rose', 'Provence'],
    image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 703,
    name: 'Belaire Brut',
    description: 'Luc Belaire Rare Brut from Burgundy. Elegant and crisp with delicate bubbles, bright apple and pear flavors, and a refined dry finish. Perfect for celebrations.',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Brut', 'Burgundy'],
    image: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 704,
    name: 'Belaire White',
    description: 'Luc Belaire Rare Luxe Blanc de Blancs. Rich and creamy with layers of peach, apricot, tropical fruits, and a subtle hint of vanilla sweetness.',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'White', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1586375e74-8c4548f2f8be?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 705,
    name: 'Martini',
    description: 'Martini Asti DOCG from Piedmont, Italy. Sweet sparkling wine with enchanting aromas of fresh grapes, melon, and peach. Perfect for desserts and celebrations.',
    price: 40000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Sweet', 'Italian'],
    image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 706,
    name: 'Andre',
    description: 'Andre California Champagne. Affordable sparkling wine with bright apple and pear flavors. Light, refreshing, and perfect for casual celebrations.',
    price: 30000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'California', 'Festive'],
    image: 'https://images.unsplash.com/photo-154729b04-b2b5-41be-a28d-4e92d012e9b4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 707,
    name: 'Blue Nun Rose',
    description: 'Blue Nun Rose Edition from Germany. Delicate pink sparkling wine with fresh red berry flavors and a light, refreshing character. Served chilled.',
    price: 55000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Rose', 'German'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
  },

  // ========== VODKA ==========
  {
    id: 801,
    name: 'Petrovskaia',
    description: 'Premium vodka distilled using traditional methods for exceptional purity. Clean, crisp taste with subtle grain sweetness and a smooth finish. Perfect for cocktails.',
    price: 12000,
    category: 'spirits',
    tags: ['Vodka', 'Premium', 'Smooth'],
    image: 'https://images.unsplash.com/photo-160425izx59-0c8c4f6a3d5b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 802,
    name: 'Absolute Water Melon',
    description: 'Absolut Watermelon vodka infused with natural watermelon flavor. Juicy, refreshing taste perfect for summer cocktails and mixed drinks. A seasonal favorite.',
    price: 8000,
    category: 'spirits',
    tags: ['Vodka', 'Flavored', 'Fruity'],
    image: 'https://images.unsplash.com/photo-157597x9c5c-47e3-8c4f-6f9a1a5a5f0a?w=400&auto=format&fit=crop&q=80',
    isNew: true,
  },

  // ========== SHISHA ==========
  {
    id: 901,
    name: 'Double Pipe',
    description: 'Premium shisha for two with dual hoses, allowing you and a companion to enjoy simultaneously. Choose from our selection of expertly blended flavors including mint, grape, apple, and mixed fruit. Served with fresh charcoal and ice for a smooth, cool experience lasting up to two hours.',
    price: 12000,
    category: 'shisha',
    tags: ['Shisha', 'Premium', 'Sharing', 'Two Hours'],
    image: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 902,
    name: 'Single Pipe',
    description: 'Classic single-hose shisha experience with premium flavored tobacco. Perfect for solo relaxation or passing among friends. Available in mint, double apple, grape, watermelon, blueberry, and exotic mixed blends. Includes fresh charcoal service and ice for enhanced smoothness.',
    price: 8000,
    category: 'shisha',
    tags: ['Shisha', 'Classic', 'Two Hours'],
    image: 'https://images.unsplash.com/photo-1606204642323-bd88a6ab97a4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 903,
    name: 'Special',
    description: 'Our signature luxury shisha experience featuring fresh fruit heads carved from real oranges, pineapples, or watermelons infused with premium tobacco blends. Includes specialty flavors not available elsewhere, enhanced cooling system, and dedicated attendant service for a truly exceptional session.',
    price: 15000,
    category: 'shisha',
    tags: ['Shisha', 'Signature', 'Luxury', 'Two Hours'],
    image: 'https://images.unsplash.com/photo-1560iz8230-73b927fbdb87?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },

  // ========== FOOD (RETAINED) ==========
  {
    id: 1001,
    name: 'Suya Platter',
    description: 'Tender, thinly sliced beef skewers marinated in a blend of ground peanuts, cayenne pepper, ginger, and traditional suya spices, grilled over open flame to perfection. Served with fresh sliced onions, tomatoes, and cabbage for a complete authentic Nigerian street food experience.',
    price: 25000,
    category: 'food',
    tags: ['Nigerian', 'Popular', 'Spicy'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1002,
    name: 'Grilled Lobster',
    description: 'Fresh whole Atlantic lobster split and grilled with garlic butter, fresh lemon juice, and a medley of aromatic herbs including thyme, rosemary, and parsley. Served with drawn butter for dipping, roasted vegetables, and your choice of side. A true delicacy from the ocean.',
    price: 48000,
    category: 'food',
    tags: ['Seafood', 'Premium', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
    requiresFoodService: true,
  },
  {
    id: 1003,
    name: 'Wagyu Sliders',
    description: 'Three mini burgers made with premium Japanese Wagyu beef patties, topped with melted aged cheddar, caramelized onions slow-cooked for hours, and our house-made truffle mayonnaise on toasted brioche buns. Each bite delivers an explosion of rich, buttery flavor.',
    price: 32000,
    category: 'food',
    tags: ['Burger', 'Premium', 'Wagyu'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1004,
    name: 'Seafood Tower',
    description: 'An impressive multi-tiered presentation of the freshest catches: chilled jumbo prawns, premium oysters on the half shell, succulent lobster tails, and pan-seared scallops. Accompanied by cocktail sauce, mignonette, and lemon wedges. Perfect for sharing among four guests.',
    price: 95000,
    category: 'food',
    tags: ['Seafood', 'Sharing', 'Premium'],
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
    requiresFoodService: true,
  },
  {
    id: 1005,
    name: 'Jollof Rice and Chicken',
    description: 'Our signature party-style jollof rice slow-cooked with tomatoes, scotch bonnet peppers, onions, and a special blend of West African spices until perfectly smoky. Served with succulent grilled chicken marinated in suya spices and sweet fried plantains on the side.',
    price: 18000,
    category: 'food',
    tags: ['Nigerian', 'Local', 'Popular'],
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1006,
    name: 'Pepper Soup Platter',
    description: 'Traditional Nigerian pepper soup featuring your choice of tender goat meat or fresh catfish, simmered in a rich, aromatic broth with calabash nutmeg, scent leaves, utazi, and scotch bonnet peppers. Served piping hot with a side of agidi or white rice.',
    price: 22000,
    category: 'food',
    tags: ['Nigerian', 'Spicy', 'Soup'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1007,
    name: 'Truffle Fries',
    description: 'Hand-cut Kennebec potatoes double-fried for crispy exterior and fluffy interior, then tossed in aromatic black truffle oil, generous shavings of aged Parmigiano-Reggiano, and fresh chopped parsley and chives. Served with house-made garlic aioli for dipping.',
    price: 12000,
    category: 'food',
    tags: ['Snack', 'Truffle', 'Side'],
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1008,
    name: 'Chicken Wings',
    description: 'Crispy golden chicken wings marinated overnight, then fried to perfection and tossed in your choice of sauce: fiery scotch bonnet spicy, smoky BBQ, honey garlic, or lemon pepper. Served with cool ranch dressing and fresh celery sticks.',
    price: 15000,
    category: 'food',
    tags: ['Wings', 'Snack', 'Popular'],
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1009,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce hearts hand-tossed with our signature Caesar dressing made from egg yolks, Dijon mustard, anchovies, garlic, and aged Parmesan. Topped with house-made croutons toasted with garlic butter and additional shaved Parmesan.',
    price: 14000,
    category: 'food',
    tags: ['Salad', 'Healthy', 'Classic'],
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1010,
    name: 'Grilled Lamb Chops',
    description: 'Premium New Zealand lamb chops encrusted with fresh rosemary, thyme, and garlic, then grilled to your preferred doneness over an open flame. Served with house-made mint sauce, roasted seasonal vegetables, and creamy mashed potatoes.',
    price: 42000,
    category: 'food',
    tags: ['Lamb', 'Premium', 'Grilled'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
    requiresFoodService: true,
  },
];

// Category display names
export const CATEGORY_NAMES: Record<string, string> = {
  all: 'Full Menu',
  brandy: 'Brandy',
  spirits: 'Whisky and Vodka',
  tequila: 'Tequila',
  liquor: 'Liquor',
  mixers: 'Mixers and Soft Drinks',
  'energy-drinks': 'Energy Drinks',
  wine: 'Red Wine',
  'sparkling-wine': 'Sparkling Wine and Champagne',
  shisha: 'Shisha',
  food: 'Cuisine'
};

// Category emojis
export const CATEGORY_ICONS: Record<string, string> = {
  all: '📋',
  brandy: '🥃',
  spirits: '🥃',
  tequila: '🌵',
  liquor: '🍶',
  mixers: '🧃',
  'energy-drinks': '⚡',
  wine: '🍷',
  'sparkling-wine': '🥂',
  shisha: '💨',
  food: '🍽️'
};

// Get items available in a specific zone
export function getItemsForZone(_zoneId: string, items = MENU_ITEMS): MenuItem[] {
  // All items available everywhere now
  return items;
}

// Get categories available in a zone
export function getCategoriesForZone(zoneId: string): string[] {
  const zoneCategories: Record<string, string[]> = {
    'open-bar': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
    'lounge': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
    'nightclub': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
    'vip': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
    'poolside': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food']
  };
  return zoneCategories[zoneId] || zoneCategories['lounge'];
}
