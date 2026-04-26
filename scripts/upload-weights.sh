#!/bin/bash
# Upload CubiCasa5k model weights to Vercel Blob Storage
#
# Prerequisites:
# 1. Vercel CLI installed: npm install -g vercel
# 2. Vercel login: vercel login
# 3. Project linked: vercel link
#
# Usage:
#   ./scripts/upload-weights.sh [weights_file]

WEIGHTS_FILE="${1:-cubicasa5k_model.pt}"
WEIGHTS_DIR="./model-weights"
BLOB_NAME="cubicasa5k_model.pt"

echo "=== CubiCasa5k Weights Upload Script ==="

# Check if weights file exists
if [ ! -f "$WEIGHTS_FILE" ]; then
    echo "Weights file not found: $WEIGHTS_FILE"
    echo ""
    echo "Download options:"
    echo "1. From official repo (if available)"
    echo "2. From Papers with Code: https://paperswithcode.com/paper/cubicasa5k"
    echo "3. From TF2DeepFloorplan: https://github.com/therenderengineer/TF2DeepFloorplan"
    echo ""
    echo "After downloading, place file as: $WEIGHTS_FILE"
    echo "Then run this script again."
    exit 1
fi

# Check file size (should be ~40MB)
FILE_SIZE=$(stat -f%z "$WEIGHTS_FILE" 2>/dev/null || stat -c%s "$WEIGHTS_FILE" 2>/dev/null)
FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))

echo "File: $WEIGHTS_FILE"
echo "Size: ${FILE_SIZE_MB}MB"

if [ $FILE_SIZE_MB -gt 100 ]; then
    echo "WARNING: File is larger than 100MB. Vercel Blob Storage limit is 500MB per file."
fi

# Upload to Vercel Blob Storage
echo ""
echo "Uploading to Vercel Blob Storage..."

BLOB_URL=$(vercel blob put "$BLOB_NAME" --file "$WEIGHTS_FILE" 2>&1)

if [[ $BLOB_URL == *"blob.vercel-storage.com"* ]]; then
    echo "✓ Upload successful!"
    echo ""
    echo "Blob URL: $BLOB_URL"
    echo ""
    echo "Next steps:"
    echo "1. Add WEIGHTS_URL to Vercel environment variables:"
    echo "   vercel env add WEIGHTS_URL"
    echo "   Paste: $BLOB_URL"
    echo ""
    echo "2. Set USE_PLACEHOLDER=false for production mode"
    echo "   vercel env rm USE_PLACEHOLDER"
    echo ""
    echo "3. Deploy:"
    echo "   vercel --prod"
else
    echo "✗ Upload failed"
    echo "Output: $BLOB_URL"
    echo ""
    echo "Make sure you have:"
    echo "- Vercel CLI installed"
    echo "- Vercel login completed"
    echo "- Project linked (vercel link)"
    exit 1
fi