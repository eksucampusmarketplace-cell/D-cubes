export const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG')}`;
};

export const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const generateOrderId = (): string => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRequestId = (): string => {
  return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMessageId = (): string => {
  return `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getAccessTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'pool-spa': 'Pool & Spa Access',
    'lounge-entry': 'Lounge Entry',
    'vip-dance': 'VIP Dance Floor',
    'call-waiter': 'Call a Waiter',
    'extra-ice': 'Extra Ice/Cups',
    'bill-request': 'Bill Request'
  };
  return labels[type] || type;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': '● Pending',
    'confirmed': '✓ Confirmed',
    'preparing': '👨‍🍳 Being Prepared',
    'ready': '✓ Ready',
    'delivering': '🚶 On Its Way',
    'delivered': '✓ Delivered'
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    'confirmed': 'text-green-500 border-green-500/30 bg-green-500/10',
    'preparing': 'text-orange-500 border-orange-500/30 bg-orange-500/10',
    'ready': 'text-green-500 border-green-500/30 bg-green-500/10',
    'delivering': 'text-blue-500 border-blue-500/30 bg-blue-500/10',
    'delivered': 'text-green-500 border-green-500/30 bg-green-500/10'
  };
  return colors[status] || 'text-gray-500';
};
