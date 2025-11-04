// file: lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.watergo.uz";

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  getGlobalStats: () => fetcher<any>("/stats/global"),
  getFirms: () => fetcher<any>("/firms"),
  getFirm: (id: string) => fetcher<any>(`/firms/${id}`),
  createFirm: (data: any) => fetcher<any>("/firms", { method: "POST", body: JSON.stringify(data) }),
  updateFirmStatus: (id: string, status: string) =>
    fetcher<any>(`/firms/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getFirmOrders: (firmId: string) => fetcher<any>(`/firms/${firmId}/orders`),
  getFirmDrivers: (firmId: string) => fetcher<any>(`/firms/${firmId}/drivers`),
  getFirmClients: (firmId: string) => fetcher<any>(`/firms/${firmId}/clients`),
  getAllOrders: () => fetcher<any>("/orders"),
  getAllDrivers: () => fetcher<any>("/drivers"),
};
