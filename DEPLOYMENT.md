# 🚀 LibraryHub Deployment Guide

## Deploying to Vercel

### Prerequisites
- GitHub repository with your LibraryHub project
- PostgreSQL database (you can use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- Google Books API key

---

## Step 1: Set Up Database

### Option A: Neon (Recommended)
1. Go to [Neon](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host:port/database`)

### Option B: Supabase
1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings > Database and copy the connection string

### Option C: Railway
1. Go to [Railway](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string

---

## Step 2: Deploy Backend

### Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### Environment Variables
Add these in Vercel dashboard:
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_random_secret_key_here
NODE_ENV=production
```

### Deploy
Click "Deploy" and wait for the build to complete. Note the deployment URL (e.g., `https://your-backend.vercel.app`)

---

## Step 3: Deploy Frontend

### Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import the same GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables
Add these in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### Deploy
Click "Deploy" and wait for the build to complete.

---

## Step 4: Database Setup

After backend deployment, you need to run migrations:

### Option A: Using Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel env pull .env.local`
3. Run: `npx sequelize-cli db:migrate`

### Option B: Using Database GUI
1. Connect to your database using a tool like pgAdmin or DBeaver
2. Run the SQL from your migration files manually

### Option C: Add Migration Script
Add this to your backend's `package.json`:
```json
{
  "scripts": {
    "migrate": "npx sequelize-cli db:migrate",
    "seed": "npx sequelize-cli db:seed:all"
  }
}
```

---

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try to register/login
3. Test the book browsing functionality
4. Test borrowing and rating features

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Make sure your backend CORS configuration includes your frontend domain
- Update `backend/app.js` CORS origin to include your Vercel frontend URL

**2. Database Connection Issues**
- Check your `DATABASE_URL` environment variable
- Ensure your database allows external connections
- Verify SSL settings if required

**3. Build Failures**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**4. API 404 Errors**
- Check that your backend routes are properly configured
- Verify the `vercel.json` configuration
- Ensure the server.js file is the entry point

### Environment Variables Checklist

**Backend:**
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `NODE_ENV=production`

**Frontend:**
- ✅ `VITE_API_URL`
- ✅ `VITE_GOOGLE_BOOKS_API_KEY`

---

## Alternative Deployment Options

### Backend Alternatives

**Railway:**
- Better for Node.js applications
- Automatic database provisioning
- More straightforward deployment

**Render:**
- Free tier available
- Good for Node.js apps
- Automatic deployments

**Heroku:**
- Traditional choice
- Good documentation
- Requires credit card for free tier

### Frontend Alternatives

**Netlify:**
- Great for React apps
- Automatic deployments
- Good free tier

**GitHub Pages:**
- Free hosting
- Requires build optimization
- Limited to static sites

---

## Post-Deployment

1. **Set up custom domains** (optional)
2. **Configure SSL certificates** (automatic with Vercel)
3. **Set up monitoring** and error tracking
4. **Configure backups** for your database
5. **Set up CI/CD** for automatic deployments

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check database connectivity
5. Review CORS configuration

Your LibraryHub should now be live and accessible worldwide! 🌍 