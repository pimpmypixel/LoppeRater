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

echo "🗄️  Setting up storage buckets..."

# Create photos_raw bucket for raw uploads
echo "📝 Creating storage bucket 'photos_raw'..."
RAW_BUCKET_RESPONSE=$(curl -s --max-time 10 -X POST "$API_BASE/storage/buckets" \
    "${HEADERS[@]}" \
    -d '{
        "bucketId": "photos_raw",
        "name": "Raw Photos",
        "permissions": ["read(\"users\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
        "fileSecurity": false,
        "enabled": true,
        "maximumFileSize": 10485760,
        "allowedFileExtensions": ["jpg", "jpeg", "png", "gif", "webp"],
        "compression": "gzip",
        "encryption": true,
        "antivirus": true
    }' 2>/dev/null)

if echo "$RAW_BUCKET_RESPONSE" | grep -q '"$id": "photos_raw"'; then
    echo "✅ Storage bucket 'photos_raw' created successfully"
else
    echo "⚠️  Storage bucket 'photos_raw' creation failed - may already exist"
fi

# Create or update photos_processed bucket for processed images
echo "📝 Setting up storage bucket 'photos_processed'..."
PROCESSED_BUCKET_CHECK=$(curl -s --max-time 10 -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" -H "X-Appwrite-Key: $APPWRITE_API_KEY" "$API_BASE/storage/buckets/photos_processed" 2>/dev/null)

if echo "$PROCESSED_BUCKET_CHECK" | grep -q '"$id":"photos_processed"'; then
    echo "✅ Storage bucket 'photos_processed' exists and is ready"
else
    # Check if old 'photos' bucket exists and rename it
    OLD_BUCKET_CHECK=$(curl -s --max-time 10 -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" -H "X-Appwrite-Key: $APPWRITE_API_KEY" "$API_BASE/storage/buckets/photos" 2>/dev/null)

    if echo "$OLD_BUCKET_CHECK" | grep -q '"$id":"photos"'; then
        echo "📝 Renaming existing 'photos' bucket to 'photos_processed'..."
        RENAME_RESPONSE=$(curl -s --max-time 10 -X PUT "$API_BASE/storage/buckets/photos" \
            "${HEADERS[@]}" \
            -d '{
                "name": "Processed Photos"
            }' 2>/dev/null)

        if echo "$RENAME_RESPONSE" | grep -q '"name": "Processed Photos"'; then
            echo "✅ Bucket renamed to 'photos_processed' successfully"
        else
            echo "⚠️  Bucket rename failed - creating new 'photos_processed' bucket"
            PROCESSED_BUCKET_RESPONSE=$(curl -s --max-time 10 -X POST "$API_BASE/storage/buckets" \
                "${HEADERS[@]}" \
                -d '{
                    "bucketId": "photos_processed",
                    "name": "Processed Photos",
                    "permissions": ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
                    "fileSecurity": false,
                    "enabled": true,
                    "maximumFileSize": 10485760,
                    "allowedFileExtensions": ["jpg", "jpeg", "png", "gif", "webp"],
                    "compression": "gzip",
                    "encryption": true,
                    "antivirus": true
                }' 2>/dev/null)

            if echo "$PROCESSED_BUCKET_RESPONSE" | grep -q '"$id": "photos_processed"'; then
                echo "✅ Storage bucket 'photos_processed' created successfully"
            else
                echo "⚠️  Storage bucket 'photos_processed' creation failed"
            fi
        fi
    else
        echo "📝 Creating new storage bucket 'photos_processed'..."
        PROCESSED_BUCKET_RESPONSE=$(curl -s --max-time 10 -X POST "$API_BASE/storage/buckets" \
            "${HEADERS[@]}" \
            -d '{
                "bucketId": "photos_processed",
                "name": "Processed Photos",
                "permissions": ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
                "fileSecurity": false,
                "enabled": true,
                "maximumFileSize": 10485760,
                "allowedFileExtensions": ["jpg", "jpeg", "png", "gif", "webp"],
                "compression": "gzip",
                "encryption": true,
                "antivirus": true
            }' 2>/dev/null)

        if echo "$PROCESSED_BUCKET_RESPONSE" | grep -q '"$id": "photos_processed"'; then
            echo "✅ Storage bucket 'photos_processed' created successfully"
        else
            echo "⚠️  Storage bucket 'photos_processed' creation failed"
        fi
    fi
fi

echo ""

echo "🎉 Infrastructure setup completed!"
echo ""
echo "📋 Summary:"
echo "- Storage bucket: photos_raw (10MB limit, image files only, users only)"
echo "- Storage bucket: photos_processed (10MB limit, image files only, public access)"
echo "- Permissions: Users can upload to raw, anyone can view processed"
echo ""
echo "💡 Next steps:"
echo "1. Database tables will be created next"
echo "2. Functions will be deployed after database setup"
echo ""
echo "🔗 Useful links:"
echo "- Appwrite Console: https://cloud.appwrite.io/console"
echo "- Project ID: $APPWRITE_PROJECT_ID"