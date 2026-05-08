<script lang="ts">
  import {
    buildSrcset,
    imageAlt,
    transformImageUrl,
    withBook
  } from '$lib/storyblok';
  import type { PageData } from './$types';

  const HERO_WIDTHS = [480, 768, 960, 1280, 1600, 1920];
  const HERO_SIZES = '(min-width: 1024px) 920px, 100vw';
  const THUMB_WIDTHS = [56, 112, 168];
  const THUMB_SIZES = '52px';

  let { data }: { data: PageData } = $props();

  let listing = $derived(data.listing);
  let entries = $derived(data.entries);
  let book = $derived(data.book);
  let categorySlug = $derived(listing.full_slug.replace(/\/$/, ''));
</script>

<svelte:head>
  <title>{listing.name} — Guild Library Appendix</title>
</svelte:head>

<div class="category-header">
  {#if listing.content.image?.filename}
    <div class="hero-image-wrap">
      <img
        src={transformImageUrl(listing.content.image.filename, 1280)}
        srcset={buildSrcset(listing.content.image.filename, HERO_WIDTHS)}
        sizes={HERO_SIZES}
        alt={imageAlt(
          listing.content.image,
          listing.name,
          `category hero: ${categorySlug}`
        )}
      />
      <div class="hero-overlay"></div>
      <h1 class="hero-title">{listing.name}</h1>
    </div>
  {:else}
    <h1>{listing.name}</h1>
  {/if}
  <p class="category-description">{listing.content.content}</p>
</div>

{#if entries.length > 0}
  <ul class="entry-list" role="list">
    {#each entries as entry}
      <li>
        <a
          href={withBook(book, `/${categorySlug}/${entry.slug}`)}
          class="entry-row"
        >
          {#if entry.image?.filename}
            <div class="entry-thumb-wrap">
              <img
                src={transformImageUrl(entry.image.filename, 112)}
                srcset={buildSrcset(entry.image.filename, THUMB_WIDTHS)}
                sizes={THUMB_SIZES}
                alt={imageAlt(
                  entry.image,
                  entry.displayName,
                  `entry thumb: ${categorySlug}/${entry.slug}`
                )}
              />
            </div>
          {:else}
            <div class="entry-thumb-placeholder" aria-hidden="true"></div>
          {/if}
          <span class="entry-name">{entry.displayName}</span>
          <span class="entry-arrow" aria-hidden="true">→</span>
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <p class="entry-list-empty">Nothing to see here yet.</p>
{/if}

<p class="back-link"><a href={withBook(book, '/')}>← All categories</a></p>

<style>
  .category-header {
    margin-bottom: var(--space-xl);
  }

  .hero-image-wrap {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 11 / 4;
    margin-bottom: var(--space-md);
  }

  .hero-image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 30%, #000000a6 100%);
  }

  .hero-title {
    position: absolute;
    bottom: var(--space-md);
    left: var(--space-lg);
    right: var(--space-lg);
    margin: 0;
    color: #fff;
    font-size: clamp(1.4rem, 3vw, 2rem);
    text-shadow: 0 1px 8px #0000008c;
  }

  .category-header h1:not(.hero-title) {
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    color: var(--foreground-grey-darkest);
    margin: 0 0 var(--space-sm);
  }

  .category-description {
    margin: 0;
    font-size: 1rem;
    color: var(--foreground-grey-light);
  }

  .entry-list {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .entry-list-empty {
    margin: 0 0 var(--space-xl);
    padding: var(--space-lg);
    background: var(--background-white);
    border: 1px dashed var(--border-grey-medium);
    border-radius: var(--radius-md);
    text-align: center;
    color: var(--foreground-grey-light);
    font-size: 0.95rem;
  }

  .entry-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--background-white);
    border: 1px solid var(--border-grey-light);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--foreground-grey-dark);
  }

  .entry-thumb-wrap,
  .entry-thumb-placeholder {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: linear-gradient(
      135deg,
      var(--background-grey-light),
      var(--background-grey-lighter)
    );
  }

  .entry-thumb-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .entry-name {
    flex: 1;
    font-weight: 500;
    font-size: 0.975rem;
  }

  .entry-arrow {
    color: var(--foreground-grey-light);
    font-size: 0.9rem;
  }

  .back-link {
    margin-top: var(--space-md);
  }

  @media (prefers-reduced-motion: no-preference) {
    .entry-row {
      transition:
        background var(--dur-fast) var(--ease),
        border-color var(--dur-fast) var(--ease),
        box-shadow var(--dur-fast) var(--ease),
        transform var(--dur-fast) var(--ease);
    }

    .entry-arrow {
      transition:
        transform var(--dur-fast) var(--ease),
        color var(--dur-fast) var(--ease);
    }

    .entry-row:hover {
      background: var(--background-grey-light);
      border-color: var(--border-grey-medium);
      box-shadow: 0 2px 10px #00000014;
      transform: translateX(3px);
    }

    .entry-row:hover .entry-arrow {
      transform: translateX(4px);
      color: var(--foreground-grey-darkest);
    }
  }
</style>
