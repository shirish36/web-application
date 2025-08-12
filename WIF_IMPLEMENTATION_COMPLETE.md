# 🎯 Workload Identity Federation (WIF) Implementation Complete

## ✅ What's Been Updated

I've successfully updated your GitHub Actions workflows to use **Workload Identity Federation (WIF)** instead of service account keys. This is the most secure and recommended approach for authenticating with Google Cloud from GitHub Actions.

## 🔄 Changes Made

### 1. Updated Authentication Method
**Before (Service Account Key):**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

**After (Workload Identity Federation):**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
    service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
```

### 2. Updated Project ID References
- Removed hardcoded `GCP_PROJECT_ID: gifted-palace-468618-q5` from environment variables
- Updated all references to use `${{ secrets.GCP_PROJECT_ID }}` instead

### 3. Files Updated
- ✅ `stage2-jfrog-to-gcr.yml` - Now uses WIF authentication
- ✅ `stage3-deploy-cloud-run.yml` - Now uses WIF authentication
- ✅ All GCP project ID references updated to use secrets

## 🔐 New GitHub Secrets Required

You now need to configure these **NEW** secrets (replacing the old GCP_SA_KEY):

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `WIF_PROVIDER` | Workload Identity Provider | From the setup script output |
| `WIF_SERVICE_ACCOUNT` | Service Account Email | From the setup script output |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `gifted-palace-468618-q5` |

### Keep These Existing Secrets:
- ✅ `JF_ACCESS_TOKEN` - JFrog Artifactory access token
- ✅ `JF_URL` - JFrog Artifactory URL

### Remove This Secret:
- ❌ `GCP_SA_KEY` - No longer needed with WIF

## 🚀 Setup Instructions

### Step 1: Run the WIF Setup Script
Copy and run this complete script in **Google Cloud Shell**:

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
echo "WIF_PROVIDER:"
echo "$WIF_PROVIDER"
echo ""
echo "WIF_SERVICE_ACCOUNT:"
echo "$SA_EMAIL"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
echo ""
echo "🎯 Your GitHub Actions workflows will now use Workload Identity Federation!"
```

### Step 2: Add GitHub Secrets
Go to https://github.com/shirish36/web-application/settings/secrets/actions and add:

1. **WIF_PROVIDER**: (Output from setup script)
2. **WIF_SERVICE_ACCOUNT**: (Output from setup script)  
3. **GCP_PROJECT_ID**: `gifted-palace-468618-q5`

### Step 3: Remove Old Secret
- Delete the `GCP_SA_KEY` secret (no longer needed)

## 🎯 Benefits of WIF

1. **Enhanced Security**: No long-lived credentials stored in GitHub
2. **Automatic Token Management**: Google manages token lifecycle
3. **Fine-grained Access Control**: Repository-specific access
4. **Audit Trail**: Better logging and monitoring
5. **Best Practice Compliance**: Follows Google Cloud security recommendations

## 🔍 Testing Your Setup

### Test Stage 1 (JFrog Build)
```bash
git add .
git commit -m "Test WIF implementation"
git push origin main
```

### Complete Pipeline Test
Once all secrets are configured, the full 3-stage pipeline will work automatically.

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify all three WIF secrets are correctly set
   - Check that the workload identity pool and provider exist
   - Ensure service account has proper role bindings

2. **Permission Denied**
   - Verify service account roles were applied correctly
   - Check that the repository name in the setup matches exactly

3. **Provider Not Found**
   - Ensure the setup script completed successfully
   - Verify the WIF_PROVIDER secret value is correct

### Debug Commands
```bash
# Check workload identity pools
gcloud iam workload-identity-pools list --location=global

# Check providers
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=github-actions-pool \
  --location=global

# Check service account bindings
gcloud iam service-accounts get-iam-policy \
  github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com
```

## 🎉 Next Steps

1. ✅ Run the WIF setup script in Google Cloud Shell
2. ✅ Add the three new secrets to GitHub
3. ✅ Remove the old `GCP_SA_KEY` secret
4. ✅ Test the pipeline by pushing code
5. ✅ Monitor the GitHub Actions runs for successful authentication

Your pipeline is now using the most secure authentication method available! 🚀
