import axios from 'axios';

/**
 * LLM-based article rewriter
 * Uses Google Gemini API v1beta endpoint to rewrite articles based on top-ranking article structures
 */
export class LLMRewriter {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
    // Use v1beta endpoint directly for better compatibility
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.modelName = null;
  }

  /**
   * List available models (helper function for debugging)
   */
  async listAvailableModels() {
    try {
      // Note: This requires the models.list() method which might not be available in all SDK versions
      // For now, we'll just try common model names
      return ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    } catch (error) {
      console.error('Error listing models:', error.message);
      return [];
    }
  }

  /**
   * Rewrite article based on reference articles' structure and quality
   */
  async rewriteArticle(originalArticle, referenceArticles) {
    try {
      // Prepare reference content summaries
      const referenceSummaries = referenceArticles
        .map((ref, index) => `Reference ${index + 1}:\n${ref.content.substring(0, 1000)}...`)
        .join('\n\n');

      const prompt = `You are an expert content writer. Rewrite the following article to match the structure, quality, and style of the top-ranking reference articles provided.

Original Article Title: ${originalArticle.title}

Original Article Content:
${originalArticle.content}

Reference Articles (top-ranking articles for similar topics):
${referenceSummaries}

Instructions:
1. Maintain the core message and key points of the original article
2. Improve the structure to match the quality of the reference articles
3. Enhance readability, flow, and engagement
4. Use similar formatting patterns (headings, paragraphs, etc.)
5. Make the content more comprehensive and valuable
6. Keep the same general length or slightly expand it

Rewritten Article:`;

      // Try different models in order of preference using v1beta endpoint
      // v1beta endpoint supports: gemini-1.5-flash, gemini-1.5-pro, gemini-pro
      const modelNames = [
        'gemini-1.5-flash',      // Fastest, recommended for most use cases
        'gemini-1.5-pro',        // More capable, better quality
        'gemini-pro'             // Original model (fallback)
      ];
      
      let lastError = null;
      
      for (const modelName of modelNames) {
        try {
          console.log(`   Trying model: ${modelName} (v1beta endpoint)...`);
          
          // Use v1beta endpoint directly via HTTP
          // Try API key as query parameter first (more reliable)
          const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
          console.log(`   Calling: ${url.replace(this.apiKey, '***')}`);
          
          const response = await axios.post(
            url,
            {
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 60000
            }
          );
          
          // Extract text from response
          const candidates = response.data?.candidates;
          if (!candidates || candidates.length === 0) {
            throw new Error('No candidates in response');
          }
          
          const content = candidates[0]?.content;
          if (!content || !content.parts || content.parts.length === 0) {
            throw new Error('No content parts in response');
          }
          
          const rewrittenContent = content.parts[0]?.text?.trim();
          
          if (!rewrittenContent || rewrittenContent.length < 50) {
            throw new Error('Generated content is too short or empty');
          }
          
          console.log(`   ✓ Successfully used model: ${modelName}`);
          return rewrittenContent;
        } catch (error) {
          lastError = error;
          
          // If it's a 404/model not found error, try next model
          if (error.response?.status === 404 || 
              error.message.includes('not found') || 
              error.message.includes('404') || 
              error.message.includes('is not found') || 
              error.message.includes('not supported')) {
            // Try next model
            continue;
          } else if (error.response?.status === 401 || error.response?.status === 403) {
            // API key issues - don't try other models
            throw new Error(`API authentication failed. Please check your GEMINI_API_KEY. Status: ${error.response.status}`);
          } else {
            // Other errors - log and try next model
            console.error(`   Error with model ${modelName}: ${error.message}`);
            if (error.response) {
              console.error(`   Status: ${error.response.status}`);
              console.error(`   Status Text: ${error.response.statusText}`);
              if (error.response.data) {
                console.error(`   Error Details: ${JSON.stringify(error.response.data, null, 2)}`);
              }
            } else if (error.request) {
              console.error(`   No response received. Request URL: ${error.config?.url?.replace(this.apiKey, '***')}`);
            }
            // For 404, try next model
            if (error.response?.status === 404) {
              continue;
            }
            // For auth errors, don't try other models
            if (error.response?.status === 401 || error.response?.status === 403) {
              throw new Error(`API authentication failed. Please check your GEMINI_API_KEY. Status: ${error.response.status}`);
            }
            continue;
          }
        }
      }
      
      // If all models failed, provide helpful error message
      const errorMsg = `All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`;
      const helpMsg = `
      
Troubleshooting:
1. Verify your GEMINI_API_KEY is correct and active
2. Get a new API key from: https://makersuite.google.com/app/apikey
3. Ensure your API key has access to Gemini models
4. Check if you need to enable the Generative AI API in Google Cloud Console
5. Some models may require specific API versions or regions

Common issues:
- API key not activated
- API not enabled in Google Cloud Console  
- Model not available in your region
- Rate limits or quota exceeded
      `;
      throw new Error(errorMsg + helpMsg);
    } catch (error) {
      console.error('LLM rewriting error:', error.message);
      throw error;
    }
  }
}

