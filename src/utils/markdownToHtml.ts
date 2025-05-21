export function markdownToHtml(markdown: string): string {
  // Remove trailing whitespace and normalize line endings
  markdown = markdown.trim().replace(/\r\n/g, '\n');

  // Process code blocks first to avoid parsing markdown inside them
  markdown = markdown.replace(/```([^`]+)```/g, (_, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Process blockquotes
  markdown = markdown.replace(/^> (.+)$/gm, (_, quote) => {
    return `<blockquote><p>${processInline(quote.trim())}</p></blockquote>`;
  });

  // Process headings
  markdown = markdown.replace(/^(#{1,6}) (.+)$/gm, (_, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content.trim()}</h${level}>`;
  });

  // Process lists
  markdown = processLists(markdown);

  // Process paragraphs and inline elements
  const paragraphs = markdown
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => {
      if (!p.startsWith('<')) {
        return `<p>${processInline(p.trim())}</p>`;
      }
      return p;
    });

  return paragraphs.join('');
}

function processInline(text: string): string {
  // Process inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Process italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Process links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
}

function processLists(markdown: string): string {
  const listRegex = /^([ ]*)([-*+]|\d+\.) (.+)$/gm;
  let matches = [...markdown.matchAll(listRegex)];

  if (matches.length === 0) return markdown;

  let currentLevel = 0;
  let listType = '';
  let result = '';
  let inList = false;

  matches.forEach((match, index) => {
    const [fullMatch, indent, marker, content] = match;
    const level = indent.length;
    const isOrdered = /\d+\./.test(marker);
    const newListType = isOrdered ? 'ol' : 'ul';

    // Start a new list
    if (!inList) {
      listType = newListType;
      result += `<${listType}>`;
      inList = true;
    }

    // Handle level changes
    if (level > currentLevel) {
      result += `<${newListType}>`;
    } else if (level < currentLevel) {
      result += `</${listType}>`;
    } else if (listType !== newListType) {
      result += `</${listType}><${newListType}>`;
      listType = newListType;
    }

    result += `<li>${processInline(content)}</li>`;
    currentLevel = level;

    // Close lists at the end
    if (index === matches.length - 1) {
      while (currentLevel >= 0) {
        result += `</${listType}>`;
        currentLevel -= 2;
      }
    }
  });

  // Replace the original list text with the processed HTML
  return markdown.replace(/(?:^[ ]*(?:[-*+]|\d+\.) .+\n?)+/gm, result);
} 