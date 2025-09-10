# AguaZarca Migration Architecture
## Complete Migration from Firebase to Railway + Next.js Static

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Static Generation](#frontend-static-generation)
5. [Deployment Strategy](#deployment-strategy)
6. [Migration Timeline](#migration-timeline)
7. [Cost Analysis](#cost-analysis)

---

## Architecture Overview

### Current State
- **Frontend**: React SPA with Firebase (no SEO, client-side rendering)
- **Backend**: Firebase + Basic PHP endpoints for MercadoLibre
- **Hosting**: Hostinger (supports static files only)
- **Issues**: No SEO, hardcoded credentials, no token refresh, potential Firebase costs

### Target Architecture

```
┌─────────────────────────────────────────────────────┐
│                GitHub Repository                     │
│         Frontend (Next.js) | Backend (Node.js)      │
└──────────────┬─────────────────────┬────────────────┘
               │                     │
               ▼                     ▼
┌──────────────────────┐  ┌─────────────────────────┐
│   GitHub Actions     │  │    Railway.app          │
│   Builds Static Site │  │    Auto-Deploy API      │
│   Every 6 hours      │  │    PostgreSQL DB        │
└──────────┬───────────┘  └─────────────────────────┘
           │                          │
           ▼                          │
┌──────────────────────┐              │
│  Hostinger (FTP)     │              │
│  Static HTML Files   │◄─────────────┘
│  $5/month            │   API Calls
└──────────────────────┘
```

### How It Works

1. **Build Time**: 
   - GitHub Actions fetches ALL properties from Railway API
   - Generates static HTML for each property (including unpublished)
   - Creates search indexes and sitemaps
   - Deploys to Hostinger via FTP

2. **Runtime**:
   - Users get instant static HTML (no database queries)
   - JavaScript hydrates for interactive features
   - Dynamic features (forms, auth) call Railway API

3. **Content Updates**:
   - Property changes in admin → Railway API
   - API triggers GitHub Action rebuild
   - New static files deployed in ~3-5 minutes

---

## Technology Stack

### Backend (Railway - $5-10/month)
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway managed)
- **ORM**: Prisma
- **Auth**: JWT with refresh tokens
- **MercadoLibre**: OAuth2 with automatic token refresh

### Frontend (Hostinger - $5/month existing)
- **Framework**: Next.js 14 (App Router)
- **Deployment**: Static export
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL

### DevOps
- **CI/CD**: GitHub Actions
- **Deployment**: Railway (auto) + FTP to Hostinger
- **Monitoring**: Google Analytics + Railway metrics

---

## Backend Implementation

### Project Structure

```
aguazarca-backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── properties.ts
│   │   ├── mercadolibre.ts
│   │   └── blogs.ts
│   ├── services/
│   │   ├── mercadolibre.service.ts
│   │   └── auth.service.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── railway.json
└── .env
```

### Database Schema (Prisma)

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  name            String?
  role            Role      @default(USER)
  properties      Property[]
  mlToken         MercadolibreToken?
  createdAt       DateTime  @default(now())
}

model Property {
  id                String    @id @default(cuid())
  title             String
  description       String?
  type              PropertyType
  commercialStatus  CommercialStatus
  price             Decimal?
  currency          String    @default("ARS")
  
  // Characteristics
  bedrooms          Int?
  bathrooms         Int?
  coveredArea       Float?
  totalArea         Float?
  
  // Location
  address           String?
  city              String?
  state             String?
  latitude          Float?
  longitude         Float?
  
  // Status
  published         Boolean   @default(false)
  featured          Boolean   @default(false)
  
  // MercadoLibre
  mercadolibreId    String?   @unique
  mercadolibreData  Json?
  
  // Relations
  images            PropertyImage[]
  previewTokens     PreviewToken[]
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model MercadolibreToken {
  id            String    @id @default(cuid())
  accessToken   String    @db.Text
  refreshToken  String    @db.Text
  expiresAt     DateTime
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
}

model PreviewToken {
  id          String    @id @default(cuid())
  token       String    @unique
  expiresAt   DateTime
  propertyId  String
  property    Property  @relation(fields: [propertyId], references: [id])
}
```

### MercadoLibre Integration

```typescript
// src/services/mercadolibre.service.ts
export class MercadoLibreService {
  async refreshToken(userId: string): Promise<string> {
    const tokenData = await prisma.mercadolibreToken.findUnique({
      where: { userId }
    })

    // Check if token needs refresh (5 min buffer)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60000)

    if (tokenData.expiresAt <= fiveMinutesFromNow) {
      const response = await axios.post(
        'https://api.mercadolibre.com/oauth/token',
        {
          grant_type: 'refresh_token',
          client_id: process.env.ML_CLIENT_ID,
          client_secret: process.env.ML_CLIENT_SECRET,
          refresh_token: tokenData.refreshToken,
        }
      )

      // Update tokens in database
      await prisma.mercadolibreToken.update({
        where: { userId },
        data: {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
        }
      })

      return response.data.access_token
    }

    return tokenData.accessToken
  }

  async importProperty(itemId: string, userId: string) {
    const token = await this.refreshToken(userId)
    
    // Fetch from MercadoLibre
    const { data: item } = await axios.get(
      `https://api.mercadolibre.com/items/${itemId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    // Transform and save
    const property = await prisma.property.create({
      data: {
        title: item.title,
        description: item.descriptions?.[0]?.text,
        price: item.price,
        mercadolibreId: item.id,
        mercadolibreData: item,
        userId,
        published: false
      }
    })
    
    // Import images
    if (item.pictures?.length > 0) {
      await prisma.propertyImage.createMany({
        data: item.pictures.map((pic, idx) => ({
          propertyId: property.id,
          url: pic.secure_url,
          orderIndex: idx
        }))
      })
    }
    
    return property
  }
}
```

### API Endpoints

```typescript
// Core endpoints
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id

// MercadoLibre
GET    /api/mercadolibre/auth-url
GET    /api/mercadolibre/callback
POST   /api/mercadolibre/import/:itemId
POST   /api/mercadolibre/refresh-token

// Preview system
POST   /api/preview/generate
GET    /api/preview/validate
```

---

## Frontend Static Generation

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}
```

### Static Page Generation

```typescript
// app/propiedades/[id]/page.tsx
export async function generateStaticParams() {
  // Generate pages for ALL properties (including unpublished)
  const properties = await fetch(`${API_URL}/properties/all`)
    .then(res => res.json())
  
  return properties.map((property) => ({
    id: property.id,
  }))
}

export default async function PropertyPage({ params }) {
  const property = await fetch(`${API_URL}/properties/${params.id}`)
    .then(res => res.json())
  
  // Unpublished properties show different content
  if (!property.published) {
    return (
      <>
        <meta name="robots" content="noindex, nofollow" />
        <UnpublishedBanner />
        <PropertyAuthCheck property={property} />
      </>
    )
  }
  
  return <PropertyDetails property={property} />
}
```

### Preview System for Unpublished Properties

```typescript
// Client-side auth check for agents
export function PropertyAuthCheck({ property }) {
  const [isAgent, setIsAgent] = useState(false)
  
  useEffect(() => {
    checkAuth().then(setIsAgent)
  }, [])
  
  if (!isAgent) {
    return <div>Property not available</div>
  }
  
  return (
    <div className="border-4 border-dashed border-orange-400">
      <div className="bg-orange-100 p-4">
        ⚠️ UNPUBLISHED - Agent Preview Only
      </div>
      <PropertyDetails property={property} />
    </div>
  )
}
```

### Build Process

```bash
# What happens during build
1. Fetch ALL properties from API
2. Generate HTML for each property
3. Create search indexes
4. Generate sitemap
5. Export static files to /out
```

### Generated File Structure

```
out/
├── index.html
├── propiedades/
│   ├── index.html
│   ├── prop-123/
│   │   └── index.html    # Full HTML with content
│   ├── prop-124/
│   │   └── index.html    # Even if unpublished
├── data/
│   ├── properties.json    # For client-side search
│   └── search-index.json
├── _next/
│   └── static/           # JS/CSS bundles
└── sitemap.xml           # Only published properties
```

---

## Deployment Strategy

### Railway Backend Setup

```bash
# 1. Connect GitHub repo to Railway
# 2. Railway auto-detects Node.js
# 3. Add PostgreSQL database
# 4. Set environment variables:

DATABASE_URL=postgresql://...
ML_CLIENT_ID=1906241279481736
ML_CLIENT_SECRET=your-secret
ML_REDIRECT_URI=https://your-app.railway.app/api/mercadolibre/callback
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://aguazarca.com.ar
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO=user/aguazarca-frontend
```

### GitHub Actions for Frontend

```yaml
# .github/workflows/deploy.yml
name: Deploy to Hostinger

on:
  push:
    branches: [main]
  repository_dispatch:
    types: [content-update]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install and Build
        env:
          NEXT_PUBLIC_API_URL: https://your-backend.railway.app
        run: |
          npm ci
          npm run build
      
      - name: Deploy to Hostinger
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./out/
          server-dir: ./public_html/
```

### Hostinger Configuration

```apache
# public/.htaccess
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Handle Next.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^/]+)/?$ $1/index.html [L]

# Cache static assets
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Trigger Rebuild from Backend

```typescript
// When content changes, trigger frontend rebuild
async function triggerRebuild() {
  await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        event_type: 'content-update'
      })
    }
  )
}
```

---

## Migration Timeline

### Week 1: Backend Setup
- [ ] Create Railway project
- [ ] Set up PostgreSQL database
- [ ] Implement auth system
- [ ] Build property CRUD endpoints
- [ ] MercadoLibre OAuth integration

### Week 2: Frontend Development
- [ ] Set up Next.js with TypeScript
- [ ] Create property pages
- [ ] Implement preview system
- [ ] Build admin dashboard
- [ ] Configure static export

### Week 3: Data Migration
- [ ] Export Firebase data
- [ ] Transform data structure
- [ ] Import to PostgreSQL
- [ ] Migrate images
- [ ] Verify data integrity

### Week 4: Integration & Testing
- [ ] Connect frontend to API
- [ ] Test MercadoLibre import
- [ ] Configure GitHub Actions
- [ ] Test FTP deployment
- [ ] Performance optimization

### Week 5: Launch
- [ ] Final testing
- [ ] DNS configuration
- [ ] Go live
- [ ] Monitor metrics
- [ ] Documentation

---

## Cost Analysis

### Monthly Costs

| Service | Cost | Purpose |
|---------|------|---------|
| Railway Backend | $5-10 | API + PostgreSQL |
| Hostinger | $5 | Static hosting (existing) |
| **Total** | **$10-15** | Complete solution |

### Comparison

| Solution | Monthly Cost | Pros | Cons |
|----------|-------------|------|------|
| **Current (Firebase)** | $0-50 | Simple | No SEO, cost uncertainty |
| **AWS Full Stack** | $113 | Scalable | Complex, expensive |
| **Railway + Hostinger** | $10-15 | Balanced | Perfect for this use case |

---

## Key Benefits

### SEO & Performance
- Static HTML pages load instantly
- Full content visible to search engines
- PageSpeed score > 90
- Social media previews work

### Developer Experience
- TypeScript throughout
- Automatic deployments
- Local development easy
- Git-based workflow

### Business Features
- MercadoLibre integration with auto-refresh
- Preview system for unpublished properties
- Agent authentication
- Analytics tracking

### Cost Effective
- 87% cheaper than AWS
- Predictable pricing
- No vendor lock-in
- Easy to migrate if needed

---

## Environment Variables Summary

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
ML_CLIENT_ID=1906241279481736
ML_CLIENT_SECRET=xxx
ML_REDIRECT_URI=https://api.aguazarca.com/api/mercadolibre/callback
JWT_SECRET=xxx
FRONTEND_URL=https://aguazarca.com.ar
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO=user/aguazarca-frontend
```

### Frontend (Build time)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_MAPBOX_TOKEN=xxx
```

### GitHub Secrets
```env
FTP_SERVER=ftp.aguazarca.com.ar
FTP_USERNAME=u123456789
FTP_PASSWORD=xxx
```

---

## Success Metrics

- **Page Load**: < 1 second
- **Build Time**: < 5 minutes
- **Deployment**: < 2 minutes
- **API Response**: < 200ms
- **Uptime**: 99.9%

---

## Support & Monitoring

- **Backend Logs**: Railway dashboard
- **Frontend Deploy**: GitHub Actions
- **Uptime**: UptimeRobot
- **Analytics**: Google Analytics
- **Errors**: Browser console + Railway logs

---

## Summary

This architecture provides:
1. **Fast, SEO-friendly** static site
2. **Full-featured backend** with MercadoLibre integration
3. **Preview system** for unpublished properties
4. **Automatic deployments** and content updates
5. **Total cost**: $10-15/month

Perfect balance of performance, features, and cost for a real estate website.