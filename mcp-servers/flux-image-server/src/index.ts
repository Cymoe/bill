import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Flux API configuration
const FLUX_API_KEY = process.env.FLUX_API_KEY || '';
const FLUX_API_BASE_URL = 'https://api.bfl.ai';

// Available Flux models - map to new endpoints
const FLUX_MODELS: Record<string, string> = {
  'flux-pro': 'flux-pro-1.1',
  'flux-dev': 'flux-dev',
  'flux-pro-ultra': 'flux-pro-1.1-ultra',
  'flux-kontext-pro': 'flux-kontext-pro',
  'flux-kontext-max': 'flux-kontext-max'
};

interface FluxGenerateParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  safety_tolerance?: number;
  seed?: number;
  output_format?: 'webp' | 'jpeg' | 'png';
  save_path?: string;
}

class FluxImageServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'flux-image-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_image',
          description: 'Generate an image using Flux AI models',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The text prompt describing the image to generate',
              },
              model: {
                type: 'string',
                description: 'The Flux model to use (flux-pro, flux-dev, flux-schnell)',
                enum: Object.keys(FLUX_MODELS),
                default: 'flux-dev',
              },
              width: {
                type: 'number',
                description: 'Image width (must be divisible by 32)',
                default: 1024,
              },
              height: {
                type: 'number',
                description: 'Image height (must be divisible by 32)',
                default: 1024,
              },
              steps: {
                type: 'number',
                description: 'Number of diffusion steps',
                default: 50,
              },
              guidance: {
                type: 'number',
                description: 'Guidance scale (how closely to follow prompt)',
                default: 7.5,
              },
              safety_tolerance: {
                type: 'number',
                description: 'Safety filter tolerance (0-6, higher = more permissive)',
                default: 2,
              },
              seed: {
                type: 'number',
                description: 'Random seed for reproducible results',
              },
              output_format: {
                type: 'string',
                description: 'Output image format',
                enum: ['webp', 'jpeg', 'png'],
                default: 'png',
              },
              save_path: {
                type: 'string',
                description: 'Optional path to save the generated image',
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'get_flux_models',
          description: 'Get available Flux models and their capabilities',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'generate_image':
          return await this.generateImage(args as unknown as FluxGenerateParams);
        case 'get_flux_models':
          return await this.getFluxModels();
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    });
  }

  private async generateImage(params: FluxGenerateParams) {
    if (!FLUX_API_KEY) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'FLUX_API_KEY environment variable is not set'
      );
    }

    try {
      // Prepare the request
      const model = FLUX_MODELS[params.model || 'flux-dev'];
      
      // Calculate aspect ratio from dimensions
      const width = params.width || 1024;
      const height = params.height || 1024;
      let aspect_ratio = "1:1";
      
      // Common aspect ratios
      if (width === 1024 && height === 768) aspect_ratio = "4:3";
      else if (width === 768 && height === 1024) aspect_ratio = "3:4";
      else if (width === 1024 && height === 576) aspect_ratio = "16:9";
      else if (width === 576 && height === 1024) aspect_ratio = "9:16";
      
      const requestData = {
        prompt: params.prompt,
        aspect_ratio: aspect_ratio,
        ...(params.seed !== undefined && { seed: params.seed }),
        ...(params.guidance !== undefined && { guidance: params.guidance }),
        ...(params.steps !== undefined && { steps: params.steps }),
        ...(params.safety_tolerance !== undefined && { safety_tolerance: params.safety_tolerance }),
        ...(params.output_format && { output_format: params.output_format }),
      };

      // Make the API request
      const apiUrl = `${FLUX_API_BASE_URL}/v1/${model}`;
      console.error(`Making request to: ${apiUrl}`);
      console.error(`Request data: ${JSON.stringify(requestData)}`);
      
      const response = await axios.post(
        apiUrl,
        requestData,
        {
          headers: {
            'accept': 'application/json',
            'x-key': FLUX_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'json',
        }
      );

      // Get the task ID and polling URL
      const taskId = response.data.id;
      const pollingUrl = response.data.polling_url || `${FLUX_API_BASE_URL}/v1/get_result`;
      
      // Poll for completion
      let result;
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 seconds
        
        const statusResponse = await axios.get(
          pollingUrl,
          {
            params: { id: taskId },
            headers: { 
              'accept': 'application/json',
              'x-key': FLUX_API_KEY 
            },
          }
        );
        
        if (statusResponse.data.status === 'Ready') {
          result = statusResponse.data.result;
          break;
        } else if (statusResponse.data.status === 'Error' || statusResponse.data.status === 'Failed') {
          throw new Error(`Flux API error: ${JSON.stringify(statusResponse.data)}`);
        }
        
        attempts++;
      }
      
      if (!result) {
        throw new Error('Image generation timed out');
      }

      // Save the image if path is provided
      let savedPath = '';
      if (params.save_path) {
        const imageUrl = result.sample;
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
        });
        
        const buffer = Buffer.from(imageResponse.data);
        const fullPath = path.resolve(params.save_path);
        await fs.writeFile(fullPath, buffer);
        savedPath = fullPath;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              model: model,
              prompt: params.prompt,
              image_url: result.sample,
              seed: result.seed,
              saved_path: savedPath || undefined,
              dimensions: `${params.width || 1024}x${params.height || 1024}`,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to generate image: ${error.message}`
      );
    }
  }

  private async getFluxModels() {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            models: {
              'flux-pro': {
                name: 'Flux Pro 1.1',
                description: 'Highest quality model, best for production use',
                max_resolution: '2048x2048',
                recommended_steps: 50,
                cost: 'Premium',
              },
              'flux-dev': {
                name: 'Flux Dev',
                description: 'Development model, good balance of quality and speed',
                max_resolution: '1024x1024',
                recommended_steps: 50,
                cost: 'Standard',
              },
              'flux-schnell': {
                name: 'Flux Schnell',
                description: 'Fast model, optimized for speed',
                max_resolution: '1024x1024',
                recommended_steps: 4,
                cost: 'Low',
              },
            },
            supported_formats: ['webp', 'jpeg', 'png'],
            dimension_requirements: 'Width and height must be divisible by 32',
          }, null, 2),
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Log startup message to stderr so it doesn't interfere with protocol
    console.error('Flux Image MCP Server started');
    console.error(`API Key configured: ${FLUX_API_KEY ? 'Yes' : 'No'}`);
  }
}

// Start the server
const server = new FluxImageServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 