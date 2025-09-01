# Backend Requirements untuk Pet Shop Management

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total DECIMAL(10,2) NOT NULL,
  cashier_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Transaction Items Table
```sql
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);
```

## API Endpoints Detail

### Authentication Endpoints

#### POST /api/auth/login
**Request:**
```json
{
  "email": "admin@petshop.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@petshop.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/logout
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@petshop.com",
    "role": "admin"
  }
}
```

### Products Endpoints

#### GET /api/products
**Query Parameters:**
- `search` (optional): Search by product name
- `category` (optional): Filter by category
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Royal Canin Adult Cat Food",
      "category": "Makanan Kucing",
      "price": 125000,
      "stock": 50,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

#### POST /api/products
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "name": "New Product",
  "category": "Makanan Kucing",
  "price": 50000,
  "stock": 25
}
```

#### PUT /api/products/:id
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "name": "Updated Product Name",
  "price": 55000,
  "stock": 30
}
```

#### DELETE /api/products/:id
**Headers:** `Authorization: Bearer {token}`

#### GET /api/products/low-stock
**Query Parameters:**
- `threshold` (optional): Stock threshold (default: 10)

### Transactions Endpoints

#### POST /api/transactions
**Headers:** `Authorization: Bearer {token}`
**Request:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    },
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "total": 315000
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "total": 315000,
    "cashier_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "updated_products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "new_stock": 48
    }
  ]
}
```

#### GET /api/transactions
**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `page`, `limit`: Pagination

#### GET /api/transactions/:id
**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "total": 315000,
    "cashier": {
      "id": "uuid",
      "name": "Cashier Name"
    },
    "created_at": "2024-01-01T00:00:00Z"
  },
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Product Name"
      },
      "quantity": 2,
      "price": 125000,
      "subtotal": 250000
    }
  ]
}
```

### Dashboard/Reports Endpoints

#### GET /api/dashboard/stats
**Query Parameters:**
- `date` (optional): Specific date for stats

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_products": 150,
    "today_transactions": 25,
    "today_revenue": 2500000,
    "low_stock_count": 5
  }
}
```

#### GET /api/reports/sales
**Query Parameters:**
- `start_date`, `end_date`: Date range
- `group_by`: 'day' or 'month'

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_revenue": 10000000,
    "total_transactions": 150
  },
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 500000,
      "transactions": 10
    }
  ]
}
```

#### GET /api/reports/products
**Response:**
```json
{
  "success": true,
  "best_selling": [
    {
      "product_id": "uuid",
      "product_name": "Product Name",
      "total_sold": 100,
      "total_revenue": 5000000
    }
  ],
  "revenue_by_category": [
    {
      "category": "Makanan Kucing",
      "total_revenue": 3000000,
      "percentage": 30
    }
  ]
}
```

## Backend Technology Stack Recommendations

### Option 1: Node.js + Express
- **Framework:** Express.js
- **Database:** PostgreSQL dengan Prisma ORM
- **Authentication:** JWT dengan bcrypt
- **Validation:** Joi atau Zod
- **Documentation:** Swagger/OpenAPI

### Option 2: Python + FastAPI
- **Framework:** FastAPI
- **Database:** PostgreSQL dengan SQLAlchemy
- **Authentication:** JWT dengan passlib
- **Validation:** Pydantic (built-in)
- **Documentation:** Auto-generated OpenAPI

### Option 3: PHP + Laravel
- **Framework:** Laravel
- **Database:** MySQL/PostgreSQL dengan Eloquent ORM
- **Authentication:** Laravel Sanctum
- **Validation:** Laravel Form Requests

## Security Considerations

1. **Input Validation:** Semua input harus divalidasi
2. **SQL Injection Prevention:** Gunakan parameterized queries
3. **Rate Limiting:** Batasi request per IP/user
4. **CORS Configuration:** Set proper CORS headers
5. **Password Hashing:** Gunakan bcrypt atau argon2
6. **JWT Security:** Set proper expiration dan refresh tokens

## Performance Optimizations

1. **Database Indexing:** Index pada kolom yang sering di-query
2. **Caching:** Redis untuk cache data yang sering diakses
3. **Pagination:** Implement proper pagination untuk large datasets
4. **Connection Pooling:** Database connection pooling
5. **API Response Compression:** Gzip compression

## Deployment Considerations

1. **Environment Variables:** Semua config via env vars
2. **Health Checks:** Endpoint untuk monitoring
3. **Logging:** Structured logging dengan levels
4. **Error Handling:** Consistent error response format
5. **Database Migrations:** Version-controlled schema changes