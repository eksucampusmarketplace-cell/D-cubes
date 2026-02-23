import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from '@/context/SocketContext';
import { CartProvider } from '@/context/CartContext';
import { TableProvider } from '@/context/TableContext';
import { CustomerPage } from '@/pages/CustomerPage';
import { ManagerDashboard } from '@/pages/ManagerDashboard';
import { KitchenDashboard } from '@/pages/KitchenDashboard';
import { BarDashboard } from '@/pages/BarDashboard';
import { QRGenerator } from '@/pages/QRGenerator';

const App: FC = () => {
  return (
    <SocketProvider>
      <CartProvider>
        <TableProvider>
          <Router>
            <Routes>
              <Route path="/" element={<CustomerPage />} />
              <Route path="/order" element={<CustomerPage />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/bar" element={<BarDashboard />} />
              <Route path="/qr" element={<QRGenerator />} />
            </Routes>
          </Router>
        </TableProvider>
      </CartProvider>
    </SocketProvider>
  );
};

export default App;
