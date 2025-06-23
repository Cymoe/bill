#!/usr/bin/env node
import { generateBlogPost, saveBlogPost, industryTopics } from './generate-post';

// Configuration for batch generation
const POSTS_PER_INDUSTRY = 2;
const INDUSTRIES = ['roofing', 'hvac', 'plumbing', 'electrical', 'painting', 'flooring', 'landscaping'];

async function generateBatch() {
  console.log('🚀 Starting batch blog post generation...\n');
  
  const results = {
    success: 0,
    failed: 0,
    posts: [] as Array<{ industry: string; topic: string; title: string; slug: string }>
  };

  for (const industry of INDUSTRIES) {
    const topics = industryTopics[industry as keyof typeof industryTopics] || [];
    const selectedTopics = topics
      .sort(() => Math.random() - 0.5)
      .slice(0, POSTS_PER_INDUSTRY);

    console.log(`\n📝 Generating ${selectedTopics.length} posts for ${industry}...`);

    for (const topic of selectedTopics) {
      try {
        console.log(`  - Generating: ${topic}`);
        const post = await generateBlogPost(industry, topic);
        await saveBlogPost(post, industry);
        
        results.success++;
        results.posts.push({
          industry,
          topic,
          title: post.title,
          slug: post.slug
        });

        // Rate limiting - wait 2 seconds between API calls
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ❌ Failed to generate post for "${topic}":`, error);
        results.failed++;
      }
    }
  }

  // Summary report
  console.log('\n📊 Batch Generation Summary:');
  console.log(`✅ Successfully generated: ${results.success} posts`);
  console.log(`❌ Failed: ${results.failed} posts`);
  console.log('\n📄 Generated Posts:');
  
  results.posts.forEach(post => {
    console.log(`  - [${post.industry}] ${post.title}`);
    console.log(`    URL: /blog/${post.slug}`);
  });

  return results;
}

// Run if called directly
generateBatch()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Batch generation failed:', error);
    process.exit(1);
  });

export { generateBatch };