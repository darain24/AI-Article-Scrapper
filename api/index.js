// Vercel serverless function entry point
// This file exports the Express app for Vercel's serverless functions

import app from '../backend/src/app.js';

// Export as Vercel serverless function
// Vercel will automatically handle the Express app
export default app;
