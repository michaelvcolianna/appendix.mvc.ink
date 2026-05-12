import { marked } from 'marked';
import { withBook, type BookCode } from './storyblok';

marked.setOptions({ breaks: true });

// Inline links: [text](/path) or [text](/path "title"). Negative lookbehind skips images (![alt](...)).
const MD_INLINE_LINK_RE =
  /(?<!!)(\[[^\]]*\]\()(\/(?!\/)[^)\s]+)((?:\s+"[^"]*"|\s+'[^']*')?\))/g;

function prefixMarkdownLinks(markdown: string, book: BookCode): string {
  return markdown.replace(
    MD_INLINE_LINK_RE,
    (_m, prefix, url, suffix) => `${prefix}${withBook(book, url)}${suffix}`
  );
}

export function renderMarkdown(text: string, book?: BookCode | null): string {
  if (!text) return '';
  const prepared = book ? prefixMarkdownLinks(text, book) : text;
  return marked.parse(prepared) as string;
}
