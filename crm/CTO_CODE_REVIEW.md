# WaterGo Platform CRM - CTO Code Review
**Review Date:** November 2025
**Reviewed By:** Technical Architecture Team
**Codebase Size:** ~8,236 lines of TypeScript/TSX
**Version:** 1.0 (MVP)

---

## Executive Summary

### Overall Assessment
The WaterGo CRM is a **well-architected MVP** with solid foundations for a production SaaS platform. The code demonstrates modern React/Next.js best practices, strong TypeScript usage, and good separation of concerns. However, several critical production-readiness gaps exist that must be addressed before launch.

### Production Readiness Score: **6.5/10**

**Strengths:**
- ✅ Excellent custom hooks architecture (useCRUD, useForm, useModal)
- ✅ Strong TypeScript type safety (100% typed interfaces)
- ✅ Clean component structure and reusability
- ✅ Modern Next.js 14 App Router implementation
- ✅ Comprehensive utility library
- ✅ Dark mode support throughout

**Critical Gaps:**
- ❌ No real API integration (100% mock data)
- ❌ Weak authentication (localStorage only, no tokens)
- ❌ No error boundaries
- ❌ Browser alert() dialogs instead of toast notifications
- ❌ Missing loading/error states
- ❌ No data persistence layer

---

## 1. Architecture & Design Patterns

### ⭐ Excellent: Custom Hooks Pattern
**Status:** **Production Ready**

The custom hooks architecture is exemplary:

```typescript
// hooks/useCRUD.ts - 230 lines
- Generic CRUD operations with full TypeScript support
- Lifecycle hooks (onBeforeCreate, onBeforeUpdate, onBeforeDelete)
- Bulk operations support
- Error handling built-in
- 60% code reduction vs direct state management
```

**Impact:** This pattern scales well and will easily adapt to API integration.

### ⭐ Good: Context Architecture
**Status:** **Needs Enhancement**

```typescript
// contexts/AuthContext.tsx
✅ Clean context pattern
✅ Custom hook with error handling
❌ localStorage auth (insecure for production)
❌ No token refresh
❌ No session timeout
```

**Recommendation:** Implement JWT-based auth with httpOnly cookies.

### ⚠️ Issue: Large Page Components
**Status:** **Needs Refactoring**

```
app/firm-order-create/page.tsx: 936 lines ⚠️
app/firm-finances/page.tsx:     729 lines ⚠️
app/firm-regions/page.tsx:      724 lines ⚠️
app/firm-products/page.tsx:     607 lines ⚠️
```

**Impact:** Difficult to maintain, test, and debug.

**Recommendation:** Break into smaller components:
```typescript
// Current: 936-line monolith
firm-order-create/page.tsx

// Proposed: Modular structure
firm-order-create/
  ├── page.tsx (100 lines - layout only)
  ├── components/
  │   ├── ClientSelector.tsx
  │   ├── ProductGrid.tsx
  │   ├── ShoppingCart.tsx
  │   └── CheckoutForm.tsx
  └── hooks/
      └── useOrderCreation.ts
```

**Effort:** 2-3 days per large page

---

## 2. Code Quality

### ⭐ Excellent: TypeScript Usage
**Status:** **Production Ready**

```typescript
// types/index.ts - 171 lines
- 16 fully-typed interfaces
- Union types for statuses
- No 'any' types in business logic
- Proper type exports

Examples:
export type OrderStatus = "PENDING" | "ASSIGNED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
export type ClientType = "B2B" | "B2C" | "B2G";
```

**Type Safety:** 100% ✅

### ⭐ Good: Utility Functions
**Status:** **Production Ready**

```typescript
// lib/utils.ts - 177 lines
- 18 utility functions
- All functions typed
- Comprehensive validation suite
- Currency/date formatting
- Phone/email validation
```

**Quality Score:** 9/10

### ⚠️ Issue: Duplicate Code Patterns
**Status:** **Medium Priority**

Found similar patterns across pages:
- Modal state management (duplicated 8+ times)
- Search/filter logic (duplicated 6+ times)
- Table rendering (duplicated 5+ times)

**Recommendation:** Create shared components:
```typescript
components/
  ├── DataTable/
  │   ├── DataTable.tsx
  │   ├── useTableFilters.ts
  │   └── useTablePagination.ts
  ├── SearchBar.tsx
  └── FilterBar.tsx
```

**Effort:** 3-4 days

---

## 3. Security Assessment

### 🔴 CRITICAL: Authentication System
**Status:** **NOT Production Ready**

