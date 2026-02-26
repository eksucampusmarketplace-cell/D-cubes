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
    description: 'Cognac aged in French oak barrels. Notes of almond and grapes.',
    price: 115000,
    category: 'brandy',
    tags: ['Cognac', 'Premium', 'French'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 102,
    name: 'Hennessy VSOP',
    description: 'Very Superior Old Pale cognac aged in oak casks. Rich fruit and spice notes.',
    price: 190000,
    category: 'brandy',
    tags: ['Cognac', 'Premium', 'Aged'],
    image: 'https://images.unsplash.com/photo-1598018553943-93a5d5df6393?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 103,
    name: 'Remy Martins XO',
    description: 'Extra Old Fine Champagne Cognac. Notes of jasmine, iris, and fig.',
    price: 480000,
    category: 'brandy',
    tags: ['Cognac', 'Luxury', 'XO'],
    image: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 104,
    name: 'Remy Martins VSOP',
    description: 'Fine Champagne Cognac aged in French oak barrels. Notes of vanilla, apricot, and floral.',
    price: 145000,
    category: 'brandy',
    tags: ['Cognac', 'Premium', 'VSOP'],
    image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 105,
    name: 'Martel XO',
    description: 'Extra Old cognac with notes of blackcurrant, gingerbread, and wood.',
    price: 610000,
    category: 'brandy',
    tags: ['Cognac', 'Luxury', 'XO'],
    image: 'https://images.unsplash.com/photo-1604228840865-c3cf4d6e8a7b?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 106,
    name: 'Martel Blueswift',
    description: 'VSOP cognac finished in bourbon casks. Notes of vanilla and candied fruit.',
    price: 165000,
    category: 'brandy',
    tags: ['Cognac', 'Innovation', 'Bourbon Finish'],
    image: 'https://images.unsplash.com/photo-1600243882192-936aa9d0a6a0?w=400&auto=format&fit=crop&q=80',
  },

  // ========== WHISKY ==========
  {
    id: 201,
    name: 'Glendiffich 21',
    description: 'Single malt Scotch whisky aged 21 years. Notes of honey, dark chocolate, and dried fruit.',
    price: 570000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Luxury', 'Aged'],
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 202,
    name: 'Glendiffich 18',
    description: 'Single malt Scotch whisky aged 18 years. Notes of baked apple and cinnamon.',
    price: 270000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Premium'],
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 203,
    name: 'Glendiffich 15',
    description: 'Single malt Scotch whisky aged 15 years. Notes of marzipan, tropical fruits, and spice.',
    price: 180000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Premium'],
    image: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 204,
    name: 'Blue Label',
    description: 'Johnnie Walker Blue Label premium blended Scotch whisky.',
    price: 405000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1566440695148-74c457d0c122?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 205,
    name: 'Red Label',
    description: 'Johnnie Walker Red Label blended Scotch whisky.',
    price: 35000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Blended'],
    image: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 206,
    name: 'Black Label',
    description: 'Johnnie Walker Black Label blended Scotch whisky aged 12 years.',
    price: 80000,
    category: 'spirits',
    tags: ['Whisky', 'Scotch', 'Aged'],
    image: 'https://images.unsplash.com/photo-1544725051-bc5c0cce9bf5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 207,
    name: 'Jack Daniels',
    description: 'Old No. 7 Tennessee Whiskey. Notes of vanilla and caramel.',
    price: 70000,
    category: 'spirits',
    tags: ['Whisky', 'Tennessee', 'Classic'],
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 208,
    name: 'Jack Daniels (1L)',
    description: 'Old No. 7 Tennessee Whiskey in 1L bottle.',
    price: 65000,
    category: 'spirits',
    tags: ['Whisky', 'Tennessee', 'Large Format'],
    image: 'https://images.unsplash.com/photo-1583120394007-4e0d9744f005?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 209,
    name: 'Jameson Black',
    description: 'Jameson Black Barrel Irish whiskey aged in bourbon barrels. Notes of butterscotch and fudge.',
    price: 45000,
    category: 'spirits',
    tags: ['Whisky', 'Irish', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 210,
    name: 'Jameson Green',
    description: 'Jameson Crested Irish whiskey. Notes of spice, nuts, and dark chocolate.',
    price: 80000,
    category: 'spirits',
    tags: ['Whisky', 'Irish', 'Premium'],
    image: 'https://images.unsplash.com/photo-1528740561668-2779c7c5e2e5?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 211,
    name: 'Ciroc',
    description: 'Premium vodka distilled from French grapes. Notes of citrus and sweetness.',
    price: 80000,
    category: 'spirits',
    tags: ['Vodka', 'Premium', 'French'],
    image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 212,
    name: 'Black Stone Gold',
    description: 'Blended whisky with notes of smoke and honey.',
    price: 40000,
    category: 'spirits',
    tags: ['Whisky', 'Blended', 'Smooth'],
    image: 'https://images.unsplash.com/photo-1577066703745-3e0770de0f64?w=400&auto=format&fit=crop&q=80',
  },

  // ========== TEQUILA ==========
  {
    id: 301,
    name: 'Tequila Siera',
    description: 'Gold tequila from blue agave. Notes of caramel and vanilla.',
    price: 55000,
    category: 'tequila',
    tags: ['Tequila', 'Gold', 'Mexican'],
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 302,
    name: 'Olmecca White',
    description: 'Silver tequila distilled from blue agave. Notes of citrus.',
    price: 60000,
    category: 'tequila',
    tags: ['Tequila', 'Silver', 'Premium'],
    image: 'https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 303,
    name: 'Casamigos Black',
    description: 'Anejo tequila aged 14 months in oak barrels. Notes of caramel and cocoa.',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Anejo', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1619451339517-4780115ab39d?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 304,
    name: 'Casamigos Gold',
    description: 'Reposado tequila aged 7 months in oak barrels. Notes of vanilla and agave.',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Reposado', 'Luxury'],
    image: 'https://images.unsplash.com/photo-155b4t20-b9f3-48cd-a6a9-5c55f0c2d58d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 305,
    name: 'Casamigos White',
    description: 'Blanco tequila with agave and citrus notes.',
    price: 390000,
    category: 'tequila',
    tags: ['Tequila', 'Blanco', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 306,
    name: 'Casamigos White (1L)',
    description: 'Casamigos Blanco tequila in 1L bottle.',
    price: 425000,
    category: 'tequila',
    tags: ['Tequila', 'Blanco', 'Large Format'],
    image: 'https://images.unsplash.com/photo-15g70f8635b-46f9dd3bc08c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 307,
    name: 'Don Julio',
    description: 'Don Julio 1942 anejo tequila aged 2.5 years. Notes of tropical fruit and spice.',
    price: 700000,
    category: 'tequila',
    tags: ['Tequila', 'Anejo', 'Luxury'],
    image: 'https://images.unsplash.com/photo-159619g803-58c4d42fde2f?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 308,
    name: 'Azul',
    description: 'Clase Azul Reposado in ceramic decanter, aged 8 months. Notes of hazelnut and vanilla.',
    price: 650000,
    category: 'tequila',
    tags: ['Tequila', 'Reposado', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1584225064-h5tc1cb86a62?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },

  // ========== LIQUOR ==========
  {
    id: 401,
    name: 'Baileys',
    description: 'Irish cream liqueur with whiskey and dairy cream. Notes of chocolate and vanilla.',
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
    description: 'Cranberry juice for mixing.',
    price: 12000,
    category: 'mixers',
    tags: ['Mixer', 'Juice'],
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 502,
    name: 'Red Bull',
    description: 'Energy drink with caffeine and taurine.',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1613424188715-165f62092b30?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 503,
    name: 'Power Horse',
    description: 'Energy drink with caffeine and taurine.',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 504,
    name: 'Monster',
    description: 'Energy drink with caffeine and ginseng.',
    price: 4000,
    category: 'energy-drinks',
    tags: ['Energy Drink'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 505,
    name: 'Water',
    description: 'Bottled still water.',
    price: 700,
    category: 'mixers',
    tags: ['Water'],
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 506,
    name: 'Coke',
    description: 'Coca-Cola soft drink.',
    price: 1500,
    category: 'mixers',
    tags: ['Soft Drink', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 507,
    name: 'Schweppes',
    description: 'Tonic water.',
    price: 1000,
    category: 'mixers',
    tags: ['Tonic', 'Mixer'],
    image: 'https://images.unsplash.com/photo-1603967606626-e1ih6cb5c0a3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 508,
    name: 'Hollandia',
    description: 'Non-alcoholic malt drink.',
    price: 4000,
    category: 'mixers',
    tags: ['Malt Drink'],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 509,
    name: 'Malt Drink',
    description: 'Non-alcoholic malt beverage.',
    price: 2000,
    category: 'mixers',
    tags: ['Malt', 'Non Alcoholic'],
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&auto=format&fit=crop&q=80',
  },

  // ========== RED WINE ==========
  {
    id: 601,
    name: 'Carlo Rossi',
    description: 'California red wine. Notes of berries and cherry.',
    price: 20000,
    category: 'wine',
    tags: ['Red Wine', 'California'],
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 602,
    name: 'Four Cousin Red',
    description: 'South African red blend. Notes of fruit and spice.',
    price: 25000,
    category: 'wine',
    tags: ['Red Wine', 'South African', 'Blend'],
    image: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 603,
    name: 'Agor',
    description: 'Premium red wine. Notes of dark fruits.',
    price: 20000,
    category: 'wine',
    tags: ['Red Wine', 'Premium'],
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&auto=format&fit=crop&q=80',
  },

  // ========== SPARKLING WINE ==========
  {
    id: 701,
    name: 'Moet Rose',
    description: 'Moet & Chandon Rose Champagne. Notes of strawberries and raspberries.',
    price: 235000,
    category: 'sparkling-wine',
    tags: ['Champagne', 'Rose', 'French'],
    image: 'https://images.unsplash.com/photo-1549804947-0be5f5abbd47?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },
  {
    id: 702,
    name: 'Belaire Rose',
    description: 'Luc Belaire Rare Rose from Provence. Notes of strawberry and blackcurrant.',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Rose', 'Provence'],
    image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 703,
    name: 'Belaire Brut',
    description: 'Luc Belaire Rare Brut. Notes of apple and pear.',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Brut'],
    image: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 704,
    name: 'Belaire White',
    description: 'Luc Belaire Blanc de Blancs. Notes of peach and tropical fruits.',
    price: 130000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'White', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1586375e74-8c4548f2f8be?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 705,
    name: 'Martini',
    description: 'Martini Asti sweet sparkling wine. Notes of grapes and peach.',
    price: 40000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Sweet', 'Italian'],
    image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 706,
    name: 'Andre',
    description: 'Andre California sparkling wine. Notes of apple and pear.',
    price: 30000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'California'],
    image: 'https://images.unsplash.com/photo-154729b04-b2b5-41be-a28d-4e92d012e9b4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 707,
    name: 'Blue Nun Rose',
    description: 'Blue Nun Rose German sparkling wine. Notes of red berries.',
    price: 55000,
    category: 'sparkling-wine',
    tags: ['Sparkling', 'Rose', 'German'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
  },

  // ========== VODKA ==========
  {
    id: 801,
    name: 'Petrovskaia',
    description: 'Premium vodka. Clean, crisp taste.',
    price: 12000,
    category: 'spirits',
    tags: ['Vodka', 'Premium', 'Smooth'],
    image: 'https://images.unsplash.com/photo-160425izx59-0c8c4f6a3d5b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 802,
    name: 'Absolute Water Melon',
    description: 'Absolut vodka infused with watermelon flavor.',
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
    description: 'Shisha with two hoses for sharing. Available flavors: mint, grape, apple, watermelon, blueberry, and mixed fruit. Served with charcoal and ice.',
    price: 12000,
    category: 'shisha',
    tags: ['Shisha', 'Sharing'],
    image: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
  },
  {
    id: 902,
    name: 'Single Pipe',
    description: 'Classic single-hose shisha. Available flavors: mint, double apple, grape, watermelon, blueberry, and mixed fruit. Served with charcoal and ice.',
    price: 8000,
    category: 'shisha',
    tags: ['Shisha', 'Classic'],
    image: 'https://images.unsplash.com/photo-1606204642323-bd88a6ab97a4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 903,
    name: 'Special',
    description: 'Shisha served in a carved fresh fruit head (orange, pineapple, or watermelon) with tobacco. Specialty fruit flavors available.',
    price: 15000,
    category: 'shisha',
    tags: ['Shisha', 'Signature', 'Fruit'],
    image: 'https://images.unsplash.com/photo-1560iz8230-73b927fbdb87?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
  },

  // ========== FOOD (RETAINED) ==========
  {
    id: 1001,
    name: 'Suya Platter',
    description: 'Beef skewers seasoned with ground peanuts and spices, grilled. Served with onions, tomatoes, and cabbage.',
    price: 25000,
    category: 'food',
    tags: ['Nigerian', 'Spicy'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1002,
    name: 'Grilled Lobster',
    description: 'Atlantic lobster grilled with garlic butter and herbs. Served with butter sauce and vegetables.',
    price: 48000,
    category: 'food',
    tags: ['Seafood', 'Premium'],
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
    requiresFoodService: true,
  },
  {
    id: 1003,
    name: 'Wagyu Sliders',
    description: 'Three mini burgers with Wagyu beef patties, cheddar cheese, caramelized onions, and truffle mayo on brioche buns.',
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
    description: 'Prawns, oysters, lobster tails, and scallops served with cocktail sauce, mignonette, and lemon.',
    price: 95000,
    category: 'food',
    tags: ['Seafood', 'Sharing'],
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&auto=format&fit=crop&q=80',
    isSignature: true,
    requiresFoodService: true,
  },
  {
    id: 1005,
    name: 'Jollof Rice and Chicken',
    description: 'Jollof rice with grilled chicken and fried plantains.',
    price: 18000,
    category: 'food',
    tags: ['Nigerian', 'Local'],
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1006,
    name: 'Pepper Soup Platter',
    description: 'Nigerian pepper soup with goat meat or catfish, served with agidi or rice.',
    price: 22000,
    category: 'food',
    tags: ['Nigerian', 'Spicy', 'Soup'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1007,
    name: 'Truffle Fries',
    description: 'Hand-cut fries tossed in truffle oil and Parmesan, served with garlic aioli.',
    price: 12000,
    category: 'food',
    tags: ['Snack', 'Truffle', 'Side'],
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1008,
    name: 'Chicken Wings',
    description: 'Fried chicken wings tossed in your choice of sauce: spicy, BBQ, honey garlic, or lemon pepper. Served with ranch and celery.',
    price: 15000,
    category: 'food',
    tags: ['Wings', 'Snack'],
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=80',
    isPopular: true,
    requiresFoodService: true,
  },
  {
    id: 1009,
    name: 'Caesar Salad',
    description: 'Romaine lettuce with Caesar dressing, Parmesan, and croutons.',
    price: 14000,
    category: 'food',
    tags: ['Salad', 'Classic'],
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop&q=80',
    requiresFoodService: true,
  },
  {
    id: 1010,
    name: 'Grilled Lamb Chops',
    description: 'Lamb chops seasoned with rosemary, thyme, and garlic, grilled. Served with mint sauce and vegetables.',
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
