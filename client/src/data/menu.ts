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
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 106,
    name: 'Martel Blueswift',
    description: 'An innovative VSOP finished in bourbon casks, creating a unique fusion of French elegance and American boldness with vanilla and candied fruit notes',
    price: 165000,
    category: 'brandy',
    tags: ['Cognac', 'Innovation', 'Bourbon Finish'],
    image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&auto=format&fit=crop&q=80',
  },

  // ========== WHISKY ==========
  {
    id: 201,
    name: 'Glendiffich 21',
    description: 'A rare single malt Scotch whisky aged for twenty one years, presenting an extraordinary depth of character with honeyed oak, dark chocolate, and dried fruit',
    price: 570000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Luxury', 'Aged'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 204,
    name: 'Blue Label',
    description: 'Johnnie Walker Blue Label, an extraordinary blend of Scotland\'s rarest and most exceptional whiskies, crafted in the tradition of the original 19th century blends',
    price: 405000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 205,
    name: 'Red Label',
    description: 'Johnnie Walker Red Label, a vibrant blend of up to thirty five whiskies, delivering a bold, characterful experience with fresh citrus and spicy cinnamon',
    price: 35000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Blended'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 206,
    name: 'Black Label',
    description: 'Johnnie Walker Black Label, an iconic blend of over forty whiskies aged for at least twelve years, offering a perfectly balanced symphony of smoky and sweet',
    price: 80000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Aged'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 207,
    name: 'Jack Daniels',
    description: 'Old No. 7 Tennessee Whiskey, charcoal mellowed drop by drop through ten feet of sugar maple charcoal for its signature smoothness and hints of vanilla and caramel',
    price: 70000,
    category: 'spirits',
    tags: ['Whisky', 'Tennessee', 'Classic'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 208,
    name: 'Jack Daniels (1L)',
    description: 'The legendary Old No. 7 in a generous one liter bottle, perfect for sharing with friends as you enjoy the smooth Tennessee whiskey experience',
    price: 65000,
    category: 'spirits',
    tags: ['Whisky', 'Tennessee', 'Large Format'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 209,
    name: 'Jameson Black',
    description: 'Jameson Black Barrel, a triple distilled Irish whiskey matured in double charred bourbon barrels for exceptional smoothness with intense notes of butterscotch and fudge',
    price: 45000,
    category: 'spirits',
    tags: ['Whisky', 'Irish', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 210,
    name: 'Jameson Green',
    description: 'Jameson Crested, a rich and full bodied Irish whiskey with a higher proportion of pot still whiskey, delivering complex flavors of spice, nuts, and dark chocolate',
    price: 80000,
    category: 'spirits',
    tags: ['Whisky', 'Irish', 'Premium'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 211,
    name: 'Ciroc',
    description: 'Ciroc Premium Vodka, distilled five times from fine French grapes for an exceptionally smooth and innovative spirit with subtle citrus and natural sweetness',
    price: 80000,
    category: 'spirits',
    tags: ['Vodka', 'Premium', 'French'],
    image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 212,
    name: 'Black Stone Gold',
    description: 'A sophisticated blended whisky with a golden amber hue, offering a harmonious balance of grain and malt whiskies with gentle smoke and sweet honey notes',
    price: 40000,
    category: 'spirits',
    tags: ['Whisky', 'Blended', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 303,
    name: 'Casamigos Black',
    description: 'Anejo tequila aged for fourteen months in premium American white oak barrels, developed by George Clooney and friends, with rich notes of caramel and cocoa',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Anejo', 'Celebrity', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 304,
    name: 'Casamigos Gold',
    description: 'Reposado tequila rested for seven months in American white oak barrels, delivering a perfectly balanced spirit with notes of oak, vanilla, and sweet agave',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Reposado', 'Celebrity', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 305,
    name: 'Casamigos White',
    description: 'Blanco tequila with a beautifully pure expression of fresh agave, featuring bright citrus notes and a long, smooth finish that defines ultra premium quality',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Blanco', 'Celebrity', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 306,
    name: 'Casamigos White (1L)',
    description: 'The exceptional Casamigos Blanco in a generous one liter format, perfect for celebrations and sharing the smooth, agave forward character with friends',
    price: 425000,
    category: 'tequila',
    tags: ['Tequila', 'Blanco', 'Large Format', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 307,
    name: 'Don Julio',
    description: 'Don Julio 1942, an ultra premium anejo tequila crafted in honor of the founder\'s legacy, aged for at least two and a half years with notes of tropical fruit and spice',
    price: 700000,
    category: 'tequila',
    tags: ['Tequila', 'Anejo', 'Ultra Luxury'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 308,
    name: 'Azul',
    description: 'Clase Azul Reposado, a masterpiece presented in handcrafted ceramic decanters, aged for eight months in bourbon barrels with rich notes of hazelnut and vanilla',
    price: 650000,
    category: 'tequila',
    tags: ['Tequila', 'Reposado', 'Artisan', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },

  // ========== MIXERS ==========
  {
    id: 501,
    name: 'Cranberry',
    description: 'Premium cranberry juice with a perfect balance of tart and sweet, ideal for crafting sophisticated cocktails or enjoying as a refreshing mixer',
    price: 12000,
    category: 'mixers',
    tags: ['Mixer', 'Juice', 'Cocktail Essential'],
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 502,
    name: 'Red Bull',
    description: 'The original energy drink that gives you wings, with a unique blend of caffeine, taurine, and B vitamins for an invigorating boost of energy',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Mixer', 'Premium'],
    image: 'https://images.unsplash.com/photo-1613424188715-165f62092b30?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 503,
    name: 'Power Horse',
    description: 'A dynamic energy drink packed with vitality boosting ingredients, delivering sustained energy with a bold, refreshing taste that awakens the senses',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 504,
    name: 'Monster',
    description: 'Unleash the beast with this intense energy drink, packed with a powerful blend of caffeine, ginseng, and B vitamins for maximum energy and focus',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Intense'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 505,
    name: 'Water',
    description: 'Pure, refreshing bottled water to cleanse the palate and keep you hydrated throughout your evening of fine dining and exquisite spirits',
    price: 700,
    category: 'mixers',
    tags: ['Water', 'Essential', 'Refreshing'],
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 506,
    name: 'Coke',
    description: 'The iconic Coca Cola, a timeless classic with its signature blend of caramel sweetness and refreshing effervescence, perfect on its own or as a mixer',
    price: 1500,
    category: 'mixers',
    tags: ['Soft Drink', 'Classic', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 507,
    name: 'Schweppes',
    description: 'Premium tonic water and mixers with a heritage of excellence, delivering the perfect balance of bitterness and bubbles to elevate any cocktail',
    price: 1000,
    category: 'mixers',
    tags: ['Tonic', 'Mixer', 'Premium'],
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 508,
    name: 'Hollandia',
    description: 'Rich and creamy malt drink with a smooth, satisfying taste, offering a nourishing blend of dairy goodness and malted barley for a wholesome refreshment',
    price: 4000,
    category: 'mixers',
    tags: ['Malt Drink', 'Nourishing', 'Creamy'],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 509,
    name: 'Malt Drink',
    description: 'A refreshing non alcoholic malt beverage with a distinctive sweet taste and energizing properties, perfect for those who prefer a wholesome alternative',
    price: 2000,
    category: 'mixers',
    tags: ['Malt', 'Non Alcoholic', 'Refreshing'],
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80',
  },

  // ========== RED WINE ==========
  {
    id: 601,
    name: 'Carlo Rossi',
    description: 'A California red wine offering exceptional value with smooth, fruity flavors of ripe berries and a soft, approachable finish that pairs beautifully with any occasion',
    price: 20000,
    category: 'wine',
    tags: ['Red Wine', 'California', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 602,
    name: 'Four Cousin Red',
    description: 'A South African red blend combining the best of traditional winemaking with modern techniques, delivering rich fruit flavors and a velvety smooth texture',
    price: 25000,
    category: 'wine',
    tags: ['Red Wine', 'South African', 'Blend'],
    image: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 603,
    name: 'Agor',
    description: 'A premium red wine with deep ruby color and complex aromas of dark fruits, offering a sophisticated drinking experience with elegant tannins and a lasting finish',
    price: 20000,
    category: 'wine',
    tags: ['Red Wine', 'Premium', 'Elegant'],
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&auto=format&fit=crop&q=80',
  },

  // ========== SPARKLING WINE ==========
  {
    id: 701,
    name: 'Moet Rose',
    description: 'Moet and Chandon Rose Imperial, a glamorous champagne with radiant color and seductive palate of wild strawberries, raspberries, and a hint of peppermint',
    price: 235000,
    category: 'sparkling-wine',
    tags: ['Champagne', 'Rose', 'Luxury', 'French'],
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 702,
    name: 'Belaire Rose',
    description: 'Luc Belaire Rare Rose, a beautiful sparkling wine from Provence with fresh strawberry and blackcurrant flavors, wrapped in an iconic black bottle',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Rose', 'Provence'],
    image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 703,
    name: 'Belaire Brut',
    description: 'Luc Belaire Rare Brut, an elegant sparkling wine crafted in Burgundy with delicate bubbles, crisp apple notes, and a refined, dry finish',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Brut', 'Burgundy'],
    image: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 704,
    name: 'Belaire White',
    description: 'Luc Belaire Rare Luxe, a luxurious Blanc de Blancs with rich flavors of peach, apricot, and tropical fruits, finished with a hint of vanilla sweetness',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'White', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 705,
    name: 'Martini',
    description: 'Martini Asti, a sweet sparkling wine from Italy with enchanting aromas of fresh grapes, melon, and peach, delivering a delightful burst of fruity sweetness',
    price: 40000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Sweet', 'Italian'],
    image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 706,
    name: 'Andre',
    description: 'Andre California Champagne, an affordable sparkling wine with bright apple and pear flavors, offering a festive experience for any celebration',
    price: 30000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'California', 'Festive'],
    image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 707,
    name: 'Blue Nun Rose',
    description: 'Blue Nun Rose Edition, a German sparkling wine with a beautiful pink hue and delicate flavors of red berries, offering a light and refreshing experience',
    price: 55000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Rose', 'German'],
    image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&auto=format&fit=crop&q=80',
  },

  // ========== VODKA ==========
  {
    id: 801,
    name: 'Petrovskaia',
    description: 'A premium vodka with exceptional purity and smoothness, distilled using traditional methods for a clean, crisp taste with subtle grain sweetness',
    price: 12000,
    category: 'spirits',
    tags: ['Vodka', 'Premium', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 802,
    name: 'Absolute Water Melon',
    description: 'Absolut Watermelon vodka, a refreshing flavored spirit infused with natural watermelon taste, perfect for summer cocktails with juicy, mouthwatering flavor',
    price: 8000,
    category: 'spirits',
    tags: ['Vodka', 'Flavored', 'Fruity'],
    image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&auto=format&fit=crop&q=80',
    isNew: true,
  },

  // ========== SHISHA ==========
  {
    id: 901,
    name: 'Double Pipe',
    description: 'An exquisite dual hose shisha experience featuring premium tobacco in your choice of flavor, perfect for sharing with a friend over two hours of smooth, flavorful clouds',
    price: 12000,
    category: 'shisha',
    tags: ['Shisha', 'Premium', 'Sharing', 'Two Hours'],
    image: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 902,
    name: 'Single Pipe',
    description: 'A classic single hose shisha session with premium flavored tobacco, delivering rich, aromatic clouds for a relaxing two hour experience of traditional enjoyment',
    price: 8000,
    category: 'shisha',
    tags: ['Shisha', 'Classic', 'Two Hours'],
    image: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 903,
    name: 'Special',
    description: 'Our signature shisha experience featuring premium tobaccos, fresh fruit heads, and exotic flavor combinations for the ultimate two hour journey of luxury smoking',
    price: 15000,
    category: 'shisha',
    tags: ['Shisha', 'Signature', 'Luxury', 'Two Hours'],
    image: 'https://images.unsplash.com/photo-1606204642323-bd88a6ab97a4?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },

  // ========== FOOD (RETAINED) ==========
  {
    id: 1001,
    name: 'Suya Platter',
    description: 'Grilled beef suya with onions, tomatoes, and spiced groundnut, offering authentic Nigerian flavors in every bite',
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
    description: 'Whole lobster prepared with garlic butter, fresh lemon, and aromatic herbs, a true ocean luxury',
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
    description: 'Three mini wagyu beef burgers with truffle mayonnaise and caramelized onions, indulgent bites of perfection',
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
    description: 'An impressive tower of oysters, prawns, lobster, and scallops, a coastal abundance served for four guests',
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
    description: 'Premium smoked jollof rice served with grilled chicken and sweet plantain, the ultimate party perfection',
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
    description: 'Hearty goat meat and catfish pepper soup served steaming hot, a warming tradition of Nigerian cuisine',
    price: 22000,
    category: 'food',
    tags: ['Nigerian', 'Spicy', 'Soup'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1007,
    name: 'Truffle Fries',
    description: 'Hand cut fries drizzled with truffle oil, parmesan cheese, and fresh herbs, elevated comfort food at its finest',
    price: 12000,
    category: 'food',
    tags: ['Snack', 'Truffle', 'Side'],
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1008,
    name: 'Chicken Wings',
    description: 'Crispy chicken wings glazed with your choice of spicy or BBQ sauce, served with cool ranch dip',
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
    description: 'Classic Caesar salad with crisp romaine lettuce, crunchy croutons, parmesan cheese, and traditional anchovy dressing',
    price: 14000,
    category: 'food',
    tags: ['Salad', 'Healthy', 'Classic'],
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1010,
    name: 'Grilled Lamb Chops',
    description: 'Herb crusted lamb chops served with mint sauce and seasonal vegetables, refined protein for discerning palates',
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
