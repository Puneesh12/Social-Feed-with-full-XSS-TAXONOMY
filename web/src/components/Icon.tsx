// Simple solid monochrome icons (fill: currentColor) so they read as clean
// white glyphs on the blue sidebar and flip to blue on the active white pill.
const PATHS: Record<string, string> = {
  home: 'M11.3 2.9a1 1 0 0 1 1.4 0l8.1 7.5a1 1 0 0 1-.7 1.7H19V20a1 1 0 0 1-1 1h-4v-6h-4v6H6a1 1 0 0 1-1-1v-7.9H3.9a1 1 0 0 1-.7-1.7z',
  explore:
    'M10 3a7 7 0 1 0 4.2 12.6l4.1 4.1a1 1 0 0 0 1.4-1.4l-4.1-4.1A7 7 0 0 0 10 3zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
  profile:
    'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.4-8 5.5V21h16v-1.5c0-3.1-3.6-5.5-8-5.5z',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm9.4 3a7.6 7.6 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2l-.4-2.6H9.5l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4.9l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2zM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
  message:
    'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
};

export function Icon({ name, size = 22 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d={PATHS[name] || PATHS.home} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
