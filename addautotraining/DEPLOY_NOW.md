# Deploy Your Application to Vercel

This guide will walk you through deploying your application to Vercel in a few simple steps.

## Prerequisites

1.  **Node.js and npm:** Ensure you have Node.js and npm installed on your computer.
2.  **Vercel Account:** You need a Vercel account. You can sign up for free at [vercel.com](https://vercel.com).

## Deployment Steps

### Step 1: Install the Vercel CLI

Open your terminal or command prompt and run the following command to install the Vercel Command Line Interface (CLI) globally on your system:

```bash
npm install -g vercel
```

### Step 2: Log in to Your Vercel Account

After the installation is complete, log in to your Vercel account by running this command:

```bash
vercel login
```

This will prompt you to enter the email address associated with your Vercel account. Vercel will then send you an email to verify your login.

### Step 3: Deploy the Application

Navigate to the root directory of your project (`addautotraining`) in your terminal and run the following command:

```bash
vercel
```

The Vercel CLI will automatically detect the project settings from the `vercel.json` file and guide you through the deployment process. It will ask you a series of questions to configure the deployment. For most of them, you can accept the default values.

### Step 4: Configure Environment Variables

Your application requires environment variables to connect to the database and for other settings. You will need to add these to your Vercel project.

You can copy the required variables from the `.env.production.example` file and add them in your Vercel project's settings page under "Environment Variables".

**Go to your project on Vercel > Settings > Environment Variables**

### Step 5: Done!

Once the deployment is complete, Vercel will provide you with a URL where your application is live.

---

For more advanced deployment options, please refer to the `DEPLOYMENT.md` file.