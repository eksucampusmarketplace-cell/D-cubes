# VELOUR — Luxury Club Table Ordering System

A premium table ordering system for members clubs, featuring QR code-based table detection, real-time communication, Telegram integration, and multi-role staff dashboards.

## Features

### Customer Experience (Mobile-First)
- **QR Code Check-in**: Each table has a unique QR code that auto-detects the table number
- **Luxury Menu**: Browse cocktails, spirits, wine, food, shisha, and non-alcoholic beverages
- **Cart & Ordering**: Add items, adjust quantities, add special notes
- **Real-time Order Tracking**: Pending → Confirmed → Preparing → Ready → On Its Way → Delivered
- **Access Requests**: Pool & Spa, Lounge Entry, VIP Dance Floor, Call Waiter, Extra Ice, Bill Request
- **Two-way Chat**: Direct messaging with staff
- **Nigerian Naira (₦)** currency support

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

- **Customer Page**: `http://localhost:3000/order?table=1` (change table number as needed)
- **Manager Dashboard**: `http://localhost:3000/manager`
- **Kitchen Display**: `http://localhost:3000/kitchen`
- **Bar Display**: `http://localhost:3000/bar`
- **QR Generator**: `http://localhost:3000/qr`

## Usage

### For Customers
1. Scan the QR code on your table
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

## WebSocket Events

### Client → Server
- `check-in` - Guest checks in
- `new-order` - Place an order
- `access-request` - Request access/assistance
- `chat-message` - Send chat message
- `update-order-status` - Staff updates order status
- `access-response` - Staff responds to access request

### Server → Client
- `new-order` - New order received
- `order-status-update` - Order status changed
- `check-in` - Guest checked in
- `access-request` - New access request
- `access-response` - Access request response
- `new-message` - New chat message

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

## Credits

Built by **Toluwase Christopher**  
Web Developer  
[WhatsApp: 08174143260](https://wa.me/2348174143260)

## License

This project is proprietary software for VELOUR Members Club.
