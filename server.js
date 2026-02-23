const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fetch = require('node-fetch');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration - These should be set via environment variables in production
const CONFIG = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN',
  TELEGRAM_MANAGER_CHAT_ID: process.env.TELEGRAM_MANAGER_CHAT_ID || 'MANAGER_CHAT_ID',
  TELEGRAM_KITCHEN_CHAT_ID: process.env.TELEGRAM_KITCHEN_CHAT_ID || 'KITCHEN_CHAT_ID',
  TELEGRAM_BAR_CHAT_ID: process.env.TELEGRAM_BAR_CHAT_ID || 'BAR_CHAT_ID',
  PORT: process.env.PORT || 3000,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
};

// In-memory data stores (use a database in production)
const tables = {}; // { tableNum: { guestName, checkedIn, orders, messages, accessRequests } }
const orders = {}; // { orderId: { tableNum, guestName, items, status, type, createdAt } }
const orderCounter = { count: 1000 };

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Helper to send Telegram message
async function sendTelegramMessage(chatId, text) {
  if (CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
    console.log('📋 TELEGRAM (simulated):', text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Telegram error:', err.message);
  }
}

// Get time string
function getTime() {
  return new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function getDate() {
  return new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Broadcast to all connected WebSocket clients
function broadcast(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Broadcast to specific client type
function broadcastTo(type, data, clientType) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.clientType === clientType) {
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  let clientType = 'unknown';
  let tableNum = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'register':
          ws.clientType = data.clientType; // 'customer', 'manager', 'kitchen', 'bar'
          ws.tableNum = data.tableNum;
          break;

        case 'chat':
          // Chat from customer to staff or vice versa
          const chatMsg = {
            tableNum: data.tableNum,
            sender: data.sender,
            senderType: data.senderType, // 'guest' or 'staff'
            text: data.text,
            time: getTime()
          };
          
          if (!tables[data.tableNum]) {
            tables[data.tableNum] = { messages: [], orders: [], accessRequests: [] };
          }
          tables[data.tableNum].messages.push(chatMsg);
          
          broadcast('chat', chatMsg);
          
          // Send to Telegram if from guest
          if (data.senderType === 'guest') {
            sendTelegramMessage(CONFIG.TELEGRAM_MANAGER_CHAT_ID, 
              `💬 MESSAGE — Table ${data.tableNum}\n👤 ${data.sender}: ${data.text}`);
          }
          break;

        case 'order_status_update':
          // Manager updating order status
          if (orders[data.orderId]) {
            orders[data.orderId].status = data.status;
            broadcast('order_status', { orderId: data.orderId, status: data.status, tableNum: orders[data.orderId].tableNum });
          }
          break;

        case 'access_granted':
        case 'access_denied':
          broadcast(data.type, { tableNum: data.tableNum, accessType: data.accessType });
          break;
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    // Client disconnected
  });
});

// API Routes

// Check-in endpoint
app.post('/api/checkin', async (req, res) => {
  const { tableNum, guestName } = req.body;
  
  if (!tableNum || !guestName) {
    return res.status(400).json({ error: 'Table number and guest name required' });
  }

  if (!tables[tableNum]) {
    tables[tableNum] = { guestName, checkedIn: true, checkedInAt: new Date(), orders: [], messages: [], accessRequests: [] };
  } else {
    tables[tableNum].guestName = guestName;
    tables[tableNum].checkedIn = true;
    tables[tableNum].checkedInAt = new Date();
  }

  // Send Telegram notification
  const time = getTime();
  await sendTelegramMessage(CONFIG.TELEGRAM_MANAGER_CHAT_ID, 
    `✅ CHECK-IN — Table ${tableNum}\n👤 Guest: ${guestName}\n🕐 ${time}`);

  // Broadcast to dashboards
  broadcast('checkin', { tableNum, guestName, time });

  res.json({ success: true, message: 'Checked in successfully' });
});

