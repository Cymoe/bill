function markdownToHtml(md) {
  if (!md) return '';
  
  // Preserve HTML span elements with classes
  const spanElements = [];
  md = md.replace(/<span class="([^"]+)">([\s\S]*?)<\/span>/g, (match, className, content) => {
    const placeholder = `__SPAN_PLACEHOLDER_${spanElements.length}__`;
    spanElements.push({ className, content });
    return placeholder;
  });
  
  // Escape HTML (except for preserved elements)
  let html = md.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

  // Headings
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');
    
  // Blockquotes - match single and multi-line blockquotes
  html = html.replace(/(^|\n)> ([^\n]+)(\n> [^\n]+)*/g, (match, start, firstLine, rest) => {
    const content = firstLine + (rest || '').replace(/\n> /g, ' ');
    return `${start}<blockquote>${content}</blockquote>`;
  });

  // Lists
  // Ordered
  html = html.replace(/(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, (m, pre, list) => {
    const items = list.split(/\n/).map(i => i.replace(/^\d+\. /, '')).map(i => `<li>${i}</li>`).join('');
    return `${pre}<ol>${items}</ol>`;
  });
  // Unordered with dash
  html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (m, pre, list) => {
    const items = list.split(/\n/).map(i => i.replace(/^- /, '')).map(i => `<li>${i}</li>`).join('');
    return `${pre}<ul>${items}</ul>`;
  });
  // Unordered with asterisk
  html = html.replace(/(^|\n)(\* .+(?:\n\* .+)*)/g, (m, pre, list) => {
    const items = list.split(/\n/).map(i => i.replace(/^\* /, '')).map(i => `<li>${i}</li>`).join('');
    return `${pre}<ul>${items}</ul>`;
  });

  // Inline: bold+italic, bold, italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs (after block elements)
  // Only wrap in <p> if not already a block element and not the only content
  const blockRx = /^(<h\d>|<ul>|<ol>|<li>|<\/li>|<\/ul>|<\/ol>|<blockquote>)/;
  // If it's a single line and not a block, don't wrap
  if (!/\n/.test(html) && !blockRx.test(html)) {
    // do nothing
  } else {
    html = html.split(/\n{2,}/).map(chunk => {
      chunk = chunk.trim();
      if (!chunk) return '';
      if (blockRx.test(chunk)) return chunk;
      return `<p>${chunk}</p>`;
    }).join('');
  }
  
  // Restore span elements
  spanElements.forEach((span, index) => {
    const placeholder = `__SPAN_PLACEHOLDER_${index}__`;
    html = html.replace(placeholder, `<span class="${span.className}">${span.content}</span>`);
  });

  // Remove single newlines
  html = html.replace(/\n+/g, '');

  // Clean up any adjacent blockquotes
  html = html.replace(/<\/blockquote><blockquote>/g, '<br>');
  
  return html;
}

module.exports = { markdownToHtml }; 