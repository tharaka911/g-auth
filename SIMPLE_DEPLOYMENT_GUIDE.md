# Simple Two-Environment Setup Guide

This guide covers setting up OAuth for **Development** (local testing) and **Production** deployment.

## 🏠 **Development Environment (Current Setup)**

Your current setup is working for development:

### **Google OAuth**
- ✅ **Client ID**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
- ✅ **Callback**: `http://localhost:3000/api/auth/callback/google`

### **GitHub OAuth**  
- ✅ **Client ID**: `YOUR_GITHUB_CLIENT_ID`
- ✅ **Callback**: `http://localhost:3000/api/auth/callback/github`

## 🚀 **Production Environment Setup**

For production deployment, you'll need separate OAuth apps:

### **1. Google OAuth for Production**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Either:
   - **Option A**: Add production URL to existing app's **Authorized redirect URIs**:
     ```
     https://your-domain.com/api/auth/callback/google
     ```
   - **Option B**: Create new OAuth app for production (recommended for clarity)

3. Update production environment variables:
   ```env
   GOOGLE_CLIENT_ID_PROD="your_production_google_client_id"
   GOOGLE_CLIENT_SECRET_PROD="your_production_google_secret"
   ```

### **2. GitHub OAuth for Production**

GitHub requires separate app for production:

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create new OAuth App:
   ```
   Application name: YourApp-Production
   Homepage URL: https://your-domain.com
   Authorization callback URL: https://your-domain.com/api/auth/callback/github
   ```

3. Update production environment variables:
   ```env
   GITHUB_CLIENT_ID_PROD="your_production_github_client_id"
   GITHUB_CLIENT_SECRET_PROD="your_production_github_secret"
   ```

## 🔧 **Environment Variables**

### **Development (.env)**
```env
NODE_ENV="development"

# Base URLs for different environments
NEXTAUTH_URL_DEV="http://localhost:3000"
NEXTAUTH_URL_PROD="https://your-domain.vercel.app"

# Google OAuth - Development
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# GitHub OAuth - Development
GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET"

# Production OAuth Credentials (for Vercel deployment)
GOOGLE_CLIENT_ID_PROD="your_production_google_client_id"
GOOGLE_CLIENT_SECRET_PROD="your_production_google_secret"
GITHUB_CLIENT_ID_PROD="your_production_github_client_id"
GITHUB_CLIENT_SECRET_PROD="your_production_github_secret"
```

### **Production (Same file, just change NODE_ENV)**
```env
NODE_ENV="production"
# All other variables stay the same!
```

## ⚡ **How It Works**

The system automatically detects the environment:

- **Development**: `NODE_ENV !== "production"` → Uses `GOOGLE_CLIENT_ID` and `GITHUB_CLIENT_ID`
- **Production**: `NODE_ENV === "production"` → Uses `GOOGLE_CLIENT_ID_PROD` and `GITHUB_CLIENT_ID_PROD`

## 🧪 **Testing**

### **Development Testing**
```bash
npm run dev
# Test at: http://localhost:3000
```

### **Production Testing**
```bash
# Set production environment variables
export NODE_ENV=production
export NEXTAUTH_URL=https://your-domain.com
# ... other production vars

npm run build && npm start
```

That's it! Simple two-environment setup with automatic OAuth app selection. 🎉