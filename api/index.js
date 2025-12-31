// Vercel serverless function entry point
// This file exports a handler function for Vercel's serverless functions

import app from '../backend/src/app.js';

// Export handler function for Vercel
// Vercel expects a function that receives (req, res)
// Express app can be used directly as it's compatible with (req, res) signature
export default async function handler(req, res) {
  // Add logging for debugging
  console.log(`[API] ${req.method} ${req.url}`);
  
  // Pass request to Express app
  return app(req, res);
}
