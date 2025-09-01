# 🏪 PetShop Management System

A modern, responsive Point of Sale (POS) and inventory management system built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### � Point of Sale (POS)
- Real-time product search and barcode scanning
- Shopping cart with automatic calculations
- Multiple payment methods support
- Receipt generation and printing

### 📦 Inventory Management
- Product CRUD operations with image support
- Brand and category management
- Stock tracking and low stock alerts
- Bulk product operations

### 📊 Dashboard & Analytics
- Sales overview and analytics
- Inventory reports and insights
- Revenue tracking and trends
- Export functionality for reports

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control
- Secure API communication
- Session management

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **HTTP Client**: Fetch API with custom service layer
- **Deployment**: Vercel with proxy configuration
- **Code Quality**: ESLint, TypeScript strict mode

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # App configuration
├── constants/          # Application constants
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── store/              # State management
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

For detailed structure information, see [STRUCTURE.md](./STRUCTURE.md)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd petshop-repo-main

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your API endpoints

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
