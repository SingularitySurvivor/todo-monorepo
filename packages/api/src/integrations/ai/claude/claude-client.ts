import axios from 'axios';

/**
 * Response structure from Claude API
 */
export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Message structure for Claude API
 */
export interface ClaudeMessage {
  role: string;
  content: string;
}

/**
 * Parameters for Claude API requests
 */
export interface ClaudeParameters {
  model: string;
  messages: ClaudeMessage[];
  system?: string;  // Added system as optional top-level parameter
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

/**
 * Claude AI client for making API calls to Anthropic's Claude models
 */
class ClaudeClient {
  private static readonly API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
  private static readonly API_VERSION = '2023-06-01';
  private static readonly DEFAULT_MODEL = 'claude-3-haiku-20240307';
  private static readonly DEFAULT_MAX_TOKENS = 4096;

  private static _instance: ClaudeClient;
  private _apiKey: string = '';

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this._apiKey = process.env.CLAUDE_API_KEY || '';
    if (!this._apiKey) {
      console.warn('CLAUDE_API_KEY environment variable is not set. Claude client will not work properly.');
    }
  }

  /**
   * Get singleton instance of ClaudeClient
   */
  public static getInstance(): ClaudeClient {
    if (!ClaudeClient._instance) {
      ClaudeClient._instance = new ClaudeClient();
    }
    return ClaudeClient._instance;
  }

  /**
   * Get the Anthropic API key from environment variable
   */
  private getApiKey(): string {
    if (!this._apiKey) {
      throw new Error('Claude API key is not set. Please set the CLAUDE_API_KEY environment variable.');
    }
    return this._apiKey;
  }

  /**
   * Invalidate the cached API key
   */
  public invalidateApiKey(): void {
    this._apiKey = process.env.CLAUDE_API_KEY || '';
  }

  /**
   * Send a request to Claude API
   * @param params Request parameters
   * @returns The Claude API response
   */
  public async sendRequest(params: ClaudeParameters): Promise<ClaudeResponse> {
    try {
      const apiKey = this.getApiKey();

      // Apply defaults if not provided
      const requestParams: ClaudeParameters = {
        model: params.model || ClaudeClient.DEFAULT_MODEL,
        messages: params.messages,
        max_tokens: params.max_tokens || ClaudeClient.DEFAULT_MAX_TOKENS,
        temperature: params.temperature !== undefined ? params.temperature : 0.7,
        ...params.system !== undefined && { system: params.system },  // Include system as top-level parameter if provided
        ...params.top_p !== undefined && { top_p: params.top_p },
        ...params.top_k !== undefined && { top_k: params.top_k },
        ...params.stop_sequences && { stop_sequences: params.stop_sequences },
        ...params.stream !== undefined && { stream: params.stream }
      };

      console.log('Sending request to Claude API:', JSON.stringify({
        ...requestParams,
        messages: requestParams.messages.map(m => ({
          role: m.role,
          content: m.content.length > 50 ? `${m.content.substring(0, 50)}...` : m.content
        }))
      }));

      const response = await axios.post<ClaudeResponse>(
        ClaudeClient.API_ENDPOINT,
        requestParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': ClaudeClient.API_VERSION,
            'x-api-key': apiKey
          }
        }
      );

      console.log('Claude API response received, tokens used:', response.data.usage);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Claude API Error:', error.response.status, error.response.data);
      } else {
        console.error('Error calling Claude API:', error);
      }
      throw error;
    }
  }

  /**
   * Simple method to send a single message and get the response text
   * @param prompt The user message to send
   * @param model Optional model to use
   * @returns The text from Claude's response
   */
  public async getCompletion(prompt: string, model?: string): Promise<string> {
    const response = await this.sendRequest({
      model: model || ClaudeClient.DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
  }
}

export default ClaudeClient;