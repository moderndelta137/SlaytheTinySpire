const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

const hashSeed = (seed) => {
  const value = String(seed ?? 'default-seed');
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const createSeededRng = (seed = `${Date.now()}-${Math.random()}`) => {
  const nextFloat = mulberry32(hashSeed(seed));

  return {
    seed,
    next: () => nextFloat(),
    nextInt: (maxExclusive) => {
      if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) return 0;
      return Math.floor(nextFloat() * maxExclusive);
    },
    pick: (items) => {
      if (!Array.isArray(items) || items.length === 0) return undefined;
      return items[Math.floor(nextFloat() * items.length)];
    },
    shuffle: (items) => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(nextFloat() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    fork: (label) => createSeededRng(`${seed}:${label}`)
  };
};
