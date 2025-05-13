const { markdownToHtml } = require('../markdownToHtml');

describe('markdownToHtml', () => {
  it('handles headings', () => {
    expect(markdownToHtml('# Title')).toBe('<h1>Title</h1>');
    expect(markdownToHtml('## Subtitle')).toBe('<h2>Subtitle</h2>');
  });

  it('handles bold and italic', () => {
    expect(markdownToHtml('**bold**')).toBe('<strong>bold</strong>');
    expect(markdownToHtml('*italic*')).toBe('<em>italic</em>');
    expect(markdownToHtml('***bolditalic***')).toBe('<strong><em>bolditalic</em></strong>');
  });

  it('handles inline code', () => {
    expect(markdownToHtml('`code`')).toBe('<code>code</code>');
  });

  it('handles links', () => {
    expect(markdownToHtml('[link](https://a.com)')).toBe('<a href="https://a.com">link</a>');
  });

  it('handles unordered lists', () => {
    expect(markdownToHtml('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('handles ordered lists', () => {
    expect(markdownToHtml('1. a\n2. b')).toBe('<ol><li>a</li><li>b</li></ol>');
  });

  it('handles paragraphs', () => {
    expect(markdownToHtml('foo\n\nbar')).toBe('<p>foo</p><p>bar</p>');
  });

  it('escapes html', () => {
    expect(markdownToHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('handles mixed content', () => {
    expect(markdownToHtml('# Title\n\n- **bold**\n- *italic*')).toBe('<h1>Title</h1><ul><li><strong>bold</strong></li><li><em>italic</em></li></ul>');
  });
}); 