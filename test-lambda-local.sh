#!/bin/bash

# ローカルでLambdaコンテナをテストするスクリプト

echo "Building Docker image..."
docker build -f Dockerfile.prod -t lambda-test:latest --platform linux/amd64 .

echo "Running Lambda container locally..."
docker run --rm -p 9000:8080 \
  -e AWS_REGION=ap-northeast-1 \
  -e NODE_ENV=production \
  lambda-test:latest &

# コンテナが起動するまで待機
sleep 5

echo "Testing Lambda function..."
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{
    "httpMethod": "GET",
    "path": "/health",
    "headers": {
      "Content-Type": "application/json"
    }
  }'

echo ""
echo "Press Ctrl+C to stop the container"
wait