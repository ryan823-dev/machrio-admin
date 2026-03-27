#!/bin/bash

# Railway Direct Deployment Script using API
# This script uses Railway's GraphQL API to trigger deployments

RAILWAY_TOKEN="${RAILWAY_TOKEN:-}"

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "Error: RAILWAY_TOKEN environment variable is not set"
    echo "Please set it: export RAILWAY_TOKEN='your-token-here'"
    exit 1
fi

echo "Triggering Railway deployment..."

# Trigger deployment
RESPONSE=$(curl -s -X POST "https://backboard.railway.app/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -d '{
        "query": "mutation DeploymentDeploy($projectId: String!, $environment: String!) { deploymentDeploy(projectId: $projectId, environment: $environment) { id status } }",
        "variables": {
            "projectId": "",
            "environment": "production"
        }
    }')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
    echo "Deployment failed"
    exit 1
fi

echo "Deployment triggered successfully"
