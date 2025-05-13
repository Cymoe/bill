function markdownToHtml(md) {
  if (!md) return '';
  // Escape HTML
  let html = md.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

  // Headings
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Lists
  // Ordered
  html = html.replace(/(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, (m, pre, list) => {
    const items = list.split(/\n/).map(i => i.replace(/^\d+\. /, '')).map(i => `<li>${i}</li>`).join('');
    return `${pre}<ol>${items}</ol>`;
  });
  // Unordered
  html = html.replace(/(^|\n)(- .+(?:\n- .+)*)/g, (m, pre, list) => {
    const items = list.split(/\n/).map(i => i.replace(/^- /, '')).map(i => `<li>${i}</li>`).join('');
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
  const blockRx = /^(<h\d>|<ul>|<ol>|<li>|<\/li>|<\/ul>|<\/ol>)/;
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

  // Remove single newlines
  html = html.replace(/\n+/g, '');

  return html;
}

module.exports = { markdownToHtml }; 