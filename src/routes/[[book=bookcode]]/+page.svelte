<script lang="ts">
  import { renderMarkdown } from '$lib/markdown';
  import {
    buildSrcset,
    imageAlt,
    transformImageUrl,
    withBook
  } from '$lib/storyblok';
  import type { PageData } from './$types';

  const CARD_WIDTHS = [320, 480, 640, 768, 960];
  const CARD_SIZES = '(min-width: 960px) 460px, 100vw';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Guild Library Appendix</title>
</svelte:head>

<div class="intro">
  {@html renderMarkdown(data.homeContent, data.book)}
</div>

<section class="categories">
  {#each data.categories as listing}
    <a href={withBook(data.book, '/' + listing.slug)} class="category-card">
      {#if listing.content.image?.filename}
        <div class="card-image-wrap">
          <img
            src={transformImageUrl(listing.content.image.filename, 640)}
            srcset={buildSrcset(listing.content.image.filename, CARD_WIDTHS)}
            sizes={CARD_SIZES}
            alt={imageAlt(
              listing.content.image,
              listing.name,
              `home card: ${listing.slug}`
            )}
          />
        </div>
      {/if}
      <div class="card-body">
        <h2>{listing.name}</h2>
        <p>{listing.content.content}</p>
      </div>
    </a>
  {/each}
</section>

<style>
  .intro {
    max-width: 680px;
    margin-bottom: var(--space-xl);
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--foreground-grey-darkest);
  }

  .intro :global(a) {
    color: var(--link-blue);
    font-weight: 500;
  }

  .intro :global(a:hover) {
    color: var(--link-blue-hover);
  }

  .categories {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  @media (min-width: 960px) {
    .categories {
      grid-template-columns: 1fr 1fr;
    }
  }

  .category-card {
    display: flex;
    flex-direction: column;
    background: var(--background-white);
    border: 1px solid var(--border-grey-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 1px 4px #0000000f;
  }

  .card-image-wrap {
    overflow: hidden;
    aspect-ratio: 11 / 6;
  }

  .card-image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-body {
    padding: var(--space-md) var(--space-lg);
    flex: 1;
  }

  .card-body h2 {
    margin: 0 0 var(--space-xs);
    font-size: 1.05rem;
    color: var(--foreground-grey-darkest);
  }

  .card-body p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--foreground-grey-light);
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: no-preference) {
    .category-card {
      transition:
        border-color var(--dur-med) var(--ease),
        box-shadow var(--dur-med) var(--ease),
        transform var(--dur-med) var(--ease);
    }

    .card-image-wrap img {
      transition: transform var(--dur-med) var(--ease);
    }

    .category-card:hover {
      border-color: var(--border-grey-medium);
      box-shadow: 0 4px 18px #0000001f;
      transform: translateY(-2px);
    }

    .category-card:hover .card-image-wrap img {
      transform: scale(1.03);
    }
  }
</style>