#### Current Implementation:
```typescript
// contexts/AuthContext.tsx:32-40
const userType = localStorage.getItem("userType");
const userEmail = localStorage.getItem("userEmail");
const firmId = localStorage.getItem("firmId");
```

**Vulnerabilities:**
1. **XSS Attack Vector:** localStorage accessible via JavaScript
2. **No Token Expiry:** Sessions never timeout
3. **No CSRF Protection:** No token-based auth
4. **Client-Side Only:** No server verification
5. **Credentials Exposed:** All auth data in browser storage

**Risk Level:** 🔴 CRITICAL

**Required Fix:**
```typescript
// Recommended Implementation
interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 1. Use httpOnly cookies for tokens
// 2. Implement JWT with short expiry (15 min)
// 3. Refresh token rotation
// 4. Server-side session validation
// 5. CSRF tokens for state-changing operations
```

**Effort:** 5-7 days
**Priority:** P0 - Block production launch

### 🔴 CRITICAL: Input Validation
**Status:** **Partially Implemented**

```typescript
// ✅ Good: Validation utilities exist
lib/utils.ts:
  - isValidEmail()
  - isValidPhone()
  - isValidPrice()

// ❌ Issue: Not consistently enforced
// Found 4 instances of alert() with user messages
app/firm-order-create/page.tsx:168-178
```

**Missing:**
- Server-side validation (all validation is client-side only)
- SQL injection protection (when API is integrated)
- XSS sanitization for user-generated content
- File upload validation (for future product images)

**Recommendation:**
```typescript
// Add zod for schema validation
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  description: z.string().max(500),
});

// Use in API routes
export async function POST(request: Request) {
  const body = await request.json();
  const validated = ProductSchema.parse(body); // Throws on invalid
  // ...
}
```

**Effort:** 2-3 days
**Priority:** P0

### ⚠️ MEDIUM: Sensitive Data Exposure
**Status:** **Needs Attention**

```typescript
// .env file committed (should be .env.local)
NEXT_PUBLIC_API_URL=https://api.watergo.uz

// ⚠️ NEXT_PUBLIC_ prefix exposes to client
// Use server-side env vars for sensitive data
```

**Recommendation:**
- Use `.env.local` (gitignored)
- Remove `NEXT_PUBLIC_` for API keys
- Use Next.js API routes as proxy
- Never expose backend URLs to client

**Effort:** 1 day
**Priority:** P1

---

## 4. Performance Analysis

### ⭐ Good: Memoization Usage
**Status:** **Well Implemented**

```typescript
// Found proper useMemo usage:
- 12 useMemo for expensive calculations
- 8 useCallback for function stability
- Proper dependency arrays
```

**Example from firm-order-create/page.tsx:**
```typescript
const filteredProducts = useMemo(() => {
  return mockProducts.filter((product) => {
    const matchesSearch = /* ... */;
    const matchesCategory = /* ... */;
    return matchesSearch && matchesCategory && product.inStock;
  });
}, [searchQuery, categoryFilter]); // ✅ Correct deps
```

### ⚠️ Issue: Missing Code Splitting
**Status:** **Medium Priority**

```typescript
// Current: All pages loaded upfront
// No dynamic imports

// Recommended: Lazy load heavy components
const ProductGrid = dynamic(() => import('./ProductGrid'), {
  loading: () => <Skeleton />,
  ssr: false
});

const ChartsLibrary = dynamic(() => import('recharts'), {
  ssr: false // 500KB+ library
});
```

**Impact:** Initial bundle size bloat
**Effort:** 2 days
**Priority:** P2

### ⚠️ Issue: No Image Optimization
**Status:** **Future Concern**

```typescript
// No next/image usage (products don't have images yet)
// When product images are added:

// ❌ Current (potential):
<img src={product.image} alt={product.name} />

// ✅ Should be:
import Image from 'next/image';
<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"
/>
```

**Effort:** 1 day (when images added)
**Priority:** P3

---

## 5. Data Management

### 🔴 CRITICAL: Mock Data Only
**Status:** **NOT Production Ready**

```typescript
// lib/mockData.ts - 400+ lines of mock data
export const mockFirms: Firm[] = [...]
export const mockDrivers: Driver[] = [...]
export const mockOrders: Order[] = [...]
export const mockClients: Client[] = [...]
export const mockProducts: Product[] = [...]
```

