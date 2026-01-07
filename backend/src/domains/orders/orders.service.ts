import { prisma } from '../../infrastructure/database/prisma.js';
import { pushNotificationService } from '../../services/push-notification.service.js';

// Generate order number (e.g., ORD-20231208-001)
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

interface CreateOrderInput {
  userId: string;
  firmId: string;
  addressId: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  preferredDeliveryTime?: string | null;
  notes?: string;
  paymentMethod?: 'CASH' | 'CARD';
}

interface CreateAddressInput {
  userId: string;
  address: string;
  title?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const ordersService = {
  // Create an address for the user
  async createAddress(data: CreateAddressInput) {
    const address = await prisma.addresses.create({
      data: {
        user_id: data.userId,
        title: data.title || 'Delivery Address',
        address: data.address,
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        is_default: data.isDefault ?? false,
      },
    });
    return address;
  },

  async create(data: CreateOrderInput) {
    // Get products to get their names and prices
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Create order with items
    const order = await prisma.orders.create({
      data: {
        order_number: generateOrderNumber(),
        user_id: data.userId,
        firm_id: data.firmId,
        address_id: data.addressId,
        total: data.total,
        notes: data.notes,
        stage: 'PENDING',
        payment_method: data.paymentMethod || 'CASH',
        order_items: {
          create: data.items.map(item => {
            const product = productMap.get(item.productId);
            return {
              product_id: item.productId,
              product_name: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: product?.price || 0,
            };
          }),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            client_profiles: { select: { name: true } },
          },
        },
        firms: { select: { id: true, name: true } },
        addresses: true,
        order_items: {
          include: {
            products: { select: { name: true, image_url: true } },
          },
        },
      },
    });

    // Transform to include user.name from clientProfile and rename orderItems to items
    const { order_items, ...rest } = order;
    return {
      ...rest,
      items: order_items,
      user: {
        id: order.users.id,
        phone: order.users.phone,
        name: order.users.client_profiles?.name || 'User',
      },
    };
  },

  async getByUserId(userId: string) {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        firms: { select: { id: true, name: true } },
        drivers: {
          select: {
            id: true,
            name: true,
            phone: true,
            driver_number: true,
            vehicle_number: true,
            car_brand: true,
            car_color: true,
            rating: true,
          },
        },
        addresses: true,
        order_items: {
          include: {
            products: { select: { name: true, image_url: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Map orderItems to items for client compatibility
    return orders.map(order => {
      const { order_items, ...rest } = order;
      return { ...rest, items: order_items };
    });
  },

  async list(firmId?: string, branchId?: string) {
    const where: any = {};
    if (firmId) where.firm_id = firmId;
    if (branchId) where.branch_id = branchId;

    const orders = await prisma.orders.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            client_profiles: { select: { name: true } },
          },
        },
        firms: { select: { id: true, name: true } },
        branches: { select: { id: true, name: true } },
        drivers: {
          select: {
            id: true,
            name: true,
            phone: true,
            driver_number: true,
            vehicle_number: true,
            car_brand: true,
            car_color: true,
            rating: true,
          },
        },
        addresses: true,
        order_items: {
          include: {
            products: { select: { name: true, image_url: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to include user.name from clientProfile and rename orderItems to items
    return orders.map(order => {
      const { order_items, ...rest } = order;
      return {
        ...rest,
        items: order_items,
        user: {
          id: order.users.id,
          phone: order.users.phone,
          name: order.users.client_profiles?.name || 'User',
        },
      };
    });
  },

  async getById(id: string) {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            client_profiles: { select: { name: true } },
          },
        },
        firms: { select: { id: true, name: true } },
        branches: { select: { id: true, name: true } },
        drivers: {
          select: {
            id: true,
            name: true,
            phone: true,
            driver_number: true,
            vehicle_number: true,
            car_brand: true,
            car_color: true,
            rating: true,
          },
        },
        addresses: true,
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) return null;

    // Transform to include user.name from clientProfile and rename orderItems to items
    const { order_items, ...rest } = order;
    return {
      ...rest,
      items: order_items,
      user: {
        id: order.users.id,
        phone: order.users.phone,
        name: order.users.client_profiles?.name || 'User',
      },
    };
  },

  async updateStatus(id: string, stage: string) {
    const order = await prisma.orders.update({
      where: { id },
      data: { stage: stage as any },
      include: {
        users: { select: { id: true } },
      },
    });

    // Send push notification for stage change (async, don't wait)
    pushNotificationService
      .sendOrderStageNotification(order.users.id, stage, order.id)
      .catch((err) => console.error('[Orders] Failed to send push notification:', err));

    return order;
  },

  async cancel(id: string, reason?: string) {
    const order = await prisma.orders.update({
      where: { id },
      data: {
        stage: 'CANCELLED',
        cancelled_at: new Date(),
        cancel_reason: reason || null,
      },
    });
    return order;
  },

  // Accept order by driver
  // Note: driverId param could be either Driver.id or User.id depending on the app
  async acceptOrder(orderId: string, driverId: string) {
    // First, try to find Driver by this ID directly
    let driver = await prisma.drivers.findUnique({
      where: { id: driverId },
    });

    // If not found, try looking up by userId (in case app sends User.id)
    if (!driver) {
      driver = await prisma.drivers.findUnique({
        where: { user_id: driverId },
      });
    }

    if (!driver) {
      throw new Error('Driver profile not found');
    }

    const order = await prisma.orders.update({
      where: { id: orderId },
      data: {
        driver_id: driver.id,
        stage: 'CONFIRMED',
      },
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            client_profiles: { select: { name: true } },
          },
        },
        firms: { select: { id: true, name: true } },
        addresses: true,
        order_items: {
          include: {
            products: { select: { name: true, image_url: true } },
          },
        },
      },
    });

    // Send "courier assigned" push notification (async, don't wait)
    pushNotificationService
      .sendCourierAssignedNotification(order.users.id, order.id)
      .catch((err) => console.error('[Orders] Failed to send courier assigned notification:', err));

    // Transform to include user.name from clientProfile and rename orderItems to items
    const { order_items, ...rest } = order;
    return {
      ...rest,
      items: order_items,
      user: {
        id: order.users.id,
        phone: order.users.phone,
        name: order.users.client_profiles?.name || 'User',
      },
    };
  },

