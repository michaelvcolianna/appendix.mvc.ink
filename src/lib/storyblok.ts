import { storyblokInit, apiPlugin, getStoryblokApi } from '@storyblok/svelte';

const useDraft =
  import.meta.env.DEV || import.meta.env.VITE_STORYBLOK_DRAFT === 'true';

export const STORYBLOK_VERSION: 'draft' | 'published' = useDraft
  ? 'draft'
  : 'published';

const accessToken = useDraft
  ? import.meta.env.VITE_STORYBLOK_PREVIEW_TOKEN
  : import.meta.env.VITE_STORYBLOK_PUBLIC_TOKEN;

let initialized = false;

export function initStoryblok() {
  if (initialized) return;
  initialized = true;
  storyblokInit({
    accessToken,
    apiOptions: {
      region: 'us'
    },
    use: [apiPlugin]
  });
}

export { getStoryblokApi };

export const BOOKS = [
  { code: 'fcoe', label: 'Fractured Children of Earth' },
  { code: 'fgor', label: 'Fragile Gamete of Resistance' },
  { code: 'faoh', label: 'Favored Accord of Humanity' } // @note: May not be real title down the line
] as const;

export type BookCode = 'fcoe' | 'fgor' | 'faoh';

// Each book inherits visibility from all earlier books, so cascade from selected back to fcoe then base
const BOOK_CASCADE: Record<BookCode, BookCode[]> = {
  faoh: ['faoh', 'fgor', 'fcoe'],
  fgor: ['fgor', 'fcoe'],
  fcoe: ['fcoe']
};

// Books visible in the UI, gated by VITE_MAX_BOOK. Each value reveals that book
// plus every earlier one; an unknown/missing value yields an empty list
const MAX_BOOK_VISIBILITY: Record<BookCode, BookCode[]> = {
  fcoe: ['fcoe'],
  fgor: ['fcoe', 'fgor'],
  faoh: ['fcoe', 'fgor', 'faoh']
};

function isBookCode(v: string | undefined | null): v is BookCode {
  return v === 'fcoe' || v === 'fgor' || v === 'faoh';
}

export function bookFromParams(
  book: string | undefined | null
): BookCode | null {
  return isBookCode(book) ? book : null;
}

const maxBook = import.meta.env.VITE_MAX_BOOK;

// In dev all three book routes are reachable; in build, VITE_MAX_BOOK gates them
const visibleCodes: readonly BookCode[] = import.meta.env.DEV
  ? ['fcoe', 'fgor', 'faoh']
  : isBookCode(maxBook)
    ? MAX_BOOK_VISIBILITY[maxBook]
    : [];

export const VISIBLE_BOOKS = BOOKS.filter((b) => visibleCodes.includes(b.code));

export function withBook(
  book: BookCode | null | undefined,
  path: string
): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!book) return clean;
  return clean === '/' ? `/${book}` : `/${book}${clean}`;
}

export function stripBookPrefix(
  pathname: string,
  currentBook: BookCode | null
): string {
  if (!currentBook) return pathname;
  const prefix = `/${currentBook}`;
  if (pathname === prefix) return '/';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

export function transformImageUrl(
  url: string | null | undefined,
  width?: number
): string | null | undefined {
  if (!url) return url;
  const rebased = url.replace(
    /^https:\/\/(?:s3\.amazonaws\.com\/)?a-us\.storyblok\.com/,
    'https://assets.mvc.ink'
  );
  // Strip any pre-existing /m/ or /m/WxH suffix so callers can re-target a width
  const stripped = rebased.replace(/\/m(?:\/\d+x\d+)?\/?$/, '');
  return width ? `${stripped}/m/${width}x0` : `${stripped}/m/`;
}

export function buildSrcset(
  url: string | null | undefined,
  widths: readonly number[]
): string | undefined {
  if (!url) return undefined;
  return widths.map((w) => `${transformImageUrl(url, w)} ${w}w`).join(', ');
}

export function imageAlt(
  asset: SbAsset | undefined,
  fallback: string,
  context?: string
): string {
  if (asset?.alt) return asset.alt;
  if (import.meta.env.DEV && asset?.filename) {
    const where = context ? ` (${context})` : '';
    console.warn(
      `[storyblok] Image missing alt text${where}: ${asset.filename}`
    );
  }
  return fallback;
}

export interface SbAsset {
  filename: string | null;
  alt?: string;
}

export interface EntryContent {
  component: 'entry';
  displayName: string;
  content: string;
  image?: SbAsset;
  fcoeDisplayName?: string;
  fcoeContent?: string;
  fcoeImage?: SbAsset;
  fgorDisplayName?: string;
  fgorContent?: string;
  fgorImage?: SbAsset;
  faohDisplayName?: string;
  faohContent?: string;
  faohImage?: SbAsset;
}

export interface ListingContent {
  component: 'listing';
  image: SbAsset;
  content: string;
}

export interface ListingStory extends SbStory {
  content: ListingContent;
}

export interface PageContent {
  component: 'page';
  content: string;
  cards: ListingStory[];
}

export interface SbStory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  sort_by_date?: string | null;
  content: EntryContent | ListingContent | PageContent;
}

export function sortBySortByDate<
  T extends { sort_by_date?: string | null; full_slug: string }
>(stories: T[]): T[] {
  const dated: T[] = [];
  for (const story of stories) {
    if (story.sort_by_date) {
      dated.push(story);
    } else if (import.meta.env.DEV) {
      console.warn(
        `[storyblok] Excluding "${story.full_slug}" from listing: missing sort_by_date`
      );
    }
  }
  return dated.sort(
    (a, b) =>
      new Date(a.sort_by_date as string).getTime() -
      new Date(b.sort_by_date as string).getTime()
  );
}

export type EntryVisibility = Record<'null' | BookCode, boolean>;

export function entryHasContent(
  content: EntryContent,
  book: BookCode | null
): boolean {
  return Boolean(resolveEntryFields(content, book).entryContent);
}

export function buildEntryVisibility(content: EntryContent): EntryVisibility {
  return {
    null: entryHasContent(content, null),
    fcoe: entryHasContent(content, 'fcoe'),
    fgor: entryHasContent(content, 'fgor'),
    faoh: entryHasContent(content, 'faoh')
  };
}

export function visibilityKey(book: BookCode | null): 'null' | BookCode {
  return book ?? 'null';
}

export function resolveEntryFields(
  content: EntryContent,
  book: BookCode | null
) {
  if (!book) {
    return {
      displayName: content.displayName,
      entryContent: content.content,
      image: content.image
    };
  }

  const cascade = BOOK_CASCADE[book];

  let displayName = content.displayName;
  for (const b of cascade) {
    const dn = content[`${b}DisplayName` as keyof EntryContent] as
      | string
      | undefined;
    if (dn) {
      displayName = dn;
      break;
    }
  }

  let entryContent = content.content;
  for (const b of cascade) {
    const ct = content[`${b}Content` as keyof EntryContent] as
      | string
      | undefined;
    if (ct) {
      entryContent = ct;
      break;
    }
  }

  let image = content.image;
  for (const b of cascade) {
    const img = content[`${b}Image` as keyof EntryContent] as
      | SbAsset
      | undefined;
    if (img?.filename) {
      image = img;
      break;
    }
  }

  return { displayName, entryContent, image };
}
