# Complete 3-Stage Deployment Pipeline

This repository implements a sophisticated 3-stage deployment pipeline that addresses the limitation where Google Cloud Run cannot directly access images from JFrog Artifactory.

## 🏗️ Architecture Overview

```
Developer Code Push → Stage 1 → Stage 2 → Stage 3 → Live Application
                     ┌─────────┐  ┌─────────┐  ┌─────────┐
                     │ Build & │  │ JFrog   │  │ Cloud   │
                     │ JFrog   │  │ to GCR  │  │ Run     │
                     │ Push    │  │ Transfer│  │ Deploy  │
                     └─────────┘  └─────────┘  └─────────┘
```

## 📋 Prerequisites

### Repository Setup
1. **Web Application Repository**: Contains your React TypeScript application
2. **Infrastructure Repository**: Contains Terraform modules (terraform-infrastructure)

### Required Secrets

Add these secrets to your web-application repository:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GCP_SA_KEY` | Google Cloud Service Account JSON | Create service account in GCP Console |
| `JF_ACCESS_TOKEN` | JFrog Artifactory Access Token | Generate in JFrog Admin Console |
| `INFRA_REPO_TOKEN` | GitHub Token for Infrastructure Repo | GitHub Settings → Developer settings → Personal access tokens |

### Environment Configuration

The pipeline supports three environments:
- **Development**: Minimal resources, auto-scaling to 0
- **Staging**: Moderate resources, testing configuration
- **Production**: Full resources, always-on instances

## 🚀 Stage 1: Build and Push to JFrog Artifactory

**File**: `.github/workflows/stage1-build-jfrog.yml`

### Triggers
- Push to `main` branch
- Pull requests to `main` branch
- Manual dispatch

### Process
1. **Quality Gates**: Code quality checks, linting, testing
2. **Environment Detection**: Auto-detects target environment based on branch
3. **Docker Build**: Builds multi-stage Docker image
4. **JFrog Push**: Pushes image to JFrog Artifactory
5. **Build Info**: Collects comprehensive build metadata
6. **Stage 2 Trigger**: Automatically triggers the next stage

### Key Features
- Automatic environment detection
- Comprehensive quality gates
- Build info collection for traceability
- Conditional deployment based on environment

## 🔄 Stage 2: JFrog to Google Container Registry Transfer

**File**: `.github/workflows/stage2-jfrog-to-gcr.yml`

### Triggers
- Triggered by Stage 1 completion
- Manual dispatch for specific images

### Process
1. **Authentication**: Connects to both JFrog and GCP
2. **Image Pull**: Downloads image from JFrog Artifactory
3. **Image Re-tag**: Properly tags for GCR
4. **GCR Push**: Uploads to Google Container Registry
5. **Verification**: Ensures image integrity
6. **Stage 3 Trigger**: Initiates Cloud Run deployment

### Key Features
- Secure credential management
- Image integrity verification
- Automatic cleanup of temporary images
- Error handling and retry logic

## ☁️ Stage 3: Cloud Run Deployment

**File**: `.github/workflows/stage3-deploy-cloud-run.yml`

### Triggers
- Triggered by Stage 2 completion
- Manual dispatch for specific deployments

### Process
1. **Infrastructure Check**: Verifies if Cloud Run service exists
2. **Infrastructure Deploy**: Creates infrastructure via Terraform if needed
3. **Application Deploy**: Deploys to Cloud Run with environment-specific configs
4. **Health Checks**: Validates deployment health
5. **Performance Test**: Basic performance validation
6. **Notifications**: Sends deployment status updates

### Key Features
- Environment-specific resource allocation
- Automatic infrastructure provisioning
- Health monitoring and validation
- Performance testing
- Comprehensive deployment reporting

## 🔧 Setup Instructions

### 1. Clone and Setup Repositories

```bash
# Clone the web application repository
git clone https://github.com/shirish36/web-application.git
cd web-application

# Clone the infrastructure repository (in a separate directory)
git clone https://github.com/your-org/terraform-infrastructure.git
```

### 2. Configure Secrets

1. **Google Cloud Service Account**:
   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions-sa \
     --description="Service account for GitHub Actions" \
     --display-name="GitHub Actions SA"
   
   # Assign necessary roles
   gcloud projects add-iam-policy-binding gifted-palace-468618-q5 \
     --member="serviceAccount:github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding gifted-palace-468618-q5 \
     --member="serviceAccount:github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   # Create and download key
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com
   ```

2. **JFrog Access Token**:
   - Login to JFrog: https://trial4jlj6w.jfrog.io/
   - Go to Administration → User Management → Access Tokens
   - Generate new token with appropriate permissions

3. **GitHub Repository Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add the required secrets listed above

### 3. Infrastructure Setup

Ensure your Terraform infrastructure repository is properly configured:

```bash
cd terraform-infrastructure
terraform init
terraform plan -var-file="environments/production.tfvars"
```

### 4. Test the Pipeline

1. **Trigger Stage 1**: Push code to main branch
2. **Monitor Progress**: Watch the GitHub Actions tab
3. **Verify Deployment**: Check Cloud Run console for deployed service

## 🔍 Monitoring and Debugging

### Viewing Logs
```bash
# Application logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=YOUR_SERVICE" --limit=50

# Build logs in GitHub Actions
# Navigate to Actions tab → Select workflow run → View job details
```

### Common Issues

1. **Authentication Failures**:
   - Verify GCP_SA_KEY secret is valid JSON
   - Check service account permissions

2. **JFrog Connection Issues**:
   - Verify JF_ACCESS_TOKEN is valid
   - Check network connectivity to JFrog

3. **Deployment Failures**:
   - Check Cloud Run quotas
   - Verify container image functionality

## 🔒 Security Considerations

1. **Secrets Management**: All sensitive data stored as GitHub secrets
2. **Service Accounts**: Minimal required permissions
3. **Network Security**: Private container registry access
4. **Environment Isolation**: Separate configurations per environment

## 📊 Pipeline Metrics

The pipeline provides comprehensive metrics:
- Build duration and success rates
- Image transfer times
- Deployment health scores
- Performance benchmarks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test changes in development environment
4. Submit pull request

## 📞 Support

For issues or questions:
1. Check GitHub Actions logs
2. Review Cloud Run service logs
3. Verify infrastructure state in Terraform

## 🎯 Next Steps

Consider implementing:
- Automated rollback capabilities
- Advanced monitoring with Prometheus/Grafana
- Load testing integration
- Security scanning in the pipeline
- Multi-region deployments

---

This complete pipeline ensures reliable, secure, and automated deployment of your React TypeScript application to Google Cloud Run while handling the JFrog Artifactory integration seamlessly.
