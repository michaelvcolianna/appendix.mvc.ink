import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import {
  bookFromParams,
  buildEntryVisibility,
  entryHasContent,
  resolveEntryFields,
  sortBySortByDate,
  withBook
} from '$lib/storyblok';
import type { BookCode, EntryContent, EntryVisibility } from '$lib/storyblok';
import {
  getCategoryEntries,
  getStoryByFullSlug
} from '$lib/storyblok-data.server';

function buildBookSwitchUrls(
  category: string,
  entry: string,
  visibleAt: EntryVisibility
): Record<'null' | BookCode, string> {
  // In dev, the entry page renders even without authored content (so the
  // Storyblok visual editor can preview), so book buttons can always link
  // straight to the entry URL.
  const target = (book: BookCode | null) =>
    dev || visibleAt[book ?? 'null']
      ? withBook(book, `/${category}/${entry}`)
      : withBook(book, `/${category}`);
  return {
    null: target(null),
    fcoe: target('fcoe'),
    fgor: target('fgor'),
    faoh: target('faoh')
  };
}

export async function load({ params, parent }) {
  const { category, entry } = params;
  const book = bookFromParams(params.book);

  const [story, siblingsRes, parentData] = await Promise.all([
    getStoryByFullSlug<EntryContent>(`${category}/${entry}`),
    getCategoryEntries(category),
    parent() as Promise<{ categories: { slug: string; name: string }[] }>
  ]);

  if (!story) {
    error(404, 'Not found');
  }

  const { categories } = parentData;

  const hasContent = entryHasContent(story.content, book);
  // In dev, render the page even when the level has no authored content so that
  // the Storyblok visual editor's iframe shows the entry while authoring.
  if (!hasContent && !dev) {
    error(404, 'Not found');
  }

  const fields = resolveEntryFields(story.content, book);
  const visibleAt = buildEntryVisibility(story.content);
  const bookSwitchUrls = buildBookSwitchUrls(category, entry, visibleAt);

  const siblings = sortBySortByDate(siblingsRes)
    .filter((s) => entryHasContent(s.content, book))
    .map((s) => ({
      slug: s.slug,
      name: resolveEntryFields(s.content, book).displayName
    }));

  const idx = siblings.findIndex((s) => s.slug === entry);
  const prevEntry = idx > 0 ? siblings[idx - 1] : null;
  const nextEntry =
    idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const categoryName =
    categories.find((c) => c.slug === category)?.name ?? category;

  return {
    story,
    fields,
    category,
    categoryName,
    prevEntry,
    nextEntry,
    bookSwitchUrls,
    book,
    hasContent
  };
}
