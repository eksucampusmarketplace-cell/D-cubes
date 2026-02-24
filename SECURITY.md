# D CUBE'S PLACE Security Documentation

## Overview
The D Cube's Place ordering system implements several security measures to protect customer data, prevent unauthorized access to staff areas, and ensure secure payment handling.

## Security Features

### 1. Route Protection
Staff dashboard routes (`/manager`, `/kitchen`, `/bar`) should be protected with authentication:
- Currently uses simple socket-based role joining
- Production deployment should add:
  - PIN code authentication for staff
  - Session tokens with expiration
  - Role-based access control (RBAC)

### 2. WebSocket Security
- Socket connections are room-based for role separation
- Staff-only rooms (`staff-manager`, `staff-kitchen`, `staff-bar`)
- Table-specific rooms for customer communication
- Socket ID tracking for disconnect handling

### 3. Payment Security
- No actual payment processing on the platform
- Staff manually mark orders as paid
- Payment status tracking: `unpaid`, `partial`, `paid`, `refunded`
- Refund tracking with reason and approval workflow

### 4. Table Session Management
- Unique session IDs per table occupation
- Multiple guest support with individual guest IDs
- Automatic session cleanup on disconnect
- Staff-controlled session end

### 5. Data Validation
- Input validation on all forms
- Type checking with TypeScript
- Price and quantity validation

## Recommended Production Enhancements

### Authentication
```typescript
// Add staff authentication middleware
const authenticateStaff = (req, res, next) => {
  const token = req.headers.authorization;
  if (!verifyStaffToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Protect staff routes
app.use('/manager', authenticateStaff);
app.use('/kitchen', authenticateStaff);
app.use('/bar', authenticateStaff);
```

### Environment Variables
Ensure these are set in production:
- `TELEGRAM_BOT_TOKEN` - Keep secret
- `KITCHEN_CHAT_ID` - Staff chat IDs
- `BAR_CHAT_ID` - Staff chat IDs
- `MANAGER_CHAT_ID` - Staff chat IDs
- `CLIENT_URL` - Production URL

### HTTPS
- Always use HTTPS in production
- Configure SSL/TLS certificates
- Use secure cookies for authentication

### Rate Limiting
```javascript
// Add rate limiting to prevent abuse
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### CORS Configuration
Current CORS allows all origins. In production:
```javascript
const allowedOrigins = ['https://velourclub.com', 'https://app.velourclub.com'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## Customer Access Control

### What Customers CAN Access:
- `/` or `/order` - Order page (with valid table number)
- Menu browsing
- Cart management
- Order placement
- Chat with staff
- Access requests

### What Customers CANNOT Access:
- `/manager` - Manager dashboard
- `/kitchen` - Kitchen display
- `/bar` - Bar display
- `/qr` - QR code generator
- `/api/analytics` - Analytics data
- Direct order modifications
- Other tables' information

## Telegram Security
- Bot token stored in environment variables
- Staff chat IDs configured separately
- No sensitive customer data sent to Telegram
- Order notifications contain minimal information

## Audit Trail
All major actions are logged:
- Check-ins (with timestamp and guest info)
- Orders (full order details)
- Status updates
- Payment status changes
- Refund requests and approvals
- Session starts and ends

## Incident Response
If security incident occurs:
1. Review server logs
2. Check Telegram message history
3. Analyze order and session data
4. Identify affected tables/guests
5. End affected sessions
6. Reset table QR codes if needed