// Place order endpoint
app.post('/api/order', async (req, res) => {
  const { tableNum, guestName, items, note, foodItems, drinkItems, foodTotal, drinkTotal, total } = req.body;
  
  if (!tableNum || !items || items.length === 0) {
    return res.status(400).json({ error: 'Table number and items required' });
  }

  const orderId = `ORD-${++orderCounter.count}`;
  const time = getTime();

  // Store order
  orders[orderId] = {
    orderId,
    tableNum,
    guestName,
    items,
    note,
    status: 'pending',
    createdAt: new Date(),
    foodItems,
    drinkItems,
    total
  };

  if (!tables[tableNum]) {
    tables[tableNum] = { orders: [], messages: [], accessRequests: [] };
  }
  tables[tableNum].orders.push(orderId);

  // Format items for Telegram
  const formatItems = (itemList) => itemList.map(i => `${i.qty}× ${i.name} (₦${(i.price * i.qty).toLocaleString()})`).join('\n');

  // Send to Manager (full order)
  const managerMsg = `🍾 NEW ORDER — Table ${tableNum}
👤 Guest: ${guestName}
━━━━━━━━━━━━━━
${formatItems(items)}
━━━━━━━━━━━━━━
💰 Total: ₦${total.toLocaleString()}
${note ? `📝 Note: ${note}` : ''}
🕐 ${time}`;
  await sendTelegramMessage(CONFIG.TELEGRAM_MANAGER_CHAT_ID, managerMsg);

  // Send to Kitchen (food only)
  if (foodItems && foodItems.length > 0) {
    const kitchenMsg = `🍳 KITCHEN ORDER — Table ${tableNum}
👤 Guest: ${guestName}
━━━━━━━━━━━━━━
${formatItems(foodItems)}
${note ? `📝 Note: ${note}` : ''}
━━━━━━━━━━━━━━
🕐 ${time}`;
    await sendTelegramMessage(CONFIG.TELEGRAM_KITCHEN_CHAT_ID, kitchenMsg);
  }

  // Send to Bar (drinks & shisha only)
  if (drinkItems && drinkItems.length > 0) {
    const barMsg = `🍸 BAR ORDER — Table ${tableNum}
👤 Guest: ${guestName}
━━━━━━━━━━━━━━
${formatItems(drinkItems)}
${note ? `📝 Note: ${note}` : ''}
━━━━━━━━━━━━━━
🕐 ${time}`;
    await sendTelegramMessage(CONFIG.TELEGRAM_BAR_CHAT_ID, barMsg);
  }

  // Broadcast to all dashboards
  broadcast('new_order', { orderId, tableNum, guestName, items, note, status: 'pending', total, foodItems, drinkItems, time });

  res.json({ success: true, orderId, message: 'Order placed successfully' });
});

// Access request endpoint
app.post('/api/access-request', async (req, res) => {
  const { tableNum, guestName, accessType } = req.body;
  
  if (!tableNum || !accessType) {
    return res.status(400).json({ error: 'Table number and access type required' });
  }

  const time = getTime();
  const requestId = `REQ-${Date.now()}`;

  if (!tables[tableNum]) {
    tables[tableNum] = { orders: [], messages: [], accessRequests: [] };
  }
  tables[tableNum].accessRequests.push({ requestId, accessType, status: 'pending', time });

  // Send to Telegram
  await sendTelegramMessage(CONFIG.TELEGRAM_MANAGER_CHAT_ID, 
    `🛎️ REQUEST — Table ${tableNum}\n👤 ${guestName || 'Guest'}\n📍 Requested: ${accessType}\n🕐 ${time}`);

  // Broadcast to manager dashboard
  broadcast('access_request', { requestId, tableNum, guestName, accessType, time });

  res.json({ success: true, requestId, message: 'Request sent' });
});

