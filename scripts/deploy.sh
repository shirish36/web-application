#!/bin/bash

# Deploy to GCP Cloud Run - Manual Deployment Script
# Usage: ./deploy.sh [environment] [image_tag]

set -e

# Configuration
PROJECT_ID="gifted-palace-468618-q5"
SERVICE_NAME="web-application-service"
REGION="us-central1"
JFROG_URL="trial4jlj6w.jfrog.io"
DOCKER_REPO="shirish-docker"

# Default values
ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to GCP Cloud Run${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Image Tag: $IMAGE_TAG${NC}"

# Validate prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
    echo -e "${RED}❌ Not authenticated with gcloud${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Check if JFrog CLI is installed
if ! command -v jf &> /dev/null; then
    echo -e "${RED}❌ JFrog CLI is not installed${NC}"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# Pull image from JFrog and retag for GCR
echo -e "${YELLOW}📥 Pulling image from JFrog Artifactory...${NC}"

JFROG_IMAGE="$JFROG_URL/$DOCKER_REPO/web-application:$IMAGE_TAG"
GCR_IMAGE="gcr.io/$PROJECT_ID/web-application:$IMAGE_TAG"

# Pull from JFrog
jf docker pull $JFROG_IMAGE

# Tag for GCR
docker tag $JFROG_IMAGE $GCR_IMAGE

# Push to GCR
echo -e "${YELLOW}📤 Pushing to Google Container Registry...${NC}"
docker push $GCR_IMAGE

echo -e "${GREEN}✅ Image pushed to GCR${NC}"

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"

# Environment-specific configurations
case $ENVIRONMENT in
  "production")
    MIN_INSTANCES=1
    MAX_INSTANCES=10
    MEMORY="512Mi"
    CPU=1
    ;;
  "staging")
    MIN_INSTANCES=0
    MAX_INSTANCES=5
    MEMORY="256Mi"
    CPU=1
    ;;
  "development")
    MIN_INSTANCES=0
    MAX_INSTANCES=2
    MEMORY="256Mi"
    CPU=1
    ;;
  *)
    echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
    exit 1
    ;;
esac

# Deploy service
gcloud run deploy $SERVICE_NAME \
  --image=$GCR_IMAGE \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --port=80 \
  --memory=$MEMORY \
  --cpu=$CPU \
  --min-instances=$MIN_INSTANCES \
  --max-instances=$MAX_INSTANCES \
  --set-env-vars="NODE_ENV=$ENVIRONMENT" \
  --tag=$ENVIRONMENT \
  --quiet

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format='value(status.url)')

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 30

if curl -f -s "$SERVICE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
      --limit=10 \
      --format="table(timestamp,severity,textPayload)"
    exit 1
fi

# Display service information
echo -e "${YELLOW}📊 Service Information:${NC}"
gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="table(spec.template.spec.containers[0].image,status.url,status.latestReadyRevisionName)"

echo -e "${GREEN}🎯 Deployment Summary:${NC}"
echo -e "  Environment: $ENVIRONMENT"
echo -e "  Image: $GCR_IMAGE"
echo -e "  Service: $SERVICE_NAME"
echo -e "  Region: $REGION"
echo -e "  URL: $SERVICE_URL"
