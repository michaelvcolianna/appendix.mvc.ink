<script>
  import { categories } from '$lib/categories';
  import Inner from '$lib/components/Inner.svelte';
  import spoilers from '$lib/stores/spoilers';
  import SpaceGrotesk from '$lib/assets/space-grotesk.woff2';
  import '../app.css';

  let { children } = $props();

  const currentYear = new Date().getFullYear();
</script>

<svelte:head>
  <link
    rel="preload"
    href={SpaceGrotesk}
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  />
</svelte:head>

<a
  href="#content"
  class="bg-white border fixed flex h-12 items-center left-4 px-12 -translate-y-16 focus:translate-y-4 motion-safe:transition-transform"
  >Skip to the content</a
>

<header class="bg-black p-6 text-white">
  <Inner>
    <div class="flex flex-wrap gap-6 justify-between">
      <a href="/" class="font-bold text-xl">The Guild Library Appendix</a>

      <button
        type="button"
        onclick={() => spoilers.set($spoilers === 'show' ? 'hide' : 'show')}
        class="bg-white font-bold px-4 py-2 rounded text-black"
        >{$spoilers === 'show' ? 'Hide' : 'Show'} spoilers</button
      >

      <nav aria-labelledby="label-categories">
        <div class="sr-only" id="label-categories">Categories:</div>

        <ul class="flex flex-wrap gap-6">
          {#each categories as [slug, label]}
            {#if slug !== 'home'}
              <li>
                <a href={`/${slug}`} class="underline">{label}</a>
              </li>
            {/if}
          {/each}
        </ul>
      </nav>
    </div>
  </Inner>
</header>

<main id="content">
  {@render children()}
</main>

<footer class="p-6">
  <Inner>
    &copy; 2023-{currentYear} by
    <a href="https://mvc.ink" class="gap-1 inline-flex items-center underline"
      >Michael V. Colianna <svg
        aria-label="Opens an external site"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="currentColor"
        class="h-4"
        ><path
          d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM320 313.4V176c0-8.8-7.2-16-16-16H166.6c-12.5 0-22.6 10.1-22.6 22.6c0 6 2.4 11.8 6.6 16L184 232l-66.3 66.3C114 302 112 306.9 112 312s2 10 5.7 13.7l36.7 36.7c3.6 3.6 8.5 5.7 13.7 5.7s10-2 13.7-5.7L248 296l33.4 33.4c4.2 4.2 10 6.6 16 6.6c12.5 0 22.6-10.1 22.6-22.6z"
        /></svg
      ></a
    >
  </Inner>
</footer>

{@html `<!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->`}
