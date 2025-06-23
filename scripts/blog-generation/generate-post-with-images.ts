#!/usr/bin/env node
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import axios from 'axios';

// Load environment variables
config({ path: '.env.local' });

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Flux API configuration
const FLUX_API_KEY = process.env.FLUX_API_KEY || 'f4b41bbc-2df0-42c3-bf3c-cdcca09d5055';
const FLUX_API_BASE_URL = 'https://api.bfl.ai';

// Industry-specific topics for content generation
const industryTopics = {
  roofing: [
    'roof inspection checklist',
    'storm damage assessment',
    'gutter maintenance guide',
    'roof ventilation importance',
    'winter roof preparation',
    'roof warranty guide',
    'emergency roof repair tips'
  ],
  hvac: [
    'air quality improvement',
    'smart thermostat benefits',
    'ductwork inspection guide',
    'seasonal HVAC tips',
    'energy efficiency upgrades',
    'HVAC troubleshooting guide',
    'heat pump vs furnace'
  ],
  plumbing: [
    'water heater maintenance',
    'pipe winterization guide',
    'leak detection tips',
    'drain cleaning guide',
    'water pressure problems',
    'bathroom renovation plumbing',
    'eco-friendly plumbing'
  ],
  electrical: [
    'electrical safety tips',
    'smart home wiring',
    'surge protection guide',
    'electrical panel upgrades',
    'outdoor lighting ideas',
    'EV charger installation',
    'energy audit checklist'
  ],
  painting: [
    'paint color trends',
    'interior painting tips',
    'exterior paint selection',
    'paint finish guide',
    'cabinet painting tutorial',
    'wallpaper vs paint',
    'paint preparation steps'
  ],
  flooring: [
    'flooring material comparison',
    'subfloor repair guide',
    'flooring installation costs',
    'carpet vs hardwood',
    'tile selection guide',
    'floor maintenance tips',
    'eco-friendly flooring'
  ],
  landscaping: [
    'lawn care calendar',
    'drought-resistant plants',
    'outdoor lighting design',
    'irrigation system guide',
    'tree trimming tips',
    'seasonal landscaping',
    'hardscaping ideas'
  ],
  kitchen: [
    'kitchen remodel trends',
    'cabinet refacing guide',
    'countertop materials comparison',
    'kitchen island design',
    'backsplash installation',
    'kitchen lighting ideas',
    'budget kitchen makeover'
  ],
  bathroom: [
    'bathroom renovation guide',
    'shower vs bathtub',
    'vanity selection tips',
    'bathroom ventilation',
    'tile design ideas',
    'small bathroom solutions',
    'luxury bathroom features'
  ]
};

interface BlogPost {
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  slug: string;
  imagePrompt?: string;
}

async function generateFluxImage(prompt: string, filename: string): Promise<string> {
  console.log(`🎨 Generating image with prompt: "${prompt}"`);
  
  try {
    // Prepare the request
    const requestData = {
      prompt: prompt,
      aspect_ratio: "16:9" // Good for blog hero images
    };

    // Make the API request
    const response = await axios.post(
      `${FLUX_API_BASE_URL}/v1/flux-dev`,
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

    // Download and save the image
    const imageUrl = result.sample;
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    
    const buffer = Buffer.from(imageResponse.data);
    const imagePath = path.join(
      process.cwd(),
      'apps',
      'blog',
      'public',
      filename
    );
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, buffer);
    
    console.log(`✅ Image saved to ${imagePath}`);
    return `/${filename}`;
  } catch (error: any) {
    console.error('Error generating image:', error.message);
    if (error.response?.data) {
      console.error('API Error details:', JSON.stringify(error.response.data, null, 2));
    }
    // Return a default image path if generation fails
    return '/default-hero.jpg';
  }
}

