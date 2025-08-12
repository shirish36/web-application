# 🔍 Quick Configuration Discovery

Run these commands in **Google Cloud Shell** to get your exact WIF configuration:

## Step 1: Discover Your Existing Setup
```bash
# Set your project
export PROJECT_ID="gifted-palace-468618-q5"

# Get project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# List workload identity pools
echo "📋 Your Workload Identity Pools:"
gcloud iam workload-identity-pools list --location=global --project=$PROJECT_ID --format="table(name,displayName,state)"

# Get the pool name (copy the NAME column from above, just the last part after the last /)
read -p "Enter your pool name (e.g., github-actions-pool): " POOL_ID

# List providers in that pool
echo "📋 Your Providers in pool '$POOL_ID':"
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=$POOL_ID \
  --location=global \
  --project=$PROJECT_ID \
  --format="table(name,displayName,state)"

# Get the provider name (copy the NAME column from above, just the last part after the last /)
read -p "Enter your provider name (e.g., github-provider): " PROVIDER_ID

# Generate the complete WIF provider string
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo ""
echo "✅ Your WIF Provider string:"
echo "$WIF_PROVIDER"
```

## Step 2: Setup Service Account (if needed)
```bash
# Service account configuration
export SA_NAME="github-actions-sa"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

# Check if service account exists, create if not
if gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "✅ Service account $SA_EMAIL already exists"
else
    echo "🔧 Creating service account..."
    gcloud iam service-accounts create $SA_NAME \
      --project=$PROJECT_ID \
      --description="Service account for GitHub Actions with WIF" \
      --display-name="GitHub Actions SA (WIF)"
fi

# Assign required roles
echo "🔧 Assigning roles..."
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/storage.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/containeranalysis.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/artifactregistry.admin"

# Bind service account to workload identity
echo "🔗 Binding service account to workload identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo "✅ Service account setup complete"
```

## Step 3: Get Your GitHub Secrets
```bash
echo ""
echo "🎯 FINAL RESULT - Add these to GitHub Secrets:"
echo "=============================================="
echo ""
echo "Go to: https://github.com/shirish36/web-application/settings/secrets/actions"
echo ""
echo "1. WIF_PROVIDER"
echo "   Value: $WIF_PROVIDER"
echo ""
echo "2. WIF_SERVICE_ACCOUNT"
echo "   Value: $SA_EMAIL"
echo ""
echo "3. GCP_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "🎉 Your pipeline is ready to use Workload Identity Federation!"
```

## 🚀 One-Liner Script

If you prefer, here's a single script that does everything:

```bash
#!/bin/bash
# Quick WIF setup with existing provider

export PROJECT_ID="gifted-palace-468618-q5"
export SA_NAME="github-actions-sa"
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

# Auto-discover (assumes common naming)
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔍 Discovering your WIF configuration..."

# Try common pool names
for pool in "github-actions-pool" "github-pool" "wif-pool" "default-pool"; do
  if gcloud iam workload-identity-pools describe $pool --location=global --project=$PROJECT_ID >/dev/null 2>&1; then
    export POOL_ID=$pool
    echo "✅ Found pool: $pool"
    break
  fi
done

# Try common provider names  
for provider in "github-provider" "github" "gh-provider"; do
  if gcloud iam workload-identity-pools providers describe $provider --workload-identity-pool=$POOL_ID --location=global --project=$PROJECT_ID >/dev/null 2>&1; then
    export PROVIDER_ID=$provider
    echo "✅ Found provider: $provider"
    break
  fi
done

if [ -z "$POOL_ID" ] || [ -z "$PROVIDER_ID" ]; then
  echo "❌ Could not auto-discover your WIF configuration."
  echo "Please run the manual discovery commands above."
  exit 1
fi

# Generate WIF provider string
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

# Setup service account
gcloud iam service-accounts create $SA_NAME --project=$PROJECT_ID --description="SA for GitHub Actions" --display-name="GitHub Actions SA" 2>/dev/null || echo "Service account exists"

# Assign roles
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/run.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/storage.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/containeranalysis.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/artifactregistry.admin" --quiet

# Bind to workload identity
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}" --quiet

echo ""
echo "🎯 SUCCESS! Add these GitHub Secrets:"
echo "====================================="
echo "WIF_PROVIDER: $WIF_PROVIDER"
echo "WIF_SERVICE_ACCOUNT: $SA_EMAIL"  
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo ""
echo "Add at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
```

## 🎯 Next Steps

1. **Run one of the scripts above** in Google Cloud Shell
2. **Copy the three secret values** from the output
3. **Add them to GitHub** at: https://github.com/shirish36/web-application/settings/secrets/actions
4. **Test your pipeline** by pushing code to the main branch

Your workflows are already updated to use WIF, so once you add the secrets, everything should work immediately! 🚀
