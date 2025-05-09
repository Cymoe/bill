import { describe, expect, test } from '@jest/globals';
import { markdownToHtml } from '../src/utils/markdown';

describe('markdownToHtml', () => {
  test('converts basic markdown elements', async () => {
    const markdown = `# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

- List item 1
- List item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

[Link](https://example.com)
![Image](https://example.com/image.jpg)

\`inline code\`

\`\`\`
code block
\`\`\`

> Blockquote

---`;

    const expected = `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<p><strong>Bold text</strong><br><em>Italic text</em><br><del>Strikethrough</del></p>
<ul>
<li>List item 1</li>
<li>List item 2<ul>
<li>Nested item</li>
</ul>
</li>
</ul>
<ol>
<li>Ordered item 1</li>
<li>Ordered item 2</li>
</ol>
<p><a href="https://example.com">Link</a><br><img alt="Image" src="https://example.com/image.jpg"></p>
<p><code>inline code</code></p>
<pre><code>code block
</code></pre>
<blockquote>
<p>Blockquote</p>
</blockquote>
<hr>
`;

    expect(await markdownToHtml(markdown)).toBe(expected);
  });

  test('handles empty input', async () => {
    expect(await markdownToHtml('')).toBe('');
  });

  test('handles tables', async () => {
    const markdown = `| Header 1 | Header 2 |
|----------|-----------|
| Cell 1   | Cell 2   |`;

    const expected = `<table>
<thead>
<tr>
<th>Header 1</th>
<th>Header 2</th>
</tr>
</thead>
<tbody><tr>
<td>Cell 1</td>
<td>Cell 2</td>
</tr>
</tbody></table>
`;

    expect(await markdownToHtml(markdown)).toBe(expected);
  });

  test('handles task lists', async () => {
    const markdown = `- [ ] Unchecked task
- [x] Checked task`;

    const expected = `<ul>
<li><input type="checkbox" disabled=""> Unchecked task</li>
<li><input type="checkbox" disabled="" checked=""> Checked task</li>
</ul>
`;

    expect(await markdownToHtml(markdown)).toBe(expected);
  });

  test('sanitizes HTML', async () => {
    const markdown = `<script>alert('xss')</script>
<img src="x" onerror="alert('xss')">`;

    const expected = `<img src="x">`;

    expect(await markdownToHtml(markdown)).toBe(expected);
  });
}); 