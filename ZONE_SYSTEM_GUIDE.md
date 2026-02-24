# D Cube's Place - Zone-Based Menu System Guide

## Overview

The ordering system supports **multiple zones** with different pricing. The **Lounge** zone has special pricing as specified in your menu list. All zones now support **full food service**.

## Zones

| Zone | ID | Description | Special Pricing |
|------|-----|-------------|-----------------|
| **Open Bar** | `open-bar` | Casual bar seating and standing tables | Standard prices |
| **Lounge** | `lounge` | Relaxed seating with premium service | **Custom Lounge prices** |
| **Nightclub** | `nightclub` | High energy dance floor area | Standard prices |
| **VIP** | `vip` | Exclusive VIP booths | Standard prices |
| **Poolside** | `poolside` | Pool cabanas and outdoor seating | Standard prices |

## Location Types

Each physical spot has a unique ID:

- **BAR-01** to **BAR-12** - Bar stools (Open Bar)
- **ST-01** to **ST-06** - Standing tables (Open Bar)
- **T-001** to **T-020** - Lounge tables (Lounge)
- **LS-01** to **LS-08** - Lounge sofas (Lounge)
- **VIP-A** to **VIP-H** - VIP booths (VIP)
- **NF-01** to **NF-10** - Nightclub floor tables (Nightclub)
- **PC-01** to **PC-06** - Poolside cabanas (Poolside)

## Zone-Specific Pricing

### Lounge Prices (as specified in your menu)

**Brandy:**
- Hennessy VS: ₦115,000
- Hennessy VSOP: ₦190,000
- Remy Martins XO: ₦480,000
- Remy Martins VSOP: ₦145,000
- Martel XO: ₦610,000
- Martel Blueswift: ₦165,000

**Whisky:**
- Glendiffich 21: ₦570,000
- Glendiffich 18: ₦270,000
- Glendiffich 15: ₦180,000
- Blue Label: ₦405,000
- Red Label: ₦35,000
- Black Label: ₦80,000
- Jack Daniels: ₦70,000
- Jack Daniels (1L): ₦65,000
- Jameson Black: ₦45,000
- Jameson Green: ₦80,000
- Ciroc: ₦80,000
- Black Stone Gold: ₦40,000

**Tequila:**
- Tequila Siera: ₦55,000
- Olmecca White/Chocolate: ₦60,000
- Casamigos Black/Gold/White: ₦390,000
- Casamigos White (1L): ₦425,000
- Don Julio: ₦700,000
- Azul: ₦650,000

**Liquor:**
- Baileys: ₦35,000

**Mixers:**
- Cranberry: ₦12,000
- Red Bull: ₦4,000
- Power Horse: ₦4,000
- Monster: ₦4,000
- Water: ₦700
- Coke: ₦1,500
- Schweppes: ₦1,000
- Hollandia: ₦4,000
- Malt Drink: ₦2,000

**Red Wine:**
- Carlo Rossi: ₦20,000
- Four Cousin Red: ₦25,000
- Agor: ₦20,000

**Sparkling Wine:**
- Moet Rose: ₦235,000
- Belaire Rose/Brut/White: ₦130,000
- Martini: ₦40,000
- Andre: ₦30,000
- Blue Nun Rose: ₦55,000

**Vodka:**
- Petrovskaia: ₦12,000
- Absolute Water Melon: ₦8,000

**Shisha:**
- Double Pipe: ₦12,000
- Single Pipe: ₦8,000
- Special: ₦15,000

### Other Zones (Open Bar, Nightclub, VIP, Poolside)

These zones use standard prices (as defined in the base menu items). You can set custom prices for these zones by adding entries to `ZONE_PRICES` in `client/src/data/menu.ts`.

## QR Code Structure

### Location-Based QR Codes
```
https://dcubesplace.com/order?location=T-001&zone=lounge
https://dcubesplace.com/order?location=BAR-05&zone=open-bar
https://dcubesplace.com/order?location=VIP-A&zone=vip
```

### Legacy Table-Based QR Codes (Backward Compatible)
```
https://dcubesplace.com/order?table=1
```
> Legacy QR codes default to the **Lounge** zone with Lounge pricing.

