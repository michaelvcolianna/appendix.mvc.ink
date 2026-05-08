import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		prerender: {
			// At non-base book levels, internal markdown links can legitimately point at
			// entries that aren't authored there. Warn instead of failing the build.
			handleHttpError: 'warn'
		}
	}
};

export default config;
