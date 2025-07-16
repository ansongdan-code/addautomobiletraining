# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to https://cloud.mongodb.com/
2. Sign up for a free account or sign in
3. Create a new project (e.g., "AddAutoTraining")

## 2. Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" (M0 Sandbox)
3. Select a cloud provider and region (preferably close to your users)
4. Name your cluster (e.g., "addautotraining-cluster")
5. Click "Create Cluster"

## 3. Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for Vercel deployment
4. Click "Confirm"

## 5. Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like: mongodb+srv://username:password@cluster.mongodb.net/database)

## 6. Update Environment Variables
Replace the connection string in your environment variables with the Atlas connection string.

Example:
```
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/addautotraining?retryWrites=true&w=majority
```

## 7. Set Environment Variables in Vercel
Use the Vercel dashboard or CLI to set your production environment variables.