async function generateBlogPost(industry: string, topic: string): Promise<BlogPost> {
  const prompt = `
You are an expert content writer for Bill Breeze, a construction and home services estimation platform. 
Create a comprehensive, SEO-optimized blog post about "${topic}" for the ${industry} industry.

The blog post should:
1. Be 1,500-2,000 words
2. Include practical, actionable advice
3. Reference costs and pricing when relevant
4. Include numbered lists and bullet points for readability
5. Have a conversational but professional tone
6. Include a call-to-action for Bill Breeze's estimation tools
7. Be formatted in MDX with appropriate headings

Structure:
- Engaging introduction that addresses the reader's pain point
- Comprehensive main content with subheadings
- Cost breakdowns or comparisons where applicable
- Tips, best practices, or step-by-step guides
- Common mistakes to avoid
- When to hire a professional vs DIY
- Conclusion with key takeaways
- CTA for Bill Breeze

ALSO include an "imagePrompt" field with a detailed description for generating a photorealistic hero image that would complement this blog post. The prompt should be specific and visual.

Return a JSON object with:
{
  "title": "SEO-optimized title under 60 characters",
  "description": "Meta description under 160 characters",
  "content": "Full MDX content",
  "tags": ["relevant", "tags", "for", "seo"],
  "category": "Industry category",
  "imagePrompt": "Detailed visual description for hero image generation"
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    
    // Generate slug from title
    const slug = result.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      ...result,
      slug
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

async function saveBlogPost(post: BlogPost, industry: string, heroImagePath: string) {
  // Use a date in the past to avoid validation issues
  const date = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd'); // Yesterday's date
  const filename = `${post.slug}.mdx`;
  const filepath = path.join(
    process.cwd(),
    'apps',
    'blog',
    'src',
    'content',
    'blog',
    filename
  );

  const frontmatter = `---
title: '${post.title}'
description: '${post.description}'
pubDate: ${date}
heroImage: '${heroImagePath}'
tags: ${JSON.stringify(post.tags)}
author: 'Bill Breeze Team'
category: '${post.category}'
---

import { Image } from 'astro:assets';

`;

  const fullContent = frontmatter + post.content;

  // Save to file system
  await fs.writeFile(filepath, fullContent, 'utf-8');
  console.log(`✅ Blog post saved to ${filepath}`);

  // Optionally save to Supabase for tracking
  const { error } = await supabase.from('blog_posts').insert({
    title: post.title,
    slug: post.slug,
    description: post.description,
    content: post.content,
    tags: post.tags,
    category: post.category,
    industry,
    hero_image: heroImagePath,
    status: 'published',
    published_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving to Supabase:', error);
  } else {
    console.log('✅ Blog post saved to database');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npm run generate:post:images "Topic Name" [industry]');
    console.error('Example: npm run generate:post:images "Kitchen Remodel Trends 2025" kitchen');
    process.exit(1);
  }

  const topic = args[0];
  const industry = args[1] || 'general';

  console.log(`🚀 Generating blog post about "${topic}" for ${industry} industry...`);

  try {
    // Generate blog content with image prompt
    const post = await generateBlogPost(industry, topic);
    
    // Generate hero image if prompt is provided
    let heroImagePath = '/blog/default-hero.jpg';
    if (post.imagePrompt) {
      const imageFilename = `${post.slug}-hero.jpg`;
      heroImagePath = await generateFluxImage(post.imagePrompt, imageFilename);
    }
    
    // Save blog post with generated image
    await saveBlogPost(post, industry, heroImagePath);
    
    console.log('\n📄 Blog post generated successfully!');
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug}`);
    console.log(`Tags: ${post.tags.join(', ')}`);
    console.log(`Hero Image: ${heroImagePath}`);
    
    // Trigger deployment if in CI/CD environment
    if (process.env.VERCEL_DEPLOY_HOOK) {
      console.log('\n🚀 Triggering Vercel deployment...');
      await fetch(process.env.VERCEL_DEPLOY_HOOK, { method: 'POST' });
    }
  } catch (error) {
    console.error('❌ Error generating blog post:', error);
    process.exit(1);
  }
}

// Run if called directly
main();

export { generateBlogPost, saveBlogPost, industryTopics };