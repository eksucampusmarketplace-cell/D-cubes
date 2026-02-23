# Staff Authentication Guide

## Current State
The current implementation uses simple socket-based room joining for role separation. Staff members join specific rooms (`staff-manager`, `staff-kitchen`, `staff-bar`) but there's no authentication to verify their identity.

## Recommended Authentication Methods

### Option 1: PIN Code Authentication (Simple)

#### Implementation Steps:

1. **Add PIN Code Environment Variables**
```env
STAFF_MANAGER_PIN=1234
STAFF_KITCHEN_PIN=5678
STAFF_BAR_PIN=9012
```

2. **Create Auth Component**
```typescript
// src/components/StaffAuth.tsx
export const StaffAuth: React.FC<{ role: 'manager' | 'kitchen' | 'bar' }> = ({ role, children }) => {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = () => {
    const correctPin = {
      manager: import.meta.env.VITE_STAFF_MANAGER_PIN,
      kitchen: import.meta.env.VITE_STAFF_KITCHEN_PIN,
      bar: import.meta.env.VITE_STAFF_BAR_PIN
    }[role];

    if (pin === correctPin) {
      setAuthenticated(true);
    } else {
      alert('Invalid PIN');
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="bg-dark-2 p-8 rounded-lg">
        <h2 className="text-gold text-2xl mb-4">Staff Login - {role}</h2>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full p-3 bg-dark border border-gold/20 rounded text-cream"
          maxLength={4}
        />
        <button
          onClick={handleAuth}
          className="w-full mt-4 p-3 bg-gold text-dark rounded"
        >
          Access
        </button>
      </div>
    </div>
  );
};
```

3. **Wrap Staff Dashboards**
```typescript
// In App.tsx
<Route path="/manager" element={
  <StaffAuth role="manager">
    <ManagerDashboard />
  </StaffAuth>
} />
<Route path="/kitchen" element={
  <StaffAuth role="kitchen">
    <KitchenDashboard />
  </StaffAuth>
} />
<Route path="/bar" element={
  <StaffAuth role="bar">
    <BarDashboard />
  </StaffAuth>
} />
```

### Option 2: Token-Based Authentication (More Secure)

#### Implementation Steps:

1. **Server-Side Token Generation**
```typescript
// In server/src/index.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.post('/api/auth/login', (req, res) => {
  const { pin, role } = req.body;

  const correctPin = {
    manager: process.env.STAFF_MANAGER_PIN,
    kitchen: process.env.STAFF_KITCHEN_PIN,
    bar: process.env.STAFF_BAR_PIN
  }[role];

  if (pin === correctPin) {
    const token = jwt.sign({ role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role });
  } else {
    res.status(401).json({ error: 'Invalid PIN' });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protect WebSocket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.decoded = decoded;
    next();
  });
});
```

2. **Client-Side Token Storage**
```typescript
// In src/utils/auth.ts
export const login = async (pin: string, role: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, role })
  });

  if (response.ok) {
    const { token } = await response.json();
    localStorage.setItem('velour_token', token);
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('velour_token');
};

export const getToken = () => {
  return localStorage.getItem('velour_token');
};
```

3. **Socket Connection with Token**
```typescript
// In SocketContext.tsx
const token = getToken();
const socket = io(SERVER_URL, {
  auth: { token }
});
```

### Option 3: Biometric/Smart Card (Enterprise)

For high-end venues:
- NFC card readers at staff terminals
- Fingerprint scanners for manager access
- Integration with venue access control system

## Security Best Practices

### PIN Codes
- Change PINs weekly
- Don't use sequential numbers (1234)
- Use different PINs for each role
- Log all authentication attempts

### Tokens
- Use short expiration times (4-8 hours)
- Implement refresh tokens
- Revoke tokens on logout
- Store securely (httpOnly cookies in production)

### Session Management
- Auto-logout after inactivity
- Display session duration
- Show currently authenticated user
- Allow staff to "hand off" sessions

### Logging
```typescript
// Log all authentication events
console.log(`AUTH: ${role} login from IP ${req.ip} at ${new Date()}`);
console.log(`AUTH: Failed login attempt for ${role} from IP ${req.ip}`);
```

## Quick Implementation (PIN Code)

For immediate security, implement Option 1 (PIN Code):

1. Add PINs to `.env`:
```env
VITE_STAFF_MANAGER_PIN=0000
VITE_STAFF_KITCHEN_PIN=1111
VITE_STAFF_BAR_PIN=2222
```

2. Create `StaffAuth.tsx` component (see Option 1 above)

3. Wrap dashboard routes in `App.tsx`

4. Test authentication:
   - Visit `/manager`
   - Enter correct PIN (0000)
   - Access granted

This provides immediate security while you implement more robust authentication.
