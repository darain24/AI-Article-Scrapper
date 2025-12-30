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

      // First, try to list available models dynamically
      // This ensures we use models that are actually available with the API key
      let availableModels = [];
      try {
        console.log('   Checking available models...');
        const listUrl = `${this.baseUrl}/models?key=${this.apiKey}`;
        const listResponse = await axios.get(listUrl, { timeout: 10000 });
        if (listResponse.data?.models) {
          // Filter for text generation models (exclude embeddings, etc.)
          availableModels = listResponse.data.models
            .filter(m => {
              const name = m.name?.replace('models/', '') || m.name || '';
              return name.includes('gemini') && 
                     !name.includes('embedding') && 
                     !name.includes('image') &&
                     !name.includes('tts') &&
                     !name.includes('robotics');
            })
            .map(m => m.name?.replace('models/', '') || m.name)
            .sort((a, b) => {
              // Prioritize: flash > pro > latest > preview
              const aPriority = a.includes('flash') ? 1 : a.includes('pro') ? 2 : 3;
              const bPriority = b.includes('flash') ? 1 : b.includes('pro') ? 2 : 3;
              return aPriority - bPriority;
            });
          
          if (availableModels.length > 0) {
            console.log(`   Found ${availableModels.length} available model(s)`);
          }
        }
      } catch (listError) {
        console.log('   Could not list models, using fallback names...');
      }

      // Try different models in order of preference using v1beta endpoint
      // Prioritize newer models (2.5, 2.0) over older ones
      const modelNames = availableModels.length > 0 
        ? availableModels
        : [
            'gemini-2.5-flash',        // Latest and fastest
            'gemini-2.5-pro',          // Latest and most capable
            'gemini-2.0-flash',        // Previous generation
            'gemini-1.5-flash',        // Older but stable
            'gemini-1.5-pro',
            'gemini-pro-latest',
            'gemini-pro'
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
          
          // Log detailed error information
          if (error.response) {
            console.error(`   ✗ Model ${modelName} failed:`);
            console.error(`      Status: ${error.response.status} ${error.response.statusText}`);
            if (error.response.data) {
              const errorData = error.response.data;
              if (errorData.error) {
                console.error(`      Error: ${errorData.error.message || JSON.stringify(errorData.error)}`);
              } else {
                console.error(`      Response: ${JSON.stringify(errorData, null, 2)}`);
              }
            }
          } else if (error.request) {
            console.error(`   ✗ Model ${modelName} failed: No response received`);
            console.error(`      URL: ${error.config?.url?.replace(this.apiKey, '***')}`);
          } else {
            console.error(`   ✗ Model ${modelName} failed: ${error.message}`);
          }
          
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
            // For other errors, try next model
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

