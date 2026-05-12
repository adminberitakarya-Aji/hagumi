# ☁️ Cloudflare Setup Guide for Hagumi

> **Status:** Not Configured
> **Priority:** Medium (set up before production launch)

## Why Cloudflare?

| Feature | Benefit for Hagumi |
|---------|--------------------|
| **CDN** | Cache static assets (images, JS bundles) globally — faster load times |
| **DDoS Protection** | Protect against attacks during game events/launches |
| **DNS Management** | Custom domain (hagumi.app, hagumi.com) |
| **R2 Object Storage** | Cheap S3-compatible storage for pet assets, user uploads |
| **Workers** | Edge-compute for API gateway, A/B testing, rate limiting |
| **Analytics** | Web analytics without privacy issues (no cookies) |

---

## 1. DNS Configuration

### Step 1: Add Domain to Cloudflare
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Add a Site**
3. Enter your domain (e.g., `hagumi.app`)
4. Select **Free** plan (upgrade later as needed)
5. Copy the nameservers Cloudflare gives you
6. Update your domain registrar's nameservers

### Step 2: Configure DNS Records

```dns
# ─── Main App (Vercel) ───
CNAME  @          -> cname.vercel-dns.com    (Proxied: ✅)
CNAME  www        -> cname.vercel-dns.com    (Proxied: ✅)

# ─── Supabase ───
CNAME  db         -> <your-project>.supabase.co  (Proxied: ❌)

# ─── API Server (future) ───
A      api        -> <your-server-ip>        (Proxied: ✅)

# ─── Assets (R2) ───
CNAME  assets     -> <r2-bucket>.r2.dev      (Proxied: ✅)

# ─── Email (if using) ───
MX     @          -> <mail-server>
TXT    @          -> "v=spf1 include:_spf.google.com ~all"
```

---

## 2. Page Rules (Performance Optimization)

```yaml
# Rule 1: Cache all static assets
URL: hagumi.app/assets/*
Setting: Cache Level = Standard
         Edge Cache TTL = 7 days
         Browser Cache TTL = 1 day

# Rule 2: Always HTTPS
URL: hagumi.app/*
Setting: Always Use HTTPS = On
         Automatic HTTPS Rewrites = On

# Rule 3: Disable cache for API
URL: hagumi.app/api/*
Setting: Cache Level = Bypass
```

---

## 3. Security Configuration

### WAF (Web Application Firewall)
```yaml
# Enable these managed rules:
- Cloudflare Managed Ruleset (OWASP)
- Cloudflare Managed IP Reputation
- Rate Limiting:

rule:
  name: "API Rate Limit"
  requests: 100
  period: 60 seconds
  URL: /api/*
  action: block

rule:
  name: "Auth Rate Limit"
  requests: 5
  period: 60 seconds
  URL: /api/v1/auth/*
  action: block
```

### Bot Fight Mode
```yaml
# Go to Security → Bots
- Enable Bot Fight Mode: ✅
- Block known bad bots: ✅
- Allow: Googlebot, Bingbot verified
```

---

## 4. R2 Object Storage (for Assets)

### Step 1: Create Bucket
```bash
# Install wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create buckets
wrangler r2 bucket create hagumi-pet-assets    # Images, sprites
wrangler r2 bucket create hagumi-user-uploads  # User generated content
```

### Step 2: Configure CORS
```json
{
  "allowedOrigins": ["https://hagumi.app", "https://*.vercel.app"],
  "allowedMethods": ["GET", "PUT", "POST"],
  "allowedHeaders": ["Content-Type", "Authorization"],
  "maxAgeSeconds": 3600
}
```

### Step 3: Access via Cloudflare Workers
```typescript
// Example: Serve assets with authentication
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const key = url.pathname.slice(1)  // Remove leading /
    
    const object = await env.BUCKET.get(key)
    if (!object) return new Response('Not Found', { status: 404 })
    
    return new Response(object.body, {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      }
    })
  }
}
```

---

## 5. Vercel Integration

Currently, Hagumi is hosted on **Vercel**. Cloudflare sits in front:

```
User → Cloudflare CDN → Vercel Edge → Vercel Serverless → Supabase
```

### DNS Verification
```bash
# Verify your Vercel deployment is proxied correctly
nslookup hagumi.app
# Should return Cloudflare IP (104.x.x.x), not Vercel IP

# Check SSL
curl -vI https://hagumi.app
# Should show Cloudflare SSL certificate
```

---

## 6. Monitoring & Analytics

### Enable:
1. **Web Analytics** (Privacy-first, no cookies needed)
2. **Bot Analytics** (See bot traffic patterns)
3. **Security Events** (Monitor blocked threats)
4. **Cache Analytics** (Verify cache hit rate > 80%)

### Dashboard URL:
```
https://dash.cloudflare.com/<your-account>/analytics
```

---

## 7. Cost Estimation

| Service | Free Plan | Pro Plan ($20/mo) | Business ($200/mo) |
|---------|-----------|-------------------|-------------------|
| CDN + DNS | Unlimited | Unlimited | Unlimited |
| DDoS Protection | Basic | Advanced | Advanced |
| WAF | Basic | 5 rules | 25 rules |
| Bot Management | No | Basic | Advanced |
| R2 Storage | 10GB free | 10GB free | 10GB free |
| Workers | 100k req/day | 1M req/day | 10M req/day |
| **Recommended** | ✅ Start here | Upgrade Month 6 | Upgrade Month 12 |

---

## Next Steps

1. [ ] Register domain (e.g., `hagumi.app`)
2. [ ] Add domain to Cloudflare
3. [ ] Configure DNS records
4. [ ] Enable SSL/TLS (Full strict)
5. [ ] Set up Page Rules
6. [ ] Enable Bot Fight Mode
7. [ ] Create R2 buckets
8. [ ] Point Vercel deployment to Cloudflare
9. [ ] Test caching (verify headers)
10. [ ] Set up monitoring dashboard