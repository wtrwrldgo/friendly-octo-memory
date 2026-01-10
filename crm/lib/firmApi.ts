// file: lib/firmApi.ts
// Branch-aware API calls for firm CRM pages
// Uses relative URLs to go through CRM's API routes (avoids Mixed Content issues)

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
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

// Branch context interface
export interface BranchContext {
  branchId?: string;
  canAccessAllBranches?: boolean;
}

// Build query string with branch params
function buildBranchParams(firmId: string, ctx?: BranchContext): string {
  const params = new URLSearchParams({ firmId });

  if (ctx?.branchId) {
    params.append('branchId', ctx.branchId);
  }
  if (ctx?.canAccessAllBranches) {
    params.append('canAccessAllBranches', 'true');
  }

  return params.toString();
}

// Firm API with branch filtering
export const firmApi = {
  // Orders - filtered by branch
  getOrders: (firmId: string, ctx?: BranchContext) =>
    fetcher<any>(`/orders?${buildBranchParams(firmId, ctx)}`),

  // Clients - shows clients who have orders in the branch
  getClients: (firmId: string, ctx?: BranchContext) =>
    fetcher<any>(`/clients?${buildBranchParams(firmId, ctx)}`),

  // Drivers - filtered by branch
  getDrivers: (firmId: string, ctx?: BranchContext) =>
    fetcher<any>(`/drivers?${buildBranchParams(firmId, ctx)}`),

  // Staff - filtered by branch (already implemented in previous phase)
  getStaff: (firmId: string, ctx?: BranchContext) =>
    fetcher<any>(`/staff/firm/${firmId}?${ctx?.branchId ? `branchId=${ctx.branchId}` : ''}`),

  // Products - not branch-filtered (firm-wide)
  getProducts: (firmId: string) =>
    fetcher<any>(`/products/firm/${firmId}`),

  // Branches - get all branches for a firm
  getBranches: (firmId: string) =>
    fetcher<any>(`/branches/firm/${firmId}`),
};