**Current State:**
- ✅ Comprehensive mock data for development
- ✅ Realistic data structures
- ❌ No persistence (refresh = data lost)
- ❌ No API integration
- ❌ No real-time updates

**API Integration Path:**

```typescript
// Step 1: Create API client layer
// lib/api/client.ts
export class ApiClient {
  private baseURL = process.env.API_URL;

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  }

  // ... post, put, delete methods
}

// Step 2: Create resource-specific services
// lib/api/products.ts
export const ProductsAPI = {
  list: () => client.get<Product[]>('/products'),
  create: (data: CreateProductDTO) => client.post('/products', data),
  update: (id: string, data: UpdateProductDTO) =>
    client.put(`/products/${id}`, data),
  delete: (id: string) => client.delete(`/products/${id}`),
};

// Step 3: Integrate with hooks
// hooks/useProducts.ts
export function useProducts() {
  const { data, isLoading, error } = useQuery(
    'products',
    ProductsAPI.list
  );

  const createMutation = useMutation(ProductsAPI.create);

  return {
    products: data ?? [],
    loading: isLoading,
    error,
    create: createMutation.mutate,
  };
}
```

**Effort:** 10-14 days (full API integration)
**Priority:** P0 - Blocks production

### ⭐ Excellent: useCRUD Hook Design
**Status:** **API-Ready**

The useCRUD hook is designed for easy API migration:

```typescript
// Current: Mock data
const { items, create, update, remove } = useCRUD({
  initialData: mockProducts,
});

// Future: With API (minimal changes)
const { items, create, update, remove } = useCRUD({
  initialData: [],
  apiConfig: {
    endpoint: '/products',
    fetchOnMount: true,
  },
});
```

**Migration Effort:** 1 day per resource type
**Quality:** 10/10 for forward compatibility

---

## 6. UI/UX Consistency

### ⭐ Excellent: Design System
**Status:** **Production Ready**

```typescript
// Consistent gradient backgrounds
bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950

// Consistent rounded corners
rounded-2xl (inputs)
rounded-3xl (cards)

// Consistent shadows
shadow-xl (elevated elements)
shadow-2xl (modals)

// Category-specific colors
Water: blue-cyan gradient
Accessories: purple-pink gradient
Equipment: orange-red gradient
```

**Consistency Score:** 9/10

### ⭐ Good: Dark Mode Implementation
**Status:** **Production Ready**

```typescript
// contexts/ThemeContext.tsx
- Persists in localStorage
- Applies to all components
- Smooth transitions
- No FOUC (Flash of Unstyled Content)
```

**Coverage:** 100% of components

### ⚠️ Issue: Accessibility (a11y)
**Status:** **Needs Improvement**

**Missing:**
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators on custom components
- Screen reader announcements
- Color contrast ratios not validated

**Example Fixes:**
```typescript
// ❌ Current
<button onClick={handleDelete}>
  <Trash2 className="w-4 h-4" />
</button>

// ✅ Fixed
<button
  onClick={handleDelete}
  aria-label="Delete product"
  className="focus:ring-2 focus:ring-blue-500"
>
  <Trash2 className="w-4 h-4" aria-hidden="true" />
</button>
```

**Effort:** 3-4 days
**Priority:** P2

---

## 7. Technical Debt

### ⚠️ MEDIUM: Alert Dialogs
**Status:** **User Experience Issue**

Found 9 instances of `alert()` and `console.log()`:

```typescript
// app/firm-order-create/page.tsx:168-181
alert("Please select a client");
alert("Please add products to cart");
alert("Please enter delivery address");
alert(`Order created successfully!\n\nClient: ...`);

// app/login/page.tsx:85
alert("Invalid credentials. Try:...");

// components/AddFirmAccountModal.tsx:50
console.log("Creating firm account:", formData);
```

**Issues:**
- Non-dismissible blocking dialogs
- Poor UX (no styling, no animation)
- Breaks mobile experience
- console.log() in production code

**Recommendation: Toast Notifications**

```bash
npm install sonner
```

```typescript
// components/ui/toaster.tsx
import { Toaster } from 'sonner';

export function ToastProvider() {
  return <Toaster position="top-right" />;
}

// Usage:
import { toast } from 'sonner';

// ✅ Success
toast.success('Order created successfully!', {
  description: `Client: ${selectedClient.name}`,
  duration: 3000,
});

// ❌ Error
toast.error('Please select a client', {
  action: {
    label: 'Select',
    onClick: () => setShowClientModal(true),
  },
});
```

**Effort:** 1 day
**Priority:** P1

