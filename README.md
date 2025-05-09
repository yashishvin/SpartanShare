# Project Name

## Overview
This project consists of a frontend and backend application with infrastructure that can be provisioned using Terraform.

## Prerequisites
- Node.js and npm installed
- Terraform installed for infrastructure provisioning

## Project Structure
```
project-root/
├── frontend/         # Frontend application
├── backend/          # Backend server 
└── infrastructure/   # Terraform configuration files
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The backend server should now be running.

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend application:
   ```
   npm start
   ```
   The frontend application should now be running and accessible in your browser.

## Infrastructure Provisioning
This project uses Terraform to provision and manage infrastructure.

1. Navigate to the infrastructure directory:
   ```
   cd infrastructure
   ```

2. Initialize Terraform:
   ```
   terraform init
   ```
   This will download the required providers and initialize the Terraform working directory.

3. Preview the infrastructure changes:
   ```
   terraform plan
   ```
   This will show you what changes Terraform will make to your infrastructure.

4. Apply the infrastructure changes:
   ```
   terraform apply
   ```
   After reviewing the plan, type `yes` to proceed with infrastructure provisioning.

## Environment Variables

### Backend Environment Variables
Create a `.env` file in the backend directory with the following variables:

- `MONGO_URI`: MongoDB connection string for database access
- `JWT_SECRET`: Secret key for JWT token generation and validation
- `GOOGLE_CLIENT_ID`: Google OAuth client ID for authentication
- `OPENAI_API_KEY`: API key for OpenAI services integration
- `AWS_ACCESS_KEY_ID`: AWS access key for S3 and other AWS services
- `AWS_SECRET_ACCESS_KEY`: AWS secret key paired with the access key
- `AWS_REGION`: AWS region where your resources are deployed (e.g., us-east-1)
- `AWS_S3_BUCKET_NAME`: Name of the S3 bucket used for file storage

### Frontend Environment Variables
Create a `.env` file in the frontend directory with the following variables:

- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID for frontend authentication
- `REACT_APP_GOOGLE_SECRET_ID`: Google OAuth secret ID for frontend authentication
- `REACT_APP_BACKEND_PORT`: Port number where the backend server is running



