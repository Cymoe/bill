import { marked } from 'marked';
import DOMPurify from 'dompurify';

export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return '';
  
  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true // Convert \n to <br>
  });

  // Convert markdown to HTML
  const rawHtml = await marked.parse(markdown);

  // Sanitize HTML to prevent XSS
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'del',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'input' // For task lists
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'type', 'checked', 'disabled'
    ]
  });

  return cleanHtml;
} 