import { dev } from '$app/environment';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  getStoryblokApi,
  initStoryblok,
  STORYBLOK_VERSION,
  type EntryContent,
  type ListingContent,
  type PageContent,
  type SbStory
} from './storyblok';

type CachedStory = SbStory & { is_startpage?: boolean };

// Storyblok folder startpages serialize their `full_slug` with a trailing
// slash (e.g. `characters/`); the API endpoint `cdn/stories/characters`
// resolves to the same story, so strip the slash for matching.
function normalizeSlug(slug: string): string {
  return slug.replace(/\/+$/, '');
}

let cachePromise: Promise<CachedStory[]> | null = null;

async function loadCache(): Promise<CachedStory[]> {
  if (!cachePromise) {
    const path = resolve(
      process.cwd(),
      '.svelte-kit/storyblok-cache/stories.json'
    );
    cachePromise = readFile(path, 'utf8').then(
      (text) => JSON.parse(text) as CachedStory[]
    );
  }
  return cachePromise;
}

export async function getHomeStory(): Promise<
  SbStory & { content: PageContent }
> {
  if (dev) {
    initStoryblok();
    const api = getStoryblokApi();
    const { data } = await api.get('cdn/stories/home', {
      version: STORYBLOK_VERSION,
      resolve_relations: 'page.cards'
    });
    return data.story as SbStory & { content: PageContent };
  }
  const stories = await loadCache();
  const home = stories.find((s) => normalizeSlug(s.full_slug) === 'home');
  if (!home) throw new Error('[storyblok-data] home story not found in cache');
  return home as SbStory & { content: PageContent };
}

export async function getStoryByFullSlug<T = SbStory['content']>(
  fullSlug: string
): Promise<(SbStory & { content: T }) | undefined> {
  if (dev) {
    initStoryblok();
    const api = getStoryblokApi();
    try {
      const { data } = await api.get(`cdn/stories/${fullSlug}`, {
        version: STORYBLOK_VERSION
      });
      return data.story as SbStory & { content: T };
    } catch {
      return undefined;
    }
  }
  const stories = await loadCache();
  const target = normalizeSlug(fullSlug);
  return stories.find((s) => normalizeSlug(s.full_slug) === target) as
    | (SbStory & { content: T })
    | undefined;
}

export async function getCategoryListing(
  category: string
): Promise<(SbStory & { content: ListingContent }) | undefined> {
  return getStoryByFullSlug<ListingContent>(category);
}

export async function getCategoryEntries(
  category: string
): Promise<Array<SbStory & { content: EntryContent }>> {
  const prefix = `${category}/`;
  if (dev) {
    initStoryblok();
    const api = getStoryblokApi();
    const entries = (await api.getAll('cdn/stories', {
      version: STORYBLOK_VERSION,
      starts_with: prefix,
      is_startpage: false
    })) as Array<SbStory & { content: EntryContent }>;
    return entries;
  }
  const stories = await loadCache();
  return stories.filter(
    (s) => s.full_slug.startsWith(prefix) && s.is_startpage !== true
  ) as Array<SbStory & { content: EntryContent }>;
}
