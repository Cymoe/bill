import { markdownToHtml } from './markdownToHtml';

describe('markdownToHtml', () => {
  test('converts headers correctly', () => {
    expect(markdownToHtml('# Header 1')).toBe('<h1>Header 1</h1>');
    expect(markdownToHtml('## Header 2')).toBe('<h2>Header 2</h2>');
    expect(markdownToHtml('### Header 3')).toBe('<h3>Header 3</h3>');
  });

  test('converts bold text correctly', () => {
    expect(markdownToHtml('**bold text**')).toBe('<strong>bold text</strong>');
    expect(markdownToHtml('__bold text__')).toBe('<strong>bold text</strong>');
  });

  test('converts italic text correctly', () => {
    expect(markdownToHtml('*italic text*')).toBe('<em>italic text</em>');
    expect(markdownToHtml('_italic text_')).toBe('<em>italic text</em>');
  });

  test('converts links correctly', () => {
    expect(markdownToHtml('[Link Text](https://example.com)')).toBe('<a href="https://example.com">Link Text</a>');
  });

  test('converts unordered lists correctly', () => {
    const markdown = `- Item 1
- Item 2
- Item 3`;
    const expected = `<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>`;
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test('converts ordered lists correctly', () => {
    const markdown = `1. First item
2. Second item
3. Third item`;
    const expected = `<ol>
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
</ol>`;
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test('converts inline code correctly', () => {
    expect(markdownToHtml('Here is `inline code`')).toBe('Here is <code>inline code</code>');
  });

  test('converts code blocks correctly', () => {
    const markdown = '```\nconst x = 1;\nconsole.log(x);\n```';
    const expected = '<pre><code>const x = 1;\nconsole.log(x);</code></pre>';
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test('converts line breaks correctly', () => {
    expect(markdownToHtml('Line 1\n\nLine 2')).toBe('<p>Line 1</p>\n<p>Line 2</p>');
  });

  test('handles complex mixed content', () => {
    const markdown = `# Title

This is a **bold** and *italic* paragraph with a [link](https://example.com).

- List item 1
- List item 2

\`\`\`
code block
\`\`\``;

    const result = markdownToHtml(markdown);
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('<a href="https://example.com">link</a>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<pre><code>');
  });

  test('handles empty string', () => {
    expect(markdownToHtml('')).toBe('');
  });

  test('handles plain text without markdown', () => {
    expect(markdownToHtml('Just plain text')).toBe('<p>Just plain text</p>');
  });
}); 