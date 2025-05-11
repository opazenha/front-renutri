#!/bin/bash

# Script to expose the backend service (port 8080) via Ngrok

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose could not be found. Please ensure it's installed and in your PATH."
    exit 1
fi

# Check if ngrok is available
if ! command -v ngrok &> /dev/null
then
    echo "ngrok could not be found. Please ensure it's installed, authenticated, and in your PATH."
    echo "Visit https://ngrok.com/download for installation instructions."
    exit 1
fi

# Check if the backend service is running
BACKEND_STATUS=$(docker-compose ps -q backend | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null)

if [ "$BACKEND_STATUS" == "running" ]; then
    echo "Backend service is running. Starting Ngrok tunnel for port 8080..."
    # Starts an HTTP tunnel to port 8080. Ngrok will provide an HTTPS URL.
    # Replace 'http' with 'tcp' if you need a raw TCP tunnel, though HTTP is common for web backends.
    ngrok http 8080
elif [ -z "$BACKEND_STATUS" ]; then
    echo "Backend service is not configured or not found in docker-compose.yml."
    echo "Please ensure your docker-compose.yml has a service named 'backend'."
elif [ "$BACKEND_STATUS" == "exited" ]; then
    echo "Backend service is exited. Please start it with 'docker-compose up -d backend' first."
else
    echo "Backend service is not running (status: $BACKEND_STATUS). Please start it with 'docker-compose up -d backend' first."
fi
