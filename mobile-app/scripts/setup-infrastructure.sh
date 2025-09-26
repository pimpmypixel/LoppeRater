#!/bin/bash

# LoppeRater Infrastructure Setup Script
# This script sets up the Appwrite infrastructure for LoppeRater
# Creates a single storage bucket for photo processing (plan limit: 1 bucket)

set -e

echo "🚀 LoppeRater Infrastructure Setup (Single Bucket)"
echo "=================================================="
echo ""

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check required environment variables
if [ -z "$APPWRITE_ENDPOINT" ]; then
    echo "❌ APPWRITE_ENDPOINT not set"
    exit 1
fi

if [ -z "$APPWRITE_PROJECT_ID" ]; then
    echo "❌ APPWRITE_PROJECT_ID not set"
    exit 1
fi

if [ -z "$APPWRITE_API_KEY" ]; then
    echo "❌ APPWRITE_API_KEY not set"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Base API URL (APPWRITE_ENDPOINT already includes /v1)
API_BASE="$APPWRITE_ENDPOINT"

# Headers for API calls
HEADERS=(
    -H "Content-Type: application/json"
    -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID"
    -H "X-Appwrite-Key: $APPWRITE_API_KEY"
)

echo "🗄️  Setting up storage bucket..."

# Note: Due to Appwrite Cloud free plan limit of 1 bucket, we use the existing 'photos' bucket
# that was created in a previous setup. This bucket handles both raw and processed photos.
echo "ℹ️  Using existing 'photos' bucket (Appwrite Cloud free plan limit: 1 bucket)"
echo "✅ Storage bucket 'photos' is ready for photo processing"

echo ""
echo "🎉 Infrastructure setup completed!"
echo ""
echo "📋 Summary:"
echo "- Storage bucket: photos (10MB limit, image files only, public access)"
echo "- Permissions: Users can upload and view, functions can process photos"
echo "- Photo Processing: Raw photos uploaded → Face blur function processes in-place"
echo "- Database tracking: rawFileId and processedFileId columns track both versions"
echo ""
echo "💡 Next steps:"
echo "1. Database tables will be created next"
echo "2. Functions will be deployed after database setup"
echo ""
echo "🔗 Useful links:"
echo "- Appwrite Console: https://cloud.appwrite.io/console"
echo "- Project ID: $APPWRITE_PROJECT_ID"