import { markdownToHtml } from '../markdownToHtml';

describe('markdownToHtml', () => {
  test('converts headings', () => {
    expect(markdownToHtml('# Heading 1')).toBe('<h1>Heading 1</h1>');
    expect(markdownToHtml('## Heading 2')).toBe('<h2>Heading 2</h2>');
    expect(markdownToHtml('### Heading 3')).toBe('<h3>Heading 3</h3>');
  });

  test('converts bold text', () => {
    expect(markdownToHtml('**bold text**')).toBe('<p><strong>bold text</strong></p>');
    expect(markdownToHtml('__bold text__')).toBe('<p><strong>bold text</strong></p>');
  });

  test('converts italic text', () => {
    expect(markdownToHtml('*italic text*')).toBe('<p><em>italic text</em></p>');
    expect(markdownToHtml('_italic text_')).toBe('<p><em>italic text</em></p>');
  });

  test('converts links', () => {
    expect(markdownToHtml('[link text](https://example.com)')).toBe(
      '<p><a href="https://example.com">link text</a></p>'
    );
  });

  test('converts code blocks', () => {
    expect(markdownToHtml('```\ncode block\n```')).toBe(
      '<pre><code>code block</code></pre>'
    );
  });

  test('converts inline code', () => {
    expect(markdownToHtml('`inline code`')).toBe('<p><code>inline code</code></p>');
  });

  test('converts lists', () => {
    const input = `
- Item 1
- Item 2
  - Nested item
- Item 3`;
    expect(markdownToHtml(input)).toBe(
      '<ul><li>Item 1</li><li>Item 2</li><ul><li>Nested item</li></ul><li>Item 3</li></ul>'
    );
  });

  test('converts ordered lists', () => {
    const input = `
1. First
2. Second
   1. Nested
3. Third`;
    expect(markdownToHtml(input)).toBe(
      '<ol><li>First</li><li>Second</li><ol><li>Nested</li></ol><li>Third</li></ol>'
    );
  });

  test('converts blockquotes', () => {
    expect(markdownToHtml('> A quote')).toBe('<blockquote><p>A quote</p></blockquote>');
  });

  test('converts paragraphs', () => {
    expect(markdownToHtml('paragraph text')).toBe('<p>paragraph text</p>');
    expect(markdownToHtml('paragraph 1\n\nparagraph 2')).toBe(
      '<p>paragraph 1</p><p>paragraph 2</p>'
    );
  });

  test('handles complex nested markdown', () => {
    const input = `# Title

This is a **bold** and *italic* text with \`inline code\`.

> A quote with [link](https://example.com)

\`\`\`
code block
\`\`\`

- List item 1
- List item 2
  - Nested item`;

    const expected = '<h1>Title</h1><p>This is a <strong>bold</strong> and <em>italic</em> text with <code>inline code</code>.</p><blockquote><p>A quote with <a href="https://example.com">link</a></p></blockquote><pre><code>code block</code></pre><ul><li>List item 1</li><li>List item 2</li><ul><li>Nested item</li></ul></ul>';

    expect(markdownToHtml(input).replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''));
  });
}); 