<script lang="ts">
  import { page } from '$app/state';
  import { bookFromParams, withBook } from '$lib/storyblok';

  let status = $derived(page.status);
  let message = $derived(page.error?.message ?? '');
  let book = $derived(bookFromParams(page.params.book));
  let isNotFound = $derived(status === 404);
  let heading = $derived(
    isNotFound ? 'Not in the appendix.' : 'Something went wrong.'
  );
  let body = $derived(
    isNotFound
      ? "We couldn't find the page you were looking for. It may have been moved, or it may not exist in this part of the library."
      : message || 'An unexpected error occurred while loading this page.'
  );
</script>

<svelte:head>
  <title>{status} — Guild Library Appendix</title>
</svelte:head>

<section class="error">
  <p class="error-status">Error {status}</p>
  <h1>{heading}</h1>
  <p class="error-body">{body}</p>

  <p class="back-link">
    <a href={withBook(book, '/')}>← Back to the appendix</a>
  </p>
</section>

<style>
  .error {
    max-width: 540px;
    margin: var(--space-xl) auto;
    padding: var(--space-xl) var(--space-lg);
    background: var(--background-white);
    border: 1px solid var(--border-grey-light);
    border-radius: var(--radius-lg);
    box-shadow: 0 1px 4px #0000000f;
    text-align: center;
  }

  .error-status {
    margin: 0 0 var(--space-sm);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--foreground-grey-light);
  }

  .error h1 {
    margin: 0 0 var(--space-md);
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    color: var(--foreground-grey-darkest);
  }

  .error-body {
    margin: 0 0 var(--space-lg);
    font-size: 1rem;
    line-height: 1.7;
    color: var(--foreground-grey-medium);
  }

  .back-link {
    margin: 0;
    font-size: 0.95rem;
  }

  .back-link a {
    color: var(--link-blue);
    font-weight: 500;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  .back-link a:hover {
    color: var(--link-blue-hover);
  }
</style>
