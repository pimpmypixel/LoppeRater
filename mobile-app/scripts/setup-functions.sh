#!/bin/bash

# LoppeRater Functions Setup Script
# This script creates and deploys Appwrite functions

set -e

echo "⚙️  LoppeRater Functions Setup"
echo "============================="
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

echo "⚙️  Checking faceBlur function..."

FUNCTION_CHECK=$(curl -s --max-time 10 -H "X-Appwrite-Project: $APPWRITE_PROJECT_ID" -H "X-Appwrite-Key: $APPWRITE_API_KEY" "$API_BASE/functions/faceBlur" 2>/dev/null)

if echo "$FUNCTION_CHECK" | grep -q '"$id":"faceBlur"'; then
    echo "✅ Function 'faceBlur' exists"
else
    echo "📝 Creating faceBlur function..."
    FUNCTION_RESPONSE=$(curl -s --max-time 10 -X POST "$API_BASE/functions" \
        "${HEADERS[@]}" \
        -d '{
            "functionId": "faceBlur",
            "name": "Face Blur Function",
            "runtime": "python-3.9",
            "execute": ["users"],
            "events": [],
            "schedule": "",
            "timeout": 900
        }' 2>/dev/null)

    if echo "$FUNCTION_RESPONSE" | grep -q '"$id": "faceBlur"'; then
        echo "✅ Function 'faceBlur' created successfully"
    else
        echo "⚠️  Function 'faceBlur' creation failed - may already exist"
        echo "   Check manually in Appwrite Console: https://cloud.appwrite.io/console"
    fi
fi

echo ""

# Check if entrypoint is already set correctly
if echo "$FUNCTION_CHECK" | grep -q '"entrypoint":"faceBlur.py"'; then
    echo "✅ Function entrypoint already set to 'faceBlur.py'"
else
    echo "📝 Updating function entrypoint..."
    ENTRYPOINT_RESPONSE=$(curl -s --max-time 10 -X PUT "$API_BASE/functions/faceBlur" \
        "${HEADERS[@]}" \
        -d '{
            "entrypoint": "faceBlur.py"
        }' 2>/dev/null)

    if echo "$ENTRYPOINT_RESPONSE" | grep -q '"entrypoint": "faceBlur.py"'; then
        echo "✅ Function entrypoint updated successfully"
    else
        echo "⚠️  Function entrypoint update failed - may already be set"
        echo "   Check manually in Appwrite Console: https://cloud.appwrite.io/console"
    fi
fi

echo ""

# Check if function has a successful deployment
if echo "$FUNCTION_CHECK" | grep -q '"latestDeploymentStatus":"ready"'; then
    echo "✅ Function deployment is ready"
else
    echo "📦 Deploying function code..."

    # Check if functions/faceBlur.tar.gz exists
    if [ ! -f "../functions/faceBlur.tar.gz" ]; then
        echo "❌ ../functions/faceBlur.tar.gz not found. Please create it first."
        echo "Run: cd ../functions && tar -czf faceBlur.tar.gz faceBlur.py requirements.txt"
        exit 1
    fi

    DEPLOY_RESPONSE=$(curl -s --max-time 30 -X POST "$API_BASE/functions/faceBlur/deployments" \
        "${HEADERS[@]}" \
        -F "code=@../functions/faceBlur.tar.gz" \
        -F 'activate=true' 2>/dev/null)

    if echo "$DEPLOY_RESPONSE" | grep -q '"status": "waiting"'; then
        echo "✅ Function deployment initiated successfully"
        echo "Monitor deployment status in Appwrite Console"
    else
        echo "⚠️  Function deployment failed - may already be deployed"
        echo "   Check manually in Appwrite Console: https://cloud.appwrite.io/console"
    fi
fi

echo ""

echo "🎉 Functions setup completed!"
echo ""
echo "📋 Summary:"
echo "- Function: faceBlur (Python 3.9, 15min timeout)"
echo "- Entrypoint: faceBlur.py"
echo "- Permissions: Users can execute"
echo ""
echo "💡 Next steps:"
echo "1. Monitor function deployment in Appwrite Console"
echo "2. Test face blur functionality"
echo ""
echo "🔗 Useful links:"
echo "- Appwrite Console: https://cloud.appwrite.io/console"
echo "- Project ID: $APPWRITE_PROJECT_ID"