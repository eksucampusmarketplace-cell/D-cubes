import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from '@/context/SocketContext';
import { CartProvider } from '@/context/CartContext';
import { TableProvider } from '@/context/TableContext';
import { StaffAuth } from '@/components/StaffAuth';
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
              <Route path="/qr" element={<QRGenerator />} />
            </Routes>
          </Router>
        </TableProvider>
      </CartProvider>
    </SocketProvider>
  );
};

export default App;
