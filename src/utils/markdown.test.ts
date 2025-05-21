import { markdownToHtml } from './markdown';

describe('markdownToHtml', () => {
  test('converts headings', () => {
    expect(markdownToHtml('# Heading 1')).toBe('<h1>Heading 1</h1>');
    expect(markdownToHtml('## Heading 2')).toBe('<h2>Heading 2</h2>');
    expect(markdownToHtml('### Heading 3')).toBe('<h3>Heading 3</h3>');
  });

  test('converts emphasis', () => {
    expect(markdownToHtml('*italic*')).toBe('<em>italic</em>');
    expect(markdownToHtml('_italic_')).toBe('<em>italic</em>');
    expect(markdownToHtml('**bold**')).toBe('<strong>bold</strong>');
    expect(markdownToHtml('__bold__')).toBe('<strong>bold</strong>');
  });

  test('converts links', () => {
    expect(markdownToHtml('[link](https://example.com)')).toBe('<a href="https://example.com">link</a>');
    expect(markdownToHtml('[link with title](https://example.com "title")')).toBe('<a href="https://example.com" title="title">link with title</a>');
  });

  test('converts lists', () => {
    const markdown = `
- Item 1
- Item 2
- Item 3`;
    expect(markdownToHtml(markdown)).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');

    const orderedList = `
1. First
2. Second
3. Third`;
    expect(markdownToHtml(orderedList)).toBe('<ol><li>First</li><li>Second</li><li>Third</li></ol>');
  });

  test('converts code blocks', () => {
    const markdown = '```\nconst x = 1;\n```';
    expect(markdownToHtml(markdown)).toBe('<pre><code>const x = 1;</code></pre>');
    
    expect(markdownToHtml('`inline code`')).toBe('<code>inline code</code>');
  });

  test('converts blockquotes', () => {
    expect(markdownToHtml('> Quote')).toBe('<blockquote>Quote</blockquote>');
  });

  test('converts paragraphs', () => {
    const markdown = 'First paragraph\n\nSecond paragraph';
    expect(markdownToHtml(markdown)).toBe('<p>First paragraph</p><p>Second paragraph</p>');
  });

  test('handles nested markdown', () => {
    const markdown = '# Title with **bold**';
    expect(markdownToHtml(markdown)).toBe('<h1>Title with <strong>bold</strong></h1>');
  });

  test('escapes HTML', () => {
    expect(markdownToHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });
}); 