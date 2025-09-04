# Project Structure

## Overview

```
src/
├── components/          # Reusable UI components
│   ├── Cashier/        # Cashier-specific components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   ├── Products/       # Product-specific components
│   └── ui/             # Basic UI components (Button, Modal)
├── config/             # Configuration files
│   └── app.ts          # App configuration and environment
├── constants/          # Application constants
│   └── index.ts        # Routes, API endpoints, storage keys
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── pages/              # Page components
│   ├── Brands.tsx      # Brand management page
│   ├── Categories.tsx  # Category management page
│   ├── Cashier.tsx     # Point of Sale page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Login page
│   ├── Products.tsx    # Product management page
│   └── Reports.tsx     # Reports page
├── services/           # API services
│   ├── api.ts          # Main API service class
│   └── index.ts        # Service exports
├── store/              # State management
│   └── useStore.ts     # Zustand store
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
├── utils/              # Utility functions
│   ├── auth.ts         # Authentication utilities
│   └── index.ts        # Utility exports
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Key Features

### 📁 **Organized Structure**

- Logical separation of concerns
- Clean import/export pattern
- Consistent naming conventions

### 🔧 **Configuration Management**

- Centralized environment configuration
- Constants for routes and API endpoints
- Type-safe configuration

### 🎯 **Component Organization**

- Feature-based component grouping
- Reusable UI components
- Layout components for consistency

### 📡 **API Management**

- Centralized API service
- Type-safe API calls
- Error handling and logging

### 🗃️ **State Management**

- Zustand for global state
- Custom hooks for complex logic
- Type-safe store operations

### 🛡️ **Type Safety**

- Comprehensive TypeScript types
- Interface definitions for all data structures
- Type-safe constants and configurations

## Best Practices Implemented

1. **Single Responsibility**: Each file has a clear, single purpose
2. **DRY Principle**: Constants and utilities are reused across the app
3. **Type Safety**: Full TypeScript coverage with proper typing
4. **Clean Imports**: Barrel exports for clean import statements
5. **Environment Separation**: Different configs for dev/prod environments
6. **Error Handling**: Comprehensive error handling throughout the app
7. **Consistent Naming**: Clear, consistent naming conventions
8. **Separation of Concerns**: Clear boundaries between different app layers