### ⚠️ MEDIUM: No Error Boundaries
**Status:** **Stability Risk**

```typescript
// Missing: Error boundary components
// Result: One component error crashes entire app

// Recommended:
// app/error.tsx (Next.js 14 error boundary)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Effort:** 2 days
**Priority:** P1

### ⚠️ LOW: Missing Loading States
**Status:** **User Experience**

Many operations have no loading indicators:
- Form submissions
- Data fetching
- Modal operations

**Example Fix:**
```typescript
// ❌ Current
<button onClick={createOrder}>Create Order</button>

// ✅ Fixed
<button
  onClick={createOrder}
  disabled={isLoading}
  className="flex items-center gap-2"
>
  {isLoading && <Spinner className="w-4 h-4 animate-spin" />}
  {isLoading ? 'Creating...' : 'Create Order'}
</button>
```

**Effort:** 2 days
**Priority:** P2

---

## 8. Dependency Analysis

### ⭐ Good: Minimal Dependencies
**Status:** **Production Ready**

```json
{
  "dependencies": {
    "next": "^14.1.0",          // ✅ Latest stable
    "react": "^18.2.0",         // ✅ Latest stable
    "react-query": "^3.39.3",   // ⚠️ v3 is deprecated, use v5
    "recharts": "^2.10.3",      // ✅ Charts library
    "clsx": "^2.1.0",           // ✅ Classname utility
    "tailwind-merge": "^2.2.0", // ✅ Tailwind merger
    "lucide-react": "^0.309.0"  // ✅ Icon library
  }
}
```

**Issues:**
1. **react-query v3:** Deprecated, should upgrade to @tanstack/react-query v5
2. **Missing:** Error tracking (Sentry)
3. **Missing:** Analytics (PostHog, Google Analytics)

**Recommendations:**
```bash
# Upgrade react-query
npm uninstall react-query
npm install @tanstack/react-query@latest

# Add error tracking
npm install @sentry/nextjs

# Add toast notifications
npm install sonner

