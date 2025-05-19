export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Process inline markdown first
  let html = processInlineMarkdown(markdown);

  // Split into blocks
  const blocks = html.split(/\n\s*\n/);
  const processedBlocks = blocks.map(block => {
    let content = block.trim();

    // Skip if block is empty
    if (!content) return '';

    // Convert code blocks
    if (content.match(/^```[\s\S]+```$/)) {
      content = content.replace(/^```\n?|\n?```$/g, '').trim();
      return `<pre><code>${content}</code></pre>`;
    }

    // Convert headings
    const headingMatch = content.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      return `<h${level}>${headingMatch[2]}</h${level}>`;
    }

    // Convert blockquotes
    if (content.startsWith('> ')) {
      content = content.replace(/^>\s+/gm, '');
      return `<blockquote><p>${content}</p></blockquote>`;
    }

    // Convert lists
    if (content.match(/^[-*]|\d+\./m)) {
      const lines = content.split('\n');
      let inList = false;
      let listType = '';
      let currentIndent = 0;
      let result = '';
      let listStack: Array<{ type: string; indent: number }> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(\s*)([-*]|\d+\.)\s(.+)/);
        if (match) {
          const [, indent, marker, text] = match;
          const indentLevel = indent.length;
          const isOrdered = /\d+\./.test(marker);
          const newListType = isOrdered ? 'ol' : 'ul';

          if (!inList) {
            inList = true;
            listType = newListType;
            result += `<${listType}>`;
            listStack.push({ type: listType, indent: indentLevel });
          } else if (indentLevel > currentIndent) {
            result = result.replace(/<\/li>$/, ''); // Remove the last closing li tag
            result += `<${newListType}>`;
            listStack.push({ type: newListType, indent: indentLevel });
          } else if (indentLevel < currentIndent) {
            while (listStack.length > 0 && listStack[listStack.length - 1].indent > indentLevel) {
              const lastList = listStack.pop();
              if (lastList) {
                result += `</li></${lastList.type}>`;
              }
            }
            result += '</li>';
          } else if (i > 0) {
            result += '</li>';
          }

          currentIndent = indentLevel;
          result += `<li>${text}`;
        }
      }

      // Close all remaining tags
      if (inList) {
        result += '</li>';
        while (listStack.length > 0) {
          const lastList = listStack.pop();
          if (lastList) {
            result += `</${lastList.type}>`;
          }
        }
      }

      return result;
    }

    // Regular paragraph
    return `<p>${content}</p>`;
  });

  return processedBlocks.filter(block => block).join('');
}

function processInlineMarkdown(text: string): string {
  let html = text;

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return html;
} 