# Custom Domain Setup for Railway API
## Configure api.aguazarca.com.ar

## Railway Custom Domain Configuration

### Step 1: Add Domain in Railway Dashboard

1. Go to your Railway project dashboard
2. Click on **Settings** tab
3. Navigate to **Networking** section
4. Click **Custom Domain**
5. Enter your domain: `api.aguazarca.com.ar`
6. Click **Add Domain**

Railway will provide you with a target CNAME record.

### Step 2: Get Railway Target

Railway will show something like:
```
Type: CNAME
Name: api.aguazarca.com.ar
Value: your-project-name.up.railway.app
```

## DNS Configuration (Hostinger)

### Step 3: Access Hostinger DNS Management

1. Log into Hostinger control panel
2. Go to **Domains** section
3. Find **aguazarca.com.ar**
4. Click **Manage**
5. Go to **DNS Zone**

### Step 4: Add CNAME Record

Add a new DNS record:
```
Type: CNAME
Name: api
Value: your-project-name.up.railway.app
TTL: 14400 (4 hours) or Auto
```

**Important:** 
- Use only `api` as the name (not the full domain)
- The value should be exactly what Railway provided
- Don't add trailing dots

### Step 5: Verify DNS Propagation

Wait 5-15 minutes, then test:

```bash
# Check if DNS is working
nslookup api.aguazarca.com.ar

# Or use dig
dig api.aguazarca.com.ar

# Expected result should show the Railway target
```

### Step 6: SSL Certificate

Railway automatically provides SSL certificates for custom domains. Once DNS propagates:

1. Railway will verify domain ownership
2. SSL certificate will be issued (can take 5-10 minutes)
3. Your API will be accessible via HTTPS

## Alternative: Cloudflare Setup (Recommended)

For better performance and security, use Cloudflare:

### Step 1: Add Domain to Cloudflare

1. Create Cloudflare account (free)
2. Add `aguazarca.com.ar` to Cloudflare
3. Update nameservers at your domain registrar to Cloudflare's

### Step 2: DNS Configuration in Cloudflare

Add CNAME record in Cloudflare:
```
Type: CNAME
Name: api
Target: your-project-name.up.railway.app
Proxy status: ☁️ Proxied (orange cloud)
```

### Step 3: SSL/TLS Settings

1. Go to **SSL/TLS** tab in Cloudflare
2. Set encryption mode to **Full (strict)**
3. Enable **Always Use HTTPS**

### Step 4: Additional Cloudflare Benefits

**Performance:**
- Global CDN for faster API responses
- Compression and minification
- HTTP/2 and HTTP/3 support

**Security:**
- DDoS protection
- Web Application Firewall (WAF)
- Bot protection
- Rate limiting

**Reliability:**
- 100% uptime SLA
- Multiple server locations
- Automatic failover

## Testing Your Custom Domain

### Test API Endpoints

Once configured, test your endpoints:

```bash
# Health check
curl https://api.aguazarca.com.ar/health

# Properties endpoint
curl https://api.aguazarca.com.ar/api/properties

# Should return 200 OK with proper CORS headers
```

### Update Frontend Configuration

Update your frontend environment variables:

```env
# .env.local (frontend)
NEXT_PUBLIC_API_URL=https://api.aguazarca.com.ar
```

## Troubleshooting

### Common Issues

#### 1. **DNS Not Propagating**
```bash
# Check current DNS
nslookup api.aguazarca.com.ar

# If still pointing to old IP, wait more or flush DNS
# Windows:
ipconfig /flushdns

# Mac:
sudo dscacheutil -flushcache
```

#### 2. **SSL Certificate Issues**
- Wait 10-15 minutes for automatic certificate
- Check Railway logs for certificate errors
- Verify DNS is pointing correctly

#### 3. **CORS Errors**
Update your backend CORS configuration:

```typescript
// src/index.ts
app.use(cors({
  origin: [
    'https://aguazarca.com.ar',
    'https://www.aguazarca.com.ar',
    'http://localhost:3000' // for development
  ],
  credentials: true
}))
```

#### 4. **Railway Connection Issues**
- Verify the CNAME target matches Railway exactly
- Check Railway project is running
- Review Railway deployment logs

### Verification Checklist

- [ ] Domain added in Railway dashboard
- [ ] CNAME record added to DNS
- [ ] DNS propagation confirmed (nslookup)
- [ ] SSL certificate active (https works)
- [ ] API endpoints responding
- [ ] CORS configured correctly
- [ ] Frontend updated with new API URL

## Domain Configuration Examples

### Hostinger DNS Zone Example
```
Type    Name    Value                           TTL
A       @       [Your server IP]               14400
CNAME   www     aguazarca.com.ar               14400
CNAME   api     your-project.up.railway.app    14400
MX      @       mail.aguazarca.com.ar          14400
```

### Cloudflare DNS Example
```
Type    Name    Content                        Proxy
A       @       [Your server IP]               ☁️ Proxied
CNAME   www     aguazarca.com.ar              ☁️ Proxied
CNAME   api     your-project.up.railway.app   ☁️ Proxied
```

## Environment Variables Update

### Backend (Railway)
```env
# Update CORS settings
FRONTEND_URL=https://aguazarca.com.ar
ML_REDIRECT_URI=https://api.aguazarca.com.ar/api/mercadolibre/callback
```

### Frontend Build
```env
NEXT_PUBLIC_API_URL=https://api.aguazarca.com.ar
```

## Final URL Structure

After setup, your URLs will be:
- **Frontend**: https://aguazarca.com.ar
- **API**: https://api.aguazarca.com.ar
- **MercadoLibre OAuth**: https://api.aguazarca.com.ar/api/mercadolibre/callback

## Security Considerations

### 1. **API Rate Limiting**
```typescript
// Add to your Express app
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

app.use('/api/', limiter)
```

### 2. **Security Headers**
```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))
```

### 3. **API Key Protection**
- Never expose Railway environment variables
- Use strong JWT secrets
- Rotate secrets periodically
- Monitor API usage

## Cost Implications

- **Railway**: No additional cost for custom domains
- **Cloudflare**: Free plan sufficient
- **SSL**: Included with Railway and Cloudflare
- **DNS**: Included with Hostinger hosting

## Timeline

1. **Domain setup**: 5 minutes
2. **DNS propagation**: 5-30 minutes  
3. **SSL certificate**: 5-10 minutes after DNS
4. **Total time**: 15-45 minutes

Once configured, your API will be accessible at `https://api.aguazarca.com.ar` with automatic HTTPS and global availability!