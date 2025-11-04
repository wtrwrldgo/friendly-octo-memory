# WaterGo Platform CRM

Super admin control center for managing all firms, orders, and drivers.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

- **Dashboard**: Global stats + firms list
- **Firms**: View and manage all partner firms
- **Orders**: Monitor all orders across all firms
- **Drivers**: Track all drivers in real-time

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.watergo.uz
```

## Pages

- `/` - Dashboard
- `/firms/[id]` - Firm detail
- `/orders` - Global orders
- `/drivers` - Global drivers

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React Icons
