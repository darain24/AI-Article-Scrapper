// Vercel serverless function entry point
// This file exports a handler function for Vercel's serverless functions

import app from '../backend/src/app.js';

// Export handler function for Vercel
// Vercel expects a function that receives (req, res)
export default function handler(req, res) {
  return app(req, res);
}
