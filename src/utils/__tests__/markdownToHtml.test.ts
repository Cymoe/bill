import { markdownToHtml } from '../markdownToHtml';

describe('markdownToHtml', () => {
  test('converts headings', () => {
    expect(markdownToHtml('# Heading 1')).toBe('<h1>Heading 1</h1>');
    expect(markdownToHtml('## Heading 2')).toBe('<h2>Heading 2</h2>');
    expect(markdownToHtml('### Heading 3')).toBe('<h3>Heading 3</h3>');
  });

  test('converts bold text', () => {
    expect(markdownToHtml('**bold text**')).toBe('<strong>bold text</strong>');
    expect(markdownToHtml('__bold text__')).toBe('<strong>bold text</strong>');
  });

  test('converts italic text', () => {
    expect(markdownToHtml('*italic text*')).toBe('<em>italic text</em>');
    expect(markdownToHtml('_italic text_')).toBe('<em>italic text</em>');
  });

  test('converts links', () => {
    expect(markdownToHtml('[link text](https://example.com)')).toBe(
      '<a href="https://example.com">link text</a>'
    );
  });

  test('converts code blocks', () => {
    expect(markdownToHtml('```\ncode block\n```')).toBe(
      '<pre><code>code block</code></pre>'
    );
  });

  test('converts inline code', () => {
    expect(markdownToHtml('`inline code`')).toBe('<code>inline code</code>');
  });

  test('converts lists', () => {
    expect(markdownToHtml('- item 1\n- item 2')).toBe(
      '<ul><li>item 1</li><li>item 2</li></ul>'
    );
    expect(markdownToHtml('1. item 1\n2. item 2')).toBe(
      '<ol><li>item 1</li><li>item 2</li></ol>'
    );
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

## Subheading

- List item 1
- List item with [link](https://example.com)

\`\`\`
code block
multiple lines
\`\`\``;

    const expected = '<h1>Title</h1><p>This is a <strong>bold</strong> and <em>italic</em> text with <code>inline code</code>.</p><h2>Subheading</h2><ul><li>List item 1</li><li>List item with <a href="https://example.com">link</a></li></ul><pre><code>code block\nmultiple lines</code></pre>';
    
    expect(markdownToHtml(input)).toBe(expected);
  });
}); 