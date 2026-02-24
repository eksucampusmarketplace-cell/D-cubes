# D Cubes Place - Engineering Memory

## Repository Overview
- **Type**: Full-stack ordering system for resort/lounge
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Socket.IO
- **Key Features**: QR code ordering, real-time updates, multi-role staff dashboards

## Architecture Patterns

### Client Structure
- `/client/src/pages` - Main page components (CustomerPage, ManagerDashboard, etc.)
- `/client/src/components` - Reusable UI components
- `/client/src/context` - React contexts (Socket, Cart, Table)
- `/client/src/data` - Static data (menu items, locations)
- `/client/src/types` - TypeScript type definitions

### State Management
- Context-based (no Redux)
- SocketContext handles WebSocket connection
- CartContext manages shopping cart
- TableContext manages guest session/location

### Backend Structure
- `/server/src/index.ts` - Main server with Socket.IO handlers
- `/server/src/types.ts` - Shared TypeScript types
- In-memory storage (orders, sessions, messages)
- Telegram bot integration for notifications

## Naming Conventions
- Components: PascalCase (e.g., `CustomerPage.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTable`)
- Types/Interfaces: PascalCase (e.g., `MenuItem`, `OrderStatus`)
- Constants: UPPER_SNAKE_CASE for exports

## Key Files for Menu/Location Management

### Adding/Modifying Menu Items
**File**: `client/src/data/menu.ts`
```typescript
{
  id: 100,
  name: 'Item Name',
  description: 'Description',
  price: 10000,
  category: 'beer', // Use existing or add new
  tags: ['Tag1', 'Tag2'],
  image: 'https://...',
  isPopular: true,  // optional
  isSignature: true, // optional
  requiresFoodService: true // for food items
}
```

### Adding/Modifying Locations
**File**: `client/src/data/locations.ts`
```typescript
{
  id: 'BAR-13',
  number: 13,
  name: 'Bar Stool 13',
  type: 'bar-stool',
  zone: 'open-bar',
  availableMenus: ['bar', 'drinks-only'],
  canReceiveFood: false,
  isActive: true,
  capacity: 2
}
```

### Category Management
Categories are defined in:
- `client/src/data/menu.ts` - `CATEGORY_NAMES` and `CATEGORY_ICONS`
- `client/src/data/locations.ts` - `ZONE_CATEGORIES`

## Zone System
- **open-bar**: Drinks only (bar stools, standing tables)
- **lounge**: Full menu (tables, sofas)
- **nightclub**: Drinks only (dance floor)
- **vip**: Full menu (VIP booths)
- **poolside**: Drinks + light food (cabanas)

## QR Code URL Formats
- New: `?location=T-001&zone=lounge`
- Legacy: `?table=1` (defaults to lounge)

## Build Commands
```bash
# Install all dependencies
npm run install-all

# Build client only
cd client && npm run build

# Build server only
cd server && npx tsc

# Type check only
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

## Common Issues & Solutions

### TypeScript errors about unused variables
- The build still succeeds, but fix for cleanliness
- Use underscore prefix for intentionally unused params: `_idx`

### Food items showing in wrong zones
- Check `canReceiveFood` in location config
- Check `ZONE_CATEGORIES` for that zone
- Verify item has `category: 'food'`

### New menu items not appearing
- Check `availableCategories` in CustomerPage
- Verify category is in `ZONE_CATEGORIES` for the zone
- Check if item is filtered out by `requiresFoodService`

## Extension Points

### Adding a New Zone
1. Add to `ZoneType` in `types/index.ts`
2. Add zone config in `client/src/data/locations.ts` (`ZONES`)
3. Add categories to `ZONE_CATEGORIES`
4. Add zone icon/color handling in CustomerPage

### Adding a New Category
1. Add to `MenuItem.category` type union
2. Add to `CATEGORY_NAMES` and `CATEGORY_ICONS`
3. Update `ZONE_CATEGORIES` for applicable zones
4. Add category image to `CATEGORY_IMAGES` config

### Adding a New Location Type
1. Add to `LocationType` in types
2. Update zone assignment logic in `generateLocations()`
3. Add display handling in CheckInScreen

## Integration Points
- Telegram bot notifications for orders
- QR code generation at `/qr` route
- Real-time updates via Socket.IO
- Payment tracking (unpaid/partial/paid/refunded)
