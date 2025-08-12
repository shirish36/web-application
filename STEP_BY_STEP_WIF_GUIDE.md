# 📋 Step-by-Step WIF Discovery Guide

Let's discover your existing Workload Identity Federation configuration in Google Cloud Platform.

## 🚀 Step 1: Access Google Cloud Shell

1. **Open Google Cloud Console**: Go to https://console.cloud.google.com
2. **Select your project**: Make sure `gifted-palace-468618-q5` is selected in the project dropdown
3. **Open Cloud Shell**: Click the Cloud Shell icon (>_) in the top right corner
4. **Wait for initialization**: Cloud Shell will open at the bottom of the screen

## 🔍 Step 2: Set Your Project and Get Basic Info

Copy and paste this command in Cloud Shell:

```bash
export PROJECT_ID="gifted-palace-468618-q5"
echo "✅ Project ID set to: $PROJECT_ID"
```

Then get your project number:

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "✅ Project Number: $PROJECT_NUMBER"
```

**Expected Output:**
```
✅ Project ID set to: gifted-palace-468618-q5
✅ Project Number: 123456789012 (your actual project number)
```

## 🔍 Step 3: Find Your Workload Identity Pools

Run this command:

```bash
echo "📋 Searching for Workload Identity Pools..."
gcloud iam workload-identity-pools list --location=global --project=$PROJECT_ID --format="table(name,displayName,state)"
```

**Expected Output:**
```
NAME                                                                        DISPLAY_NAME           STATE
projects/123456789012/locations/global/workloadIdentityPools/my-pool-name  My Pool Display Name   ACTIVE
```

**🎯 Action Required:**
- Look at the output above
- Find the pool name (the part after `/workloadIdentityPools/`)
- Copy that name for the next step

**Example:** If you see `projects/123456789012/locations/global/workloadIdentityPools/github-actions-pool`, then your pool name is `github-actions-pool`

## 🔍 Step 4: Set Your Pool Name

Replace `YOUR_POOL_NAME` with the actual pool name you found:

```bash
export POOL_ID="YOUR_POOL_NAME"
echo "✅ Pool ID set to: $POOL_ID"
```

**Example:**
```bash
export POOL_ID="github-actions-pool"
echo "✅ Pool ID set to: github-actions-pool"
```

## 🔍 Step 5: Find Your GitHub Provider

Run this command:

```bash
echo "📋 Searching for Providers in pool '$POOL_ID'..."
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=$POOL_ID \
  --location=global \
  --project=$PROJECT_ID \
  --format="table(name,displayName,state)"
```

**Expected Output:**
```
NAME                                                                                              DISPLAY_NAME    STATE
projects/123456789012/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider  GitHub Provider  ACTIVE
```

**🎯 Action Required:**
- Look at the output above
- Find the provider name (the part after `/providers/`)
- Copy that name for the next step

**Example:** If you see `projects/.../providers/github-provider`, then your provider name is `github-provider`

## 🔍 Step 6: Set Your Provider Name

Replace `YOUR_PROVIDER_NAME` with the actual provider name you found:

```bash
export PROVIDER_ID="YOUR_PROVIDER_NAME"
echo "✅ Provider ID set to: $PROVIDER_ID"
```

**Example:**
```bash
export PROVIDER_ID="github-provider"
echo "✅ Provider ID set to: github-provider"
```

## 🎯 Step 7: Generate Your WIF Provider String

Now let's create the complete WIF provider string:

```bash
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"
echo ""
echo "🎉 Your WIF Provider String:"
echo "$WIF_PROVIDER"
echo ""
```

**Expected Output:**
```
🎉 Your WIF Provider String:
projects/123456789012/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
```

**🎯 Important:** Copy this entire string - you'll need it for GitHub secrets!

## ⚙️ Step 8: Setup Service Account

Now let's create and configure the service account:

```bash
# Set service account details
export SA_NAME="github-actions-sa"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
export REPO_OWNER="shirish36"
export REPO_NAME="web-application"

