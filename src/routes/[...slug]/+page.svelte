<script>
  import Entry from '$lib/components/Entry.svelte';
  import Listing from '$lib/components/Listing.svelte';
  import Page from '$lib/components/Page.svelte';
  import Seo from '$lib/components/Seo.svelte';

  let { data } = $props();

  let page = $derived(data.page);
</script>

<Seo {page} />

{#if page.content.component === 'page'}
  <Page {page} />
{/if}

{#if page.content.component === 'listing'}
  <Listing {page} />
{/if}

{#if page.content.component === 'entry'}
  <Entry {page} />
{/if}
