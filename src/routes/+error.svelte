<script>
  import BackLink from '$lib/components/BackLink.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Inner from '$lib/components/Inner.svelte';
</script>

<Inner grid={true}>
  <Breadcrumbs>
    <BackLink href="/">Back to Home</BackLink>
  </Breadcrumbs>

  <Heading>Not found</Heading>

  <p>The page you requested couldn't be found.</p>
</Inner>
