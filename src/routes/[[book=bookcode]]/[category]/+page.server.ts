import { error } from '@sveltejs/kit';
import {
  bookFromParams,
  entryHasContent,
  resolveEntryFields,
  sortBySortByDate
} from '$lib/storyblok';
import {
  getCategoryEntries,
  getCategoryListing
} from '$lib/storyblok-data.server';

export async function load({ params }) {
  const { category } = params;
  const book = bookFromParams(params.book);

  const [listing, rawEntries] = await Promise.all([
    getCategoryListing(category),
    getCategoryEntries(category)
  ]);

  if (!listing) {
    error(404, 'Not found');
  }

  const entries = sortBySortByDate(rawEntries)
    .filter((e) => entryHasContent(e.content, book))
    .map((e) => {
      const fields = resolveEntryFields(e.content, book);
      return {
        slug: e.slug,
        displayName: fields.displayName,
        image: fields.image
      };
    });

  return { listing, entries, book };
}
