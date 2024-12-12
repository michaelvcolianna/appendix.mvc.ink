<script>
  import BackLink from '$lib/components/BackLink.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Inner from '$lib/components/Inner.svelte';
  import spoilers from '$lib/stores/spoilers';

  let props = $props();

  let page = $derived(props.page);
</script>

<Inner grid={true}>
  <Breadcrumbs>
    <BackLink />

    <BackLink url={page.full_slug} />
  </Breadcrumbs>

  <article class="gap-4 grid">
    <Heading>
      <small class="block text-sm uppercase">Entry</small>
      <span>
        {#if $spoilers === 'show' && page.content.fcoeDisplayName}
          {page.content.fcoeDisplayName}
        {:else}
          {page.content.displayName}
        {/if}
      </span>
    </Heading>

    {#if $spoilers === 'show' && page.content.fcoeImage}
      <Hero image={page.content.fcoeImage} dimension={256} />
    {:else}
      <Hero image={page.content.image} dimension={256} />
    {/if}

    <div class="prose prose-zinc">
      {#if $spoilers === 'show' && page.content.fcoeHtml}
        {@html page.content.fcoeHtml}
      {:else}
        {@html page.content.html}
      {/if}
    </div>
  </article>

  <nav aria-label="Previous and next entries">
    <ul class="gap-4 grid lg:grid-cols-2">
      {#if page.content.previous}
        <li class="grid">
          <strong class="text-sm uppercase">Previous</strong>

          <a href={`/${page.content.previous.full_slug}`} class="underline">
            {#if $spoilers === 'show' && page.content.previous.content.fcoeDisplayName}
              {page.content.previous.content.fcoeDisplayName}
            {:else}
              {page.content.previous.content.displayName}
            {/if}
          </a>
        </li>
      {:else}
        <li></li>
      {/if}

      {#if page.content.next}
        <li class="grid justify-self-end">
          <strong class="text-sm uppercase">Next</strong>

          <a href={`/${page.content.next.full_slug}`} class="underline">
            {#if $spoilers === 'show' && page.content.next.content.fcoeDisplayName}
              {page.content.next.content.fcoeDisplayName}
            {:else}
              {page.content.next.content.displayName}
            {/if}
          </a>
        </li>
      {:else}
        <li></li>
      {/if}
    </ul>
  </nav>
</Inner>
