# 🏪 PetShop Management System

A modern, responsive Point of Sale (POS) and inventory management system built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### 🛒 Point of Sale (POS)
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
```

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://103.54.170.35:8001/api/v1
VITE_TENANT_NAME=petshop

# App Configuration  
VITE_APP_NAME=PetShop POS
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment

### Vercel Deployment

1. **Automatic Deployment**:
   ```bash
   # Push to main branch for automatic deployment
   git push origin main
   ```

2. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

### Production Configuration

The project includes `vercel.json` with proxy configuration to handle HTTPS/HTTP mixed content:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://103.54.170.35:8001/api/v1/$1"
    }
  ]
}
```

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

## 🔧 API Integration

### Authentication
```typescript
// Login
POST /auth/login
{
  "username": "admin",
  "password": "password"
}

// Refresh Token
POST /auth/refresh
{
  "refresh_token": "your_refresh_token"
}
```

### Products Management
```typescript
// Get Products
GET /products

// Create Product
POST /products
{
  "name": "Product Name",
  "price": 10000,
  "stock": 100,
  "brand_id": 1,
  "category_id": 1
}
```

### Brands & Categories
```typescript
// Get Brands
GET /brands

// Get Categories  
GET /categories
```

## 🎨 UI Components

### Reusable Components
- `Button` - Styled button with variants
- `Modal` - Accessible modal dialogs
- `ProductSearch` - Real-time product search
- `Cart` - Shopping cart management

### Layout Components
- `Layout` - Main app layout wrapper
- `Sidebar` - Navigation sidebar with dropdowns

## 🔒 Authentication Flow

1. **Login**: User enters credentials
2. **Token Storage**: JWT tokens stored securely
3. **Auto Refresh**: Automatic token refresh before expiry
4. **Route Protection**: Protected routes redirect to login
5. **Logout**: Clear tokens and redirect

## 🛡️ Security Features

- **CORS Handling**: Proper CORS configuration
- **Token Management**: Secure JWT handling
- **Input Validation**: Client-side validation
- **Error Handling**: Comprehensive error management

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop**: Full desktop experience
- **Touch Friendly**: Touch-optimized interfaces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@petshop.com
- 📞 Phone: +62 xxx-xxx-xxxx

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Vercel for seamless deployment
- Open source community for inspiration
