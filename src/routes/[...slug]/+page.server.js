import { books } from '$lib/books';
import { byDate } from '$lib/sort';
import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import markdownit from 'markdown-it';
import markdownitExternalLink from 'markdown-it-external-link';
import StoryblokClient from 'storyblok-js-client';
import { STORYBLOK_PREVIEW_TOKEN } from '$env/static/private';
import striptags from 'striptags';

const contentMax = 96;

const excerpt = (content) =>
  content?.length > contentMax
    ? `${striptags(content).slice(0, contentMax)}...`
    : striptags(content);

const md = markdownit();
md.use(markdownitExternalLink, {
  hosts: [
    'http://localhost:4173',
    'http://localhost:5173',
    'https://appendix.mvc.ink'
  ],
  rel: 'noopener noreferrer',
  target: '_top'
});

const sortedCategoryEntries = (category) =>
  allStories
    .filter(
      (story) =>
        story.content.component === 'entry' &&
        story.full_slug.startsWith(category)
    )
    .sort(byDate);

const Storyblok = new StoryblokClient({
  accessToken: STORYBLOK_PREVIEW_TOKEN,
  region: 'us'
});

const unSlash = (url) => url.replace(/^\/|\/$/g, '');

const version = dev ? 'draft' : 'published';

const allBooks = [...books.keys()];

const allStories = [];

await Storyblok.getAll('cdn/stories', {
  resolve_relations: ['page.cards'],
  version
}).then((stories) => {
  stories.forEach((story) => {
    story.content.html = md.render(story.content.content);
    story.content.excerpt = excerpt(story.content.html);

    allBooks.forEach((book) => {
      const content = story.content[`${book}Content`];

      if (content) {
        const rendered = md.render(content);

        story.content[`${book}Html`] = rendered;
        story.content[`${book}Excerpt`] = excerpt(rendered);
      }
    });

    allStories.push(story);
  });
});

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const page = allStories.find((story) => {
    const fullSlug = unSlash(story.full_slug);
    const slug = params.slug || 'home';

    return fullSlug === slug;
  });

  if (!page) {
    if (dev) {
      console.log(`Can't find slug ${params.slug}`);
    }

    error(404);
  }

  if (page.content.component === 'listing') {
    page.content.stories = sortedCategoryEntries(page.slug);
  }

  if (page.content.component === 'entry') {
    const [category] = page.full_slug.split('/');

    const sortedEntries = sortedCategoryEntries(category);

    const pageIndex = sortedEntries.findIndex(
      (story) => story.full_slug === page.full_slug
    );

    page.content.previous = sortedEntries[pageIndex - 1];
    page.content.next = sortedEntries[pageIndex + 1];
  }

  return {
    page
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const stories = await Storyblok.getAll('cdn/stories', { version });

  return stories
    .filter((story) => story.slug !== 'home')
    .map((story) => ({ slug: unSlash(story.full_slug) }));
}

export const prerender = !dev;
