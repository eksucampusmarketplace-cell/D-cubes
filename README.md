# VELOUR Members Club - Table Ordering System

A luxury table ordering system for VELOUR Members Club in Lagos, Nigeria. The system enables guests to order food and drinks from their table via QR codes, with real-time communication between guests and staff.

## Features

### Customer Page (Mobile-First)
- **QR Code Check-in**: Guests scan a table-specific QR code to access the ordering system
- **Table Detection**: Automatic table number detection from URL parameter
- **Menu Browsing**: Categories include Cocktails, Spirits & Bottles, Wine & Champagne, Food, Shisha, Non-Alcoholic
- **Cart System**: Add items, adjust quantities, add special notes
- **Access Requests**: Request Pool & Spa, Lounge Entry, VIP Dance Floor, Call a Waiter, Extra Ice/Cups, Bill Request
- **Two-way Chat**: Real-time messaging between guests and staff
- **Order Status Tracking**: Live updates from Pending → Confirmed → Preparing → On Way → Delivered

### Staff Dashboards

#### Manager Dashboard
- All incoming orders from all tables
- Access requests panel (grant/deny)
- Table grid showing tables 1-50 with status indicators
- Two-way chat with any table
- Telegram feed showing all bot messages
- Live statistics (new orders, active tables, revenue, delivered)

#### Kitchen Display
- Food orders only (no drinks or shisha)
- Large readable text for kitchen screens
- One-click status updates: New → Preparing → Ready
- Audio alerts for new orders

#### Bar Display
- Drinks and shisha orders only
- Grouped by category (Cocktails, Spirits, Wine, Shisha, Non-Alc)
- One-click status updates

## Technical Stack

- **Backend**: Node.js with Express
- **Real-time Communication**: WebSockets (ws library)
- **Telegram Integration**: Bot API for notifications
- **QR Code Generation**: qrcode library (auto-generates 50 QR codes)

## Installation

```bash
npm install
```

## Configuration

Set these environment variables for Telegram integration:

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_MANAGER_CHAT_ID="manager_chat_id"
export TELEGRAM_KITCHEN_CHAT_ID="kitchen_chat_id"
export TELEGRAM_BAR_CHAT_ID="bar_chat_id"
export BASE_URL="https://your-domain.com"
```

## Running

```bash
npm start
```

The server will start on port 3000 by default.

## URLs

| Page | URL |
|------|-----|
| Landing Page | `/` |
| Customer Order | `/order?table=X` |
| Manager Dashboard | `/manager` |
| Kitchen Display | `/kitchen` |
| Bar Display | `/bar` |
| QR Codes | `/qrcodes` |

## How Tables Work

1. Each table (1-50) has a unique QR code printed and placed on it
2. QR codes link to `/order?table=X` where X is the table number
3. When a guest scans, the system automatically detects their table
4. All actions (check-in, orders, chat, requests) carry the table number
5. If no table parameter is present, an error is shown

## Telegram Notifications

The system sends notifications to different Telegram groups:

- **Manager Bot**: Check-ins, all orders, access requests, chat messages
- **Kitchen Bot**: Food orders only
- **Bar Bot**: Drinks and shisha orders only

## Menu Items

All prices are in Nigerian Naira (₦). The menu includes:
- 6 Cocktails (₦7,500 - ₦12,000)
- 6 Spirits & Bottles (₦65,000 - ₦220,000)
- 5 Wines & Champagnes (₦45,000 - ₦180,000)
- 8 Food items (₦18,000 - ₦95,000)
- 5 Shisha options (₦15,000 - ₦18,000)
- 5 Non-Alcoholic drinks (₦4,000 - ₦6,000)

## License

MIT

## Author

Built by **Toluwase Christopher** · Web Developer
WhatsApp: [08174143260](https://wa.me/2348174143260)