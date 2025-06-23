#!/usr/bin/env node
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

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
  ]
};

interface BlogPost {
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  slug: string;
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

Return a JSON object with:
{
  "title": "SEO-optimized title under 60 characters",
  "description": "Meta description under 160 characters",
  "content": "Full MDX content",
  "tags": ["relevant", "tags", "for", "seo"],
  "category": "Industry category"
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

async function saveBlogPost(post: BlogPost, industry: string) {
  const date = format(new Date(), 'yyyy-MM-dd');
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
pubDate: '${date}'
heroImage: '/blog/${post.slug}-hero.jpg'
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
    console.error('Usage: npm run generate:post "Topic Name" [industry]');
    console.error('Example: npm run generate:post "Kitchen Remodel Trends 2025" kitchen');
    process.exit(1);
  }

  const topic = args[0];
  const industry = args[1] || 'general';

  console.log(`🚀 Generating blog post about "${topic}" for ${industry} industry...`);

  try {
    const post = await generateBlogPost(industry, topic);
    await saveBlogPost(post, industry);
    
    console.log('\n📄 Blog post generated successfully!');
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug}`);
    console.log(`Tags: ${post.tags.join(', ')}`);
    
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