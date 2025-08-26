# EcoSnap AI - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- All API keys ready

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready - All APIs integrated"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `eco-snap-sparkle` repository

### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:

#### Required APIs (Already have keys):
```
VITE_GEMINI_API_KEY = AIzaSyCdBFIzpAfPfk7tW9IUOSihKU20XmuyrGA
VITE_UNSPLASH_ACCESS_KEY = HUDILVwDmLsGa2sKvhXONnSuVf4wlbAd3RvcewAe10s  
VITE_CARBON_INTERFACE_KEY = EnacLdKh2zHUdjJ2qzvXDw
```

#### Optional (for user accounts):
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_key
```

#### App Configuration:
```
VITE_APP_NAME = EcoSnap AI
VITE_APP_VERSION = 2.0.0
```

### Step 4: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live!

## 🔧 Build Settings (Auto-detected)
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🌟 Features Available
- ✅ AI-powered eco scoring (Gemini)
- ✅ High-quality product images (Unsplash)
- ✅ Carbon footprint calculations (Carbon Interface)
- ✅ Real product database (OpenFoodFacts - no key needed)
- ✅ Professional UI with camera scanning
- ✅ Real-time product analysis

## 🎯 Post-Deployment
1. Test all scanning modes
2. Verify API integrations
3. Check console for any errors
4. Share your live environmental app!

Your EcoSnap AI will be production-ready with all premium features! 🚀
