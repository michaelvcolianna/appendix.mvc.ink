<script lang="ts">
  import { imageAlt, transformImageUrl, type SbAsset } from './storyblok';

  type Variant = { media?: string; width: number };

  let {
    asset,
    fallbackAlt,
    context,
    variants
  }: {
    asset: SbAsset;
    fallbackAlt: string;
    context?: string;
    variants: readonly Variant[];
  } = $props();

  const alt = $derived(imageAlt(asset, fallbackAlt, context));
  const sources = $derived(
    variants.filter((v): v is Required<Variant> => Boolean(v.media))
  );
  const fallback = $derived(
    variants.find((v) => !v.media) ?? variants[variants.length - 1]
  );
</script>

<picture>
  {#each sources as v (v.media)}
    <source
      media={v.media}
      srcset={transformImageUrl(asset.filename, v.width)}
    />
  {/each}
  <img src={transformImageUrl(asset.filename, fallback.width)} {alt} />
</picture>

<style>
  picture {
    display: contents;
  }
</style>
