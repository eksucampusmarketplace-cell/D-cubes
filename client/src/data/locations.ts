import type { Location, ZoneConfig, ZoneType, MenuType } from '@/types';

/** Zone configurations */
export const ZONES: Record<ZoneType, ZoneConfig> = {
  'open-bar': {
    id: 'open-bar',
    name: 'Open Bar',
    description: 'Casual bar seating with full drink selection and dining service',
    icon: '🍺',
    defaultMenus: ['bar', 'drinks-only'],
    allowFood: true,
    theme: {
      primaryColor: '#C9A84C',
      accentColor: '#1a1a1a'
    }
  },
  'lounge': {
    id: 'lounge',
    name: 'Lounge',
    description: 'Relaxed seating with full menu service',
    icon: '🛋️',
    defaultMenus: ['lounge', 'full'],
    allowFood: true,
    theme: {
      primaryColor: '#C9A84C',
      accentColor: '#2d1810'
    }
  },
  'nightclub': {
    id: 'nightclub',
    name: 'Nightclub',
    description: 'High energy area with drinks, bottle service, and dining',
    icon: '🎵',
    defaultMenus: ['nightclub', 'drinks-only'],
    allowFood: true,
    theme: {
      primaryColor: '#ff006e',
      accentColor: '#1a0a1a'
    }
  },
  'vip': {
    id: 'vip',
    name: 'VIP',
    description: 'Exclusive VIP booths with premium service',
    icon: '👑',
    defaultMenus: ['full', 'lounge', 'nightclub'],
    allowFood: true,
    theme: {
      primaryColor: '#ffd700',
      accentColor: '#1a1a1a'
    }
  },
  'poolside': {
    id: 'poolside',
    name: 'Poolside',
    description: 'Pool cabanas and outdoor seating with full service',
    icon: '🏊',
    defaultMenus: ['lounge', 'drinks-only'],
    allowFood: true,
    theme: {
      primaryColor: '#00d4ff',
      accentColor: '#0a1a1a'
    }
  }
};

/** Menu type display names */
export const MENU_TYPE_NAMES: Record<MenuType, string> = {
  'full': 'Full Menu',
  'drinks-only': 'Drinks Only',
  'bar': 'Bar Menu',
  'lounge': 'Lounge Menu',
  'nightclub': 'Nightclub Menu',
  'food': 'Food Menu'
};

/** Category availability by zone - all zones now have food */
export const ZONE_CATEGORIES: Record<ZoneType, string[]> = {
  'open-bar': ['soft-drinks', 'energy-drinks', 'beer', 'brandy', 'wine', 'liquor', 'tequila', 'sparkling-wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar', 'food'],
  'lounge': ['soft-drinks', 'energy-drinks', 'beer', 'brandy', 'wine', 'liquor', 'tequila', 'sparkling-wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar', 'food'],
  'nightclub': ['soft-drinks', 'energy-drinks', 'beer', 'brandy', 'wine', 'liquor', 'tequila', 'sparkling-wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar', 'food'],
  'vip': ['soft-drinks', 'energy-drinks', 'beer', 'brandy', 'wine', 'liquor', 'tequila', 'sparkling-wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar', 'food'],
  'poolside': ['soft-drinks', 'energy-drinks', 'beer', 'wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar', 'food']
};

