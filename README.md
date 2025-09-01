# Pet Shop Management System

A modern web-based Point of Sale (POS) system built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 Authentication with JWT tokens
- 📦 Product management with categories and brands
- 💰 Sales transaction processing
- 📊 Dashboard with sales analytics
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

## Environment Setup

### Development

Update the environment variables in `.env`:

```env
VITE_API_BASE_URL=http://103.54.170.35:8001/api/v1
VITE_TENANT_NAME=wojo
```

### Production (Vercel)

Set these environment variables in Vercel Dashboard:

- `VITE_API_BASE_URL`: `http://103.54.170.35:8001/api/v1`
- `VITE_TENANT_NAME`: `wojo`

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel Dashboard
3. Set environment variables
4. Deploy automatically

The application will be available at your Vercel domain.
