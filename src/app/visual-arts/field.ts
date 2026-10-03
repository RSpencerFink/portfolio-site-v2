/**
 * Star positions for The Painter / The Filmmaker (R3 · A3/A4): three slots per
 * row, each work placed at the start, centre or end of its slot and nudged
 * down by a varying amount, so the works read as scattered stars rather than a
 * grid. `width` is the work's share of its slot (paintings: canvas inches / 48).
 */
export function starSlot(i: number, width: number) {
  const row = Math.floor(i / 3);
  return {
    '--w': width.toFixed(3),
    '--dy': `${((i * 37 + row * 11) % 5) * 24}px`,
    justifySelf: ['start', 'center', 'end'][(i + row) % 3],
  };
}
