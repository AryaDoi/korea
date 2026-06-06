#!/usr/bin/env bash
# Deploy both frontend and backend to Cloudflare
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Starting Warung RMB Deployment to Cloudflare ($ENVIRONMENT)"
echo ""

# Check for required tools
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install it with: npm install -g @cloudflare/wrangler"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Deploy Backend
echo "📦 Deploying Backend (Workers)..."
cd backend
npm install
npm run deploy
echo "✅ Backend deployed successfully"
echo ""

# Deploy Frontend
echo "📱 Deploying Frontend (Pages)..."
cd ../frontend
npm install
npm run deploy
echo "✅ Frontend deployed successfully"
echo ""

echo "✨ Deployment complete!"
echo ""
echo "Frontend: https://warung-rmb.com"
echo "Backend:  https://api.warung-rmb.com"
echo ""
echo "Test the API: curl https://api.warung-rmb.com/api/health"
