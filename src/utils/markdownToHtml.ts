export function markdownToHtml(markdown: string): string {
  // Split into lines for processing
  let lines = markdown.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeBlockContent = '';
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines
    if (line === '') {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      continue;
    }

    // Handle code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        continue;
      } else {
        html += `<pre><code>${codeBlockContent.trim()}</code></pre>`;
        inCodeBlock = false;
        codeBlockContent = '';
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }

    // Handle lists
    if (line.match(/^[0-9]+\./)) {
      if (!inList || listType !== 'ol') {
        if (inList) html += `</ul>`;
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      line = line.replace(/^[0-9]+\.\s*/, '');
      html += `<li>${processInlineMarkdown(line)}</li>`;
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList || listType !== 'ul') {
        if (inList) html += `</ol>`;
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      line = line.substring(2);
      html += `<li>${processInlineMarkdown(line)}</li>`;
      continue;
    }

    // Handle headings
    if (line.startsWith('#')) {
      const match = line.match(/^#+/);
      if (match) {
        const level = match[0].length;
        const text = line.substring(level).trim();
        html += `<h${level}>${processInlineMarkdown(text)}</h${level}>`;
        continue;
      }
    }

    // Check if line contains only inline markdown
    const isInlineOnly = isInlineMarkdown(line);
    if (isInlineOnly) {
      html += processInlineMarkdown(line);
    } else {
      html += `<p>${processInlineMarkdown(line)}</p>`;
    }
  }

  // Close any open lists
  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  return html;
}

function isInlineMarkdown(text: string): boolean {
  // Check if the text is purely inline markdown (bold, italic, link, or code)
  const inlinePatterns = [
    /^\*\*[^*]+\*\*$/,  // bold with **
    /^__[^_]+__$/,      // bold with __
    /^\*[^*]+\*$/,      // italic with *
    /^_[^_]+_$/,        // italic with _
    /^`[^`]+`$/,        // inline code
    /^\[[^\]]+\]\([^)]+\)$/  // link
  ];

  return inlinePatterns.some(pattern => pattern.test(text));
}

function processInlineMarkdown(text: string): string {
  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Handle bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Handle italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Handle links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
} 