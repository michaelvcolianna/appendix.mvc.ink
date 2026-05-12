import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import StoryblokClient from 'storyblok-js-client';

export const STORYBLOK_CACHE_DIR = '.svelte-kit/storyblok-cache';
export const STORYBLOK_CACHE_FILE = 'stories.json';

// SvelteKit runs two Vite builds (ssr + client) per `vite build` and the
// config module is re-evaluated for each pass, so a module-level cache
// would not survive. Stash the dedupe promise on `globalThis` instead.
const PREFETCH_KEY = Symbol.for('appendix.storyblok-prefetch');
type PrefetchHost = typeof globalThis & {
  [PREFETCH_KEY]?: Promise<void>;
};

function storyblokPrebuild(env: Record<string, string>): Plugin {
  return {
    name: 'storyblok-prebuild',
    apply: 'build',
    buildStart() {
      const host = globalThis as PrefetchHost;
      if (!host[PREFETCH_KEY]) {
        host[PREFETCH_KEY] = prefetchStoryblok(env, (msg) => this.info(msg));
      }
      return host[PREFETCH_KEY];
    }
  };
}

async function prefetchStoryblok(
  env: Record<string, string>,
  info: (msg: string) => void
): Promise<void> {
  const useDraft = env.VITE_STORYBLOK_DRAFT === 'true';
  const accessToken = useDraft
    ? env.VITE_STORYBLOK_PREVIEW_TOKEN
    : env.VITE_STORYBLOK_PUBLIC_TOKEN;
  if (!accessToken) {
    throw new Error(
      '[storyblok-prebuild] missing access token: set VITE_STORYBLOK_PUBLIC_TOKEN or VITE_STORYBLOK_PREVIEW_TOKEN'
    );
  }

  const client = new StoryblokClient({ accessToken, region: 'us' });
  const version: 'draft' | 'published' = useDraft ? 'draft' : 'published';

  const stories = await client.getAll('cdn/stories', {
    version,
    resolve_relations: 'page.cards'
  });

  const cacheDir = resolve(process.cwd(), STORYBLOK_CACHE_DIR);
  await mkdir(cacheDir, { recursive: true });
  await writeFile(
    resolve(cacheDir, STORYBLOK_CACHE_FILE),
    JSON.stringify(stories)
  );

  info(`cached ${stories.length} stories (${version}) to ${cacheDir}`);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [basicSsl(), storyblokPrebuild(env), sveltekit()],
    build: {
      rolldownOptions: {
        checks: {
          pluginTimings: false
        }
      }
    }
  };
});
