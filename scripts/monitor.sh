#!/bin/bash

# Monitoring and Health Check Script
# Usage: ./monitor.sh [service-name] [region]

set -e

# Configuration
PROJECT_ID="gifted-palace-468618-q5"
SERVICE_NAME=${1:-"web-application-service"}
REGION=${2:-"us-central1"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Cloud Run Service Monitor${NC}"
echo -e "${YELLOW}Service: $SERVICE_NAME${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo ""

# Service Status
echo -e "${BLUE}🔍 Service Status${NC}"
gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="table(
    metadata.name,
    status.url,
    status.latestReadyRevisionName,
    status.conditions[0].status,
    status.conditions[0].reason
  )"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format='value(status.url)')

echo ""
echo -e "${BLUE}🌐 Service URL: ${GREEN}$SERVICE_URL${NC}"

# Health Check
echo ""
echo -e "${BLUE}🏥 Health Check${NC}"
if curl -f -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Service is healthy (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Service health check failed${NC}"
fi

# Performance Check
echo ""
echo -e "${BLUE}⚡ Performance Check${NC}"
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$SERVICE_URL")
echo -e "Response Time: ${YELLOW}${RESPONSE_TIME}s${NC}"

# Recent Logs
echo ""
echo -e "${BLUE}📝 Recent Logs (Last 10 entries)${NC}"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
  --limit=10 \
  --format="table(timestamp,severity,textPayload)" \
  --sort-by="~timestamp"

# Traffic Metrics
echo ""
echo -e "${BLUE}📈 Traffic Metrics (Last 1 hour)${NC}"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND httpRequest.status>=200" \
  --format="value(httpRequest.status)" \
  --freshness=1h | sort | uniq -c | sort -nr

# Resource Usage
echo ""
echo -e "${BLUE}💾 Resource Usage${NC}"
gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --format="table(
    spec.template.spec.containers[0].resources.limits.cpu:label=CPU_LIMIT,
    spec.template.spec.containers[0].resources.limits.memory:label=MEMORY_LIMIT
  )"

# Revisions
echo ""
echo -e "${BLUE}🔄 Recent Revisions${NC}"
gcloud run revisions list \
  --service=$SERVICE_NAME \
  --region=$REGION \
  --limit=5 \
  --format="table(
    metadata.name,
    status.conditions[0].status:label=STATUS,
    metadata.creationTimestamp.date():label=CREATED,
    spec.containers[0].image:label=IMAGE
  )"

# Continuous Monitoring Mode
if [[ "$3" == "--watch" ]]; then
    echo ""
    echo -e "${YELLOW}⏰ Continuous monitoring mode (Ctrl+C to stop)${NC}"
    while true; do
        echo ""
        echo -e "${BLUE}$(date): Checking service health...${NC}"
        
        if curl -f -s -o /dev/null "$SERVICE_URL"; then
            echo -e "${GREEN}✅ Service is healthy${NC}"
        else
            echo -e "${RED}❌ Service is down!${NC}"
            # Send alert (you can integrate with your alerting system here)
        fi
        
        sleep 60  # Check every minute
    done
fi

echo ""
echo -e "${GREEN}📊 Monitoring complete!${NC}"
