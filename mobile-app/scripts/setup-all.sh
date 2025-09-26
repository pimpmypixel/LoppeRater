#!/bin/bash

# LoppeRater Complete Setup Orchestrator
# This script runs all setup scripts in the correct order:
# 1. Infrastructure (storage buckets)
# 2. Database (tables, attributes, relationships)
# 3. Functions (serverless functions)

set -e

echo "🚀 LoppeRater Complete Setup Orchestrator"
echo "========================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "scripts/setup-infrastructure.sh" ]; then
    echo "❌ Please run this script from the mobile-app directory"
    echo "   cd mobile-app && ./scripts/setup-all.sh"
    exit 1
fi

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check required environment variables
if [ -z "$APPWRITE_ENDPOINT" ]; then
    echo "❌ APPWRITE_ENDPOINT not set in .env.local"
    exit 1
fi

if [ -z "$APPWRITE_PROJECT_ID" ]; then
    echo "❌ APPWRITE_PROJECT_ID not set in .env.local"
    exit 1
fi

if [ -z "$APPWRITE_API_KEY" ]; then
    echo "❌ APPWRITE_API_KEY not set in .env.local"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Make scripts executable
chmod +x scripts/setup-infrastructure.sh
chmod +x scripts/setup-database.js
chmod +x scripts/setup-functions.sh

echo "📋 Setup Order:"
echo "1. Infrastructure (storage buckets)"
echo "2. Database (tables, attributes, relationships)"
echo "3. Functions (serverless functions)"
echo ""

# Step 1: Infrastructure Setup
echo "🏗️  Step 1: Setting up infrastructure..."
echo "--------------------------------------"
if ./scripts/setup-infrastructure.sh; then
    echo "✅ Infrastructure setup completed successfully"
else
    echo "❌ Infrastructure setup failed"
    exit 1
fi

echo ""

# Step 2: Database Setup
echo "🗄️  Step 2: Setting up database..."
echo "---------------------------------"
if node scripts/setup-database.js; then
    echo "✅ Database setup completed successfully"
else
    echo "❌ Database setup failed"
    exit 1
fi

echo ""

# Step 3: Functions Setup
echo "⚙️  Step 3: Setting up functions..."
echo "----------------------------------"
if ./scripts/setup-functions.sh; then
    echo "✅ Functions setup completed successfully"
else
    echo "❌ Functions setup failed"
    exit 1
fi

echo ""

echo "🎉 All setup steps completed successfully!"
echo ""
echo "📋 Summary:"
echo "- ✅ Storage bucket: photos (10MB limit, image files only)"
echo "- ✅ Database tables: markets, roles, stalls, ratings, photos, users"
echo "- ✅ Function: faceBlur (Python 3.9, 15min timeout)"
echo "- ✅ Permissions configured for user access"
echo ""
echo "💡 Next steps:"
echo "1. Monitor function deployment in Appwrite Console"
echo "2. Test the mobile app functionality"
echo "3. Verify data relationships work correctly"
echo ""
echo "🔗 Useful links:"
echo "- Appwrite Console: https://cloud.appwrite.io/console"
echo "- Project ID: $APPWRITE_PROJECT_ID"
echo ""
echo "📱 Ready to run the mobile app!"
echo "   npm start or bun start"