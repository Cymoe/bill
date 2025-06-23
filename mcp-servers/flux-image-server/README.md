# Flux Image MCP Server

A Model Context Protocol (MCP) server that provides image generation capabilities using the Flux AI models from Black Forest Labs.

## Features

- **Multiple Flux Models**: Support for Flux Pro, Dev, and Schnell models
- **Customizable Parameters**: Control image dimensions, quality, and generation settings
- **Image Saving**: Option to save generated images locally
- **Model Information**: Query available models and their capabilities

## Prerequisites

1. Node.js 18+ installed
2. A Flux API key from [Black Forest Labs](https://blackforestlabs.ai/)

## Installation

1. Navigate to the server directory:
```bash
cd mcp-servers/flux-image-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp env.example .env
```

4. Add your Flux API key to the `.env` file:
```
FLUX_API_KEY=your_actual_api_key_here
```

5. Build the TypeScript code:
```bash
npm run build
```

## Configuration

### Claude Desktop Integration

Add the following to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "flux-image": {
      "command": "node",
      "args": ["/path/to/your/mcp-servers/flux-image-server/dist/index.js"],
      "env": {
        "FLUX_API_KEY": "your_flux_api_key_here"
      }
    }
  }
}
```

Replace `/path/to/your` with the actual path to your project.

### Alternative: Using npx

You can also run the server directly with npx:

```json
{
  "mcpServers": {
    "flux-image": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/your/mcp-servers/flux-image-server/src/index.ts"],
      "env": {
        "FLUX_API_KEY": "your_flux_api_key_here"
      }
    }
  }
}
```

## Available Tools

### 1. generate_image

Generate an image using Flux AI models.

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `model`: Model to use (`flux-pro`, `flux-dev`, `flux-schnell`) - default: `flux-dev`
- `width`: Image width in pixels (must be divisible by 32) - default: 1024
- `height`: Image height in pixels (must be divisible by 32) - default: 1024
- `steps`: Number of diffusion steps - default: 50
- `guidance`: Guidance scale (how closely to follow prompt) - default: 7.5
- `safety_tolerance`: Safety filter tolerance (0-6, higher = more permissive) - default: 2
- `seed`: Random seed for reproducible results
- `output_format`: Image format (`webp`, `jpeg`, `png`) - default: `png`
- `save_path`: Optional local path to save the generated image

**Example usage in Claude:**
```
Generate an image of a serene mountain landscape at sunset with a lake in the foreground
```

### 2. get_flux_models

Get information about available Flux models and their capabilities.

**Example usage in Claude:**
```
What Flux models are available and what are their differences?
```

## Flux Models Overview

### Flux Pro 1.1
- **Best for**: Production use, highest quality output
- **Resolution**: Up to 2048x2048
- **Speed**: Slower but highest quality
- **Cost**: Premium pricing

### Flux Dev
- **Best for**: Development and testing
- **Resolution**: Up to 1024x1024
- **Speed**: Good balance of speed and quality
- **Cost**: Standard pricing

### Flux Schnell
- **Best for**: Rapid prototyping, quick iterations
- **Resolution**: Up to 1024x1024
- **Speed**: Very fast (4 steps)
- **Cost**: Lower cost

## Tips for Best Results

1. **Prompt Engineering**:
   - Be specific and descriptive
   - Include style references (e.g., "photorealistic", "oil painting style")
   - Mention lighting, mood, and composition

2. **Dimensions**:
   - Always use dimensions divisible by 32
   - Common sizes: 512x512, 768x768, 1024x1024
   - Aspect ratios: 1:1, 16:9, 9:16, 4:3

3. **Model Selection**:
   - Use `flux-schnell` for quick drafts
   - Use `flux-dev` for most purposes
   - Use `flux-pro` for final, high-quality outputs

4. **Guidance Scale**:
   - Lower values (3-7): More creative interpretation
   - Higher values (7-15): Stricter adherence to prompt

## Troubleshooting

### "FLUX_API_KEY environment variable is not set"
- Ensure your API key is properly set in the `.env` file or Claude config

### "Image generation timed out"
- The server waits up to 60 seconds for generation
- Complex prompts or high resolutions may take longer
- Try reducing complexity or dimensions

### "Width/height must be divisible by 32"
- Adjust your dimensions to be multiples of 32
- Example: 1024, 768, 512, etc.

## Development

- Run in development mode: `npm run dev`
- Build: `npm run build`
- Start production server: `npm start`

## License

MIT 