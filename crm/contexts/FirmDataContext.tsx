// file: contexts/FirmDataContext.tsx
// Shared data context to cache firm data across pages and prevent refetching

"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { Order, Driver, Client } from "@/types";

interface FirmDataContextType {
  // Orders
  orders: Order[];
  ordersLoading: boolean;
  fetchOrders: (force?: boolean) => Promise<void>;

  // Drivers
  drivers: Driver[];
  driversLoading: boolean;
  fetchDrivers: (force?: boolean) => Promise<void>;

  // Clients
  clients: Client[];
  clientsLoading: boolean;
  fetchClients: (force?: boolean) => Promise<void>;

  // Refresh all
  refreshAll: () => Promise<void>;
}

const FirmDataContext = createContext<FirmDataContextType | undefined>(undefined);

// Cache expiration time (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

export function FirmDataProvider({ children }: { children: React.ReactNode }) {
  const { user, firm } = useAuth();

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const ordersLastFetch = useRef<number>(0);

  // Drivers state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const driversLastFetch = useRef<number>(0);

  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const clientsLastFetch = useRef<number>(0);

  const firmId = user?.firmId || firm?.id;

  // Fetch orders with caching - uses local API route to avoid mixed content issues
  const fetchOrders = useCallback(async (force = false) => {
    console.log('[FirmDataContext] ===== ORDERS FETCH v3 =====', { firmId, force });
    if (!firmId) {
      console.log('[FirmDataContext] No firmId, skipping orders fetch');
      return;
    }

    const now = Date.now();
    // Skip if data is fresh and not forcing refresh
    if (!force && orders.length > 0 && now - ordersLastFetch.current < CACHE_TTL) {
      console.log('[FirmDataContext] Using cached orders, age:', Math.round((now - ordersLastFetch.current) / 1000), 'seconds');
      return;
    }
    console.log('[FirmDataContext] Fetching fresh orders...');

    try {
      setOrdersLoading(true);
      // Use local API route instead of direct HTTP call to backend
      const response = await fetch(`/api/orders?firmId=${firmId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch orders:", result.error);
        return;
      }

      const data = result.data || [];
      // Debug: show raw address data structure for first order
      if (data[0]) {
        const firstOrder = data[0];
        console.log('[FirmDataContext] First order address debug:', {
          hasAddresses: 'addresses' in firstOrder,
          addressesValue: firstOrder.addresses,
          hasAddress: 'address' in firstOrder,
          addressValue: firstOrder.address,
          address_id: firstOrder.address_id,
        });
      }
      const mappedOrders = data.map((o: any) => {
        // Get address from the nested addresses relation (Prisma includes this)
        // Debug: show which path works
        let addressText = "";
        if (o.addresses?.address) {
          addressText = o.addresses.address;
        } else if (o.address?.address) {
          addressText = o.address.address;
        } else if (o.addressText) {
          addressText = o.addressText;
        } else if (typeof o.address === 'string' && o.address) {
          addressText = o.address;
        } else {
          // Show debug info: which fields exist
          addressText = `[DEBUG: addresses=${!!o.addresses}, addr=${!!o.address}]`;
        }
        // Get driver from 'drivers' relation (Prisma uses plural name)
        const driverData = o.drivers || o.driver;

        return {
          id: o.id,
          orderNumber: o.orderNumber || o.order_number || `WG-${new Date().getFullYear()}-000000`,
          firmId: o.firmId || o.firm_id,
          firmName: o.firms?.name || o.firm?.name || o.firmName || firm?.name || "",
          clientName: o.user?.name || o.clientName || o.users?.name || o.user?.phone || "Unknown Client",
          address: addressText,
          status: o.stage || o.status || "PENDING",
          paymentMethod: o.paymentMethod || o.payment_method || "CASH",
          total: o.total || 0,
          createdAt: o.createdAt || o.created_at,
          driverId: o.driver_id || driverData?.id || null,
          driverName: driverData?.name || o.driverName || null,
          driverPhone: driverData?.phone || o.driverPhone || null,
        };
      });
      setOrders(mappedOrders);
      ordersLastFetch.current = now;
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, [firmId, firm?.name, orders.length]);

  // Fetch drivers with caching - uses local API route to avoid mixed content issues
  const fetchDrivers = useCallback(async (force = false) => {
    if (!firmId) return;

    const now = Date.now();
    if (!force && drivers.length > 0 && now - driversLastFetch.current < CACHE_TTL) {
      return;
    }

    try {
      setDriversLoading(true);
      // Use local API route instead of direct HTTP call to backend
      const response = await fetch(`/api/drivers?firmId=${firmId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch drivers:", result.error);
        return;
      }

      const data = result.drivers || [];
      const mappedDrivers: Driver[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        firmId: d.firmId || d.firm_id,
        firmName: firm?.name || "My Firm",
        status: (d.isAvailable || d.is_available ? "ONLINE" : "OFFLINE") as "ONLINE" | "OFFLINE" | "DELIVERING",
        carPlate: d.vehicleNumber || d.vehicle_number || d.carPlate || "N/A",
        city: d.city || d.district || "N/A",
      }));
      setDrivers(mappedDrivers);
      driversLastFetch.current = now;
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setDriversLoading(false);
    }
  }, [firmId, firm?.name, drivers.length]);

  // Fetch clients with caching - uses local API route to avoid mixed content issues
  const fetchClients = useCallback(async (force = false) => {
    if (!firmId) return;

    const now = Date.now();
    if (!force && clients.length > 0 && now - clientsLastFetch.current < CACHE_TTL) {
      return;
    }

    try {
      setClientsLoading(true);
      // Use local API route instead of direct HTTP call to backend
      const response = await fetch(`/api/clients?firmId=${firmId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch clients:", result.error);
        return;
      }

      const data = result.clients || [];
      console.log('[FirmDataContext] Raw clients data:', data);
      const mappedClients: Client[] = data.map((c: any) => {
        // Use nullish coalescing to handle 0 values correctly
        const totalOrders = c.totalOrders ?? c._count?.orders ?? c.ordersCount ?? 0;
        const revenue = c.revenue ?? c.totalSpent ?? 0;
        const address = c.address ?? c.addresses?.[0]?.address ?? "No address";

        console.log('[FirmDataContext] Mapped client:', c.name, { totalOrders, revenue, address });

        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || "",
          address,
          firmId: firmId,
          type: "B2C" as const,
          totalOrders: Number(totalOrders),
          revenue: Number(revenue),
          createdAt: c.createdAt,
          lastOrderAt: c.lastOrderAt || c.createdAt,
        };
      });
      setClients(mappedClients);
      clientsLastFetch.current = now;
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setClientsLoading(false);
    }
  }, [firmId, clients.length]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchOrders(true),
      fetchDrivers(true),
      fetchClients(true),
    ]);
  }, [fetchOrders, fetchDrivers, fetchClients]);

  // Clear cache when firm changes
  useEffect(() => {
    if (firmId) {
      // Reset cache timestamps to trigger fresh fetch
      ordersLastFetch.current = 0;
      driversLastFetch.current = 0;
      clientsLastFetch.current = 0;
      setOrders([]);
      setDrivers([]);
      setClients([]);
    }
  }, [firmId]);

  const value = {
    orders,
    ordersLoading,
    fetchOrders,
    drivers,
    driversLoading,
    fetchDrivers,
    clients,
    clientsLoading,
    fetchClients,
    refreshAll,
  };

  return (
    <FirmDataContext.Provider value={value}>
      {children}
    </FirmDataContext.Provider>
  );
}

export function useFirmData() {
  const context = useContext(FirmDataContext);
  if (context === undefined) {
    throw new Error("useFirmData must be used within a FirmDataProvider");
  }
  return context;
}
