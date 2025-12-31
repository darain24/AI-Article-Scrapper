// Vercel serverless function entry point
// This file exports a handler function for Vercel's serverless functions

import app from '../backend/src/app.js';

// Export handler function for Vercel
// Vercel expects a function that receives (req, res)
export default async function handler(req, res) {
  // Add logging for debugging
  console.log(`[API Handler] ${req.method} ${req.url}`);
  console.log(`[API Handler] Original URL: ${req.url}`);
  console.log(`[API Handler] Path: ${req.path || 'undefined'}`);
  
  try {
    // Pass request to Express app
    // Express app will handle routing internally
    return app(req, res);
  } catch (error) {
    console.error('[API Handler] Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
