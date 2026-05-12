<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import {
    bookFromParams,
    stripBookPrefix,
    VISIBLE_BOOKS,
    withBook,
    type BookCode
  } from '$lib/storyblok';
  import type { LayoutData } from './$types';

  let { children, data }: { children: any; data: LayoutData } = $props();

  let headerHidden = $state(false);
  let catsOpen = $state(false);
  let booksOpen = $state(false);

  const HIDE_THRESHOLD = 100;
  const SHOW_THRESHOLD = 420;

  let lastScrollY = 0;
  let scrollAccum = 0;

  let currentBook = $derived<BookCode | null>(
    data.book ?? bookFromParams(page.params.book)
  );
  let strippedPath = $derived(stripBookPrefix(page.url.pathname, currentBook));

  function bookHref(targetBook: BookCode | null): string {
    const overrides = page.data.bookSwitchUrls as
      | Record<'null' | BookCode, string>
      | undefined;
    if (overrides) {
      return overrides[targetBook ?? 'null'];
    }
    return withBook(targetBook, strippedPath);
  }

  function onScroll() {
    const y = window.scrollY;
    const delta = y - lastScrollY;
    lastScrollY = y;

    if (y < 80) {
      headerHidden = false;
      scrollAccum = 0;
      return;
    }

    if ((delta > 0 && scrollAccum < 0) || (delta < 0 && scrollAccum > 0)) {
      scrollAccum = 0;
    }
    scrollAccum += delta;

    if (scrollAccum > HIDE_THRESHOLD) {
      headerHidden = true;
      scrollAccum = 0;
    } else if (scrollAccum < -SHOW_THRESHOLD) {
      headerHidden = false;
      scrollAccum = 0;
    }
  }

  function toggleCats() {
    catsOpen = !catsOpen;
    if (catsOpen) booksOpen = false;
  }

  function toggleBooks() {
    booksOpen = !booksOpen;
    if (booksOpen) catsOpen = false;
  }

  function onDocClick(e: MouseEvent) {
    const t = e.target as Element;
    if (!t.closest('.dial-cats') && !t.closest('.dial-books')) {
      catsOpen = false;
      booksOpen = false;
    }
  }

  afterNavigate(() => {
    catsOpen = false;
    booksOpen = false;
  });

  onMount(() => {
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onDocClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onDocClick);
    };
  });
</script>

<svelte:head>
  <title>Guild Library Appendix</title>
</svelte:head>

