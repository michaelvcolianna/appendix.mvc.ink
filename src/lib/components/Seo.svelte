<script>
  let { page } = $props();
</script>

<svelte:head>
  {#if page.content.component === 'page'}
    <title>The Guild Library Appendix</title>
    <meta name="description" content="The home page for the Guild Library Appendix, with a list of categories" />
  {/if}

  {#if page.content.component === 'listing'}
    <title>Category: {page.name} | The Guild Library Appendix</title>
    <meta name="description" content={page.content.content} />
  {/if}

  {#if page.content.component === 'entry'}
    <title>Entry: {page.content.displayName} | The Guild Library Appendix</title>
    <meta name="description" content={page.content.excerpt} />
  {/if}

  <meta name="robots" content="noai, noimageai" />
</svelte:head>
