# D CUBE'S PLACE - Complete Feature Documentation

## Table of Contents
1. [Core Features](#core-features)
2. [New Enhanced Features](#new-enhanced-features)
3. [Security Features](#security-features)
4. [Analytics & Reporting](#analytics--reporting)
5. [Payment & Refunds](#payment--refunds)
6. [Table & Session Management](#table--session-management)
7. [Telegram Integration](#telegram-integration)
8. [Deployment](#deployment)

---

## Core Features

### Customer Experience
- **QR Code Check-in**: Scan table QR code to access ordering system
- **Menu Browsing**: Browse cocktails, spirits, wine, food, shisha, and non-alcoholic drinks
- **Cart Management**: Add items, adjust quantities, add special notes
- **Real-time Order Tracking**: 6 status levels (pending → confirmed → preparing → ready → delivering → delivered)
- **Access Requests**: Request pool/spa access, lounge entry, VIP dance floor, call waiter, extra ice, or bill request
- **Two-way Chat**: Real-time messaging with staff
- **Nigerian Naira Currency**: Full ₦ support throughout

### Staff Operations
- **Manager Dashboard**: Complete overview with orders, tables, chat, and Telegram feed
- **Kitchen Display**: Food orders only, large readable cards
- **Bar Display**: Drinks & shisha orders, categorized by type
- **Real-time Updates**: WebSocket-based synchronization across all devices

---

## New Enhanced Features

### 1. Returns & Refunds

#### Drink Returns
- Customers can request refunds for unsatisfactory drinks
- Staff can approve/deny refund requests
- Full refund tracking with reason and amount
- Order status changes to "refunded" when approved

#### Order Cancellation
- Staff can cancel pending orders
- Automatic notification to customer
- Reason tracking for cancellations
- Prevents preparation of unwanted items

#### Implementation
```typescript
// Request refund
const refundRequest: RefundRequest = {
  id: generateId(),
  orderId: 'order-123',
  tableNumber: 15,
  guestName: 'John Doe',
  itemIds: [1, 2],
  reason: 'Drink was too strong',
  status: 'pending',
  timestamp: new Date(),
  amount: 15000
};
processRefund(refundRequest);
```

### 2. Payment Management

#### Payment Status Tracking
- **Unpaid**: Order placed, not yet paid
- **Partial**: Partial payment received
- **Paid**: Fully paid
- **Refunded**: Payment refunded

#### Mark as Paid
Staff can click "Mark Paid" button on any order:
- Updates payment status to "paid"
- Sends Telegram notification
- Removes from unpaid order counter
- Updates analytics revenue

#### Payment Display
- Each order shows payment status badge
- Color-coded indicators (orange = unpaid, green = paid)
- Unpaid orders prominently displayed in stats

### 3. Table Session Management

#### Multiple Guests per Table
- Track individual guests at same table
- Each guest has unique ID
- Support split orders and payments
- View guest count in real-time

#### Session Lifecycle
```
1. First guest scans QR → New session created
2. Additional guests scan QR → Join existing session
3. Guests order → Orders linked to session
4. Guest disconnects → Removed from session
5. All guests leave → Session inactive
6. Staff ends session → Final bill, table ready for turnover
```

#### Session Turnover
- Staff click "×" on active table to end session
- Calculates total bill from all orders
- Notifies all guests session ended
- Table marked as available for new guests
- Session history retained for analytics

#### Implementation
```typescript
// End session
const handleEndSession = (tableNumber: number) => {
  const tableOrders = orders.filter(o =>
    o.tableNumber === tableNumber && o.status !== 'cancelled'
  );
  const totalBill = tableOrders.reduce((sum, o) => sum + o.total, 0);
  endSession(tableNumber, totalBill);
};
```

### 4. Enhanced Telegram Integration

#### Organized Message Format
```
🍾 NEW ORDER — Table 15
👤 John Doe
🆔 Order: abc12345
━━━━━━━━━━━━━━
2× Hennessy VSOP (₦20,000)
1× Moët & Chandon (₦45,000)
━━━━━━━━━━━━━━
💰 Total: ₦65,000
💳 Payment: Unpaid
📝 Extra ice please
```

#### Event-Specific Notifications
- ✅ **New Session**: First guest checks in
- 👥 **Guest Joined**: Additional guest joins table
- 🍾 **New Order**: Order placed
- 🔄 **Refund Request**: Refund requested
- ✅ **Refund Approved**: Refund processed
- ❌ **Refund Denied**: Refund rejected
- 💳 **Payment Received**: Payment marked
- 🧹 **Session Ended**: Session closed

#### Message Threading
Each notification includes:
- Order ID (last 8 characters)
- Table number
- Guest name
- Timestamp
- Relevant details only

### 5. Analytics Dashboard

#### Revenue Analytics
- Total revenue
- Order count
- Average order value
- Revenue by hour
- Revenue by table

#### Product Analytics
- Top selling items (by quantity and revenue)
- Category breakdown
- Popular items by category
- Item performance metrics

#### Table Analytics
- Top tables by revenue
- Orders per table
- Average spend per table
- Table occupancy rates

#### Real-time Updates
- Analytics auto-refresh every 60 seconds
- Immediate stats updates on new orders/payments
- Export capability (future enhancement)

#### API Endpoint
```
GET /api/analytics
Response:
{
  totalRevenue: 5000000,
  orderCount: 150,
  averageOrderValue: 33333,
  topSellingItems: [...],
  categoryBreakdown: [...],
  hourlySales: [...],
  tablePerformance: [...]
}
```

---

## Security Features

### Staff Authentication

#### PIN Code Protection
- Each staff role has unique PIN
- Manager PIN: `STAFF_MANAGER_PIN`
- Kitchen PIN: `STAFF_KITCHEN_PIN`
- Bar PIN: `STAFF_BAR_PIN`
- Session expires after 8 hours

#### Protected Routes
- `/manager` - Requires manager PIN
- `/kitchen` - Requires kitchen PIN
- `/bar` - Requires bar PIN
- `/qr` - Requires any staff PIN (optional)

#### Customer Access Control
**Allowed:**
- `/` or `/order` - Ordering page
- Menu browsing
- Cart management
- Order placement
- Chat with staff
- Access requests

**Blocked:**
- `/manager` - Manager dashboard
- `/kitchen` - Kitchen display
- `/bar` - Bar display
- `/qr` - QR code generator
- `/api/analytics` - Analytics data
- Other tables' information

### WebSocket Security
- Room-based access control
- Staff-only rooms
- Table-specific rooms
- Socket ID verification
- Automatic cleanup on disconnect

---

## Deployment

### Docker Support

#### Build with Docker
```bash
docker build -t velour-app .
```

#### Run with Docker Compose
```bash
docker-compose up -d
```

#### Environment Configuration
Create `.env` file:
```env
# Server
PORT=5000
CLIENT_URL=https://your-domain.com

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
KITCHEN_CHAT_ID=kitchen_chat_id
BAR_CHAT_ID=bar_chat_id
MANAGER_CHAT_ID=manager_chat_id

# Staff PINs
STAFF_MANAGER_PIN=1234
STAFF_KITCHEN_PIN=5678
STAFF_BAR_PIN=9012
```

### Platform Deployment

#### Render.com
1. Connect GitHub repository
2. Add environment variables
3. Deploy web service
4. Configure custom domain (optional)

#### Railway.app
1. New Project → Deploy from GitHub
2. Add `VELOUR` service
3. Configure build command and start script
4. Add environment variables

#### AWS / GCP / Azure
Use provided Dockerfile for containerized deployment.

---

## Feature Summary

### Implemented ✅
- [x] Returns and refund requests
- [x] Order cancellation
- [x] Payment status tracking
- [x] Mark as paid functionality
- [x] Multiple guests per table
- [x] Session management
- [x] Table turnover handling
- [x] Enhanced Telegram notifications
- [x] Analytics dashboard
- [x] Revenue tracking
- [x] Product performance metrics
- [x] Table performance analytics
- [x] PIN code authentication
- [x] Route protection
- [x] Docker deployment
- [x] Docker Compose support

### Future Enhancements 🚀
- [ ] Split bill functionality
- [ ] Partial payments
- [ ] Advanced refund (partial item refund)
- [ ] Receipt generation
- [ ] Email/SMS receipts
- [ ] Staff scheduling integration
- [ ] Inventory management
- [ ] Customer loyalty program
- [ ] Table reservation system
- [ ] Mobile app (React Native)

---

## Usage Examples

### Handling a Table Turnover

**Scenario:** Table 15 guests leave, new guests arrive

1. **First Guest Leaves:**
   ```
   Guest disconnects → Removed from session
   Staff notification: "Guest left Table 15. 2 guests remaining"
   ```

2. **All Guests Leave:**
   ```
   Table 15 marked inactive
   Staff clicks "×" on Table 15
   Session ended, final bill calculated
   Telegram: "🧹 SESSION ENDED — Table 15"
   ```

3. **New Guests Arrive:**
   ```
   New guest scans QR code
   Fresh session created
   Ready for new orders
   ```

### Processing a Refund

**Scenario:** Customer wants to return a drink

1. **Customer requests refund:**
   ```typescript
   requestRefund({
     orderId: 'order-123',
     tableNumber: 15,
     guestName: 'John',
     reason: 'Drink was warm',
     amount: 20000
   });
   ```

2. **Manager approves:**
   ```
   Click "Approve" on refund request
   Order status → "refunded"
   Payment status → "refunded"
   Telegram notification sent
   ```

### Marking Orders as Paid

**Scenario:** Customer pays cash at table

1. **Staff action:**
   ```
   Find order in Manager Dashboard
   Click "💳 Mark Paid" button
   ```

2. **System updates:**
   ```
   Payment status → "paid"
   Unpaid counter decreases
   Revenue analytics updated
   Telegram: "💳 PAYMENT RECEIVED"
   ```

---

## Support & Documentation

For detailed setup instructions, see:
- `README.md` - Project overview and quick start
- `SECURITY.md` - Security best practices
- `AUTHENTICATION.md` - Staff authentication setup
- `docker-compose.yml` - Deployment configuration

For questions or issues:
- GitHub Issues: Report bugs and request features
- Telegram Bot: Real-time staff notifications
- In-app Chat: Customer support

---

*VELOUR - Luxury Club Table Ordering System*
*Version 2.0 with Enhanced Features*
