# Vercel Auto-Deployment Setup

This project can auto-deploy to Vercel via GitHub Actions.

## Setup Steps

### Option 1: Vercel Dashboard (Recommended - No secrets needed)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import `Burburton/amazing-home` repository
4. Vercel will auto-detect settings from `vercel.json`
5. Click "Deploy"

Every push to `main` will auto-deploy.

### Option 2: GitHub Actions with Secrets

1. Get Vercel tokens:
   ```bash
   vercel login
   vercel link  # Get ORG_ID and PROJECT_ID
   vercel whoami  # Get token from dashboard
   ```

2. Add secrets to GitHub repo:
   - `VERCEL_ORG_ID` - Your Vercel team ID
   - `VERCEL_PROJECT_ID` - Project ID from `vercel link`
   - `VERCEL_TOKEN` - Token from Vercel dashboard

3. Push to trigger deployment

## Environment Variables

After deployment, set in Vercel dashboard:

| Variable | Value | Purpose |
|----------|-------|---------|
| `USE_PLACEHOLDER` | `true` | Start with placeholder mode |
| `WEIGHTS_URL` | (later) | CubiCasa5k weights URL |

## Testing

After deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Recognition API (placeholder mode)
curl -X POST https://your-app.vercel.app/api/recognize \
  -H "Content-Type: application/json" \
  -d '{"image_base64": "test"}'
```