## Menu Categories

The menu is organized into elegant categories:

1. **Brandy** - Fine cognacs and brandies
2. **Whisky and Vodka** - Premium spirits
3. **Tequila** - Mexican agave spirits
4. **Liquor** - Cream liqueurs and specialty spirits
5. **Mixers and Soft Drinks** - Juices, sodas, and water
6. **Energy Drinks** - Red Bull, Monster, etc.
7. **Red Wine** - Fine red wines
8. **Sparkling Wine and Champagne** - Celebratory bubbles
9. **Shisha** - Premium hookah experiences
10. **Cuisine** - Food menu

## Generating QR Codes

1. Go to `/qr` route on the admin panel
2. Select **Zone-Based (New)** mode
3. Choose a zone filter (or "All Zones")
4. Select specific locations
5. Click "Print QR Codes"

Each QR code shows:
- Location name (e.g., "Lounge Table 5", "VIP Booth A")
- Zone icon and name
- Price differences are automatic based on zone

## Customer Experience

When a customer scans a QR code:

1. **Check-in Screen** shows:
   - Zone icon and name
   - Location name (e.g., "Bar Stool 3")
   - Elegant welcome message

2. **Menu Display**:
   - Shows items with **zone-specific prices**
   - Lounge customers see Lounge prices
   - Other zones see standard prices
   - Beautiful descriptions without dashes

3. **Food Service**: Available at **all locations**

## Beautiful Descriptions

Each item has a luxurious description written without dashes:

Example:
> "A remarkable blend of over 40 distinct eaux de vie, aged in French oak barrels to create a bold, fragrant cognac with notes of toasted almond and fresh grapes"

> "Don Julio 1942, an ultra premium anejo tequila crafted in honor of the founder's legacy, aged for at least two and a half years with notes of tropical fruit and spice"

## Adding Zone-Specific Prices

To set custom prices for a zone, edit `client/src/data/menu.ts`:

```typescript
export const ZONE_PRICES: Partial<Record<ZoneType, Record<number, number>>> = {
  lounge: {
    101: 115000, // Hennessy VS Lounge price
    102: 190000, // Hennessy VSOP Lounge price
    // ... more items
  },
  'open-bar': {
    // Add Open Bar specific prices here
  },
  nightclub: {
    // Add Nightclub specific prices here
  }
};
```

The item ID corresponds to the `id` field in the MENU_ITEMS array.

## Staff Dashboards

The existing staff dashboards continue to work:

- **Kitchen Dashboard**: Receives all food orders from all zones
- **Bar Dashboard**: Receives all drink orders from all zones
- **Manager Dashboard**: Sees all orders with zone/location indicators and correct prices

## Managing the Menu

### File: `client/src/data/menu.ts`

**To add a new item:**
```typescript
{
  id: 1001,
  name: 'Item Name',
  description: 'Beautiful description without dashes, using elegant flowing language',
  price: 50000, // Base price for non-Lounge zones
  category: 'spirits',
  tags: ['Premium', 'Smooth'],
  image: 'https://...',
  isPopular: true,  // optional
  isSignature: true, // optional
}
```

**To set Lounge price:**
Add to `ZONE_PRICES.lounge`:
```typescript
lounge: {
  1001: 55000, // Lounge-specific price
}
```

## Food is Available Everywhere

All locations now support food delivery:
- Bar stools and standing tables
- Nightclub floor tables
- Poolside cabanas
- VIP booths
- Lounge tables and sofas

The kitchen will receive orders from all zones.

## Technical Notes

- **Price Resolution**: `getItemPrice(item, zone)` checks ZONE_PRICES first, falls back to base price
- **Backward Compatible**: Old table-based QR codes default to Lounge pricing
- **URL Parameters**: `?location=XXX&zone=YYY` determines pricing
- **No Price Display**: If no zone price exists, base price is shown

## Summary of Changes

1. ✅ Food delivery enabled at all 52 locations
2. ✅ Lounge-specific pricing implemented
3. ✅ Beautiful, dash-free descriptions
4. ✅ Elegant category organization
5. ✅ Zone-specific price display in UI
6. ✅ QR generator updated for location-based codes
