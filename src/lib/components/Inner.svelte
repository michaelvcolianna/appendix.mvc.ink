<script>
  let { grid, children } = $props();

  const innerClasses = `${grid ? 'grid gap-4 p-4 lg:px-0' : ''} m-auto max-w-5xl`;
</script>

<div class={innerClasses}>
  {@render children()}
</div>