/** Generate locations for the venue - all locations can receive food */
export function generateLocations(): Location[] {
  const locations: Location[] = [];

  // Open Bar Stools (BAR-01 to BAR-12)
  for (let i = 1; i <= 12; i++) {
    locations.push({
      id: `BAR-${String(i).padStart(2, '0')}`,
      number: i,
      name: `Bar Stool ${i}`,
      type: 'bar-stool',
      zone: 'open-bar',
      availableMenus: ['bar', 'drinks-only'],
      canReceiveFood: true,
      isActive: true,
      capacity: 2
    });
  }

  // Standing Tables near bar (ST-01 to ST-06)
  for (let i = 1; i <= 6; i++) {
    locations.push({
      id: `ST-${String(i).padStart(2, '0')}`,
      number: i,
      name: `Standing Table ${i}`,
      type: 'standing-table',
      zone: 'open-bar',
      availableMenus: ['bar', 'drinks-only'],
      canReceiveFood: true,
      isActive: true,
      capacity: 4
    });
  }

  // Lounge Tables (T-001 to T-020)
  for (let i = 1; i <= 20; i++) {
    locations.push({
      id: `T-${String(i).padStart(3, '0')}`,
      number: i,
      name: `Lounge Table ${i}`,
      type: 'table',
      zone: 'lounge',
      availableMenus: ['lounge', 'full'],
      canReceiveFood: true,
      isActive: true,
      capacity: 4
    });
  }

  // Lounge Seats/Sofas (LS-01 to LS-08)
  for (let i = 1; i <= 8; i++) {
    locations.push({
      id: `LS-${String(i).padStart(2, '0')}`,
      number: i,
      name: `Lounge Sofa ${i}`,
      type: 'lounge-seat',
      zone: 'lounge',
      availableMenus: ['lounge', 'full'],
      canReceiveFood: true,
      isActive: true,
      capacity: 6
    });
  }

  // VIP Booths (VIP-A to VIP-H)
  const vipLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  vipLabels.forEach((label) => {
    locations.push({
      id: `VIP-${label}`,
      number: label,
      name: `VIP Booth ${label}`,
      type: 'vip-booth',
      zone: 'vip',
      availableMenus: ['full', 'lounge', 'nightclub'],
      canReceiveFood: true,
      isActive: true,
      capacity: 8,
      notes: 'Premium bottle service available'
    });
  });

  // Nightclub Floor Tables (NF-01 to NF-10)
  for (let i = 1; i <= 10; i++) {
    locations.push({
      id: `NF-${String(i).padStart(2, '0')}`,
      number: i,
      name: `Nightclub Floor ${i}`,
      type: 'table',
      zone: 'nightclub',
      availableMenus: ['nightclub', 'drinks-only'],
      canReceiveFood: true,
      isActive: true,
      capacity: 6
    });
  }

  // Poolside Cabanas (PC-01 to PC-06)
  for (let i = 1; i <= 6; i++) {
    locations.push({
      id: `PC-${String(i).padStart(2, '0')}`,
      number: i,
      name: `Poolside Cabana ${i}`,
      type: 'poolside-cabana',
      zone: 'poolside',
      availableMenus: ['lounge', 'drinks-only'],
      canReceiveFood: true,
      isActive: true,
      capacity: 8
    });
  }

  return locations;
}

/** All locations */
export const LOCATIONS: Location[] = generateLocations();

/** Get location by ID */
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find(loc => loc.id === id);
}

/** Get location by number (for backward compatibility) */
export function getLocationByNumber(number: number): Location | undefined {
  return LOCATIONS.find(loc => loc.number === number && loc.zone === 'lounge');
}

/** Get locations by zone */
export function getLocationsByZone(zone: ZoneType): Location[] {
  return LOCATIONS.filter(loc => loc.zone === zone);
}

/** Check if a category is available in a zone */
export function isCategoryAvailableInZone(category: string, zone: ZoneType): boolean {
  return ZONE_CATEGORIES[zone]?.includes(category) ?? false;
}

/** Get zone display info */
export function getZoneInfo(zone: ZoneType): ZoneConfig {
  return ZONES[zone];
}

/** Legacy: Convert old table number to location ID */
export function tableNumberToLocationId(tableNumber: number): string {
  return `T-${String(tableNumber).padStart(3, '0')}`;
}

/** Legacy: Check if location ID is a legacy table */
export function isLegacyTable(locationId: string): boolean {
  return locationId.startsWith('T-') && !locationId.includes('-');
}
