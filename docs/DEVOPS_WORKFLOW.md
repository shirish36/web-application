# Complete DevOps Workflow Documentation

## Overview
This document outlines the complete end-to-end workflow for the React web application deployment from development to production on Google Cloud Platform.

## Architecture Components

### 1. Source Code Management
- **Repository**: GitHub (https://github.com/shirish36/web-application.git)
- **Branching Strategy**: GitFlow (main, develop, feature branches)
- **Code Quality**: ESLint, TypeScript, Jest testing

### 2. Artifact Management
- **JFrog Artifactory**: https://trial4jlj6w.jfrog.io
- **Docker Registry**: shirish-docker repository
- **Build Info**: Tracked with JFrog CLI

### 3. Google Cloud Platform Resources
- **Project ID**: gifted-palace-468618-q5
- **Project Number**: 283962084457
- **Project Name**: DevOps-Non-Prod
- **Primary Services**:
  - Cloud Run (Container hosting)
  - Container Registry (Image storage)
  - Cloud Build (Alternative CI/CD)
  - Cloud Monitoring (Observability)

## Workflow Stages

### Stage 1: Development & Code Quality

#### 1.1 Local Development
```bash
# Setup
npm install
npm start  # Development server on localhost:3000

# Testing
npm test
npm run build  # Production build
```

#### 1.2 Code Quality Gates
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Type checking and compilation
- **Jest**: Unit and integration testing
- **Security Audit**: Dependency vulnerability scanning
- **Coverage**: Code coverage reporting

#### 1.3 Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Run local quality checks
4. Create pull request to `develop`
5. Automated CI checks run
6. Code review and approval
7. Merge to `develop`

### Stage 2: Build & Artifact Management

#### 2.1 Docker Build Process
```dockerfile
# Multi-stage build optimizes image size
FROM node:18-alpine AS build
# ... build React app
FROM nginx:alpine
# ... serve static files
```

#### 2.2 JFrog Integration
- **Build Info Collection**: Environment and Git metadata
- **Image Tagging**: `trial4jlj6w.jfrog.io/shirish-docker/web-application:BUILD_NUMBER`
- **Security Scanning**: Xray vulnerability analysis
- **Artifact Promotion**: Automated promotion through repositories

#### 2.3 Build Artifacts
- **Docker Image**: Containerized React application
- **Build Metadata**: Git commit, environment variables, dependencies
- **Test Results**: Coverage reports and test outcomes
- **Security Reports**: Vulnerability scan results

### Stage 3: Deployment to GCP

#### 3.1 Google Cloud Run Deployment
```bash
gcloud run deploy web-application-service \
  --image=gcr.io/gifted-palace-468618-q5/web-application:BUILD_NUMBER \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated
```

#### 3.2 Infrastructure Configuration
- **CPU**: 1 vCPU
- **Memory**: 512Mi
- **Scaling**: 0-10 instances (auto-scaling)
- **Port**: 80 (nginx serving React SPA)
- **Environment**: Production settings

#### 3.3 Deployment Process
1. Pull image from JFrog Artifactory
2. Re-tag for Google Container Registry
3. Push to GCR
4. Deploy to Cloud Run
5. Health check validation
6. Traffic routing (100% to new version)

### Stage 4: Monitoring & Observability

#### 4.1 Application Monitoring
- **Health Checks**: HTTP endpoint monitoring
- **Performance Metrics**: Response time, throughput
- **Error Tracking**: Application errors and exceptions
- **Resource Usage**: CPU, memory, network utilization

#### 4.2 Infrastructure Monitoring
- **Cloud Run Metrics**: Request count, latency, errors
- **Container Registry**: Image pulls and storage
- **Build Pipeline**: Success/failure rates, duration

## Security Considerations

### 1. Secrets Management
- **GitHub Secrets**:
  - `JF_ACCESS_TOKEN`: JFrog authentication
  - `GCP_SA_KEY`: Google Cloud service account key
- **Environment Variables**: Non-sensitive configuration

### 2. Access Control
- **JFrog**: Repository-level permissions
- **GCP**: IAM roles and service accounts
- **GitHub**: Branch protection rules

### 3. Security Scanning
- **Dependencies**: npm audit for vulnerabilities
- **Container Images**: JFrog Xray scanning
- **Code Quality**: Static analysis with ESLint

## Disaster Recovery & Rollback

### 1. Rollback Strategy
```bash
# Quick rollback to previous version
gcloud run services update-traffic web-application-service \
  --to-revisions=PREVIOUS_REVISION=100
```

### 2. Backup Strategy
- **Source Code**: Git repository (distributed)
- **Artifacts**: JFrog Artifactory retention policy
- **Configuration**: Infrastructure as Code

## Performance Optimization

### 1. Build Optimization
- **Multi-stage Docker**: Reduced image size
- **npm ci**: Faster, deterministic installs
- **Build Caching**: Docker layer caching

### 2. Runtime Optimization
- **nginx**: Efficient static file serving
- **Compression**: Gzip compression enabled
- **Caching**: Browser caching headers

## Cost Optimization

### 1. Cloud Run
- **Min Instances**: 0 (scales to zero)
- **Right-sizing**: Appropriate CPU/memory allocation
- **Regional Deployment**: Single region for cost efficiency

### 2. Container Registry
- **Image Cleanup**: Automated old image deletion
- **Vulnerability Scanning**: Built-in security scanning

## Compliance & Governance

### 1. Change Management
- **Git History**: Complete change tracking
- **Build Provenance**: Full build artifact lineage
- **Deployment Logs**: Audit trail for all deployments

### 2. Quality Gates
- **Automated Testing**: Prevents broken deployments
- **Security Scanning**: Vulnerability prevention
- **Code Review**: Human oversight for changes

## Troubleshooting Guide

### Common Issues

1. **Build Failures**
   - Check npm dependencies
   - Verify TypeScript compilation
   - Review test failures

2. **Deployment Failures**
   - Verify GCP permissions
   - Check Cloud Run service configuration
   - Review container image accessibility

3. **Runtime Issues**
   - Check Cloud Run logs
   - Verify nginx configuration
   - Monitor resource usage

### Debug Commands
```bash
# Check Cloud Run service status
gcloud run services describe web-application-service --region=us-central1

# View application logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# JFrog CLI debugging
jf config show
jf rt ping
```

## Future Enhancements

### 1. Advanced Deployment Strategies
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Releases**: Gradual traffic shifting
- **A/B Testing**: Feature flag integration

### 2. Enhanced Monitoring
- **Custom Metrics**: Application-specific monitoring
- **Alerting**: Proactive issue detection
- **Distributed Tracing**: Request flow analysis

### 3. Multi-Environment Support
- **Development**: Auto-deploy from develop branch
- **Staging**: Pre-production testing environment
- **Production**: Stable release environment

This workflow provides a robust, scalable, and secure deployment pipeline for your React application on Google Cloud Platform.
