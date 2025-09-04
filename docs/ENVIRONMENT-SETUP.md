# Environment Configuration

## 📁 File Structure

```
├── .env.example          # ✅ Template (commit ke git)
├── .env.development      # ✅ Development config (commit ke git)
├── .env.production       # ✅ Production config (commit ke git)
└── .env.local           # ❌ Local overrides (JANGAN commit)
```

## 🚀 Quick Setup

### Copy template untuk local development:

```bash
cp .env.example .env.local
```

### Edit `.env.local` dengan nilai actual:

```properties
VITE_API_BASE_URL=http://your-server.com/api/v1
VITE_TENANT_NAME=your-tenant
```

## 📋 Environment Variables

| Variable            | Description       | Example                        |
| ------------------- | ----------------- | ------------------------------ |
| `VITE_API_BASE_URL` | API server URL    | `http://localhost:8001/api/v1` |
| `VITE_TENANT_NAME`  | Tenant identifier | `wojo`                         |
| `VITE_APP_NAME`     | Application name  | `PetShop POS`                  |
| `VITE_APP_VERSION`  | App version       | `1.0.0`                        |

### 3. Environment Priority

Vite loads environment files in this order:

1. `.env.local` (always loaded, ignored by git)
2. `.env.development` (when MODE=development)
3. `.env.production` (when MODE=production)
4. `.env.example` (template only)

### 4. Usage in Code

```typescript
// Environment variables are available via import.meta.env
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const tenantName = import.meta.env.VITE_TENANT_NAME;
```

### 5. Security Notes

- ✅ `.env.example` - Template, safe to commit
- ✅ `.env.development` - Development config, safe to commit
- ✅ `.env.production` - Production config, safe to commit
- ❌ `.env.local` - Local overrides, NEVER commit
- ❌ `.env` - Contains secrets, NEVER commit

### 6. Proxy Configuration

The development server includes proxy configuration to avoid CORS:

- Local requests to `/api/*` are proxied to the actual API server
- This allows using relative URLs in production and direct URLs in development
