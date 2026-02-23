import { MenuItem } from '@/types';

export const MENU_ITEMS: MenuItem[] = [
  // COCKTAILS
  {
    id: 1,
    name: 'Lagos Sunset',
    description: 'Campari, blood orange, prosecco, basil',
    price: 8500,
    category: 'cocktails',
    tags: ['Signature']
  },
  {
    id: 2,
    name: 'Velour Noir',
    description: 'Dark rum, activated charcoal, coconut, lime',
    price: 12000,
    category: 'cocktails',
    tags: ['Signature', 'Strong']
  },
  {
    id: 3,
    name: 'Gold Rush',
    description: 'Bourbon, lemon, honey, ginger',
    price: 9500,
    category: 'cocktails',
    tags: ['Classic']
  },
  {
    id: 4,
    name: 'Afro Spritz',
    description: 'Zobo, aperol, sparkling water, mint',
    price: 7500,
    category: 'cocktails',
    tags: ['Light']
  },
  {
    id: 5,
    name: 'Midnight Velvet',
    description: 'Mezcal, blackberry, vanilla, lime',
    price: 11000,
    category: 'cocktails',
    tags: ['Signature']
  },
  {
    id: 6,
    name: 'Nigerian Mule',
    description: 'Ginger beer, lime, angostura bitters',
    price: 8000,
    category: 'cocktails',
    tags: ['Classic']
  },

  // SPIRITS & BOTTLES
  {
    id: 10,
    name: 'Hennessy VS',
    description: 'Bottle service — cognac (700ml)',
    price: 85000,
    category: 'spirits',
    tags: ['Bottle']
  },
  {
    id: 11,
    name: 'D\'Ussé VSOP',
    description: 'Bottle service — premium cognac (750ml)',
    price: 95000,
    category: 'spirits',
    tags: ['Bottle']
  },
  {
    id: 12,
    name: 'Don Julio 1942',
    description: 'Bottle service — aged tequila (750ml)',
    price: 180000,
    category: 'spirits',
    tags: ['Bottle', 'Premium']
  },
  {
    id: 13,
    name: 'Johnnie Walker Blue Label',
    description: 'Bottle service — blended scotch (750ml)',
    price: 120000,
    category: 'spirits',
    tags: ['Bottle']
  },
  {
    id: 14,
    name: 'Macallan 18 Year',
    description: 'Bottle service — single malt whisky (700ml)',
    price: 250000,
    category: 'spirits',
    tags: ['Bottle', 'Premium']
  },
  {
    id: 15,
    name: 'Cîroc Vodka',
    description: 'Bottle service — premium vodka (750ml)',
    price: 65000,
    category: 'spirits',
    tags: ['Bottle']
  },
  {
    id: 16,
    name: 'Remy Martin XO',
    description: 'Bottle service — cognac (700ml)',
    price: 150000,
    category: 'spirits',
    tags: ['Bottle', 'Premium']
  },

  // WINE & CHAMPAGNE
  {
    id: 20,
    name: 'Dom Pérignon 2013',
    description: 'Champagne, France — bottle',
    price: 180000,
    category: 'wine',
    tags: ['Champagne']
  },
  {
    id: 21,
    name: 'Whispering Angel',
    description: 'Provence Rosé — bottle (2022)',
    price: 65000,
    category: 'wine',
    tags: ['Rosé']
  },
  {
    id: 22,
    name: 'Moët & Chandon Brut',
    description: 'Champagne, France — bottle',
    price: 75000,
    category: 'wine',
    tags: ['Champagne']
  },
  {
    id: 23,
    name: 'Veuve Clicquot',
    description: 'Yellow Label Champagne — bottle',
    price: 90000,
    category: 'wine',
    tags: ['Champagne']
  },
  {
    id: 24,
    name: 'Cloudy Bay Sauvignon Blanc',
    description: 'Marlborough, New Zealand — bottle',
    price: 45000,
    category: 'wine',
    tags: ['White Wine']
  },
  {
    id: 25,
    name: 'Meiomi Pinot Noir',
    description: 'California — bottle',
    price: 55000,
    category: 'wine',
    tags: ['Red Wine']
  },

  // FOOD
  {
    id: 30,
    name: 'Suya Platter',
    description: 'Grilled beef suya, onions, tomatoes, spiced groundnut',
    price: 25000,
    category: 'food',
    tags: ['Popular', 'Nigerian']
  },
  {
    id: 31,
    name: 'Grilled Lobster',
    description: 'Whole lobster, garlic butter, lemon, herbs',
    price: 48000,
    category: 'food',
    tags: ['Premium', 'Seafood']
  },
  {
    id: 32,
    name: 'Wagyu Sliders',
    description: '3 mini wagyu burgers, truffle mayo, caramelised onion',
    price: 32000,
    category: 'food',
    tags: ['Popular', 'Burger']
  },
  {
    id: 33,
    name: 'Seafood Tower',
    description: 'Oysters, prawns, lobster, scallops — serves 4',
    price: 95000,
    category: 'food',
    tags: ['Sharing', 'Premium']
  },
  {
    id: 34,
    name: 'Jollof Rice & Chicken',
    description: 'Premium smoked jollof rice, grilled chicken, plantain',
    price: 18000,
    category: 'food',
    tags: ['Local', 'Nigerian']
  },
  {
    id: 35,
    name: 'Pepper Soup Platter',
    description: 'Goat meat and catfish pepper soup, served hot',
    price: 22000,
    category: 'food',
    tags: ['Nigerian', 'Spicy']
  },
  {
    id: 36,
    name: 'Truffle Fries',
    description: 'Hand-cut fries, truffle oil, parmesan, herbs',
    price: 12000,
    category: 'food',
    tags: ['Snack']
  },
  {
    id: 37,
    name: 'Chicken Wings',
    description: 'Spicy or BBQ glazed wings, ranch dip',
    price: 15000,
    category: 'food',
    tags: ['Snack', 'Popular']
  },
  {
    id: 38,
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan, anchovy dressing',
    price: 14000,
    category: 'food',
    tags: ['Salad']
  },
  {
    id: 39,
    name: 'Grilled Lamb Chops',
    description: 'Herb-crusted lamb, mint sauce, seasonal vegetables',
    price: 42000,
    category: 'food',
    tags: ['Premium']
  },

  // SHISHA
  {
    id: 40,
    name: 'Double Apple',
    description: 'Classic double apple flavour — 1 hour',
    price: 15000,
    category: 'shisha',
    tags: ['Classic']
  },
  {
    id: 41,
    name: 'Gummy Bear',
    description: 'Fruity mixed flavour — 1 hour',
    price: 18000,
    category: 'shisha',
    tags: ['Popular']
  },
  {
    id: 42,
    name: 'Lemon Mint',
    description: 'Fresh lemon with cool mint — 1 hour',
    price: 15000,
    category: 'shisha',
    tags: ['Refreshing']
  },
  {
    id: 43,
    name: 'Blue Mist',
    description: 'Blueberry, mint, grape blend — 1 hour',
    price: 20000,
    category: 'shisha',
    tags: ['Premium']
  },
  {
    id: 44,
    name: 'Paan Shot',
    description: 'Traditional Indian paan flavour — 1 hour',
    price: 18000,
    category: 'shisha',
    tags: ['Exotic']
  },
  {
    id: 45,
    name: 'Velour Special',
    description: 'Custom blend with fresh fruits — 1 hour',
    price: 25000,
    category: 'shisha',
    tags: ['Signature', 'Premium']
  },

  // NON-ALCOHOLIC
  {
    id: 50,
    name: 'Virgin Mojito',
    description: 'Lime, mint, sugar, soda water',
    price: 5500,
    category: 'nonalc',
    tags: ['Mocktail']
  },
  {
    id: 51,
    name: 'Zobo Punch',
    description: 'Hibiscus, ginger, pineapple, sparkling water',
    price: 4500,
    category: 'nonalc',
    tags: ['Local', 'Nigerian']
  },
  {
    id: 52,
    name: 'Mango Lassi',
    description: 'Fresh mango, yoghurt, cardamom',
    price: 5000,
    category: 'nonalc',
    tags: ['Smoothie']
  },
  {
    id: 53,
    name: 'Tropical Cooler',
    description: 'Pineapple, coconut, lime, mint',
    price: 6000,
    category: 'nonalc',
    tags: ['Mocktail']
  },
  {
    id: 54,
    name: 'Elderflower Spritz',
    description: 'Elderflower cordial, soda, cucumber, mint',
    price: 5500,
    category: 'nonalc',
    tags: ['Mocktail', 'Refreshing']
  },
  {
    id: 55,
    name: 'Fresh Juice',
    description: 'Orange, pineapple or watermelon — fresh squeezed',
    price: 4000,
    category: 'nonalc',
    tags: ['Fresh']
  },
];

export const CATEGORY_NAMES: Record<string, string> = {
  all: 'Full Menu',
  cocktails: 'Cocktails',
  spirits: 'Spirits & Bottles',
  wine: 'Wine & Champagne',
  food: 'Food',
  shisha: 'Shisha',
  nonalc: 'Non-Alcoholic'
};

export const CATEGORY_ICONS: Record<string, string> = {
  cocktails: '🍸',
  spirits: '🥃',
  wine: '🍷',
  food: '🍽️',
  shisha: '💨',
  nonalc: '🧃'
};
