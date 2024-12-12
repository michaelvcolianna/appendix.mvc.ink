<script>
  import UnknownHero from '$lib/assets/unknown.jpg';

  let { image, dimension } = $props();

  dimension ??= 64;
</script>

<div>
  <img
    src={image?.filename || UnknownHero}
    alt=""
    height={dimension}
    width={dimension}
    class="border-2 border-black rounded-full"
  />
</div>
