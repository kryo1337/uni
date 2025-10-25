#!/bin/bash

# Deploy backend to Azure App Service
# Usage: ./deploy.sh

echo "🚀 Deploying backend to Azure..."

# Check if logged in to Azure
echo "🔐 Checking Azure login..."
if ! az account show &> /dev/null; then
  echo "❌ Not logged in to Azure!"
  echo "   Run: az login"
  exit 1
fi

echo "✅ Logged in as: $(az account show --query user.name -o tsv)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader

# Create deployment package
echo "📦 Creating deployment package..."
zip -r backend.zip . \
  -x "*.git*" \
  -x "tests/*" \
  -x "phpunit.xml" \
  -x ".phpunit.cache/*" \
  -x "deploy.sh" \
  -x "backend.zip"

echo "✅ Package created: backend.zip"
echo ""
echo "📤 Deploying to Azure..."

# Deploy using Azure CLI
az webapp deploy \
  --resource-group pwch \
  --name lab1-backend \
  --src-path backend.zip \
  --type zip

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "🌐 Backend URL: https://lab1-backend.azurewebsites.net"
else
  echo "❌ Deployment failed!"
  exit 1
fi

# Cleanup
echo "🧹 Cleaning up..."
rm backend.zip

echo "✨ Done!"

