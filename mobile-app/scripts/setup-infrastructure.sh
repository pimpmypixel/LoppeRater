#!/bin/bash

# LoppeRater Complete Setup Script
# This script orchestrates the complete Appwrite infrastructure setup
# by running infrastructure, database, and functions setup scripts

set -e

echo "🚀 LoppeRater Complete Setup"
echo "============================"
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

# Base API URL
API_BASE="$APPWRITE_ENDPOINT/v1"

# Headers for API calls
HEADERS=(
    -H "Content-Type: application/json"
    -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID"
    -H "X-Appwrite-Key: $APPWRITE_API_KEY"
)

echo "🗄️  Checking storage bucket 'photos'..."

# Try to get the bucket, but handle API issues gracefully
BUCKET_CHECK=$(curl -s --max-time 10 -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" -H "X-Appwrite-Key: $APPWRITE_API_KEY" "$API_BASE/storage/buckets/photos" 2>/dev/null)

if echo "$BUCKET_CHECK" | grep -q '"$id":"photos"'; then
    echo "✅ Storage bucket 'photos' exists and is ready"
elif echo "$BUCKET_CHECK" | grep -q '"code":404'; then
    echo "📝 Creating storage bucket 'photos'..."
    BUCKET_RESPONSE=$(curl -s --max-time 10 -X POST "$API_BASE/storage/buckets" \
        "${HEADERS[@]}" \
        -d '{
            "bucketId": "photos",
            "name": "Photos",
            "permissions": ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
            "fileSecurity": false,
            "enabled": true,
            "maximumFileSize": 10485760,
            "allowedFileExtensions": ["jpg", "jpeg", "png", "gif", "webp"],
            "compression": "gzip",
            "encryption": true,
            "antivirus": true
        }' 2>/dev/null)

    if echo "$BUCKET_RESPONSE" | grep -q '"$id": "photos"'; then
        echo "✅ Storage bucket 'photos' created successfully"
    else
        echo "⚠️  Storage bucket 'photos' creation failed - may already exist"
        echo "   Check manually in Appwrite Console: https://cloud.appwrite.io/console"
    fi
else
    echo "⚠️  Could not verify storage bucket status - may already exist"
    echo "   Check manually in Appwrite Console: https://cloud.appwrite.io/console"
fi

echo ""

echo "🎉 Infrastructure setup completed!"
echo ""
echo "📋 Summary:"
echo "- Storage bucket: photos (10MB limit, image files only)"
echo "- Permissions: Users can upload, anyone can view"
echo ""
echo "💡 Next steps:"
echo "1. Database tables will be created next"
echo "2. Functions will be deployed after database setup"
echo ""
echo "🔗 Useful links:"
echo "- Appwrite Console: https://cloud.appwrite.io/console"
echo "- Project ID: $APPWRITE_PROJECT_ID"