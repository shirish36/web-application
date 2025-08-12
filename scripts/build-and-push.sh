#!/bin/bash

# Build and push to JFrog Artifactory
# Usage: ./build-and-push.sh [tag]

set -e

# Configuration
JFROG_URL="trial4jlj6w.jfrog.io"
DOCKER_REPO="shirish-docker"
IMAGE_NAME="web-application"

# Default tag
TAG=${1:-$(date +%Y%m%d-%H%M%S)}
FULL_IMAGE_NAME="$JFROG_URL/$DOCKER_REPO/$IMAGE_NAME:$TAG"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔨 Building and pushing Docker image${NC}"
echo -e "${YELLOW}Image: $FULL_IMAGE_NAME${NC}"

# Check prerequisites
if ! command -v jf &> /dev/null; then
    echo -e "${RED}❌ JFrog CLI is not installed${NC}"
    exit 1
fi

# Test JFrog connection
echo -e "${YELLOW}🔌 Testing JFrog connection...${NC}"
if jf rt ping; then
    echo -e "${GREEN}✅ JFrog connection successful${NC}"
else
    echo -e "${RED}❌ JFrog connection failed${NC}"
    exit 1
fi

# Build image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
jf docker build -t $FULL_IMAGE_NAME .

# Push to JFrog
echo -e "${YELLOW}📤 Pushing to JFrog Artifactory...${NC}"
jf docker push $FULL_IMAGE_NAME

# Collect build info
echo -e "${YELLOW}📊 Collecting build information...${NC}"
export JFROG_CLI_BUILD_NAME="web-application-manual-build"
export JFROG_CLI_BUILD_NUMBER=$TAG

jf rt build-collect-env
jf rt build-add-git
jf rt build-publish

echo -e "${GREEN}✅ Build and push completed!${NC}"
echo -e "${GREEN}📦 Image: $FULL_IMAGE_NAME${NC}"
echo -e "${GREEN}🏗️  Build: $JFROG_CLI_BUILD_NAME:$TAG${NC}"

# Security scan
echo -e "${YELLOW}🔍 Running security scan...${NC}"
if jf build-scan $JFROG_CLI_BUILD_NAME $TAG; then
    echo -e "${GREEN}✅ Security scan passed${NC}"
else
    echo -e "${YELLOW}⚠️  Security scan found issues (check JFrog Xray)${NC}"
fi