// Update order status endpoint
app.post('/api/order-status', (req, res) => {
  const { orderId, status } = req.body;
  
  if (!orderId || !status) {
    return res.status(400).json({ error: 'Order ID and status required' });
  }

  if (orders[orderId]) {
    orders[orderId].status = status;
    broadcast('order_status', { orderId, status, tableNum: orders[orderId].tableNum });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Get all orders (for dashboard)
app.get('/api/orders', (req, res) => {
  res.json(Object.values(orders));
});

// Get all tables status
app.get('/api/tables', (req, res) => {
  res.json(tables);
});

// Get orders by type (for kitchen/bar)
app.get('/api/orders/:type', (req, res) => {
  const type = req.params.type;
  const filteredOrders = Object.values(orders).filter(order => {
    if (type === 'kitchen') return order.foodItems && order.foodItems.length > 0;
    if (type === 'bar') return order.drinkItems && order.drinkItems.length > 0;
    return true;
  });
  res.json(filteredOrders);
});

// Generate QR codes page
app.get('/qrcodes', async (req, res) => {
  const totalTables = 50;
  const qrDataUrls = [];

  for (let i = 1; i <= totalTables; i++) {
    const url = `${CONFIG.BASE_URL}/order?table=${i}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: '#0A0A0A', light: '#F5F0E8' }
      });
      qrDataUrls.push({ tableNum: i, url, dataUrl });
    } catch (err) {
      console.error(`QR generation error for table ${i}:`, err);
    }
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VELOUR — QR Codes</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --gold: #C9A84C;
      --black: #0A0A0A;
      --dark: #111111;
      --cream: #F5F0E8;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: var(--black);
      color: var(--cream);
      font-family: 'DM Sans', sans-serif;
      padding: 40px;
    }
    h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.5rem;
      letter-spacing: 0.3em;
      color: var(--gold);
      margin-bottom: 10px;
    }
    .subtitle { color: rgba(245,240,232,0.4); margin-bottom: 40px; }
    .qr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .qr-card {
      background: var(--dark);
      border: 1px solid rgba(201,168,76,0.2);
      padding: 20px;
      text-align: center;
    }
    .qr-card img {
      width: 150px;
      height: 150px;
      margin-bottom: 10px;
    }
    .qr-table {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      color: var(--gold);
      letter-spacing: 0.2em;
    }
    .qr-url {
      font-size: 0.65rem;
      color: rgba(245,240,232,0.3);
      word-break: break-all;
    }
    .download-btn {
      background: var(--gold);
      color: var(--black);
      border: none;
      padding: 8px 16px;
      font-size: 0.7rem;
      cursor: pointer;
      margin-top: 10px;
    }
    .print-all {
      background: var(--gold);
      color: var(--black);
      border: none;
      padding: 12px 30px;
      font-size: 0.8rem;
      cursor: pointer;
      margin-bottom: 30px;
    }
    @media print {
      body { background: white; }
      .qr-card { break-inside: avoid; border: 2px solid #C9A84C; background: white; }
      .qr-table { color: #C9A84C; }
      .qr-url { color: #666; }
      .print-all { display: none; }
    }
  </style>
</head>
<body>
  <h1>VELOUR QR CODES</h1>
  <p class="subtitle">Print and place one QR code on each table. Guests scan to check in and order.</p>
  <button class="print-all" onclick="window.print()">🖨️ Print All QR Codes</button>
  <div class="qr-grid">
    ${qrDataUrls.map(qr => `
      <div class="qr-card">
        <img src="${qr.dataUrl}" alt="Table ${qr.tableNum} QR Code">
        <div class="qr-table">Table ${qr.tableNum}</div>
        <div class="qr-url">${qr.url}</div>
        <button class="download-btn" onclick="downloadQR('${qr.tableNum}', '${qr.dataUrl}')">Download</button>
      </div>
    `).join('')}
  </div>
  <script>
    function downloadQR(tableNum, dataUrl) {
      const link = document.createElement('a');
      link.download = 'velour-table-' + tableNum + '.png';
      link.href = dataUrl;
      link.click();
    }
  </script>
</body>
</html>
  `);
});

// Customer ordering page
app.get('/order', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Manager dashboard
app.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manager.html'));
});

// Kitchen dashboard
app.get('/kitchen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kitchen.html'));
});

// Bar dashboard
app.get('/bar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bar.html'));
});

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(CONFIG.PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🥂 VELOUR Members Club — Table Ordering System              ║
╠════════════════════════════════════════════════════════════════╣
║   Server running on port ${CONFIG.PORT}                                  ║
║                                                                ║
║   Landing Page:    http://localhost:${CONFIG.PORT}/                       ║
║   QR Codes:        http://localhost:${CONFIG.PORT}/qrcodes                ║
║   Customer Order:  http://localhost:${CONFIG.PORT}/order?table=X          ║
║   Manager Dashboard: http://localhost:${CONFIG.PORT}/manager             ║
║   Kitchen Display: http://localhost:${CONFIG.PORT}/kitchen               ║
║   Bar Display:     http://localhost:${CONFIG.PORT}/bar                   ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