# Add form handling
npm install react-hook-form zod @hookform/resolvers
```

**Effort:** 2 days
**Priority:** P1

---

## 9. Production Readiness Checklist

### 🔴 Blockers (Must Fix Before Launch)

| Issue | Status | Effort | Priority |
|-------|--------|--------|----------|
| Real API Integration | ❌ Not Started | 10-14 days | P0 |
| JWT Authentication | ❌ Not Started | 5-7 days | P0 |
| Input Validation (Server) | ❌ Not Started | 2-3 days | P0 |
| Error Boundaries | ❌ Not Started | 2 days | P1 |
| Environment Variables | ❌ Not Started | 1 day | P1 |
| Toast Notifications | ❌ Not Started | 1 day | P1 |

**Total Blocker Effort:** ~22-30 days

### ⚠️ Important (Fix Soon After Launch)

| Issue | Status | Effort | Priority |
|-------|--------|--------|----------|
| Component Refactoring | 📝 Planned | 2-3 days/page | P2 |
| Code Splitting | 📝 Planned | 2 days | P2 |
| Accessibility | 📝 Planned | 3-4 days | P2 |
| Loading States | 📝 Planned | 2 days | P2 |
| Dependency Upgrades | 📝 Planned | 2 days | P1 |

### ✅ Nice to Have (Post-Launch)

- Image optimization
- Analytics integration
- Performance monitoring
- E2E testing
- Storybook component library

---

## 10. Recommendations by Priority

### P0 - Critical (Pre-Launch)

1. **API Integration** (10-14 days)
   ```typescript
   // Create API client layer
   // Integrate with useCRUD hooks
   // Add error handling
   // Test all endpoints
   ```

2. **Authentication Overhaul** (5-7 days)
   ```typescript
   // Implement JWT with httpOnly cookies
   // Add refresh token rotation
   // Server-side session validation
   // Login/logout flows
   ```

3. **Server-Side Validation** (2-3 days)
   ```typescript
   // Add zod schemas
   // Create Next.js API routes
   // Validate all inputs
   // Sanitize outputs
   ```

### P1 - High (Week 1 Post-Launch)

4. **Error Handling** (2 days)
   - Add error boundaries
   - Implement toast notifications
   - Remove alert() dialogs
   - Add error logging

5. **Security Hardening** (2 days)
   - Move env vars to .env.local
   - Remove NEXT_PUBLIC_ from sensitive data
   - Add CSRF protection
   - Implement rate limiting

6. **Dependency Updates** (2 days)
   - Upgrade react-query to v5
   - Add Sentry for error tracking
   - Add form validation library

### P2 - Medium (Month 1)

7. **Component Refactoring** (6-9 days)
   - Break down 900+ line components
   - Create shared DataTable component
   - Extract SearchBar/FilterBar
   - Create reusable form components

8. **Performance** (4 days)
   - Implement code splitting
   - Add lazy loading
   - Optimize bundle size
   - Add performance monitoring

9. **Accessibility** (3-4 days)
   - Add ARIA labels
   - Implement keyboard navigation
   - Test with screen readers
   - Validate color contrast

### P3 - Low (Ongoing)

10. **Testing** (Ongoing)
    - Add unit tests (Jest)
    - Add integration tests (Playwright)
    - E2E test critical flows
    - Add visual regression tests

---

## 11. Cost-Benefit Analysis

### Investment Required

| Category | Effort | Cost ($) | Risk Reduction |
|----------|--------|----------|----------------|
| P0 Blockers | 22-30 days | $17,600-24,000 | 🔴 Critical → ✅ Safe |
| P1 High | 8 days | $6,400 | ⚠️ Medium → ✅ Safe |
| P2 Medium | 13-17 days | $10,400-13,600 | ⚠️ Low → ✅ Safe |

**Total Pre-Launch Investment:** 30-38 days (~$24,000-30,400)

*Assuming $800/day developer rate*

### ROI Analysis

**Without Fixes:**
- ❌ Security breaches (estimated loss: $100K-500K+)
- ❌ Data loss incidents (reputation damage)
- ❌ Poor UX → High churn rate
- ❌ Scaling issues at 100+ concurrent users

**With Fixes:**
- ✅ Enterprise-ready security
- ✅ Scalable to 10,000+ users
- ✅ Professional UX
- ✅ Maintainable codebase

**Break-Even:** ~40 enterprise customers @ $800/month

---

## 12. Timeline Recommendation

### Phase 1: Critical Fixes (Weeks 1-4)
```
Week 1: API Integration foundation
Week 2: Authentication system
Week 3: Validation & security
Week 4: Error handling & testing
```

### Phase 2: High Priority (Weeks 5-6)
```
Week 5: Dependency updates, toast system
Week 6: Security hardening, env vars
```

### Phase 3: Medium Priority (Weeks 7-9)
```
Week 7: Component refactoring (2 pages)
Week 8: Performance optimization
Week 9: Accessibility improvements
```

### Launch: Week 10 ✅

---

## 13. Final Verdict

### What's Working Well ⭐

1. **Architecture:** Custom hooks pattern is excellent
2. **Type Safety:** 100% TypeScript coverage
3. **Code Quality:** Clean, readable, well-organized
4. **Design System:** Consistent and modern
5. **Developer Experience:** Good DX with custom hooks

### What Needs Immediate Attention 🔴

1. **Security:** Authentication is not production-ready
2. **Data Layer:** No real API integration
3. **Error Handling:** Missing error boundaries
4. **Validation:** Client-side only, needs server validation
5. **UX:** Alert dialogs instead of proper notifications

### Bottom Line

**This is a high-quality MVP** with solid foundations, but it's **not production-ready** in its current state. The codebase demonstrates strong engineering practices and will scale well once the critical gaps are addressed.

**Recommendation:** **Invest 4-6 weeks** in addressing P0 and P1 issues before production launch. The ROI is substantial - you'll avoid costly security breaches, data loss, and scaling issues down the line.

**Technical Debt Score:** 3.5/10 (Low debt, mostly missing features vs bad code)

**Maintainability Score:** 8/10 (Easy to maintain once refactored)

**Scalability Score:** 7/10 (Will scale well with API layer)

---

## Appendix: Code Examples

### A. Recommended API Service Pattern

```typescript
// lib/api/base.ts
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ... put, delete, patch methods
}

// Usage
const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);
export const ProductsAPI = {
  list: () => api.get<Product[]>('/products'),
  create: (data: CreateProductDTO) => api.post('/products', data),
};
```

### B. Recommended Auth Flow

```typescript
// lib/auth/client.ts
export const AuthService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    return data.user;
  },

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Refresh failed');
    return response.json();
  },
};

// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Validate credentials
  const user = await validateCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set httpOnly cookies
  const response = NextResponse.json({ user });
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}
```

---

**Review Completed:** November 2025
**Next Review:** Post-API Integration (Estimated: January 2026)

