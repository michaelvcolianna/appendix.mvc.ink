import { bookFromParams } from '$lib/storyblok';
import { getHomeStory } from '$lib/storyblok-data.server';

export const prerender = true;

export async function load({ params }) {
  const story = await getHomeStory();
  return {
    categories: story.content.cards,
    homeContent: story.content.content,
    book: bookFromParams(params.book)
  };
}
