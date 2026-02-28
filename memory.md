# D Cubes Place - Engineering Memory

## Repository Overview
- **Type**: Full-stack ordering system for resort/lounge
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Socket.IO
- **Database**: Supabase (PostgreSQL) with in-memory fallback
- **Key Features**: QR code ordering, real-time updates, multi-role staff dashboards, inventory management, receipts

## Architecture Patterns

### Client Structure
- `/client/src/pages` - Main page components (CustomerPage, ManagerDashboard, etc.)
- `/client/src/components` - Reusable UI components
- `/client/src/context` - React contexts (Socket, Cart, Table, Settings)
- `/client/src/data` - Static data (menu items, locations)
- `/client/src/types` - TypeScript type definitions

### State Management
- Context-based (no Redux)
- SocketContext handles WebSocket connection
- CartContext manages shopping cart
- TableContext manages guest session/location
- SettingsContext manages dark mode, sounds, preferences

### Backend Structure
- `/server/src/index.ts` - Main server with Socket.IO handlers
- `/server/src/types.ts` - Shared TypeScript types
- `/server/src/database.ts` - Supabase database integration
- In-memory storage with Supabase sync (orders, sessions, messages)
- Telegram bot integration for notifications

## New Features (2024)

### Database & Storage
- **Supabase Integration**: Full PostgreSQL persistence with auto-fallback to in-memory
- **Data Backup**: Export all data for backup via `/api/backup`
- **Storage Stats**: Monitor database size via `/api/storage-stats`
- **Configurable Retention**: Data auto-cleanup after specified hours (default 24h)

### Inventory Management
- Toggle item availability in Admin Panel
- Out-of-stock items show "Unavailable" to customers
- Real-time inventory sync across all clients
- Socket event: `inventory-update`

### Receipt Generation
- Digital receipts generated from orders
- 2-hour expiration with auto-cleanup
- HTML receipt view for printing/sharing
- API: `POST /api/receipts`, `GET /api/receipts/:id/html`

### Security Enhancements
- **Rate Limiting**: 100 requests/minute per IP by default
- **Audit Logging**: All actions logged with timestamp, actor, IP
- **IP Whitelisting**: Optional restriction for staff routes
- Environment variables: `IP_WHITELIST_ENABLED`, `WHITELISTED_IPS`

### UI/UX Improvements
- **Dark/Light Mode**: Toggle in Settings (SettingsContext)
- **Order Sounds**: Audio alerts for new orders/messages
- **Keyboard Shortcuts**: Quick actions in staff dashboards
- **Quick Notes**: Pre-defined order notes templates

### Telegram Notifications
- **Configurable Events**: Toggle each notification type
- Events: newOrder, orderStatus, payment, refund, accessRequest, chat, session
- Socket event: `update-telegram-config`
- API: `GET/POST /api/telegram-config`

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
  requiresFoodService: true, // for food items
  isAvailable: true, // NEW: inventory status
  stockQuantity: null // NEW: null = unlimited
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

## Environment Variables

### Server (.env)
```env
# Core
PORT=5000
CLIENT_URL=http://localhost:3000

# Telegram
TELEGRAM_BOT_TOKEN=xxx
KITCHEN_CHAT_ID=xxx
BAR_CHAT_ID=xxx
MANAGER_CHAT_ID=xxx

# Database (Supabase)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx

# Security
IP_WHITELIST_ENABLED=false
WHITELISTED_IPS=127.0.0.1

# Staff PINs
STAFF_MANAGER_PIN=0000
STAFF_KITCHEN_PIN=1111
STAFF_BAR_PIN=2222
```

## Alert/Notification System (Staff Dashboards)
All three staff dashboards (Manager, Kitchen, Bar) now have:
- `newOrderAlert` state + 5-second auto-dismiss banner at top of page
- Web Audio API tone using oscillator (no external audio files needed)
- `playAlertTone()` using `AudioContext` ref to avoid recreation
- Alert banner is color-coded: Manager=red, Kitchen=orange, Bar=blue

## Dashboard Data Recovery on Refresh
All staff dashboards fetch initial data on mount via REST APIs:
- Manager: orders, access-requests, refund-requests, sessions, messages
- Kitchen: orders (food items only), messages
- Bar: orders (bar items only), messages

