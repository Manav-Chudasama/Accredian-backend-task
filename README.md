# Referral System Backend

A Node.js backend service for managing course referrals using Express and Prisma.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/dbname"
   SHADOW_DATABASE_URL="mysql://user:password@localhost:3306/shadow_dbname"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-specific-password"
   FRONTEND_URL="http://your-frontend-url"
   PORT=3000
   ```
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Run migrations:
   ```bash
   npm run prisma:migrate
   ```
6. Start the server:
   ```bash
   npm run dev
   ```

## Features

- Email-based referral system
- User statistics
- Referral tracking
- Email notifications

## Deployment on Vercel

1. Create a Vercel account and install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. Set up environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required variables from `.env.sample`
