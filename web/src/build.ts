// The client-side half of the single build switch. Vite inlines
// import.meta.env.VITE_BUILD_MODE at build time.
export const BUILD_MODE = (import.meta.env.VITE_BUILD_MODE || 'vulnerable') as
  | 'vulnerable'
  | 'defended';

export const isDefended = BUILD_MODE === 'defended';
export const isVulnerable = BUILD_MODE === 'vulnerable';
