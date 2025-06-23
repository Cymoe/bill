import { marked } from 'marked';

export function markdownToHtml(md: string): string {
  // Escape HTML
  const safe = md.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]!));
  // marked.parseSync is sync and always returns string (marked v4+)
  // If not available, fallback to parse with async: false
  if (typeof (marked as any).parseSync === 'function') {
    return (marked as any).parseSync(safe).trim();
  }
  // @ts-ignore
  return marked.parse(safe, { async: false }).trim();
} 