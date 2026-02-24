# D Cube's Place - Zone-Based Menu System Guide

## Overview

The ordering system now supports **multiple zones** with different menu availability. Each location in the venue belongs to a zone, and customers see only the items available in their current zone when they scan the QR code.

## Zones

| Zone | ID | Food Service | Description |
|------|-----|--------------|-------------|
| **Open Bar** | `open-bar` | ❌ No | Bar stools and standing tables - drinks only |
| **Lounge** | `lounge` | ✅ Yes | Regular tables and sofas - full menu |
| **Nightclub** | `nightclub` | ❌ No | Dance floor tables - drinks & bottle service |
| **VIP** | `vip` | ✅ Yes | Premium booths - full menu + bottle service |
| **Poolside** | `poolside` | ✅ Yes | Cabanas - drinks + light food |

## Location Types

Each physical spot has a unique ID and type:

- **BAR-01** to **BAR-12** - Bar stools (Open Bar)
- **ST-01** to **ST-06** - Standing tables (Open Bar)
- **T-001** to **T-020** - Lounge tables (Lounge)
- **LS-01** to **LS-08** - Lounge sofas (Lounge)
- **VIP-A** to **VIP-H** - VIP booths (VIP)
- **NF-01** to **NF-10** - Nightclub floor tables (Nightclub)
- **PC-01** to **PC-06** - Poolside cabanas (Poolside)

## QR Code Structure

### New Location-Based QR Codes
```
https://dcubesplace.com/order?location=T-001&zone=lounge
https://dcubesplace.com/order?location=BAR-05&zone=open-bar
https://dcubesplace.com/order?location=VIP-A&zone=vip
```

### Legacy Table-Based QR Codes (Backward Compatible)
```
https://dcubesplace.com/order?table=1
https://dcubesplace.com/order?table=15
```
> Legacy QR codes default to the **Lounge** zone with full menu access.

## Menu Categories by Zone

### Open Bar & Nightclub
- ✅ Soft Drinks, Energy Drinks, Beer
- ✅ Brandy, Wine, Liquor, Tequila
- ✅ Sparkling Wine, Cocktails, Non-Alcoholic
- ✅ Shisha, Cigarettes
- ❌ **No Food**

### Lounge, VIP & Poolside
- ✅ **All categories including Food**

## Generating QR Codes

1. Go to `/qr` route on the admin panel
2. Select **Zone-Based (New)** mode
3. Choose a zone filter (or "All Zones")
4. Select specific locations
5. Click "Print QR Codes"

Each QR code will show:
- Location name (e.g., "Bar Stool 5", "VIP Booth A")
- Zone icon and name
- "Drinks Only" badge for non-food zones

## Customer Experience

When a customer scans a QR code:

1. **Check-in Screen** shows:
   - Zone icon and name
   - Location name (e.g., "Bar Stool 3")
   - "Drinks Only" notice if applicable

2. **Menu Display**:
   - Only categories available in that zone are shown
   - Food items are hidden in non-food zones
   - Zone-specific banner at the top

3. **Staff Notifications**:
   - Orders include zone and location info
   - Kitchen only receives food orders from food-enabled zones

## Managing Locations

### File: `client/src/data/locations.ts`

To add or modify locations:

```typescript
{
  id: 'BAR-13',              // Unique identifier
  number: 13,                // Display number
  name: 'Bar Stool 13',      // Display name
  type: 'bar-stool',         // Location type
  zone: 'open-bar',          // Zone assignment
  availableMenus: ['bar', 'drinks-only'],
  canReceiveFood: false,     // Food delivery capability
  isActive: true,            // Active status
  capacity: 2                // Max capacity
}
```

### Zone Configuration

Modify zone settings in the same file:

```typescript
export const ZONES: Record<ZoneType, ZoneConfig> = {
  'open-bar': {
    id: 'open-bar',
    name: 'Open Bar',
    description: 'Casual bar seating with full drink selection',
    icon: '🍺',
    defaultMenus: ['bar', 'drinks-only'],
    allowFood: false,
    theme: {
      primaryColor: '#C9A84C',
      accentColor: '#1a1a1a'
    }
  },
  // ... other zones
};
```

## Menu Items

### File: `client/src/data/menu.ts`

All drinks from your price list have been added:

**Soft Drinks**: Bottle Water (₦500), Coke/Malt/Fayrouz (₦1,200), Hollandia/Chivita (₦4,000), 5 Alive (₦3,500)

**Energy Drinks**: Red Bull/Power Horse/Monster (₦3,500), Predator/Climax/Fearless (₦1,500)

**Brandy**: Hennessy VS (₦115,000), Hennessy VSOP (₦190,000), Remy VSOP (₦145,000), Martel VSOP (₦135,000), Martel Blueswift (₦165,000)

**Wine**: Four Cousins (₦25,000), Carlo Rossi (₦20,000), Agor (₦20,000)

**Liquor**: Baileys (₦35,000)

**Shisha**: Double Pipe (₦10,000), Single Pipe (₦7,000)

**Tequila**: Tequila Siera (₦55,000), Olmecca (₦60,000), Casamigos (₦390,000-₦425,000)

**Sparkling Wine**: Andre (₦30,000), Martini Rose (₦40,000), Belaire (₦130,000), Moet Rose (₦235,000)

**Beer**: Goldberg/Trophy/33/Desperado (₦1,800), Smirnoff Ice variants (₦1,800-₦2,500), Heineken/Budweiser/Legend (₦2,300), Stout variants (₦1,500-₦2,500)

**Cigarettes**: Dunhill (₦3,000), Benson/London/Oris/Rothmans/Bohem (₦2,000)

## Category Availability

Edit `ZONE_CATEGORIES` in `client/src/data/locations.ts`:

```typescript
export const ZONE_CATEGORIES: Record<ZoneType, string[]> = {
  'open-bar': ['soft-drinks', 'energy-drinks', 'beer', 'brandy', 'wine', 'liquor', 'tequila', 'sparkling-wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar'],
  'lounge': ['soft-drinks', 'energy-drinks', 'beer', 'brandy', 'wine', 'liquor', 'tequila', 'sparkling-wine', 'spirits', 'cocktails', 'nonalc', 'shisha', 'cigar', 'food'],
  // ... other zones
};
```

## Staff Dashboards

The existing staff dashboards (Manager, Kitchen, Bar) continue to work with the new system:

- **Kitchen Dashboard**: Only sees food orders from zones that allow food
- **Bar Dashboard**: Sees all drink orders from all zones
- **Manager Dashboard**: Sees all orders with zone/location indicators

## Technical Notes

- **Backward Compatible**: Old table-based QR codes continue to work
- **URL Parameters**: The system reads `?location=XXX&zone=YYY` or `?table=N`
- **Food Filtering**: Items with `requiresFoodService: true` are automatically hidden in non-food zones
- **Zone Detection**: If no zone is specified, defaults to `lounge`

## Troubleshooting

**Customer sees wrong menu?**
- Check the QR code URL has correct `location` and `zone` parameters
- Verify location exists in `LOCATIONS` array

**Food showing up in bar area?**
- Ensure `canReceiveFood: false` is set for bar locations
- Check `ZONE_CATEGORIES` doesn't include 'food' for that zone

**New location not showing?**
- Verify `isActive: true` in location config
- Regenerate QR codes after adding new locations
