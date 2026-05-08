<script lang="ts">
  import { renderMarkdown } from '$lib/markdown';
  import { transformImageUrl, withBook } from '$lib/storyblok';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let fields = $derived(data.fields);
  let category = $derived(data.category);
  let categoryName = $derived(data.categoryName);
  let prevEntry = $derived(data.prevEntry);
  let nextEntry = $derived(data.nextEntry);
  let book = $derived(data.book);
  let hasContent = $derived(data.hasContent);
  let renderedHtml = $derived(renderMarkdown(fields.entryContent, book));
</script>

<svelte:head>
  <title>{fields.displayName} — Guild Library Appendix</title>
</svelte:head>

<article>
  {#if fields.image?.filename}
    <div class="entry-image-wrap">
      <img
        src={transformImageUrl(fields.image.filename)}
        alt={fields.image.alt ?? fields.displayName}
      />
    </div>
  {/if}

  <h1>{fields.displayName}</h1>

  <div class="entry-content">
    {@html renderedHtml}
  </div>
</article>

{#if hasContent}
  <nav class="entry-nav" aria-label="Entry navigation">
    <div class="entry-nav-prev">
      {#if prevEntry}
        <a
          href={withBook(book, `/${category}/${prevEntry.slug}`)}
          class="entry-nav-link prev"
        >
          <span class="nav-direction">← Previous</span>
          <span class="nav-title">{prevEntry.name}</span>
        </a>
      {/if}
    </div>
    <div class="entry-nav-next">
      {#if nextEntry}
        <a
          href={withBook(book, `/${category}/${nextEntry.slug}`)}
          class="entry-nav-link next"
        >
          <span class="nav-direction">Next →</span>
          <span class="nav-title">{nextEntry.name}</span>
        </a>
      {/if}
    </div>
  </nav>
{/if}

<p class="back-link">
  <a href={withBook(book, `/${category}`)}>← Back to {categoryName}</a>
</p>

<style>
  article {
    max-width: 680px;
    margin-bottom: var(--space-xl);
  }

  .entry-image-wrap {
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: var(--space-lg);
    max-width: 360px;
    box-shadow: 0 4px 20px #0000001f;
  }

  .entry-image-wrap img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  article h1 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    color: var(--foreground-grey-darkest);
    margin: 0 0 var(--space-lg);
  }

  .entry-content {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--foreground-grey-dark);
  }

  .entry-content :global(p) {
    margin: 0 0 1.2em;
  }
  .entry-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .entry-content :global(a) {
    color: var(--link-blue);
    font-weight: 500;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  .entry-content :global(a:hover) {
    color: var(--link-blue-hover);
  }

  .entry-content :global(strong) {
    font-weight: 600;
  }

  /* ── Prev / Next nav ─────────────────────────────────────────────── */
  .entry-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    max-width: 680px;
    margin-bottom: var(--space-lg);
  }

  .entry-nav-prev {
    grid-column: 1;
  }
  .entry-nav-next {
    grid-column: 2;
    text-align: right;
  }

  .entry-nav-link {
    display: flex;
    flex-direction: column;
    gap: 0.15em;
    padding: var(--space-sm) var(--space-md);
    background: var(--background-white);
    border: 1px solid var(--border-grey-light);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: inherit;
  }

  .entry-nav-link.next {
    align-items: flex-end;
  }

  .nav-direction {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--foreground-grey-light);
  }

  .nav-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--foreground-grey-darkest);
  }

  .back-link {
    font-size: 0.9rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    .entry-nav-link {
      transition:
        background var(--dur-fast) var(--ease),
        border-color var(--dur-fast) var(--ease),
        box-shadow var(--dur-fast) var(--ease);
    }

    .entry-nav-link:hover {
      background: var(--background-grey-light);
      border-color: var(--border-grey-medium);
      box-shadow: 0 2px 10px #00000014;
    }

    .entry-image-wrap img {
      transition: transform var(--dur-med) var(--ease);
    }
  }
</style>
