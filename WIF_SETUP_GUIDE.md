# 🔐 Google Cloud Workload Identity Federation Setup for GitHub Actions

## Overview
Workload Identity Federation (WIF) allows your GitHub Actions to authenticate with Google Cloud without storing long-lived service account keys. This is more secure and follows Google Cloud best practices.

## 🚀 Setup Steps

### Step 1: Create Service Account
```bash
# Set your project ID
export PROJECT_ID="gifted-palace-468618-q5"
export SA_NAME="github-actions-sa"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
gcloud iam service-accounts create $SA_NAME \
  --project=$PROJECT_ID \
  --description="Service account for GitHub Actions with WIF" \
  --display-name="GitHub Actions SA (WIF)"

echo "✅ Service account created: $SA_EMAIL"
```

### Step 2: Assign Required Roles
```bash
# Assign necessary roles for Cloud Run and Container Registry
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

echo "✅ Roles assigned to service account"
```

### Step 3: Create Workload Identity Pool
```bash
# Create workload identity pool
export POOL_ID="github-actions-pool"
export POOL_DISPLAY_NAME="GitHub Actions Pool"

gcloud iam workload-identity-pools create $POOL_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --display-name="$POOL_DISPLAY_NAME" \
  --description="Workload Identity Pool for GitHub Actions"

echo "✅ Workload Identity Pool created: $POOL_ID"
```

### Step 4: Create Workload Identity Provider
```bash
# Create workload identity provider for GitHub
export PROVIDER_ID="github-provider"
export PROVIDER_DISPLAY_NAME="GitHub Provider"
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool=$POOL_ID \
  --display-name="$PROVIDER_DISPLAY_NAME" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com"

echo "✅ Workload Identity Provider created: $PROVIDER_ID"
```

### Step 5: Bind Service Account to Workload Identity
```bash
# Allow the GitHub repo to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

# Get project number (needed for the above command)
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Run the binding command with project number
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo "✅ Service account bound to workload identity"
```

### Step 6: Get Workload Identity Provider Name
```bash
# Get the full provider name for GitHub secrets
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo "🔑 Add these to your GitHub repository secrets:"
echo "WIF_PROVIDER: $WIF_PROVIDER"
echo "WIF_SERVICE_ACCOUNT: $SA_EMAIL"
echo "GCP_PROJECT_ID: $PROJECT_ID"
```

## 📝 Complete Setup Script
Here's a complete script you can run in Google Cloud Shell:

```bash
#!/bin/bash
set -e

# Configuration
export PROJECT_ID="gifted-palace-468618-q5"
export SA_NAME="github-actions-sa"
export POOL_ID="github-actions-pool"
export PROVIDER_ID="github-provider"
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

# Derived variables
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo "🚀 Setting up Workload Identity Federation for GitHub Actions"
echo "Project: $PROJECT_ID"
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Step 1: Create service account
echo "1️⃣ Creating service account..."
gcloud iam service-accounts create $SA_NAME \
  --project=$PROJECT_ID \
  --description="Service account for GitHub Actions with WIF" \
  --display-name="GitHub Actions SA (WIF)" || echo "Service account may already exist"

# Step 2: Assign roles
echo "2️⃣ Assigning roles..."
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

# Step 3: Create workload identity pool
echo "3️⃣ Creating workload identity pool..."
gcloud iam workload-identity-pools create $POOL_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --description="Workload Identity Pool for GitHub Actions" || echo "Pool may already exist"

# Step 4: Create workload identity provider
echo "4️⃣ Creating workload identity provider..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool=$POOL_ID \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" || echo "Provider may already exist"

# Step 5: Bind service account
echo "5️⃣ Binding service account to workload identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔑 Add these secrets to your GitHub repository:"
echo "   https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
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
echo "🎯 Your GitHub Actions workflows will now use Workload Identity Federation!"
```

## 🔐 GitHub Secrets to Add

After running the setup script, add these secrets to your GitHub repository:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `WIF_PROVIDER` | Workload Identity Provider | `projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | Service Account Email | `github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com` |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `gifted-palace-468618-q5` |

## ⚠️ Important Notes

1. **Keep your existing JFrog secrets**: `JF_ACCESS_TOKEN` and `JF_URL` are still needed for JFrog Artifactory access
2. **Remove GCP_SA_KEY**: You no longer need the service account key file
3. **Repository-specific**: This setup only works for the `shirish36/web-application` repository
4. **Security**: WIF tokens are short-lived and automatically managed by GitHub

## 🔧 Troubleshooting

If you encounter issues:

```bash
# Check if workload identity pool exists
gcloud iam workload-identity-pools list --location=global --project=$PROJECT_ID

# Check if provider exists
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=$POOL_ID \
  --location=global \
  --project=$PROJECT_ID

# Check service account IAM bindings
gcloud iam service-accounts get-iam-policy $SA_EMAIL --project=$PROJECT_ID
```

## 🎯 Next Steps

1. Run the complete setup script in Google Cloud Shell
2. Add the three secrets to your GitHub repository
3. Your workflows will automatically use WIF authentication
4. Test by pushing code to trigger the pipeline

The updated workflow files will be provided separately with WIF authentication configured!
