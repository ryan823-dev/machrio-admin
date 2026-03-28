#!/bin/bash
# Force Railway to rebuild without cache

echo "=== Force Railway Deploy ==="
echo "This will trigger a new deployment with cache cleared"
echo ""

# Get the latest commit
LATEST_COMMIT=$(git rev-parse HEAD)
echo "Latest commit: $LATEST_COMMIT"

# Create an empty commit to force rebuild
git commit --allow-empty -m "Force rebuild for Railway"
git push origin main

echo ""
echo "✅ Pushed empty commit to force rebuild"
echo "Now go to Railway Dashboard and trigger a new deployment"