<header class:hidden={headerHidden}>
  <div class="header-inner">
    <div class="header-top">
      <a href={withBook(currentBook, '/')} class="site-title"
        >Guild Library Appendix</a
      >

      <!-- Desktop-only: inline category nav -->
      <nav class="category-nav" aria-label="Categories">
        {#each data.categories as category}
          <a
            href={withBook(currentBook, '/' + category.slug)}
            class="cat-link"
            class:active={strippedPath.startsWith('/' + category.slug)}
          >
            {category.name}
          </a>
        {/each}
      </nav>

      <!-- Mobile/tablet-only: speed dial buttons -->
      <div class="speed-dials">
        <div class="dial-cats">
          <button
            class="dial-btn"
            class:open={catsOpen}
            onclick={toggleCats}
            aria-expanded={catsOpen}
            aria-haspopup="true"
          >
            Categories
          </button>
          {#if catsOpen}
            <div class="dial-panel">
              {#each data.categories as category}
                <a
                  href={withBook(currentBook, '/' + category.slug)}
                  class="panel-cat-link"
                  class:active={strippedPath.startsWith('/' + category.slug)}
                >
                  {category.name}
                </a>
              {/each}
            </div>
          {/if}
        </div>

        {#if VISIBLE_BOOKS.length > 0}
          <div class="dial-books">
            <button
              class="dial-btn"
              class:open={booksOpen}
              onclick={toggleBooks}
              aria-expanded={booksOpen}
              aria-haspopup="true"
            >
              Books
            </button>
            {#if booksOpen}
              <div class="dial-panel">
                <a
                  href={bookHref(null)}
                  class="panel-book-link"
                  class:active={currentBook === null}
                >
                  None
                </a>
                {#each VISIBLE_BOOKS as book}
                  <a
                    href={bookHref(book.code)}
                    class="panel-book-link"
                    class:active={currentBook === book.code}
                  >
                    {book.label}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Desktop-only: book bar -->
    {#if VISIBLE_BOOKS.length > 0}
      <div class="book-bar">
        <span class="book-bar-label">Books Finished:</span>
        <div class="book-buttons" role="group" aria-label="Book selection">
          <a
            href={bookHref(null)}
            class="book-link"
            class:active={currentBook === null}
          >
            None
          </a>
          {#each VISIBLE_BOOKS as book}
            <a
              href={bookHref(book.code)}
              class="book-link"
              class:active={currentBook === book.code}
            >
              {book.label}
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</header>

<main>
  <div class="main-inner">
    {@render children()}
  </div>
</main>

<style>
  header {
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-grey-dark);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(8px);
    padding: var(--space-sm) var(--space-lg);
  }

  .header-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .header-top {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    flex-wrap: wrap;
  }

  .site-title {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--header-foreground-grey-lightest);
    flex-shrink: 0;
  }

  .site-title:hover {
    color: var(--header-foreground-grey-light);
  }

  /* ── Desktop: inline category nav ─────────────────────────────── */
  .category-nav {
    display: none;
    flex-wrap: wrap;
    gap: var(--space-xs);
    align-items: center;
  }

  .cat-link {
    padding: 0.2em 0.65em;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    background: #fff;
    color: var(--foreground-grey-darkest);
    border: 1px solid var(--border-grey-medium);
  }

  .cat-link:hover {
    background: var(--background-grey-light);
    border-color: var(--border-grey-medium);
    color: var(--foreground-grey-darkest);
  }

  .cat-link.active {
    background: var(--foreground-grey-darkest);
    border-color: var(--foreground-grey-darkest);
    color: #fff;
  }

  /* ── Desktop: book bar ─────────────────────────────────────────── */
  .book-bar {
    display: none;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    padding-top: var(--space-xs);
  }

  .book-bar-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--header-foreground-grey-light);
    flex-shrink: 0;
  }

  .book-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .book-link {
    padding: 0.2em 0.75em;
    border: 1px solid var(--border-grey-medium);
    background: #fff;
    border-radius: var(--radius-sm);
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 500;
    text-decoration: none;
    color: var(--foreground-grey-darkest);
  }

  .book-link:hover {
    background: var(--background-grey-light);
  }

  .book-link.active {
    background: var(--foreground-grey-darkest);
    border-color: var(--foreground-grey-darkest);
    color: #fff;
  }

  /* ── Mobile/tablet: speed dials ───────────────────────────────── */
  .speed-dials {
    display: flex;
    gap: var(--space-xs);
    align-items: center;
  }

  .dial-cats,
  .dial-books {
    position: relative;
  }

  .dial-btn {
    padding: 0.25em 0.75em;
    border: 1px solid var(--border-grey-medium);
    background: #fff;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--foreground-grey-darkest);
  }

  .dial-btn:hover {
    background: var(--background-grey-light);
  }

  .dial-btn.open {
    background: var(--foreground-grey-darkest);
    border-color: var(--foreground-grey-darkest);
    color: #fff;
  }

  .dial-panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 180px;
    background: #fff;
    border: 1px solid var(--border-grey-medium);
    border-radius: var(--radius-md);
    padding: var(--space-xs);
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 20;
    box-shadow: 0 4px 16px #0000002e;
  }

  .panel-cat-link {
    display: block;
    padding: 0.35em 0.75em;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    color: var(--foreground-grey-darkest);
    border: 1px solid transparent;
  }

  .panel-cat-link:hover {
    background: var(--background-grey-light);
    border-color: var(--border-grey-medium);
  }

  .panel-cat-link.active {
    background: var(--foreground-grey-darkest);
    border-color: var(--foreground-grey-darkest);
    color: #fff;
  }

  .panel-book-link {
    display: block;
    width: 100%;
    padding: 0.35em 0.75em;
    border: 1px solid transparent;
    background: transparent;
    border-radius: var(--radius-sm);
    font-family: var(--font);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    color: var(--foreground-grey-darkest);
    text-align: left;
  }

  .panel-book-link:hover {
    background: var(--background-grey-light);
    border-color: var(--border-grey-medium);
  }

  .panel-book-link.active {
    background: var(--foreground-grey-darkest);
    border-color: var(--foreground-grey-darkest);
    color: #fff;
  }

  /* ── Responsive ───────────────────────────────────────────────── */

  /* Mobile: title takes its own row so dials wrap below */
  @media (max-width: 599px) {
    .site-title {
      flex: 1 1 100%;
    }

    .header-top {
      row-gap: var(--space-xs);
    }
  }

  /* Desktop: show inline nav + book bar, hide speed dials */
  @media (min-width: 1024px) {
    .speed-dials {
      display: none;
    }
    .category-nav {
      display: flex;
    }
    .book-bar {
      display: flex;
    }
  }

  /* ── Scroll-hide (mobile/tablet only) ─────────────────────────── */
  @media (max-width: 1023px) {
    header.hidden {
      transform: translateY(-100%);
    }
  }

  @media (max-width: 1023px) and (prefers-reduced-motion: no-preference) {
    header {
      transition: transform 280ms var(--ease);
    }
  }

  /* ── Transitions ──────────────────────────────────────────────── */
  @media (prefers-reduced-motion: no-preference) {
    .cat-link,
    .book-link,
    .dial-btn,
    .panel-cat-link,
    .panel-book-link {
      transition:
        background var(--dur-fast) var(--ease),
        border-color var(--dur-fast) var(--ease),
        color var(--dur-fast) var(--ease);
    }
  }

  main {
    padding: var(--space-xl) var(--space-lg);
  }

  .main-inner {
    max-width: 960px;
    margin: 0 auto;
  }
</style>
