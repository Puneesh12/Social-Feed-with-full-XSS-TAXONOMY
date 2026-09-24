// Deterministic initials avatar — no external images, no upload needed.
const COLORS = ['#1d9bf0', '#f91880', '#7856ff', '#00ba7c', '#ff7a00', '#ffd400', '#e0245e'];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const clean = (name || '?').trim();
  const initials = clean
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: colorFor(clean),
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