  // Get queue position for an order (how many orders are ahead in the queue)
  async getQueuePosition(orderId: string) {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: { firm_id: true, created_at: true, stage: true },
    });

    if (!order) return { queuePosition: 0, ordersAhead: 0 };

    // Queue stages include both PENDING and IN_QUEUE (for compatibility)
    const queueStages = ['PENDING', 'IN_QUEUE'];

    // Only calculate queue for orders in queue stage (waiting for driver)
    if (!queueStages.includes(order.stage as string)) {
      return { queuePosition: 0, ordersAhead: 0 };
    }

    // Count orders from the same firm that are in queue and created before this order
    const ordersAhead = await prisma.orders.count({
      where: {
        firm_id: order.firm_id,
        stage: { in: queueStages as any },
        driver_id: null, // No driver assigned yet
        created_at: { lt: order.created_at },
      },
    });

    return {
      queuePosition: ordersAhead + 1, // 1-indexed position
      ordersAhead: ordersAhead,
    };
  },

  // Get available orders for drivers (orders without driver assigned)
  async getAvailableOrders(status?: string) {
    // Map mobile app status to database values
    // Mobile uses: ORDER_PLACED, IN_QUEUE, COURIER_ON_THE_WAY, COURIER_ARRIVED, DELIVERED, CANCELLED
    // DB may have: PENDING or IN_QUEUE for new orders, then DELIVERING, DELIVERED, CANCELLED
    const statusMap: Record<string, string[]> = {
      'ORDER_PLACED': ['PENDING', 'IN_QUEUE'],
      'IN_QUEUE': ['PENDING', 'IN_QUEUE'],
      'COURIER_ON_THE_WAY': ['DELIVERING', 'PICKED_UP', 'CONFIRMED'],
      'COURIER_ARRIVED': ['DELIVERING'],
      'DELIVERED': ['DELIVERED'],
      'CANCELLED': ['CANCELLED'],
    };

    // Get the stages to query for (support both PENDING and IN_QUEUE for compatibility)
    const stagesToQuery = status ? (statusMap[status] || [status]) : ['PENDING', 'IN_QUEUE'];

    // Get orders without a driver assigned that are in queue
    const orders = await prisma.orders.findMany({
      where: {
        driver_id: null, // No driver assigned yet
        stage: { in: stagesToQuery as any },
      },
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            client_profiles: { select: { name: true } },
          },
        },
        firms: { select: { id: true, name: true } },
        addresses: true,
        order_items: {
          include: {
            products: { select: { name: true, image_url: true } },
          },
        },
      },
      orderBy: { created_at: 'asc' }, // Oldest first (FIFO)
    });

    // Transform to include user.name from clientProfile and rename orderItems to items
    return orders.map(order => {
      const { order_items, ...rest } = order;
      return {
        ...rest,
        items: order_items,
        user: {
          id: order.users.id,
          phone: order.users.phone,
          name: order.users.client_profiles?.name || 'User',
        },
      };
    });
  },
};
