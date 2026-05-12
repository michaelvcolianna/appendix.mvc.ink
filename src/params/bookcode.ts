import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) =>
  param === 'fcoe' || param === 'fgor' || param === 'faoh';
