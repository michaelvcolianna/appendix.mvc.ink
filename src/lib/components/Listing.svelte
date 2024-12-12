<script>
  import BackLink from '$lib/components/BackLink.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { byDate } from '$lib/sort';
  import Heading from '$lib/components/Heading.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Inner from '$lib/components/Inner.svelte';
  import spoilers from '$lib/stores/spoilers';

  let { page } = $props();

  let cards = $derived(page.content.stories);
</script>

<Inner grid={true}>
  <Breadcrumbs>
    <BackLink />
  </Breadcrumbs>

  <div class="gap-4 grid">
    <Heading>Category Page: {page.name}</Heading>

    <div class="prose prose-zinc">
      {@html page.content.html.code}
    </div>

    <ol class="gap-4 grid lg:grid-cols-2">
      {#each cards as card}
        <li class="gap-4 grid grid-cols-[64px_1fr]">
          {#if $spoilers === 'show' && card.content.fcoeImage}
            <Hero image={card.content.fcoeImage} />
          {:else}
            <Hero image={card.content.image} />
          {/if}

          <div>
            <h2>
              <a
                href={`/${card.full_slug}`}
                class="font-bold text-lg underline"
              >
                {#if $spoilers === 'show' && card.content.fcoeDisplayName}
                  {card.content.fcoeDisplayName}
                {:else}
                  {card.content.displayName}
                {/if}
              </a>
            </h2>

            <div>
              {#if $spoilers === 'show' && card.content.fcoeExcerpt}
                {@html card.content.fcoeExcerpt}
              {:else}
                {@html card.content.excerpt}
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ol>
  </div>
</Inner>
