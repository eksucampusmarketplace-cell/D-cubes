# D Cubes Place — Resort & Lounge Ordering System

A premium ordering system for resorts and lounges featuring optional QR code-based table detection, real-time communication, Telegram integration, multi-role staff dashboards, and comprehensive management features including returns, refunds, payment tracking, analytics, and session management.

## Features

### Customer Experience (Mobile-First)
- **Optional QR Code Check-in**: Table-specific access via QR codes, or browse the full menu directly
- **Luxury Menu**: Browse cocktails, spirits, wine, food, shisha, and non-alcoholic beverages
- **Cart & Ordering**: Add items, adjust quantities, add special notes
- **Real-time Order Tracking**: Pending → Confirmed → Preparing → Ready → On Its Way → Delivered
- **Access Requests**: Swimming Pool, Lounge Entry, Night Club, Casino, Gym, Laundry Services, Call Waiter, Extra Ice, Bill Request
- **Two-way Chat**: Direct messaging with staff
- **Nigerian Naira (₦)** currency support

### Enhanced Management Features

#### Payment & Refunds
- **Payment Tracking**: Track order payment status (unpaid, partial, paid, refunded)
- **Mark as Paid**: One-click payment confirmation by staff
- **Refund Requests**: Customers can request returns for drinks
- **Refund Processing**: Staff approve/deny refunds with reason tracking
- **Order Cancellation**: Cancel pending orders before preparation
- **Refund Analytics**: Track total refunds and reasons

#### Table & Session Management
- **Multi-Guest Sessions**: Multiple guests can join same table
- **Individual Guest Tracking**: Unique IDs for each guest at a table
- **Split Orders**: Multiple orders from same table, separately trackable
- **Session Turnover**: Clean end-of-session handling
- **Guest Notifications**: Notify when guests leave/join table
- **Table Status**: Clear indication of table availability

#### Analytics Dashboard
- **Revenue Analytics**: Total revenue, order count, average order value
- **Product Performance**: Top-selling items by quantity and revenue
- **Category Breakdown**: Sales by category (cocktails, food, etc.)
- **Hourly Sales**: Peak hours identification
- **Table Performance**: Top tables by revenue and orders
- **Real-time Updates**: Auto-refresh every 60 seconds

#### Security
- **PIN Authentication**: Role-specific PIN codes for staff dashboards
- **Route Protection**: Secure access to manager, kitchen, and bar views
- **Session Expiration**: Auto-logout after 8 hours
- **Access Logging**: Track all staff authentication attempts

### Staff Dashboards
- **Manager Dashboard**: Full overview, all orders, access requests, table grid, chat, Telegram feed, live stats
- **Kitchen Display**: Food orders only, large readable cards, status updates
- **Bar Display**: Drinks & shisha orders, categorized by type

### Technical Features
- **Real-time**: WebSockets for instant sync across all devices
- **Telegram Integration**: Automatic notifications to Kitchen, Bar, and Manager bots
- **QR Code Generation**: Auto-generate printable QR codes for tables 1-50
- **Dark Luxury Aesthetic**: Black, gold, cream theme with Cormorant Garamond & DM Sans fonts

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Telegram Bot Token (optional but recommended)

### Installation

```bash
# Install all dependencies
npm run install-all

# Or manually:
cd client && npm install
cd ../server && npm install
```

### Configuration

1. Copy the environment file:
```bash
cd server
cp .env.example .env
```

2. Edit `.env` with your Telegram bot token and chat IDs:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
KITCHEN_CHAT_ID=your_kitchen_chat_id
BAR_CHAT_ID=your_bar_chat_id
MANAGER_CHAT_ID=your_manager_chat_id
```

To get Telegram chat IDs:
- Message @BotFather to create a bot and get your token
- Message @userinfobot to get your personal chat ID
- Create groups for Kitchen, Bar, and Manager, add your bot, then use @getidsbot to get group chat IDs

### Running the Application

```bash
# Run both client and server
npm run dev

# Or separately:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

### Accessing the App

- **Customer Page**: `http://localhost:3000/order` (add `?table=N` for table-specific access)
- **Manager Dashboard**: `http://localhost:3000/manager` (PIN: 0000)
- **Kitchen Display**: `http://localhost:3000/kitchen` (PIN: 1111)
- **Bar Display**: `http://localhost:3000/bar` (PIN: 2222)
- **QR Generator**: `http://localhost:3000/qr` (No PIN required)

**Note:** Default PINs are for development only. Change them in `.env` before production deployment.

## Usage

### For Customers
1. Visit the ordering page (directly or via QR code on your table)
2. Enter your name to check in
3. Browse the menu and add items to cart
4. Add any special requests in the notes
5. Send order to staff
6. Track your order status in real-time
7. Chat with staff if needed

### For Staff

**Manager:**
- Monitor all tables and orders
- Grant/deny access requests
- Chat with guests at any table
- View Telegram notifications
- Update order statuses

**Kitchen:**
- See food orders only
- Mark orders as "Being Prepared" → "Ready"
- Clear, large-text display optimized for kitchen screens

**Bar:**
- See drinks & shisha orders only
- Orders grouped by category (Cocktails, Bottles, Shisha, Non-alcoholic)
- Mark orders as "Being Prepared" → "Ready"

## QR Code Setup

Visit `/qr` to generate QR codes for all tables. Features:
- Set custom base URL
- Select table range (e.g., 1-50)
- Print-ready layout
- Download individual QR codes via API: `/api/qr/1`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/qr/:tableNumber` - Generate QR code for table
- `GET /api/analytics` - Get sales and performance analytics
- `GET /api/table/:tableNumber` - Get table session information

## WebSocket Events

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

### Server → Client
- `new-order` - New order received
- `order-status-update` - Order status changed
- `check-in` - Guest checked in (includes guest count)
- `check-in-success` - Check-in successful (includes guest ID, session ID)
- `access-request` - New access request
- `access-response` - Access request response
- `new-message` - New chat message
- `payment-update` - Payment status changed
- `refund-request` - New refund request
- `refund-processed` - Refund approved/denied
- `order-cancelled` - Order cancelled
- `session-ended` - Session ended (for staff)
- `session-ended-client` - Session ended (for guests)
- `guest-left` - Guest left table
- `table-inactive` - All guests left table

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
TELEGRAM_BOT_TOKEN=your_token
KITCHEN_CHAT_ID=your_chat_id
BAR_CHAT_ID=your_chat_id
MANAGER_CHAT_ID=your_chat_id

# Staff Authentication
STAFF_MANAGER_PIN=1234
STAFF_KITCHEN_PIN=5678
STAFF_BAR_PIN=9012
```

### Docker Deployment

Using Docker Compose (recommended):
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Manual Docker build:
```bash
# Build image
docker build -t dcubes-app .

# Run container
docker run -p 3000:3000 -p 5000:5000 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e STAFF_MANAGER_PIN=1234 \
  dcubes-app
```

### Build
```bash
cd client && npm run build
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or DigitalOcean
- **Domain**: Configure your domain with proper SSL

## Menu Customization

Edit `client/src/data/menu.ts` to customize:
- Menu items
- Categories
- Prices
- Descriptions
- Tags

## Documentation

For detailed information on specific features:
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation with examples
- **[SECURITY.md](SECURITY.md)** - Security best practices and guidelines
- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Staff authentication setup and options

## Credits

Built by **Toluwase Christopher**  
Web Developer  
[WhatsApp: 08174143260](https://wa.me/2348174143260)

## License

This project is proprietary software for D Cubes Place.