Customer TableContext fetches messages for the current table on check-in (tableNumber + isCheckedIn dependency).

## Session End Handling (Customer Side)
`TableContext` now listens to `session-ended-client` and calls `setIsCheckedIn(false)` + `clearPersistedSession()` so the customer's UI properly resets when staff ends their session.

## Manager Dashboard
- Sidebar navigation buttons are now fully functional with `activeView` state ('orders' | 'tables' | 'messages')
- Stats cards are clickable and navigate to the relevant view
- "Tonight's Revenue" stat shows real order count instead of hardcoded "18% vs last Friday"
- Chat tab has a table selector showing all tables with conversation history
- Duplicate order guard: `if (prev.some(o => o.id === order.id)) return prev` on new-order

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
- Check inventory status (`isAvailable`)

### Multiple guests on same table
- Each guest gets unique `guestId`
- All guests share same `sessionId`
- Orders linked to both `guestId` and `sessionId`
- Staff sees guest count per table

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

## Socket Events (Complete List)

### Client → Server
- `check-in` - Guest checks in
- `new-order` - Place an order
- `access-request` - Request access/assistance
- `chat-message` - Send chat message
- `update-order-status` - Staff updates order status
- `update-payment` - Staff updates payment status
- `request-refund` - Customer requests refund
- `process-refund` - Staff approves/denies refund
- `cancel-order` - Staff cancels pending order
- `access-response` - Staff responds to access request
- `end-session` - Staff ends table session (turnover)
- `update-inventory` - Toggle item availability
- `update-telegram-config` - Update notification settings
- `generate-receipt` - Create receipt for order

### Server → Client
- `new-order` - New order received
- `order-status-update` - Order status changed
- `check-in` - Guest checked in
- `check-in-success` - Check-in successful
- `access-request` - New access request
- `access-response` - Access request response
- `new-message` - New chat message
- `payment-update` - Payment status changed
- `refund-request` - New refund request
- `refund-processed` - Refund approved/denied
- `order-cancelled` - Order cancelled
- `session-ended` - Session ended (for staff)
- `session-ended-client` - Session ended (for guests)
- `session-receipt` - Final bill receipt generated
- `guest-left` - Guest left table
- `table-inactive` - All guests left table
- `inventory-update` - Item availability changed
- `telegram-config` - Telegram notification settings
- `receipt-generated` - Receipt created

## Bar/Drink Category List (canonical - must stay in sync across all files)
```
['cocktails', 'spirits', 'wine', 'nonalc', 'brandy', 'tequila', 'sparkling-wine', 'liquor', 'mixers', 'energy-drinks', 'beer', 'shisha']
```
Files that use this list:
- `server/src/index.ts` - new-order routing to staff-bar, order-status-update routing
- `client/src/pages/BarDashboard.tsx` - BAR_CATEGORIES constant
- `client/src/components/CartPanel.tsx` - drinkItems filter for routing preview
- `client/src/context/TableContext.tsx` - allDrinkCategories in zoneCategoryMap

## API Endpoints

### Core
- `GET /api/health` - Health check
- `GET /api/qr/:tableNumber?zone=lounge` - Generate QR code (zone param optional, defaults to lounge)
- `GET /api/analytics` - Sales analytics
- `GET /api/table/:tableNumber` - Table session info

### Dashboard Recovery (new)
- `GET /api/orders` - Get active (non-completed) orders
- `GET /api/orders/all` - Get all orders including completed
- `GET /api/sessions` - Get active table sessions
- `GET /api/access-requests` - Get pending access requests
- `GET /api/refund-requests` - Get pending refund requests
- `GET /api/messages` - Get all chat messages
- `GET /api/messages/:tableNumber` - Get messages for a table

### Inventory
- `GET /api/inventory` - Get inventory status
- `POST /api/inventory` - Update item availability

### Receipts
- `GET /api/receipts` - List active receipts
- `GET /api/receipts/:id` - Get receipt by ID
- `GET /api/receipts/:id/html` - HTML receipt view
- `POST /api/receipts` - Create receipt from order

### Configuration
- `GET /api/telegram-config` - Get notification settings
- `POST /api/telegram-config` - Update notification settings
- `GET /api/audit-logs` - Get audit logs
