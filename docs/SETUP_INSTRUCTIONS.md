# Setup Instructions for DevOps Pipeline

## Prerequisites

### 1. GitHub Repository Setup
1. Fork or clone the repository: `https://github.com/shirish36/web-application.git`
2. Ensure you have admin access to configure secrets and workflows

### 2. JFrog Artifactory Setup
1. Access your JFrog instance: `https://trial4jlj6w.jfrog.io`
2. Create an access token:
   - Go to User Profile → Security → Access Tokens
   - Generate new token with appropriate permissions
   - Save the token securely

### 3. Google Cloud Platform Setup
1. Verify project access: `gifted-palace-468618-q5`
2. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```
3. Create a service account for GitHub Actions:
   ```bash
   gcloud iam service-accounts create github-actions-sa \
     --display-name="GitHub Actions Service Account"
   ```
4. Grant necessary permissions:
   ```bash
   gcloud projects add-iam-policy-binding gifted-palace-468618-q5 \
     --member="serviceAccount:github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding gifted-palace-468618-q5 \
     --member="serviceAccount:github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding gifted-palace-468618-q5 \
     --member="serviceAccount:github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```
5. Generate service account key:
   ```bash
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account=github-actions-sa@gifted-palace-468618-q5.iam.gserviceaccount.com
   ```

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

### Repository Secrets
1. Go to Repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `JF_ACCESS_TOKEN` | JFrog access token | Your JFrog access token |
| `GCP_SA_KEY` | GCP service account key | Contents of `github-actions-key.json` |

### Repository Variables
Add the following variables:

| Variable Name | Description | Value |
|---------------|-------------|-------|
| `JF_URL` | JFrog URL | `https://trial4jlj6w.jfrog.io` |

## Local Development Setup

### 1. Install Dependencies
```bash
# Clone repository
git clone https://github.com/shirish36/web-application.git
cd web-application

# Install Node.js dependencies
npm install

# Install development tools
npm install -g @jfrog/cli
```

### 2. Environment Configuration
Create `.env.local` file:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

### 3. JFrog CLI Setup (Local)
```bash
# Configure JFrog CLI
jf config add --url=https://trial4jlj6w.jfrog.io --access-token=YOUR_TOKEN

# Test connection
jf rt ping
```

### 4. Google Cloud CLI Setup (Local)
```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# Initialize and authenticate
gcloud init
gcloud auth login
gcloud config set project gifted-palace-468618-q5

# Configure Docker for GCR
gcloud auth configure-docker
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test locally
npm start  # Development server
npm test   # Run tests
npm run build  # Test production build

# Commit and push
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

### 2. Pull Request Process
1. Create PR from feature branch to `main`
2. Automated CI checks will run:
   - Code quality (ESLint, TypeScript)
   - Unit tests
   - Security audit
   - Build verification
3. Request code review
4. Merge after approval

### 3. Deployment Trigger
- Push to `main` branch triggers full CI/CD pipeline
- Automatic deployment to GCP Cloud Run
- Health checks verify deployment success

## Monitoring and Troubleshooting

### 1. GitHub Actions Monitoring
- Go to Actions tab in GitHub repository
- Monitor workflow runs and check logs
- Review failed steps and error messages

### 2. JFrog Monitoring
```bash
# Check build info
jf rt search "shirish-docker/web-application*"

# View build details
jf rt build-info web-application-build BUILD_NUMBER
```

### 3. GCP Monitoring
```bash
# Check Cloud Run service status
gcloud run services list

# View service details
gcloud run services describe web-application-service --region=us-central1

# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit=20
```

### 4. Application Health
```bash
# Test application endpoint
curl -f https://your-cloud-run-url.run.app/

# Check application metrics in GCP Console
# Go to Cloud Run → Service → Metrics tab
```

## Security Best Practices

### 1. Secrets Management
- Never commit secrets to repository
- Use GitHub secrets for sensitive data
- Rotate access tokens regularly
- Use least privilege principle for service accounts

### 2. Container Security
- Regularly update base images
- Scan for vulnerabilities with JFrog Xray
- Use non-root user in containers when possible
- Keep container images minimal

### 3. Access Control
- Enable branch protection rules
- Require code reviews for main branch
- Use signed commits when possible
- Regular audit of access permissions

## Cost Optimization

### 1. Cloud Run Configuration
- Set appropriate min/max instances
- Right-size CPU and memory allocation
- Use request-based scaling
- Monitor usage and adjust as needed

### 2. Container Registry
- Set up lifecycle policies for old images
- Clean up unused images regularly
- Use regional storage for cost efficiency

### 3. JFrog Artifactory
- Configure retention policies
- Monitor storage usage
- Clean up old artifacts periodically

## Backup and Recovery

### 1. Source Code
- Git repository provides distributed backup
- Regular repository backups to multiple locations
- Tag important releases for easy reference

### 2. Artifacts
- JFrog Artifactory retention policies
- Export important artifacts for long-term storage
- Document artifact promotion process

### 3. Configuration
- Store infrastructure as code
- Version control all configuration files
- Document manual configuration steps

## Next Steps

1. **Set up all secrets and variables** in GitHub repository
2. **Test the workflow** with a small change
3. **Monitor the first deployment** closely
4. **Set up monitoring and alerting** for production
5. **Document any customizations** for your specific needs

For any issues or questions, refer to the troubleshooting section or check the workflow logs in GitHub Actions.
