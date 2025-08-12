# 🔍 Using Existing GitHub Provider Configuration

Since you already have the GitHub provider configured in GCP, let's get the existing details and complete the setup.

## 📋 Get Your Existing Configuration

Run these commands in **Google Cloud Shell** to get your existing WIF configuration:

### Step 1: Get Project Information
```bash
# Set your project
export PROJECT_ID="gifted-palace-468618-q5"
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

echo "Project ID: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
```

### Step 2: List Existing Workload Identity Pools
```bash
# List all workload identity pools
echo "🔍 Existing Workload Identity Pools:"
gcloud iam workload-identity-pools list --location=global --project=$PROJECT_ID

# If you see pools, set the pool ID (replace with your actual pool name)
export POOL_ID="your-pool-name"  # Update this with your actual pool name
```

### Step 3: List Existing Providers
```bash
# List providers in your pool (update POOL_ID if different)
echo "🔍 Existing Providers:"
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=$POOL_ID \
  --location=global \
  --project=$PROJECT_ID

# If you see providers, set the provider ID (replace with your actual provider name)
export PROVIDER_ID="github-provider"  # Update this with your actual provider name
```

### Step 4: Check/Create Service Account
```bash
# Check if service account exists
export SA_NAME="github-actions-sa"  # Or your preferred name
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔍 Checking service account: $SA_EMAIL"
gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID || {
  echo "Creating service account..."
  gcloud iam service-accounts create $SA_NAME \
    --project=$PROJECT_ID \
    --description="Service account for GitHub Actions with WIF" \
    --display-name="GitHub Actions SA (WIF)"
}
```

### Step 5: Assign Required Roles (if not already assigned)
```bash
echo "🔧 Assigning roles to service account..."

# Cloud Run admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

# Storage admin (for Container Registry)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

# Container analysis admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/containeranalysis.admin"

# Artifact Registry admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.admin"

echo "✅ Roles assigned"
```

### Step 6: Bind Service Account to Workload Identity
```bash
# Bind service account to your repository
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

echo "🔗 Binding service account to workload identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo "✅ Service account bound to workload identity"
```

### Step 7: Generate GitHub Secrets
```bash
# Generate the complete provider name
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo ""
echo "🔑 GitHub Secrets to Add:"
echo "========================"
echo ""
echo "Secret Name: WIF_PROVIDER"
echo "Secret Value: $WIF_PROVIDER"
echo ""
echo "Secret Name: WIF_SERVICE_ACCOUNT"
echo "Secret Value: $SA_EMAIL"
echo ""
echo "Secret Name: GCP_PROJECT_ID"
echo "Secret Value: $PROJECT_ID"
echo ""
echo "✅ Add these to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
```

## 🎯 Complete Setup Script (Using Existing Provider)

Here's a complete script that works with your existing GitHub provider:

```bash
#!/bin/bash
set -e

# Configuration - UPDATE THESE VALUES
export PROJECT_ID="gifted-palace-468618-q5"
export POOL_ID="your-existing-pool-name"      # UPDATE: Your actual pool name
export PROVIDER_ID="github-provider"          # UPDATE: Your actual provider name
export SA_NAME="github-actions-sa"            # Or your preferred SA name
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

# Derived variables
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo "🚀 Setting up GitHub Actions with existing WIF provider"
echo "Project: $PROJECT_ID"
echo "Pool: $POOL_ID"
echo "Provider: $PROVIDER_ID"
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Verify existing resources
echo "1️⃣ Verifying existing resources..."
gcloud iam workload-identity-pools describe $POOL_ID \
  --location=global \
  --project=$PROJECT_ID || {
  echo "❌ Pool $POOL_ID not found. Please update POOL_ID variable."
  exit 1
}

gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
  --workload-identity-pool=$POOL_ID \
  --location=global \
  --project=$PROJECT_ID || {
  echo "❌ Provider $PROVIDER_ID not found. Please update PROVIDER_ID variable."
  exit 1
}

echo "✅ Existing WIF resources verified"

# Create/verify service account
echo "2️⃣ Setting up service account..."
gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID || {
  echo "Creating service account..."
  gcloud iam service-accounts create $SA_NAME \
    --project=$PROJECT_ID \
    --description="Service account for GitHub Actions with WIF" \
    --display-name="GitHub Actions SA (WIF)"
}

# Assign roles
echo "3️⃣ Assigning roles..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/containeranalysis.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.admin"

# Bind to workload identity
echo "4️⃣ Binding to workload identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔑 Add these secrets to GitHub:"
echo "https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo ""
echo "WIF_PROVIDER:"
echo "$WIF_PROVIDER"
echo ""
echo "WIF_SERVICE_ACCOUNT:"
echo "$SA_EMAIL"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
```

## 🎯 Quick Setup Steps

1. **Find your existing configuration:**
   ```bash
   gcloud iam workload-identity-pools list --location=global
   gcloud iam workload-identity-pools providers list --workload-identity-pool=YOUR_POOL_NAME --location=global
   ```

2. **Update the script variables:**
   - Set `POOL_ID` to your existing pool name
   - Set `PROVIDER_ID` to your existing provider name (probably "github-provider")

3. **Run the setup script** with your actual values

4. **Add the three secrets to GitHub:**
   - `WIF_PROVIDER`
   - `WIF_SERVICE_ACCOUNT` 
   - `GCP_PROJECT_ID`

## 🔧 What to Look For

When you run the first commands, look for output like:
```
NAME: my-github-pool
DISPLAY_NAME: GitHub Actions Pool
STATE: ACTIVE
```

And for providers:
```
NAME: github-provider
DISPLAY_NAME: GitHub Provider
STATE: ACTIVE
```

Use those exact names in the setup script!

Would you like me to help you identify your existing pool and provider names, or do you already know them?