echo "🔧 Service Account Email: $SA_EMAIL"
echo "🔧 Repository: $REPO_OWNER/$REPO_NAME"
```

## ⚙️ Step 9: Create Service Account (if needed)

Check if the service account exists and create it if needed:

```bash
echo "🔍 Checking if service account exists..."
if gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "✅ Service account $SA_EMAIL already exists"
else
    echo "🔧 Creating service account..."
    gcloud iam service-accounts create $SA_NAME \
      --project=$PROJECT_ID \
      --description="Service account for GitHub Actions with WIF" \
      --display-name="GitHub Actions SA (WIF)"
    echo "✅ Service account created!"
fi
```

## ⚙️ Step 10: Assign Required Roles

Assign the necessary roles to your service account:

```bash
echo "🔧 Assigning Cloud Run Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

echo "🔧 Assigning Storage Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

echo "🔧 Assigning Container Analysis Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/containeranalysis.admin"

echo "🔧 Assigning Artifact Registry Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.admin"

echo "✅ All roles assigned!"
```

## ⚙️ Step 11: Bind Service Account to Workload Identity

This is the crucial step that connects your service account to GitHub:

```bash
echo "🔗 Binding service account to workload identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}"

echo "✅ Service account bound to workload identity!"
```

## 🎯 Step 12: Get Your Final GitHub Secrets

Now let's display all the secrets you need to add to GitHub:

```bash
echo ""
echo "🎉 SUCCESS! Here are your GitHub Secrets:"
echo "=========================================="
echo ""
echo "🔑 Secret Name: WIF_PROVIDER"
echo "📋 Secret Value:"
echo "$WIF_PROVIDER"
echo ""
echo "🔑 Secret Name: WIF_SERVICE_ACCOUNT"
echo "📋 Secret Value:"
echo "$SA_EMAIL"
echo ""
echo "🔑 Secret Name: GCP_PROJECT_ID"
echo "📋 Secret Value:"
echo "$PROJECT_ID"
echo ""
echo "📍 Add these at: https://github.com/shirish36/web-application/settings/secrets/actions"
echo ""
echo "🎯 Your pipeline is ready to use Workload Identity Federation!"
```

## 📝 Step 13: Add Secrets to GitHub

1. **Open GitHub Repository**: Go to https://github.com/shirish36/web-application
2. **Go to Settings**: Click the "Settings" tab
3. **Navigate to Secrets**: Click "Secrets and variables" → "Actions"
4. **Add each secret**: Click "New repository secret" for each one:

### Secret 1: WIF_PROVIDER
- **Name**: `WIF_PROVIDER`
- **Value**: (Copy the long string from Step 7)

### Secret 2: WIF_SERVICE_ACCOUNT
- **Name**: `WIF_SERVICE_ACCOUNT`
- **Value**: `github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com`

### Secret 3: GCP_PROJECT_ID
- **Name**: `GCP_PROJECT_ID`
- **Value**: `gifted-palace-468618-q5`

## ✅ Step 14: Test Your Setup

Once you've added all secrets, test your pipeline:

```bash
# In your local terminal (not Cloud Shell)
git add .
git commit -m "Test WIF authentication"
git push origin main
```

Then check your GitHub Actions at: https://github.com/shirish36/web-application/actions

## 🆘 Troubleshooting

### If Step 3 shows no pools:
```bash
# Check if WIF is enabled
gcloud services list --enabled --filter="name:iamcredentials.googleapis.com"
```

### If you see errors in Step 10:
```bash
# Check current user permissions
gcloud auth list
gcloud config get-value account
```

### If GitHub Actions fail:
1. Verify all three secrets are added correctly
2. Check that the secret values don't have extra spaces
3. Ensure the repository name matches exactly: `shirish36/web-application`

---

**🎯 Ready to proceed?** Start with Step 1 and work your way through each step. Let me know if you encounter any issues!
