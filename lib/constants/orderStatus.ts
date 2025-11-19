export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Order Placed',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmed',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.SHIPPED]: 'Shipped',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PROCESSING]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUSES.SHIPPED]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'bg-teal-100 text-teal-800',
  [ORDER_STATUSES.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800'
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  [ORDER_STATUSES.PENDING]: 'Your order has been received and is being reviewed',
  [ORDER_STATUSES.CONFIRMED]: 'Your order has been confirmed and payment is being processed',
  [ORDER_STATUSES.PROCESSING]: 'Your order is being prepared for shipment',
  [ORDER_STATUSES.SHIPPED]: 'Your order has been shipped and is on its way',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Your order is out for delivery and will arrive soon',
  [ORDER_STATUSES.DELIVERED]: 'Your order has been successfully delivered',
  [ORDER_STATUSES.CANCELLED]: 'Your order has been cancelled'
};

// Define valid status transitions to prevent invalid status updates
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.OUT_FOR_DELIVERY, ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [], // No transitions from delivered
  [ORDER_STATUSES.CANCELLED]: [] // No transitions from cancelled
};

// Get the next logical status in the order flow
export function getNextOrderStatus(currentStatus: OrderStatus): OrderStatus | null {
  switch (currentStatus) {
    case ORDER_STATUSES.PENDING:
      return ORDER_STATUSES.CONFIRMED;
    case ORDER_STATUSES.CONFIRMED:
      return ORDER_STATUSES.PROCESSING;
    case ORDER_STATUSES.PROCESSING:
      return ORDER_STATUSES.SHIPPED;
    case ORDER_STATUSES.SHIPPED:
      return ORDER_STATUSES.OUT_FOR_DELIVERY;
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return ORDER_STATUSES.DELIVERED;
    default:
      return null;
  }
}

// Check if a status transition is valid
export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

// Get the progress percentage for tracking visualization
export function getOrderProgress(status: OrderStatus): number {
  switch (status) {
    case ORDER_STATUSES.PENDING:
      return 10;
    case ORDER_STATUSES.CONFIRMED:
      return 20;
    case ORDER_STATUSES.PROCESSING:
      return 40;
    case ORDER_STATUSES.SHIPPED:
      return 60;
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return 80;
    case ORDER_STATUSES.DELIVERED:
      return 100;
    case ORDER_STATUSES.CANCELLED:
      return 0;
    default:
      return 0;
  }
}

// Get all statuses in the correct order for timeline display
export function getOrderStatusFlow(): { status: OrderStatus; label: string; description: string }[] {
  return [
    {
      status: ORDER_STATUSES.PENDING,
      label: ORDER_STATUS_LABELS[ORDER_STATUSES.PENDING],
      description: ORDER_STATUS_DESCRIPTIONS[ORDER_STATUSES.PENDING]
    },
    {
      status: ORDER_STATUSES.CONFIRMED,
      label: ORDER_STATUS_LABELS[ORDER_STATUSES.CONFIRMED],
      description: ORDER_STATUS_DESCRIPTIONS[ORDER_STATUSES.CONFIRMED]
    },
    {
      status: ORDER_STATUSES.PROCESSING,
      label: ORDER_STATUS_LABELS[ORDER_STATUSES.PROCESSING],
      description: ORDER_STATUS_DESCRIPTIONS[ORDER_STATUSES.PROCESSING]
    },
    {
      status: ORDER_STATUSES.SHIPPED,
      label: ORDER_STATUS_LABELS[ORDER_STATUSES.SHIPPED],
      description: ORDER_STATUS_DESCRIPTIONS[ORDER_STATUSES.SHIPPED]
    },
    {
      status: ORDER_STATUSES.OUT_FOR_DELIVERY,
      label: ORDER_STATUS_LABELS[ORDER_STATUSES.OUT_FOR_DELIVERY],
      description: ORDER_STATUS_DESCRIPTIONS[ORDER_STATUSES.OUT_FOR_DELIVERY]
    },
    {
      status: ORDER_STATUSES.DELIVERED,
      label: ORDER_STATUS_LABELS[ORDER_STATUSES.DELIVERED],
      description: ORDER_STATUS_DESCRIPTIONS[ORDER_STATUSES.DELIVERED]
    }
  ];
}

// Get estimated delivery time based on status (in days from order placement)
export function getEstimatedDeliveryDays(status: OrderStatus): number | null {
  switch (status) {
    case ORDER_STATUSES.PENDING:
    case ORDER_STATUSES.CONFIRMED:
      return 7; // 7 days from placement
    case ORDER_STATUSES.PROCESSING:
      return 5; // 5 days when processing starts
    case ORDER_STATUSES.SHIPPED:
      return 3; // 3 days when shipped
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return 1; // 1 day when out for delivery
    case ORDER_STATUSES.DELIVERED:
      return 0; // Already delivered
    default:
      return null;
  }
}