<script>
  import Content from '$lib/components/Content.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Inner from '$lib/components/Inner.svelte';

  let { page } = $props();

  let cards = $derived(page.content.cards.sort((a, b) =>
    a.name.localeCompare(b.name)
  ));
</script>

<Inner grid={true}>
  <Heading>{page.name}</Heading>

  <Content html={page.content.html} />

  <ul class="gap-4 grid lg:grid-cols-2">
    {#each cards as card}
      <li>
        <a href={`/${card.slug}`} class="block relative">
          <div class="absolute bg-white bottom-2 left-2 px-3 py-1">
            {card.name}
          </div>

          <img
            alt=""
            src={card.content.image.filename}
            height="300"
            width="550"
            class="rounded shadow-zinc-400 shadow"
          />
        </a>
      </li>
    {/each}
  </ul>
</Inner>
