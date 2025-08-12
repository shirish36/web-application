# Environment Configuration Reference

## 🌍 Environment Variables

### Required for All Stages

| Variable | Description | Source | Example |
|----------|-------------|--------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | Hardcoded in workflows | `gifted-palace-468618-q5` |
| `GCP_REGION` | GCP deployment region | Hardcoded in workflows | `us-central1` |
| `JFROG_URL` | JFrog Artifactory URL | Hardcoded in workflows | `trial4jlj6w.jfrog.io` |
| `JFROG_REPO` | JFrog Docker repository | Hardcoded in workflows | `shirish-docker` |

### Repository Secrets (Configure in GitHub)

| Secret | Stage | Description | How to Generate |
|--------|-------|-------------|-----------------|
| `GCP_SA_KEY` | All | Google Cloud Service Account JSON | GCP Console → IAM → Service Accounts |
| `JF_ACCESS_TOKEN` | 1, 2 | JFrog Artifactory access token | JFrog Console → Administration → Access Tokens |
| `INFRA_REPO_TOKEN` | 3 | GitHub token for infrastructure repo | GitHub Settings → Developer Settings → Personal Access Tokens |

## 🏷️ Environment-Specific Configurations

### Development Environment
```yaml
Environment: development
Resources:
  - Memory: 256Mi
  - CPU: 0.5
  - Min Instances: 0
  - Max Instances: 2
Triggers:
  - Branch: develop
  - Manual deployment
```

### Staging Environment
```yaml
Environment: staging
Resources:
  - Memory: 256Mi
  - CPU: 1
  - Min Instances: 0
  - Max Instances: 5
Triggers:
  - Branch: staging
  - Manual deployment
```

### Production Environment
```yaml
Environment: production
Resources:
  - Memory: 512Mi
  - CPU: 1
  - Min Instances: 1
  - Max Instances: 10
Triggers:
  - Branch: main
  - Manual deployment
```

## 🔧 Service Account Permissions

Your GCP Service Account needs these roles:

```bash
# Required roles for the GitHub Actions service account
roles/run.admin                    # Cloud Run administration
roles/storage.admin                # Container Registry access
roles/artifactregistry.admin       # Artifact Registry (if used)
roles/iam.serviceAccountUser       # Service account impersonation
roles/logging.viewer               # Log access for debugging
```

## 📦 Container Image Naming Convention

Images follow this naming pattern:
```
JFrog: trial4jlj6w.jfrog.io/shirish-docker/web-application:TAG
GCR:   gcr.io/gifted-palace-468618-q5/web-application:TAG
```

Where TAG format is:
- Production: `prod-YYYYMMDD-HHMMSS-COMMIT_SHA`
- Staging: `staging-YYYYMMDD-HHMMSS-COMMIT_SHA`
- Development: `dev-YYYYMMDD-HHMMSS-COMMIT_SHA`

## 🚦 Workflow Triggers

### Stage 1 Triggers
```yaml
# Automatic triggers
on:
  push:
    branches: [ main, staging, develop ]
  pull_request:
    branches: [ main ]

# Manual trigger
workflow_dispatch:
  inputs:
    environment: [production, staging, development]
    skip_tests: [true, false]
```

### Stage 2 Triggers
```yaml
# Triggered by Stage 1
workflow_dispatch:
  inputs:
    jfrog_image_url: "trial4jlj6w.jfrog.io/shirish-docker/web-application:tag"
    gcr_image_url: "gcr.io/gifted-palace-468618-q5/web-application:tag"
    environment: [production, staging, development]
```

### Stage 3 Triggers
```yaml
# Triggered by Stage 2
workflow_dispatch:
  inputs:
    gcr_image_url: "gcr.io/gifted-palace-468618-q5/web-application:tag"
    image_tag: "prod-20240101-120000-abc123"
    environment: [production, staging, development]
    service_name: "web-application-prod"
```

## 🔍 Debugging Commands

### Check Cloud Run Service
```bash
gcloud run services list --region=us-central1
gcloud run services describe SERVICE_NAME --region=us-central1
```

### Check Container Images
```bash
# JFrog
curl -H "Authorization: Bearer $JF_ACCESS_TOKEN" \
  "https://trial4jlj6w.jfrog.io/artifactory/api/docker/shirish-docker/v2/web-application/tags/list"

# GCR
gcloud container images list-tags gcr.io/gifted-palace-468618-q5/web-application
```

### View Logs
```bash
# Application logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Build logs
gcloud logging read "resource.type=build" --limit=20
```

## 🎛️ Manual Deployment Commands

### Deploy directly to Cloud Run (bypass pipeline)
```bash
gcloud run deploy web-application-prod \
  --image=gcr.io/gifted-palace-468618-q5/web-application:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1
```

### Manual image transfer
```bash
# Pull from JFrog
docker login trial4jlj6w.jfrog.io
docker pull trial4jlj6w.jfrog.io/shirish-docker/web-application:tag

# Tag for GCR
docker tag trial4jlj6w.jfrog.io/shirish-docker/web-application:tag \
  gcr.io/gifted-palace-468618-q5/web-application:tag

# Push to GCR
gcloud auth configure-docker
docker push gcr.io/gifted-palace-468618-q5/web-application:tag
```

## 🚨 Emergency Procedures

### Rollback to Previous Version
```bash
# List revisions
gcloud run revisions list --service=web-application-prod --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic web-application-prod \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

### Emergency Stop
```bash
# Scale to 0 instances
gcloud run services update web-application-prod \
  --min-instances=0 \
  --max-instances=0 \
  --region=us-central1
```

### Health Check URLs
```bash
# Service URL format
https://web-application-prod-HASH-uc.a.run.app

# Health check endpoints (if implemented)
/health
/ready
/metrics
```

## 📋 Checklist for New Deployments

- [ ] All secrets configured in GitHub
- [ ] Service account has required permissions
- [ ] Infrastructure repository accessible
- [ ] JFrog Artifactory accessible
- [ ] GCP project quotas sufficient
- [ ] Environment-specific configurations reviewed
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Team notified of deployment window
