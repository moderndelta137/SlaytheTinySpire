import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Heart, Coins, Map as MapIcon, Sword, Shield, Skull, Ghost, Sparkles, ScrollText, Library, Crosshair, Hexagon, Eye, Flame, Wind, Loader2, Globe, Menu as MenuIcon, Volume2, VolumeX } from 'lucide-react';
import { UI as LOCALIZATION_UI, CHARACTER_TEXT, RELIC_POOL as LOCALIZATION_RELIC_POOL, RELIC_DICT as LOCALIZATION_RELIC_DICT, ENEMY_LIBRARY as LOCALIZATION_ENEMY_LIBRARY, ENEMY_MOVE_LABELS as LOCALIZATION_ENEMY_MOVE_LABELS, ACHIEVEMENT_DEFS as LOCALIZATION_ACHIEVEMENT_DEFS, COPY, localizeTemplate, localizeGeneratedName, translateGeneratedText } from './localization';

// --- GAME DATA & ENGINES ---

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const glyphIcon = (viewBox, paths) => ({ className = "" }) => (
  <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {paths}
  </svg>
);
const AttackIcon = glyphIcon("0 0 24 24", <>)
  <path d="m14.5 5 4.5 4.5" />
  <path d="M12.5 7 5 14.5V19h4.5L17 11.5 12.5 7Z" />
  <path d="m10 16 2 2" />
  <path d="m7 19-2 2" />
  <path d="m9 17-2-2" />
</>);
  <path d="M5 7.5v11A1.5 1.5 0 0 0 6.5 20H16" />
  <path d="M11 9h3" />
  <path d="M11 13h3" />
</>);
const RelicBadgeIcon = glyphIcon("0 0 24 24", <>
  <path d="m12 3 5 4-5 14-5-14 5-4Z" />
  <path d="M9.5 7h5" />
</>);
const BurningBloodIcon = glyphIcon("0 0 24 24", <>
  <path d="M12 4c2.2 3-1 5.2 1.5 7.8A4.5 4.5 0 1 1 7 15.3c0-2.5 1.6-3.8 3-5.7.9-1.2.8-3 2-5.6Z" />
  <path d="M12 10.5c.9 1-.1 1.8.8 2.8a1.8 1.8 0 1 1-3 1.2c0-1 .8-1.7 1.4-2.5.4-.6.3-1.1.8-1.5Z" />
</>);
const VajraIcon = glyphIcon("0 0 24 24", <>
  <path d="m12 3 2.5 4.5L12 12 9.5 7.5 12 3Z" />
  <path d="m7.5 10.5 4.5 2 4.5-2" />
  <path d="m12 12-2.5 4.5L12 21l2.5-4.5L12 12Z" />
</>);
const AnchorRelicIcon = glyphIcon("0 0 24 24", <>
  <circle cx="12" cy="4" r="1.5" />
  <path d="M12 6v10" />
  <path d="M7 12v1a5 5 0 0 0 10 0v-1" />
  <path d="M7 13H4" />
  <path d="M17 13h3" />
  <path d="M9 19h6" />
</>);
const LanternRelicIcon = glyphIcon("0 0 24 24", <>
  <path d="M10 6V4h4v2" />
  <path d="M9 6h6" />
  <path d="M8 8h8l-1 8H9L8 8Z" />
  <path d="M10 19h4" />
  <path d="M12 16v3" />
</>);
const BagOfMarblesIcon = glyphIcon("0 0 24 24", <>
  <path d="M7.5 8.5c2.8-1.5 6.2-1.5 9 0" />
  <path d="M6.5 10.5c.6 6.2 2.6 8.5 5.5 8.5s4.9-2.3 5.5-8.5" />
  <circle cx="9" cy="13" r="1.4" />
  <circle cx="12.8" cy="14.5" r="1.4" />
  <circle cx="15.5" cy="11.8" r="1.2" />
</>);
const OrichalcumIcon = glyphIcon("0 0 24 24", <>
  <path d="m12 3 6 5-2 8-4 5-4-5-2-8 6-5Z" />
  <path d="M12 3v18" />
  <path d="M6 8h12" />
</>);
const PenNibIcon = glyphIcon("0 0 24 24", <>
  <path d="M12 3 17 8 12 21 7 8l5-5Z" />
  <circle cx="12" cy="11" r="1.2" />
  <path d="M10.5 18h3" />
</>);
const ThreadNeedleIcon = glyphIcon("0 0 24 24", <>
  <path d="M18 5 7 16" />
  <path d="M18 5h2l-1 2" />
  <path d="M6.2 17a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" />
  <path d="M13.5 9.5c1 .3 2 .8 2.8 1.5" />
</>);
const IceCreamIcon = glyphIcon("0 0 24 24", <>
  <path d="M8 11a2.5 2.5 0 1 1 3.4-2.3A2.8 2.8 0 1 1 16 11" />
  <path d="M9 11h7" />
  <path d="m10.5 11 1.5 9 1.5-9" />
</>);
const ShovelIcon = glyphIcon("0 0 24 24", <>
  <path d="m15 3 6 6" />
  <path d="M13 5 7 11" />
  <path d="M6 12c-2.1 2.1-3.2 5-.8 7.4C7.6 21.8 10.5 20.7 12.6 18.6L6 12Z" />
</>);
const RingOfTheSnakeIcon = glyphIcon("0 0 24 24", <>
  <path d="M12 6a6 6 0 1 0 0 12c2.2 0 4-1.3 4-3 0-1.4-1.1-2.4-2.7-2.4h-1.1c-1.4 0-2.2-.7-2.2-1.8 0-1.3 1.2-2.3 2.8-2.3 1.2 0 2.3.4 3.2 1.1" />
  <circle cx="16.8" cy="9.6" r="0.5" />
  <path d="m18 10 2 1" />
</>);
const CrackedCoreIcon = glyphIcon("0 0 24 24", <>
  <path d="m12 3 6 3.5v7L12 21 6 13.5v-7L12 3Z" />
  <path d="m13 7-2 5h2l-2 5" />
</>);
const PureWaterIcon = glyphIcon("0 0 24 24", <>
  <path d="M12 4c3 4-2.5 5.5-2.5 9a2.5 2.5 0 0 0 5 0c0-3.5-5.5-5-2.5-9Z" />
  <path d="M7 19c1.5-1 8.5-1 10 0" />
  <path d="M8 21c1-.7 7-.7 8 0" />
</>);
const OmenForgeIcon = glyphIcon("0 0 24 24", <>
  <path d="M6 14h8l-1.5 4h-5L6 14Z" />
  <path d="M14 14h4" />
  <path d="M16 10c1.7 1.7.9 3.2-.2 4" />
  <path d="M10 6c1.5 2-.8 3 .8 4.7a2.2 2.2 0 1 1-3.7 1.5c0-1.4.9-2.1 1.7-3.2.8-1 .7-1.8 1.2-3Z" />
</>);
const MeatOnTheBoneIcon = glyphIcon("0 0 24 24", <>
  <path d="M7 8a1.8 1.8 0 1 1-3.2-1.1A1.8 1.8 0 0 1 7 8Z" />
  <path d="M17 16a1.8 1.8 0 1 1 3.2 1.1A1.8 1.8 0 0 1 17 16Z" />
  <path d="M6.2 9.2 14.8 17.8" />
  <path d="M9 7c2.3-1.4 4.6-1.4 6.9.9 2.3 2.3 2.2 4.7.8 7" />
</>);
const RELIC_ICON_MAP = {
  'Burning Blood': BurningBloodIcon,
  Vajra: VajraIcon,
  Anchor: AnchorRelicIcon,
  Lantern: LanternRelicIcon,
  'Bag of Marbles': BagOfMarblesIcon,
  Orichalcum: OrichalcumIcon,
  'Pen Nib': PenNibIcon,
  'Thread and Needle': ThreadNeedleIcon,
  'Ice Cream': IceCreamIcon,
  Shovel: ShovelIcon,
  'Ring of the Snake': RingOfTheSnakeIcon,
  'Cracked Core': CrackedCoreIcon,
  'Pure Water': PureWaterIcon,
  'Omen Forge': OmenForgeIcon,
  'Meat on the Bone': MeatOnTheBoneIcon
};
const RelicIcon = ({ relicName, className = "w-4 h-4" }) => {
  const IconComponent = RELIC_ICON_MAP[relicName] || RelicBadgeIcon;
  return <IconComponent className={className} />;
};

// A helper to automatically inject icons into game text safely
const renderTextWithIcons = (text) => {
  if (!text) return null;
  if (typeof text !== 'string') return text; // Prevents crash if already parsed
  const parts = text.split(/(damage|Dmg|Block|HP)/g);
  return parts.map((part, i) => {
    if (part === 'damage' || part === 'Dmg') {
      return <span key={i} className="inline-flex items-center text-red-400 font-bold mx-0.5 drop-shadow-sm"><AttackIcon className="w-3.5 h-3.5 mr-0.5" />{part}</span>;
    }
    if (part === 'Block') {
      return <span key={i} className="inline-flex items-center text-blue-400 font-bold mx-0.5 drop-shadow-sm"><Shield className="w-3.5 h-3.5 mr-0.5" />{part}</span>;
    }
    if (part === 'HP') {
      return <span key={i} className="inline-flex items-center text-green-400 font-bold mx-0.5 drop-shadow-sm"><Heart className="w-3.5 h-3.5 mr-0.5" />{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

const renderFloatingEffectText = (text, type) => {
  if (!text) return null;
  const parts = String(text).split(/(Gold|damage|Dmg|Block|HP)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part === 'Gold') return <span key={index} className="text-amber-300">{part}</span>;
    if (part === 'damage' || part === 'Dmg') return <span key={index} className="text-red-400">{part}</span>;
    if (part === 'Block') return <span key={index} className="text-blue-300">{part}</span>;
    if (part === 'HP') {
      const hpColor = type === 'damage' ? 'text-red-400' : 'text-green-300';
      return <span key={index} className={hpColor}>{part}</span>;
    }
    return <span key={index}>{part}</span>;
  });
};

const splitCardDescriptionLines = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/(?<=\.)\s+(?=[A-Z])|(?<=[\u3002\uFF01\uFF1F])/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const renderCardDescription = (text) => {
  const lines = splitCardDescriptionLines(text);
  if (lines.length === 0) return null;
  return (
    <div className="w-full flex flex-col items-center justify-center gap-1">
      {lines.map((line, index) => (
        <div key={`${line}-${index}`} className="w-full text-center break-words">
          {renderTextWithIcons(line)}
        </div>
      ))}
    </div>
  );
};

// --- TRANSLATION DICTIONARIES ---

const UI = LOCALIZATION_UI;

const CHARACTERS = {
  IRONCLAD: { 
    name: CHARACTER_TEXT.IRONCLAD.name, hp: 80, color: "text-red-400", icon: <Flame className="w-8 h-8" />,
    relics: ["Burning Blood"], deck: ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Bash"],
    cardPool: ["Iron Wave", "Perfected Strike", "Pommel Strike", "Shrug It Off", "Cleave", "Inflame", "Shockwave", "Bludgeon", "Demon Form", "Limit Break", "Carnage"]
  },
  SILENT: { 
    name: CHARACTER_TEXT.SILENT.name, hp: 70, color: "text-green-400", icon: <Wind className="w-8 h-8" />,
    relics: ["Ring of the Snake"], deck: ["Strike", "Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Defend", "Survivor", "Neutralize"],
    cardPool: ["Dagger Spray", "Backflip", "Deadly Poison", "Acrobatics", "Bouncing Flask", "Adrenaline", "Catalyst", "Noxious Fumes", "Dash", "Cloak And Dagger"]
  },
  DEFECT: { 
    name: CHARACTER_TEXT.DEFECT.name, hp: 75, color: "text-blue-400", icon: <Hexagon className="w-8 h-8" />,
    relics: ["Cracked Core"], deck: ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Zap", "Dualcast"],
    cardPool: ["Cold Snap", "Ball Lightning", "Glacier", "Hologram", "Defragment", "Echo Form", "Leap", "Sweeping Beam", "Claw", "Core Surge"]
  },
  WATCHER: { 
    name: CHARACTER_TEXT.WATCHER.name, hp: 72, color: "text-purple-400", icon: <Eye className="w-8 h-8" />,
    relics: ["Pure Water"], deck: ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Eruption", "Vigilance"],
    cardPool: ["Flurry of Blows", "Empty Fist", "Halt", "Bowling Bash", "Tantrum", "Wallop", "Vault", "Blasphemy", "Sash Whip", "Cut Through Fate", "Like Water", "Foresight"]
  },
  NECROBINDER: { 
    name: CHARACTER_TEXT.NECROBINDER.name, hp: 70, color: "text-indigo-400", icon: <Skull className="w-8 h-8" />,
    relics: ["Omen Forge"], deck: ["Strike", "Strike", "Strike", "Strike", "Defend", "Defend", "Defend", "Defend", "Reap", "Animate"],
    cardPool: ["Soul Strike", "Bone Wall", "Dark Bargain", "Grave Dig", "Summon Horde", "Death Knell", "Siphon", "Corpse Explosion", "Ritual Dagger", "Spectral Shield", "Grave Pact", "Soul Furnace"]
  }
};

const RELIC_POOL = LOCALIZATION_RELIC_POOL;
const RELIC_DICT = LOCALIZATION_RELIC_DICT;
let CARD_DICT = {};
const ENEMY_LIBRARY = LOCALIZATION_ENEMY_LIBRARY;
const ENEMY_MOVE_LABELS = LOCALIZATION_ENEMY_MOVE_LABELS;
const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
};

const CARD_TYPE_META = {
  Attack: { label: 'Attack', badgeClass: 'bg-red-500/15 text-red-200 border-red-400/35' },
  Skill: { label: 'Skill', badgeClass: 'bg-sky-500/15 text-sky-200 border-sky-400/35' },
  Power: { label: 'Power', badgeClass: 'bg-violet-500/15 text-violet-200 border-violet-400/35' },
  Status: { label: 'Status', badgeClass: 'bg-slate-500/15 text-slate-200 border-slate-400/35' }
};

const CARD_RARITY_META = {
  Common: { label: 'Common', badgeClass: 'text-slate-400', glowClass: '', borderClass: '' },
  Uncommon: { label: 'Uncommon', badgeClass: 'text-emerald-300', glowClass: 'shadow-[0_0_22px_rgba(52,211,153,0.22)]', borderClass: 'border-emerald-400/45' },
  Rare: { label: 'Rare', badgeClass: 'text-amber-300', glowClass: 'shadow-[0_0_26px_rgba(251,191,36,0.28)]', borderClass: 'border-amber-300/55' }
};

const UNCOMMON_CARDS = new Set([
  'Inflame', 'Shockwave', 'Carnage', 'Acrobatics', 'Bouncing Flask', 'Catalyst', 'Noxious Fumes', 'Dash',
  'Glacier', 'Hologram', 'Defragment', 'Bowling Bash', 'Tantrum', 'Wallop', 'Cut Through Fate',
  'Dark Bargain', 'Summon Horde', 'Siphon', 'Ritual Dagger', 'Like Water', 'Grave Pact'
]);

const RARE_CARDS = new Set([
  'Bludgeon', 'Demon Form', 'Limit Break', 'Adrenaline', 'Echo Form', 'Core Surge',
  'Vault', 'Blasphemy', 'Death Knell', 'Corpse Explosion', 'Spectral Shield', 'Foresight', 'Soul Furnace'
]);

const getCardRarity = (cardName, explicitRarity) => {
  if (explicitRarity) return explicitRarity;
  const baseName = cardName.replace('+', '');
  if (RARE_CARDS.has(baseName)) return 'Rare';
  if (UNCOMMON_CARDS.has(baseName)) return 'Uncommon';
  return 'Common';
};
const parseEffectSpec = (value) => {
  const spec = {};
  if (!value) return spec;
  value.split(';').forEach((part) => {
    const [rawKey, rawValue = ''] = part.split('=');
    const key = rawKey?.trim();
    if (!key) return;
    spec[key] = rawValue.trim();
  });
  return spec;
};
const parseCardsCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return {};
  const headers = parseCsvLine(lines[0]);
  const cards = {};
  lines.slice(1).forEach((line) => {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
    cards[row.name] = {
      character: row.character,
      type: row.type,
      rarity: getCardRarity(row.name, row.rarity),
      n: { en: row.name, ja: row.name, zh: row.name },
      d: { en: row.desc, ja: row.desc, zh: row.desc },
      dUp: { en: row.up_desc, ja: row.up_desc, zh: row.up_desc },
      effects: parseEffectSpec(row.effects),
      effectsUp: parseEffectSpec(row.effects_up)
    };
  });
  return cards;
};
const getCardDefinition = (cardName) => {
  const baseName = cardName.replace('+', '');
  const data = CARD_DICT[baseName];
  if (!data) return null;
  return {
    ...data,
    baseName,
    isUpgraded: cardName.endsWith('+'),
    effectSpec: cardName.endsWith('+') ? data.effectsUp : data.effects
  };
};
const getEnemyCodexKey = (tier, nameEn) => `${tier}:${nameEn}`;
const buildEnemyCodexCatalog = () => {
  return ['normal', 'elite', 'boss'].flatMap((tier) =>
    ENEMY_LIBRARY[tier].map((entry) => ({
      key: getEnemyCodexKey(tier, entry.names.en),
      tier,
      names: entry.names,
      spriteKey: entry.spriteKey,
      act: entry.act
    }))
  );
};
const ENEMY_CODEX_CATALOG = buildEnemyCodexCatalog();

const CHARACTER_STARTER_RELIC = Object.fromEntries(
  Object.entries(CHARACTERS).map(([key, char]) => [key, char.relics[0]])
);

const CHARACTER_COLLECTIONS = Object.fromEntries(
  Object.entries(CHARACTERS).map(([key, char]) => {
    const cards = Array.from(new Set([
      ...char.deck.filter(card => !COMMON_STARTER_CARDS.includes(card)),
      ...char.cardPool
    ]));
    return [key, { cards, relics: [...char.relics] }];
  })
);

const ACHIEVEMENT_DEFS = LOCALIZATION_ACHIEVEMENT_DEFS;
const createDefaultMetaProgress = () => ({
  stats: {
    totalCombatWins: 0,
    totalEnemiesDefeated: 0,
    totalEliteWins: 0,
    totalCardsPlayed: 0,
    totalCardsCollected: 0,
    totalRelicsCollected: 0,
    lowHpCombatSurvived: 0,
    highestGold: 99,
    highestActCleared: 0,
    totalWins: 0
  },
  settings: {
    masterVolume: 70,
    uiVolume: 80,
    combatVolume: 75,
    achievementVolume: 90,
    isMuted: false
  },
  unlockedCharacters: [...STARTER_UNLOCKED_CHARACTERS],
  unlockedCards: [...STARTER_UNLOCKED_CARDS],
  unlockedRelics: [...STARTER_UNLOCKED_RELICS],
  achievements: Object.fromEntries(ACHIEVEMENT_DEFS.map(achievement => [achievement.id, { completed: false }])),
  encounteredEnemies: {}
});

const getMetaStorageKey = (slotId) => `${META_STORAGE_PREFIX}${slotId}`;

const mergeUnique = (base, extra) => Array.from(new Set([...(base || []), ...(extra || [])]));

const getUnlockRequirementText = (achievementId, lang) => {
  const achievement = ACHIEVEMENT_DEFS.find(item => item.id === achievementId);
  return achievement ? achievement.title[lang] : achievementId;
};

const getCharacterUnlockAchievement = (characterKey) => {
  return ACHIEVEMENT_DEFS.find(achievement => achievement.rewards.characters.includes(characterKey));
};

const getUnlockedCardPoolForCharacter = (characterKey, metaProgress) => {
  const character = CHARACTERS[characterKey];
  if (!character) return [];
  return character.cardPool.filter(card => metaProgress.unlockedCards.includes(card));
};

const getUnlockedRelicPool = (metaProgress) => {
  return RELIC_POOL.filter(relic => metaProgress.unlockedRelics.includes(relic));
};

const applyAchievementRewards = (metaProgress, rewards) => {
  return {
    ...metaProgress,
    unlockedCharacters: mergeUnique(metaProgress.unlockedCharacters, rewards.characters),
    unlockedCards: mergeUnique(metaProgress.unlockedCards, rewards.cards),
    unlockedRelics: mergeUnique(metaProgress.unlockedRelics, rewards.relics)
  };
};

const evaluateAchievementProgress = (metaProgress) => {
  let nextMeta = {
    ...metaProgress,
    achievements: { ...metaProgress.achievements }
  };
  const newlyCompleted = [];

  ACHIEVEMENT_DEFS.forEach((achievement) => {
    const alreadyCompleted = nextMeta.achievements[achievement.id]?.completed;
    if (!alreadyCompleted && achievement.isComplete(nextMeta.stats)) {
      nextMeta.achievements[achievement.id] = { completed: true };
      nextMeta = applyAchievementRewards(nextMeta, achievement.rewards);
      newlyCompleted.push(achievement);
    }
  });

  return { metaProgress: nextMeta, newlyCompleted };
};

const updateMetaProgressWithStats = (metaProgress, statChanges = {}) => {
  const currentStats = metaProgress.stats;
  const nextStats = {
    totalCombatWins: currentStats.totalCombatWins + (statChanges.totalCombatWins || 0),
    totalEnemiesDefeated: currentStats.totalEnemiesDefeated + (statChanges.totalEnemiesDefeated || 0),
    totalEliteWins: currentStats.totalEliteWins + (statChanges.totalEliteWins || 0),
    totalCardsPlayed: currentStats.totalCardsPlayed + (statChanges.totalCardsPlayed || 0),
    totalCardsCollected: currentStats.totalCardsCollected + (statChanges.totalCardsCollected || 0),
    totalRelicsCollected: currentStats.totalRelicsCollected + (statChanges.totalRelicsCollected || 0),
    lowHpCombatSurvived: currentStats.lowHpCombatSurvived + (statChanges.lowHpCombatSurvived || 0),
    highestGold: Math.max(currentStats.highestGold, statChanges.highestGold ?? currentStats.highestGold),
    highestActCleared: Math.max(currentStats.highestActCleared, statChanges.highestActCleared ?? currentStats.highestActCleared),
    totalWins: currentStats.totalWins + (statChanges.totalWins || 0)
  };

  return evaluateAchievementProgress({
    ...metaProgress,
    stats: nextStats
  });
};

const getStateRewardCardPool = (state) => {
  const character = state.characterKey ? CHARACTERS[state.characterKey] : null;
  const basePool = character?.cardPool || state.character?.cardPool || [];
  const unlockedPool = basePool.filter(card => (state.unlockedCards || []).includes(card));
  return unlockedPool.length > 0 ? unlockedPool : basePool;
};

const getStateRewardRelicPool = (state) => {
  const ownedRelics = new Set(state.relics || []);
  const unlockedPool = RELIC_POOL.filter(relic => (state.unlockedRelics || []).includes(relic) && !ownedRelics.has(relic));
  const fallbackPool = RELIC_POOL.filter(relic => !ownedRelics.has(relic));
  return unlockedPool.length > 0 ? unlockedPool : fallbackPool;
};

const UNCOMMON_RELICS = new Set(['Vajra', 'Anchor', 'Lantern', 'Bag of Marbles', 'Orichalcum', 'Thread and Needle', 'Pure Water']);
const RARE_RELICS = new Set(['Pen Nib', 'Ice Cream', 'Shovel', 'Meat on the Bone', 'Omen Forge']);

const getRelicRarity = (relicName) => {
  if (RARE_RELICS.has(relicName)) return 'Rare';
  if (UNCOMMON_RELICS.has(relicName)) return 'Uncommon';
  return 'Common';
};

const pickRewardCard = (state, tier = 'normal') => {
  const pool = getStateRewardCardPool(state);
  const rareCards = pool.filter(card => getCardRarity(card) === 'Rare');
  const uncommonCards = pool.filter(card => getCardRarity(card) === 'Uncommon');

  if (tier === 'boss') {
    return getRandomItem(rareCards.length > 0 ? rareCards : uncommonCards.length > 0 ? uncommonCards : pool);
  }
  if (tier === 'elite') {
    const upgradedPool = [...uncommonCards, ...rareCards];
    return getRandomItem(upgradedPool.length > 0 ? upgradedPool : pool);
  }
  return getRandomItem(pool);
};

const pickRewardRelic = (state, tier = 'normal') => {
  const pool = getStateRewardRelicPool(state);
  if (pool.length === 0) return null;
  const rareRelics = pool.filter(relic => getRelicRarity(relic) === 'Rare');
  const uncommonRelics = pool.filter(relic => getRelicRarity(relic) === 'Uncommon');

  if (tier === 'boss') {
    return getRandomItem(rareRelics.length > 0 ? rareRelics : uncommonRelics.length > 0 ? uncommonRelics : pool);
  }
  if (tier === 'elite') {
    const upgradedPool = [...uncommonRelics, ...rareRelics];
    return getRandomItem(upgradedPool.length > 0 ? upgradedPool : pool);
  }
  return getRandomItem(pool);
};

const appendRelicIfAvailable = (state, relicName) => {
  if (!relicName || (state.relics || []).includes(relicName)) return [...(state.relics || [])];
  return [...(state.relics || []), relicName];
};

const getTranslatedCard = (cardName, lang) => {
  const isUpgraded = cardName.endsWith('+');
  const baseName = cardName.replace('+', '');
  const data = CARD_DICT[baseName];
  if (!data) return { name: cardName, desc: COPY.fallback.unknownCard[lang] || COPY.fallback.unknownCard.en };
  const baseLocalizedName = data.n[lang] && data.n[lang] !== data.n.en ? data.n[lang] : localizeGeneratedName('card', data.n.en, lang);
  const localizedDesc = isUpgraded ? data.dUp[lang] : data.d[lang];
  return {
    name: `${baseLocalizedName}${isUpgraded ? '+' : ''}`,
    desc: translateGeneratedText(localizedDesc, lang),
    type: data.type,
    rarity: getCardRarity(baseName, data.rarity)
  };
};

const getTranslatedRelic = (relicName, lang) => {
  const data = RELIC_DICT[relicName];
  if (!data) return { name: relicName, desc: COPY.fallback.unknownRelic[lang] || COPY.fallback.unknownRelic.en };
  const localizedName = data.name[lang] && data.name[lang] !== data.name.en ? data.name[lang] : localizeGeneratedName('relic', data.name.en, lang);
  return { name: localizedName, desc: translateGeneratedText(data.desc[lang], lang) };
};

// --- COMBAT ENGINE ---

const drawCards = (c, num) => {
  const drawn = [...(c.hand || [])];
  let drawnCount = 0;
  while (drawnCount < num) {
    if (c.drawPile.length === 0) {
      if (c.discardPile.length === 0) break;
      c.drawPile = [...c.discardPile].sort(() => Math.random() - 0.5);
      c.discardPile = [];
    }
    drawn.push(c.drawPile.pop());
    drawnCount += 1;
  }
  c.hand = drawn;
};

const getNumericEffect = (spec, key, fallback = 0) => {
  const raw = spec?.[key];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calcDamage = (base, combat, damageMultiplier = 1) => {
  let dmg = Math.floor((base + combat.playerStrength) * damageMultiplier);
  if (combat.enemyVuln > 0) dmg = Math.floor(dmg * 1.5);
  return dmg;
};

const applyDamageToEnemy = (dmg, combat) => {
  let actualDmg = Math.max(0, dmg - combat.enemyBlock);
  combat.enemyBlock = Math.max(0, combat.enemyBlock - dmg);
  combat.enemyHp -= actualDmg;
  return actualDmg;
};

const applyDamageToPlayer = (base, s, c) => {
  let dmg = base + (c.enemyStrength || 0); 
  if (c.enemyWeak > 0) dmg = Math.floor(dmg * 0.75);
  if (c.playerVuln > 0) dmg = Math.floor(dmg * 1.5);
  let actualDmg = Math.max(0, dmg - c.playerBlock);
  c.playerBlock = Math.max(0, c.playerBlock - dmg);
  s.hp -= actualDmg;
};

const executeCard = (cardName, s, c, options = {}) => {
  const definition = getCardDefinition(cardName);
  if (!definition || definition.effectSpec.unplayable === '1') return definition;

  const spec = definition.effectSpec;
  const damageMultiplier = options.damageMultiplier ?? 1;
  const onDamage = options.onDamage;
  const hits = getNumericEffect(spec, 'hits', 1);
  const damage = getNumericEffect(spec, 'damage', 0);
  const block = getNumericEffect(spec, 'block', 0);
  const draw = getNumericEffect(spec, 'draw', 0);
  const strength = getNumericEffect(spec, 'strength', 0);
  const vulnerable = getNumericEffect(spec, 'vulnerable', 0);
  const weak = getNumericEffect(spec, 'weak', 0);
  const heal = getNumericEffect(spec, 'heal', 0);
  const selfDamage = getNumericEffect(spec, 'self_damage', 0);
  const claw = spec.claw ? spec.claw.split(':').map(Number) : null;
  const perfected = spec.perfected ? spec.perfected.split(':').map(Number) : null;

  if (damage > 0) {
    for (let i = 0; i < hits; i += 1) {
      const actualDamage = applyDamageToEnemy(calcDamage(damage, c, damageMultiplier), c);
      if (actualDamage > 0 && onDamage) onDamage(actualDamage, i);
    }
  }
  if (block > 0) c.playerBlock += block;
  if (draw > 0) drawCards(c, draw);
  if (strength > 0) c.playerStrength += strength;
  if (vulnerable > 0) c.enemyVuln += vulnerable;
  if (weak > 0) c.enemyWeak += weak;
  if (heal > 0) s.hp = Math.min(s.maxHp, s.hp + heal);
  if (selfDamage > 0) s.hp = Math.max(1, s.hp - selfDamage);
  if (spec.double_strength === '1') c.playerStrength *= 2;
  if (perfected) {
    const [baseDamage, perStrikeBonus] = perfected;
    const strikeCount = s.deck.filter(card => card.includes('Strike')).length;
    const actualDamage = applyDamageToEnemy(calcDamage(baseDamage + strikeCount * perStrikeBonus, c, damageMultiplier), c);
    if (actualDamage > 0 && onDamage) onDamage(actualDamage, 0);
  }
  if (claw) {
    const [baseDamage, growth] = claw;
    c.clawBase = c.clawBase || baseDamage;
    const actualDamage = applyDamageToEnemy(calcDamage(c.clawBase, c, damageMultiplier), c);
    if (actualDamage > 0 && onDamage) onDamage(actualDamage, 0);
    c.clawBase += growth;
  }
  if (spec.power) {
    const [powerKey, rawValue] = spec.power.split(':');
    const powerValue = Number(rawValue || 0);
    if (powerKey === 'strength') c.playerStrength += powerValue;
    if (powerKey === 'demon_form') c.activePowers.demonForm += powerValue;
    if (powerKey === 'noxious_fumes') c.activePowers.noxiousFumes += powerValue;
    if (powerKey === 'echo_form') c.activePowers.echoForm += Math.max(1, powerValue);
    if (powerKey === 'block_each_turn') c.activePowers.blockEachTurn += powerValue;
    if (powerKey === 'draw_each_turn') c.activePowers.drawEachTurn += powerValue;
  }

  return definition;
};

const cloneCombatForPreview = (gameState) => {
  const c = gameState.combat;
  if (!c) return null;
  const simCombat = {
    ...c,
    hand: [...(c.hand || [])],
    drawPile: [...(c.drawPile || [])],
    discardPile: [...(c.discardPile || [])],
    activePowers: { ...(c.activePowers || {}) },
    intent: c.intent ? { ...c.intent } : null
  };

  return {
    ...gameState,
    deck: [...(gameState.deck || [])],
    relics: [...(gameState.relics || [])],
    combat: simCombat
  };
};

const getCombatPreviewForCard = (gameState, cardName) => {
  if (!gameState?.combat || !cardName) return null;

  const simState = cloneCombatForPreview(gameState);
  const simCombat = simState.combat;
  const cardDefinition = getCardDefinition(cardName);
  if (!cardDefinition) return null;

  const penNibTriggers = simState.relics.includes('Pen Nib') && (((simCombat.cardsPlayed || 0) + 1) % 3 === 0);
  const damageMultiplier = penNibTriggers ? 2 : 1;
  const shouldEcho = (simCombat.activePowers.echoForm || 0) > 0 && (simCombat.turnCardsPlayed || 0) === 0;

  if (simState.relics.includes('Cracked Core')) simCombat.playerBlock += 2;
  executeCard(cardName, simState, simCombat, { damageMultiplier });
  if (shouldEcho) {
    executeCard(cardName, simState, simCombat, { damageMultiplier });
  }

  return {
    playerHp: simState.hp,
    playerBlock: simCombat.playerBlock,
    enemyHp: simCombat.enemyHp,
    enemyBlock: simCombat.enemyBlock
  };
};

const getIntentPlayerPreview = (gameState, overrides = {}) => {
  const combat = gameState?.combat;
  if (!combat?.intent || combat.intent.type !== 'attack') return null;

  const damage = combat.intent.projectedDmg ?? 0;
  const baseBlock = overrides.playerBlock ?? combat.playerBlock;
  const baseHp = overrides.playerHp ?? gameState.hp;
  const nextBlock = Math.max(0, baseBlock - damage);
  const hpLoss = Math.max(0, damage - baseBlock);

  return {
    playerBlock: nextBlock,
    playerHp: Math.max(0, baseHp - hpLoss)
  };
};

// --- PROCEDURAL GENERATION ENGINE ---

const getEnemyPatternText = (sequence) => ({
  en: sequence.map(move => ENEMY_MOVE_LABELS[move.type].en).join(' -> '),
  ja: sequence.map(move => ENEMY_MOVE_LABELS[move.type].ja).join(' -> '),
  zh: sequence.map(move => ENEMY_MOVE_LABELS[move.type].zh).join(' -> ')
});

const generateProceduralRun = (act) => {
  const hpMult = act === 1 ? 1 : act === 2 ? 1.4 : 1.75;
  const damageMult = act === 1 ? 1 : act === 2 ? 1.35 : 1.65;

  const patternMap = {
    aggressive: (dmg, isBoss) => [
      { type: 'attack', val: dmg },
      { type: 'attack', val: dmg + (isBoss ? 8 : 4) },
      { type: 'defend', val: Math.max(6, Math.floor(dmg * 0.8)) }
    ],
    guarded: (dmg, isBoss) => [
      { type: 'defend', val: Math.max(8, Math.floor(dmg * 1.8)) },
      { type: 'attack', val: dmg },
      { type: 'buff', val: isBoss ? 3 : 1 }
    ],
    hexer: (dmg, isBoss) => [
      { type: 'buff', val: isBoss ? 3 : 1 },
      { type: 'attack', val: dmg + (isBoss ? 6 : 3) },
      { type: 'defend', val: Math.max(6, Math.floor(dmg)) }
    ],
    berserk: (dmg, isBoss) => [
      { type: 'attack', val: dmg + (isBoss ? 4 : 2) },
      { type: 'buff', val: isBoss ? 4 : 2 },
      { type: 'attack', val: dmg + (isBoss ? 10 : 5) }
    ],
    boss_guardian: (dmg) => [
      { type: 'defend', val: Math.floor(dmg * 2) },
      { type: 'attack', val: dmg },
      { type: 'buff', val: 3 },
      { type: 'attack', val: dmg + 10 }
    ],
    boss_collector: (dmg) => [
      { type: 'buff', val: 3 },
      { type: 'attack', val: dmg + 4 },
      { type: 'defend', val: Math.floor(dmg * 1.6) },
      { type: 'attack', val: dmg + 12 }
    ],
    boss_time: (dmg) => [
      { type: 'attack', val: dmg },
      { type: 'defend', val: Math.floor(dmg * 1.8) },
      { type: 'buff', val: 4 },
      { type: 'attack', val: dmg + 14 }
    ]
  };

  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const instantiateEnemy = (template, tier) => {
    const isBoss = tier === 'boss';
    const scaledDamage = Math.max(4, Math.floor(template.baseDamage * damageMult));
    const hpVariance = isBoss ? 0 : Math.floor(Math.random() * 8);
    const hp = Math.floor(template.baseHp * hpMult) + hpVariance;
    const sequence = patternMap[template.pattern](scaledDamage, isBoss);
    const codexKey = getEnemyCodexKey(tier, template.names.en);
    const codexPattern = getEnemyPatternText(sequence);

    return {
      id: `${template.key.toUpperCase()}_${Math.floor(Math.random() * 1000)}`,
      tier,
      names: template.names,
      hp,
      spriteKey: template.spriteKey,
      codexKey,
      codexPattern,
      getAction: (turn, c) => {
        const move = sequence[(turn - 1) % sequence.length];
        if (move.type === 'attack') {
          let projectedDmg = move.val + (c.enemyStrength || 0);
          if (c.enemyWeak > 0) projectedDmg = Math.floor(projectedDmg * 0.75);
          if (c.playerVuln > 0) projectedDmg = Math.floor(projectedDmg * 1.5);
          return {
            type: 'attack',
            value: move.val,
            projectedDmg,
            text: localizeTemplate(COPY.enemyIntent.attack, { projectedDmg }),
            execute: (s, combat) => applyDamageToPlayer(move.val, s, combat)
          };
        }
        if (move.type === 'defend') {
          return {
            type: 'defend',
            value: move.val,
            text: localizeTemplate(COPY.enemyIntent.defend, { value: move.val }),
            execute: (s, combat) => { combat.enemyBlock += move.val; }
          };
        }
        return {
          type: 'buff',
          value: move.val,
          text: localizeTemplate(COPY.enemyIntent.buff, { value: move.val }),
          execute: (s, combat) => { combat.enemyStrength += move.val; }
        };
      }
    };
  };

  const generateEvent = () => {
    const goldCost = Math.floor(20 + Math.random() * 40 * hpMult);
    const hpCost = Math.floor(8 + Math.random() * 10 * hpMult);
    return {
      title: COPY.nodes.mysteriousDiscovery.title,
      type: "Event",
      spriteKey: "event_crystal",
      icon: <Sparkles className="w-12 h-12 text-blue-400" />,
      text: COPY.nodes.mysteriousDiscovery.text,
      choices: [
        { label: COPY.nodes.mysteriousDiscovery.takeRisk, effectText: localizeTemplate(COPY.nodes.mysteriousDiscovery.takeRiskEffect, { hpCost }), action: (state) => ({ hp: state.hp - hpCost, relics: appendRelicIfAvailable(state, pickRewardRelic(state)) }) },
        { label: COPY.nodes.mysteriousDiscovery.trade, effectText: localizeTemplate(COPY.nodes.mysteriousDiscovery.tradeEffect, { goldCost }), condition: (state) => state.gold >= goldCost, action: (state) => ({ gold: state.gold - goldCost, deck: [...state.deck, getRandomItem(getStateRewardCardPool(state))] }) },
        { label: COPY.nodes.mysteriousDiscovery.leave, effectText: COPY.nodes.mysteriousDiscovery.leaveEffect, action: (state) => ({}) }
      ]
    };
  };

  const normals = shuffle(ENEMY_LIBRARY.normal).slice(0, 10).map((template) => instantiateEnemy(template, 'normal'));
  const elites = shuffle(ENEMY_LIBRARY.elite).slice(0, 4).map((template) => instantiateEnemy(template, 'elite'));
  const bossTemplate = ENEMY_LIBRARY.boss.find((entry) => entry.act === act) || ENEMY_LIBRARY.boss[0];
  const boss = instantiateEnemy(bossTemplate, 'boss');
  const events = Array(5).fill(null).map(() => generateEvent());

  return { normals, elites, boss, events, allEnemies: [...normals, ...elites, boss] };
};

// --- ENCOUNTER GENERATORS ---

const getRewardNode = (enemy) => {
  const rewardTier = enemy?.tier || 'normal';
  const goldAmount = rewardTier === 'boss' ? 40 : rewardTier === 'elite' ? 30 : 25;
  const choices = [
    { label: COPY.nodes.reward.takeGold, effectText: COPY.nodes.reward.takeGoldEffect, action: (state) => ({ gold: state.gold + goldAmount }) },
    { label: COPY.nodes.reward.addCard, effectText: COPY.nodes.reward.addCardEffect, action: (state) => ({ deck: [...state.deck, pickRewardCard(state, rewardTier)] }) }
  ];

  if (rewardTier === 'elite' || rewardTier === 'boss') {
    choices.push({
      label: { en: 'Take Relic', ja: '�E��E��E��E��E�b�E�N�E�𓾂�', zh: '?�E��E�?�E��E�' },
      effectText: { en: 'Gain 1 relic.', ja: '�E��E��E��E��E�b�E�N�E��E�1�E���E��E�B', zh: '?�E��E�1�E��E�?�E��E��E�B' },
      action: (state) => ({ relics: appendRelicIfAvailable(state, pickRewardRelic(state, rewardTier)) })
    });
  } else {
    choices.push({ label: COPY.nodes.reward.bandage, effectText: COPY.nodes.reward.bandageEffect, action: (state) => ({ hp: Math.min(state.maxHp, state.hp + 15) }) });
  }

  return {
    title: COPY.nodes.reward.title,
    type: "Reward",
    spriteKey: "event_crystal",
    icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
    text: COPY.nodes.reward.text,
    choices
  };
};

const getActTransitionNode = (currentAct) => ({
  title: localizeTemplate(COPY.nodes.actTransition.title, { act: currentAct }),
  type: "Transition",
  spriteKey: "event_crystal",
  icon: <MapIcon className="w-16 h-16 text-yellow-400" />,
  text: COPY.nodes.actTransition.text,
  choices: [
    { label: COPY.nodes.actTransition.ascend, effectText: COPY.nodes.actTransition.ascendEffect, action: () => ({ startNextAct: true }) }
  ]
});

const getNeowNode = () => ({
  title: COPY.nodes.neow.title,
  type: "Event",
  spriteKey: "neow",
  icon: <Ghost className="w-12 h-12 text-emerald-400" />,
  text: COPY.nodes.neow.text,
  choices: [
    { label: COPY.nodes.neow.chooseCard, effectText: COPY.nodes.neow.chooseCardEffect, action: (state) => ({ deck: [...state.deck, getRandomItem(getStateRewardCardPool(state))] }) },
    { label: COPY.nodes.neow.sacrifice, effectText: COPY.nodes.neow.sacrificeEffect, action: (state) => ({ maxHp: state.maxHp - 8, hp: Math.min(state.hp, state.maxHp - 8), relics: appendRelicIfAvailable(state, pickRewardRelic(state)) }) },
    { label: COPY.nodes.neow.acceptGold, effectText: COPY.nodes.neow.acceptGoldEffect, action: (state) => ({ gold: state.gold + 100 }) }
  ]
});

const getRestSite = () => {
  const choices = [
    { label: COPY.nodes.rest.rest, effectText: COPY.nodes.rest.restEffect, action: (state) => ({ hp: Math.min(state.maxHp, state.hp + Math.floor(state.maxHp * 0.3)) }) },
    { label: COPY.nodes.rest.smith, effectText: COPY.nodes.rest.smithEffect, action: (state) => {
          if (state.deck.length === 0) return {};
          const newDeck = [...state.deck];
          const idx = Math.floor(Math.random() * newDeck.length);
          if (!newDeck[idx].endsWith('+')) newDeck[idx] = newDeck[idx] + "+";
          return { deck: newDeck };
      }},
    { label: COPY.nodes.rest.forage, effectText: COPY.nodes.rest.forageEffect, action: (state) => ({ gold: state.gold + 15, maxHp: state.maxHp + 2, hp: state.hp + 2 }) },
    { label: COPY.nodes.rest.dig, effectText: COPY.nodes.rest.digEffect, condition: (state) => state.relics.includes('Shovel'), action: (state) => ({ relics: appendRelicIfAvailable(state, pickRewardRelic(state)) }) }
  ];
  return {
    title: COPY.nodes.rest.title,
    type: "Rest",
    spriteKey: "rest_fire",
    icon: <Library className="w-12 h-12 text-orange-400" />,
    text: COPY.nodes.rest.text,
    choices: choices
  };
};

const getShop = () => ({
  title: COPY.nodes.shop.title,
  type: "Shop",
  spriteKey: "merchant",
  icon: <Coins className="w-12 h-12 text-yellow-400" />,
  text: COPY.nodes.shop.text,
  choices: [
    { label: COPY.nodes.shop.buyRelic, effectText: COPY.nodes.shop.buyRelicEffect, condition: (state) => state.gold >= 75, action: (state) => ({ gold: state.gold - 75, relics: appendRelicIfAvailable(state, pickRewardRelic(state)) }) },
    { label: COPY.nodes.shop.buyCard, effectText: COPY.nodes.shop.buyCardEffect, condition: (state) => state.gold >= 50, action: (state) => ({ gold: state.gold - 50, deck: [...state.deck, getRandomItem(getStateRewardCardPool(state))] }) },
    { label: COPY.nodes.shop.leave, effectText: COPY.nodes.shop.leaveEffect, action: (state) => ({}) }
  ]
});

const getDeathNode = () => ({
  title: COPY.nodes.death.title,
  type: "Game Over",
  spriteKey: "neow",
  icon: <Skull className="w-16 h-16 text-gray-500" />,
  text: COPY.nodes.death.text,
  choices: [{ label: COPY.nodes.death.retry, effectText: COPY.nodes.death.retryEffect, action: () => ({ reset: true }) }]
});

const getVictoryNode = () => ({
  title: COPY.nodes.victory.title,
  type: "Victory",
  spriteKey: "neow",
  icon: <Heart className="w-16 h-16 text-red-500 animate-pulse" />,
  text: COPY.nodes.victory.text,
  choices: [{ label: COPY.nodes.victory.playAgain, effectText: COPY.nodes.victory.playAgainEffect, action: () => ({ reset: true }) }]
});

const generateMapRoute = (runContent) => {
  const route = [];
  const createCombatNode = (enemy) => ({
    title: enemy.names, type: "Combat", spriteKey: enemy.spriteKey, icon: <AttackIcon className="w-12 h-12 text-red-500" />,
    text: COPY.nodes.combat.text,
    choices: [
      { label: COPY.nodes.combat.engage, effectText: COPY.nodes.combat.engageEffect, action: (state) => ({ startCombat: enemy.id, stayOnFloor: true }) },
      { label: COPY.nodes.combat.ambush, effectText: COPY.nodes.combat.ambushEffect, condition: (state) => state.hp > 5, action: (state) => ({ hp: state.hp - 5, startCombat: enemy.id, applyVuln: 2, stayOnFloor: true }) }
    ]
  });

  const createEliteNode = (enemy) => ({
    title: {
      en: COPY.nodes.elite.title.en.replace('{name}', enemy.names.en),
      ja: COPY.nodes.elite.title.ja.replace('{name}', enemy.names.ja),
      zh: COPY.nodes.elite.title.zh.replace('{name}', enemy.names.zh)
    },
    type: "Elite", spriteKey: enemy.spriteKey, icon: <Skull className="w-12 h-12 text-purple-500" />,
    text: COPY.nodes.elite.text,
    choices: [
      { label: COPY.nodes.elite.engage, effectText: COPY.nodes.elite.engageEffect, action: (state) => ({ startCombat: enemy.id, stayOnFloor: true }) },
      { label: COPY.nodes.elite.defend, effectText: COPY.nodes.elite.defendEffect, action: (state) => ({ startCombat: enemy.id, bonusBlock: 15, bonusEnemyStr: 1, stayOnFloor: true }) }
    ]
  });

  const createBossNode = (enemy) => ({
    title: {
      en: COPY.nodes.boss.title.en.replace('{name}', enemy.names.en),
      ja: COPY.nodes.boss.title.ja.replace('{name}', enemy.names.ja),
      zh: COPY.nodes.boss.title.zh.replace('{name}', enemy.names.zh)
    },
    type: "Boss", spriteKey: enemy.spriteKey, icon: <Skull className="w-16 h-16 text-green-500" />,
    text: COPY.nodes.boss.text,
    choices: [
      { label: COPY.nodes.boss.engage, effectText: COPY.nodes.boss.engageEffect, action: (state) => ({ startCombat: enemy.id, stayOnFloor: true }) },
      { label: COPY.nodes.boss.brace, effectText: COPY.nodes.boss.braceEffect, action: (state) => ({ startCombat: enemy.id, bonusBlock: 20, stayOnFloor: true }) }
    ]
  });

  let normalIdx = 0, eliteIdx = 0, eventIdx = 0;
  route.push(createCombatNode(runContent.normals[normalIdx++])); 
  
  const distribution = ['Combat', 'Combat', 'Event', 'Event', 'Shop', 'Elite', 'Rest', 'Rest'];
  for (let i = distribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
  }
  
  const eIdx = distribution.indexOf('Elite');
  if (eIdx < 2) {
    const safeIdx = Math.floor(Math.random() * 6) + 2; 
    [distribution[eIdx], distribution[safeIdx]] = [distribution[safeIdx], distribution[eIdx]];
  }

  distribution.forEach(type => {
    if (type === 'Combat') route.push(createCombatNode(runContent.normals[normalIdx++]));
    else if (type === 'Event') route.push(runContent.events[eventIdx++]); 
    else if (type === 'Shop') route.push(getShop());
    else if (type === 'Elite') route.push(createEliteNode(runContent.elites[eliteIdx++]));
    else if (type === 'Rest') route.push(getRestSite());
  });
  route.push(createBossNode(runContent.boss)); 
  return route;
};

// --- SPIRE ORGANIC BACKGROUND ---

const getBgLight = (type) => {
  switch(type) {
    case 'Combat': return 'from-red-900/60 via-red-950/40 to-transparent';
    case 'Event': return 'from-indigo-900/60 via-indigo-950/40 to-transparent';
    case 'Rest': return 'from-orange-600/30 via-orange-900/20 to-transparent';
    case 'Shop': return 'from-amber-500/30 via-amber-900/20 to-transparent';
    case 'Elite': return 'from-purple-900/70 via-purple-950/50 to-transparent';
    case 'Boss': return 'from-emerald-900/60 via-emerald-950/40 to-transparent';
    case 'Victory': return 'from-yellow-500/40 via-yellow-700/20 to-transparent';
    case 'Game Over': return 'from-red-950/60 via-black/50 to-transparent';
    default: return 'from-slate-700/40 via-slate-900/20 to-transparent';
  }
};

const ROOM_THEME = {
  Combat: {
    colors: ['#14070a', '#2b0d14', '#63171f', '#1f2937'],
    corridorGlow: '#ef4444',
    floor: '#1f1317',
    wall: '#2a1519',
    accent: '#f59e0b',
    feature: 'torches'
  },
  Event: {
    colors: ['#050816', '#111a38', '#312e81', '#0f172a'],
    corridorGlow: '#60a5fa',
    floor: '#13162a',
    wall: '#171d3b',
    accent: '#a78bfa',
    feature: 'crystals'
  },
  Rest: {
    colors: ['#1a0d07', '#3b1609', '#7c2d12', '#1f2937'],
    corridorGlow: '#fb923c',
    floor: '#2b1a0e',
    wall: '#40200f',
    accent: '#fde68a',
    feature: 'braziers'
  },
  Shop: {
    colors: ['#120d06', '#33210d', '#7c4a12', '#1f2937'],
    corridorGlow: '#fbbf24',
    floor: '#2a1d10',
    wall: '#3d2a13',
    accent: '#fde68a',
    feature: 'stalls'
  },
  Elite: {
    colors: ['#0c0618', '#231035', '#581c87', '#111827'],
    corridorGlow: '#c084fc',
    floor: '#180f26',
    wall: '#28123b',
    accent: '#f472b6',
    feature: 'obelisks'
  },
  Boss: {
    colors: ['#03130d', '#0d2e24', '#065f46', '#111827'],
    corridorGlow: '#34d399',
    floor: '#0d1e19',
    wall: '#123027',
    accent: '#a7f3d0',
    feature: 'altar'
  },
  Victory: {
    colors: ['#1c1404', '#5b4308', '#ca8a04', '#1f2937'],
    corridorGlow: '#fde047',
    floor: '#2a240e',
    wall: '#42330e',
    accent: '#fef08a',
    feature: 'stars'
  },
  'Game Over': {
    colors: ['#050505', '#17090c', '#3f0d12', '#020617'],
    corridorGlow: '#b91c1c',
    floor: '#10090a',
    wall: '#1a0f12',
    accent: '#f87171',
    feature: 'embers'
  },
  Transition: {
    colors: ['#050816', '#152246', '#1d4ed8', '#020617'],
    corridorGlow: '#60a5fa',
    floor: '#111827',
    wall: '#172554',
    accent: '#93c5fd',
    feature: 'crystals'
  },
  default: {
    colors: ['#020617', '#0f172a', '#1e293b', '#111827'],
    corridorGlow: '#94a3b8',
    floor: '#111827',
    wall: '#1e293b',
    accent: '#cbd5e1',
    feature: 'pillars'
  }
};

const hashSeed = (value) => {
  const text = `${value || 'default'}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
};

const seededValue = (seed, index) => {
  const x = Math.sin(seed * 0.001 + index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const getRoomTheme = (type) => ROOM_THEME[type] || ROOM_THEME.default;

const SpireBackground = ({ roomType, isMoving, lightClass, transitionMode = 'straight' }) => {
  const theme = getRoomTheme(roomType);
  const seed = hashSeed(roomType);
  const roomId = `${roomType || 'default'}`.replace(/\s+/g, '-').toLowerCase();
  const props = Array.from({ length: 9 }, (_, index) => {
    const depth = index + 1;
    return {
      x: 12 + seededValue(seed, index) * 76,
      y: 22 + seededValue(seed, index + 20) * 42,
      scale: 0.35 + depth * 0.08,
      opacity: 0.12 + depth * 0.05,
      width: 8 + seededValue(seed, index + 40) * 10,
      height: 12 + seededValue(seed, index + 60) * 24,
      rotate: -12 + seededValue(seed, index + 80) * 24
    };
  });
  const ambientParticles = Array.from({ length: 14 }, (_, index) => ({
    left: 6 + seededValue(seed, index + 101) * 88,
    top: 12 + seededValue(seed, index + 131) * 72,
    size: 4 + seededValue(seed, index + 151) * 10,
    delay: seededValue(seed, index + 171) * 4.5,
    duration: 5.5 + seededValue(seed, index + 191) * 6.5,
    opacity: 0.16 + seededValue(seed, index + 211) * 0.3
  }));
  const glowOrbs = Array.from({ length: 6 }, (_, index) => ({
    left: 10 + seededValue(seed, index + 241) * 80,
    top: 10 + seededValue(seed, index + 261) * 44,
    width: 10 + seededValue(seed, index + 281) * 24,
    height: 18 + seededValue(seed, index + 301) * 30,
    delay: seededValue(seed, index + 321) * 3,
    duration: 3.8 + seededValue(seed, index + 341) * 3.2,
    opacity: 0.08 + seededValue(seed, index + 361) * 0.16
  }));
  const runeBands = Array.from({ length: 4 }, (_, index) => ({
    left: 18 + seededValue(seed, index + 381) * 64,
    top: 14 + seededValue(seed, index + 401) * 26,
    width: 20 + seededValue(seed, index + 421) * 28,
    delay: seededValue(seed, index + 441) * 2.5,
    duration: 6.5 + seededValue(seed, index + 461) * 2.5,
    rotate: -6 + seededValue(seed, index + 481) * 12
  }));
  const shaftBeams = Array.from({ length: 3 }, (_, index) => ({
    left: 14 + seededValue(seed, index + 501) * 72,
    width: 10 + seededValue(seed, index + 521) * 12,
    delay: seededValue(seed, index + 541) * 2.8,
    duration: 7 + seededValue(seed, index + 561) * 3
  }));
  const floorBands = Array.from({ length: 4 }, (_, index) => ({
    left: 12 + seededValue(seed, index + 581) * 58,
    width: 18 + seededValue(seed, index + 601) * 18,
    delay: seededValue(seed, index + 621) * 3.5,
    duration: 6 + seededValue(seed, index + 641) * 3
  }));
  const crystalColumns = Array.from({ length: 5 }, (_, index) => ({
    left: 8 + seededValue(seed, index + 661) * 78,
    bottom: 18 + seededValue(seed, index + 681) * 18,
    width: 5 + seededValue(seed, index + 701) * 6,
    height: 18 + seededValue(seed, index + 721) * 30,
    delay: seededValue(seed, index + 741) * 3.4,
    duration: 5.8 + seededValue(seed, index + 761) * 3.4
  }));
  const wallPanels = Array.from({ length: 4 }, (_, index) => ({
    side: index % 2 === 0 ? 'left' : 'right',
    top: 12 + seededValue(seed, index + 781) * 46,
    width: 9 + seededValue(seed, index + 801) * 8,
    height: 14 + seededValue(seed, index + 821) * 16,
    delay: seededValue(seed, index + 841) * 2.8,
    duration: 5 + seededValue(seed, index + 861) * 2.8
  }));

  const transitionClass = transitionMode === 'straight' ? 'animate-room-push-forward' : '';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${lightClass} opacity-90 transition-colors duration-1000 mix-blend-screen`}></div>
      <div className={`absolute inset-0 transition-transform duration-700 ${isMoving ? transitionClass : ''}`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-95" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`room-bg-${roomId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.colors[0]} />
              <stop offset="35%" stopColor={theme.colors[1]} />
              <stop offset="70%" stopColor={theme.colors[2]} />
              <stop offset="100%" stopColor={theme.colors[3]} />
            </linearGradient>
            <radialGradient id={`corridor-glow-${roomId}`} cx="50%" cy="28%" r="55%">
              <stop offset="0%" stopColor={theme.corridorGlow} stopOpacity="0.55" />
              <stop offset="55%" stopColor={theme.corridorGlow} stopOpacity="0.12" />
              <stop offset="100%" stopColor={theme.corridorGlow} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#room-bg-${roomId})`} />
          <ellipse cx="50" cy="28" rx="22" ry="12" fill={`url(#corridor-glow-${roomId})`} />
          <polygon points="0,100 21,68 39,26 0,0" fill={theme.wall} opacity="0.92" />
          <polygon points="100,100 79,68 61,26 100,0" fill={theme.wall} opacity="0.92" />
          <polygon points="18,100 82,100 61,26 39,26" fill={theme.floor} opacity="0.95" />
          <polygon points="39,26 61,26 56,10 44,10" fill={theme.accent} opacity="0.18" />
          <line x1="50" y1="26" x2="50" y2="100" stroke={theme.accent} strokeOpacity="0.18" strokeWidth="0.4" />
          {props.map((item, index) => (
            <g key={index} transform={`translate(${item.x} ${item.y}) rotate(${item.rotate}) scale(${item.scale})`}>
              {theme.feature === 'torches' && (
                <>
                  <rect x="-1.4" y="-2" width="2.8" height={item.height * 0.55} rx="0.6" fill={theme.wall} opacity={item.opacity} />
                  <circle cx="0" cy="-3.2" r="2.6" fill={theme.accent} opacity={item.opacity + 0.1} />
                </>
              )}
              {theme.feature === 'crystals' && (
                <polygon points={`0,-${item.height} ${item.width * 0.45},0 0,${item.height * 0.65} -${item.width * 0.45},0`} fill={theme.accent} opacity={item.opacity} />
              )}
              {theme.feature === 'braziers' && (
                <>
                  <rect x={`-${item.width * 0.18}`} y="0" width={item.width * 0.36} height={item.height * 0.48} fill={theme.wall} opacity={item.opacity} />
                  <circle cx="0" cy={`-${item.height * 0.2}`} r={item.width * 0.38} fill={theme.accent} opacity={item.opacity + 0.08} />
                </>
              )}
              {theme.feature === 'stalls' && (
                <>
                  <rect x={`-${item.width * 0.55}`} y={`-${item.height * 0.15}`} width={item.width * 1.1} height={item.height * 0.38} fill={theme.wall} opacity={item.opacity} />
                  <polygon points={`-${item.width * 0.7},-${item.height * 0.15} 0,-${item.height * 0.65} ${item.width * 0.7},-${item.height * 0.15}`} fill={theme.accent} opacity={item.opacity + 0.05} />
                </>
              )}
              {theme.feature === 'obelisks' && (
                <polygon points={`0,-${item.height} ${item.width * 0.32},-${item.height * 0.2} ${item.width * 0.2},${item.height * 0.7} -${item.width * 0.2},${item.height * 0.7} -${item.width * 0.32},-${item.height * 0.2}`} fill={theme.accent} opacity={item.opacity} />
              )}
              {theme.feature === 'altar' && (
                <>
                  <rect x={`-${item.width * 0.5}`} y={`-${item.height * 0.1}`} width={item.width} height={item.height * 0.34} fill={theme.wall} opacity={item.opacity} />
                  <circle cx="0" cy={`-${item.height * 0.45}`} r={item.width * 0.38} fill={theme.accent} opacity={item.opacity + 0.12} />
                </>
              )}
              {theme.feature === 'stars' && (
                <>
                  <circle cx="0" cy="0" r={item.width * 0.18} fill={theme.accent} opacity={item.opacity + 0.12} />
                  <path d={`M 0 -${item.height * 0.5} L 0 ${item.height * 0.5} M -${item.width * 0.5} 0 L ${item.width * 0.5} 0`} stroke={theme.accent} strokeOpacity={item.opacity} strokeWidth="0.9" />
                </>
              )}
              {theme.feature === 'embers' && (
                <circle cx="0" cy="0" r={item.width * 0.24} fill={theme.accent} opacity={item.opacity + 0.08} />
              )}
              {theme.feature === 'pillars' && (
                <rect x={`-${item.width * 0.22}`} y={`-${item.height * 0.8}`} width={item.width * 0.44} height={item.height * 1.25} fill={theme.wall} opacity={item.opacity} />
              )}
            </g>
          ))}
        </svg>
      </div>
      {isMoving && transitionMode === 'corner-left' && (
        <div className="absolute inset-0 z-30 overflow-hidden">
          <div
            className="absolute inset-y-0 right-[-8%] w-[72%] animate-corner-left-wall"
            style={{ background: `linear-gradient(90deg, ${theme.wall} 0%, ${theme.colors[0]} 55%, rgba(0,0,0,0.98) 100%)`, clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)' }}
          />
          <div
            className="absolute inset-y-0 left-0 w-[55%] animate-corner-left-opening"
            style={{ background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, ${theme.corridorGlow}22 40%, ${theme.colors[1]} 100%)`, clipPath: 'polygon(0 0, 72% 18%, 48% 100%, 0 100%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[75%] h-[42%] animate-corner-left-floor"
            style={{ background: `linear-gradient(180deg, ${theme.floor}00 0%, ${theme.floor} 100%)`, clipPath: 'polygon(0 100%, 100% 68%, 78% 0, 0 24%)' }}
          />
        </div>
      )}
        {isMoving && transitionMode === 'corner-right' && (
          <div className="absolute inset-0 z-30 overflow-hidden">
          <div
            className="absolute inset-y-0 left-[-8%] w-[72%] animate-corner-right-wall"
            style={{ background: `linear-gradient(270deg, ${theme.wall} 0%, ${theme.colors[0]} 55%, rgba(0,0,0,0.98) 100%)`, clipPath: 'polygon(0 0, 72% 0, 100% 100%, 0 100%)' }}
          />
          <div
            className="absolute inset-y-0 right-0 w-[55%] animate-corner-right-opening"
            style={{ background: `linear-gradient(270deg, rgba(0,0,0,0) 0%, ${theme.corridorGlow}22 40%, ${theme.colors[1]} 100%)`, clipPath: 'polygon(28% 18%, 100% 0, 100% 100%, 52% 100%)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-[75%] h-[42%] animate-corner-right-floor"
            style={{ background: `linear-gradient(180deg, ${theme.floor}00 0%, ${theme.floor} 100%)`, clipPath: 'polygon(0 68%, 100% 100%, 100% 24%, 22% 0)' }}
          />
          </div>
        )}
        <div className="absolute inset-0 overflow-hidden">
          {theme.feature === 'torches' && (
            <>
              <div
                className="absolute left-[14%] right-[14%] bottom-[6%] h-[28%] animate-magma-sheet"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, ${theme.floor} 12%, ${theme.corridorGlow}55 42%, ${theme.accent}88 60%, ${theme.corridorGlow}66 74%, ${theme.floor} 100%)`,
                  clipPath: 'polygon(0 100%, 14% 54%, 30% 68%, 45% 34%, 62% 58%, 78% 24%, 100% 100%)',
                  filter: 'blur(2px)'
                }}
              />
              {floorBands.map((band, i) => (
                <div
                  key={`magma-${i}`}
                  className="absolute bottom-[10%] h-[16%] animate-magma-river"
                  style={{
                    left: `${band.left}%`,
                    width: `${band.width}%`,
                    background: `linear-gradient(90deg, transparent 0%, ${theme.accent}66 24%, ${theme.corridorGlow}aa 50%, ${theme.accent}66 76%, transparent 100%)`,
                    clipPath: 'polygon(0 70%, 20% 42%, 42% 58%, 66% 28%, 86% 44%, 100% 66%, 100% 100%, 0 100%)',
                    boxShadow: `0 0 22px ${theme.corridorGlow}44`,
                    animationDelay: `${band.delay}s`,
                    animationDuration: `${band.duration}s`
                  }}
                />
              ))}
            </>
          )}
          {(theme.feature === 'torches' || theme.feature === 'braziers' || theme.feature === 'embers') && ambientParticles.map((particle, i) => (
            <div
              key={`ember-${i}`}
              className={`absolute rounded-full blur-[1px] ${theme.feature === 'embers' ? 'bg-red-500/45 animate-drift-ash' : 'bg-amber-400/50 animate-float-ember'}`}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                opacity: particle.opacity,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
          {theme.feature === 'crystals' && (
            <>
              {crystalColumns.map((column, i) => (
                <div
                  key={`crystal-column-${i}`}
                  className="absolute animate-crystal-column"
                  style={{
                    left: `${column.left}%`,
                    bottom: `${column.bottom}%`,
                    width: `${column.width}%`,
                    height: `${column.height}%`,
                    clipPath: 'polygon(50% 0, 92% 18%, 82% 100%, 18% 100%, 8% 18%)',
                    background: `linear-gradient(180deg, ${theme.accent}ee 0%, ${theme.corridorGlow}99 38%, ${theme.colors[1]}55 100%)`,
                    boxShadow: `0 0 20px ${theme.accent}55`,
                    filter: 'saturate(1.15)',
                    animationDelay: `${column.delay}s`,
                    animationDuration: `${column.duration}s`
                  }}
                />
              ))}
              {glowOrbs.map((orb, i) => (
                <div
                  key={`crystal-glow-${i}`}
                  className="absolute rounded-full animate-crystal-glow mix-blend-screen"
                  style={{
                    left: `${orb.left}%`,
                    top: `${orb.top}%`,
                    width: `${orb.width}px`,
                    height: `${orb.height}px`,
                    opacity: orb.opacity,
                    background: `radial-gradient(circle at 50% 35%, ${theme.accent}88 0%, ${theme.corridorGlow}44 45%, transparent 75%)`,
                    filter: 'blur(8px)',
                    animationDelay: `${orb.delay}s`,
                    animationDuration: `${orb.duration}s`
                  }}
                />
              ))}
              {shaftBeams.map((beam, i) => (
                <div
                  key={`beam-${i}`}
                  className="absolute top-0 h-[78%] animate-arcane-shaft"
                  style={{
                    left: `${beam.left}%`,
                    width: `${beam.width}%`,
                    background: `linear-gradient(180deg, ${theme.accent}2e 0%, ${theme.corridorGlow}12 55%, transparent 100%)`,
                    filter: 'blur(3px)',
                    animationDelay: `${beam.delay}s`,
                    animationDuration: `${beam.duration}s`
                  }}
                />
              ))}
            </>
          )}
          {theme.feature === 'braziers' && (
            <>
              <div
                className="absolute left-[18%] right-[18%] bottom-[10%] h-[24%] animate-heat-sheet"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, ${theme.accent}18 35%, ${theme.corridorGlow}22 58%, transparent 100%)`,
                  clipPath: 'polygon(8% 100%, 18% 62%, 34% 68%, 48% 42%, 61% 62%, 74% 38%, 92% 100%)',
                  filter: 'blur(8px)'
                }}
              />
              {wallPanels.map((panel, i) => (
                <div
                  key={`rest-glow-${i}`}
                  className="absolute animate-brazier-flicker"
                  style={{
                    [panel.side]: '8%',
                    top: `${panel.top}%`,
                    width: `${panel.width}%`,
                    height: `${panel.height}%`,
                    background: `radial-gradient(circle at 50% 40%, ${theme.accent}55 0%, ${theme.corridorGlow}22 48%, transparent 75%)`,
                    filter: 'blur(10px)',
                    animationDelay: `${panel.delay}s`,
                    animationDuration: `${panel.duration}s`
                  }}
                />
              ))}
            </>
          )}
          {theme.feature === 'stalls' && (
            <>
              {wallPanels.map((panel, i) => (
                <div
                  key={`banner-${i}`}
                  className="absolute animate-banner-sway"
                  style={{
                    [panel.side]: '4%',
                    top: `${panel.top}%`,
                    width: `${panel.width}%`,
                    height: `${panel.height}%`,
                    background: `linear-gradient(180deg, ${theme.accent}88 0%, ${theme.colors[1]}bb 60%, ${theme.colors[0]} 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 86% 100%, 50% 84%, 14% 100%)',
                    opacity: 0.65,
                    animationDelay: `${panel.delay}s`,
                    animationDuration: `${panel.duration}s`
                  }}
                />
              ))}
              {glowOrbs.map((orb, i) => (
                <div
                  key={`lantern-${i}`}
                  className="absolute rounded-full animate-lantern-sway"
                  style={{
                    left: `${orb.left}%`,
                    top: `${orb.top}%`,
                    width: `${Math.max(8, orb.width * 0.5)}px`,
                    height: `${Math.max(10, orb.height * 0.5)}px`,
                    background: `radial-gradient(circle at 50% 45%, ${theme.accent}cc 0%, ${theme.corridorGlow}88 38%, transparent 72%)`,
                    boxShadow: `0 0 24px ${theme.accent}55`,
                    animationDelay: `${orb.delay}s`,
                    animationDuration: `${orb.duration}s`
                  }}
                />
              ))}
              {ambientParticles.slice(0, 10).map((particle, i) => (
                <div
                  key={`dust-${i}`}
                  className="absolute rounded-full bg-yellow-100/20 animate-market-dust"
                  style={{
                    width: `${Math.max(3, particle.size * 0.55)}px`,
                    height: `${Math.max(3, particle.size * 0.55)}px`,
                    left: `${particle.left}%`,
                    top: `${particle.top + 10}%`,
                    animationDelay: `${particle.delay}s`,
                    animationDuration: `${particle.duration + 2}s`
                  }}
                />
              ))}
            </>
          )}
          {theme.feature === 'obelisks' && runeBands.map((band, i) => (
            <div
              key={`rune-${i}`}
              className="absolute animate-rune-drift"
              style={{
                left: `${band.left}%`,
                top: `${band.top}%`,
                width: `${band.width}%`,
                height: '10%',
                transform: `rotate(${band.rotate}deg)`,
                borderTop: `1px solid ${theme.accent}55`,
                borderBottom: `1px solid ${theme.corridorGlow}33`,
                boxShadow: `0 0 18px ${theme.accent}22`,
                animationDelay: `${band.delay}s`,
              animationDuration: `${band.duration}s`
            }}
          />
          ))}
          {theme.feature === 'obelisks' && (
            <div
              className="absolute left-[28%] right-[28%] bottom-[12%] h-[30%] animate-obelisk-core"
              style={{
                background: `radial-gradient(ellipse at center, ${theme.accent}18 0%, ${theme.corridorGlow}22 45%, transparent 78%)`,
                filter: 'blur(12px)'
              }}
            />
          )}
          {theme.feature === 'altar' && (
            <>
              <div
                className="absolute left-[20%] right-[20%] bottom-[18%] h-[22%] animate-altar-breath"
                style={{
                  background: `radial-gradient(ellipse at center, ${theme.accent}28 0%, ${theme.corridorGlow}12 45%, transparent 78%)`,
                  filter: 'blur(16px)'
                }}
              />
              {ambientParticles.slice(0, 12).map((particle, i) => (
                <div
                  key={`mist-${i}`}
                  className="absolute rounded-full animate-boss-mist"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top + 18}%`,
                    width: `${particle.size * 3.4}px`,
                    height: `${particle.size * 1.7}px`,
                    opacity: particle.opacity * 0.75,
                    background: `radial-gradient(circle at 50% 50%, ${theme.accent}30 0%, ${theme.corridorGlow}18 55%, transparent 78%)`,
                    filter: 'blur(10px)',
                    animationDelay: `${particle.delay}s`,
                    animationDuration: `${particle.duration + 2.5}s`
                  }}
                />
              ))}
            </>
          )}
          {theme.feature === 'stars' && ambientParticles.map((particle, i) => (
            <div
              key={`star-${i}`}
              className="absolute animate-star-twinkle"
              style={{
                left: `${particle.left}%`,
                top: `${Math.max(6, particle.top - 8)}%`,
                width: `${Math.max(5, particle.size)}px`,
                height: `${Math.max(5, particle.size)}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration - 1}s`
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at center, ${theme.accent}dd 0%, ${theme.accent}66 35%, transparent 72%)`,
                  boxShadow: `0 0 18px ${theme.accent}66`
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: '150%',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent 0%, ${theme.accent}cc 50%, transparent 100%)`
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: '1px',
                  height: '150%',
                  background: `linear-gradient(180deg, transparent 0%, ${theme.accent}cc 50%, transparent 100%)`
                }}
              />
            </div>
          ))}
          {theme.feature === 'stars' && (
            <div
              className="absolute inset-x-[10%] top-[8%] h-[24%] animate-victory-sky"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.accent}22 18%, ${theme.corridorGlow}30 50%, ${theme.accent}22 82%, transparent 100%)`,
                filter: 'blur(12px)'
              }}
            />
          )}
          {theme.feature === 'embers' && (
            <div
              className="absolute inset-x-0 bottom-[8%] h-[34%] animate-smoke-sheet"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${theme.colors[1]}66 40%, ${theme.colors[0]}cc 100%)`,
                filter: 'blur(10px)'
              }}
            />
          )}
          {(theme.feature === 'pillars' || roomType === 'Transition') && ambientParticles.map((particle, i) => (
            <div
              key={`dusty-${i}`}
              className="absolute rounded-full bg-slate-200/10 animate-hall-dust"
              style={{
                width: `${Math.max(2, particle.size * 0.45)}px`,
                height: `${Math.max(2, particle.size * 0.45)}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration + 1.5}s`
              }}
            />
          ))}
          {(theme.feature === 'pillars' || roomType === 'Transition') && shaftBeams.map((beam, i) => (
            <div
              key={`hall-beam-${i}`}
              className="absolute top-0 h-[100%] animate-hall-beam"
              style={{
                left: `${beam.left}%`,
                width: `${Math.max(6, beam.width * 0.6)}%`,
                background: `linear-gradient(180deg, transparent 0%, ${theme.corridorGlow}12 30%, ${theme.accent}18 56%, transparent 100%)`,
                filter: 'blur(5px)',
                animationDelay: `${beam.delay}s`,
                animationDuration: `${beam.duration}s`
              }}
            />
          ))}
        </div>
        <div className={`absolute inset-0 bg-black ${isMoving ? 'animate-room-fade-veil z-50' : 'opacity-0 z-0'}`}></div>
      </div>
    );
  };

// --- HAND-CRAFTED 16x16 PIXEL SPRITES ENGINE ---

const PIXEL_SPRITES = {
  player_ironclad: [
    "0000003300000000", "0000034433000000", "0000344444300000", "0003442244430000",
    "0003334433330000", "0003111111130000", "0031111111113000", "0311111111113300",
    "0311222211114300", "0311111111114300", "0031111111134300", "0003111111334300",
    "0003411134443000", "0033403330340000", "0033003030330000", "0003000000030000"
  ],
  player_silent: [
    "0000003300000000", "0000031133000000", "0000311111300000", "0003113311130000",
    "0003331133330000", "0031111111130000", "0311111111113000", "0311111111113300",
    "0311333311114300", "0031111111134300", "0003111111334300", "0003311133333000",
    "0033300033330000", "0033000003300000", "0300000000330000", "0000000000030000"
  ],
  player_defect: [
    "0000003300000000", "0000034433000000", "0000342244300000", "0000344444300000",
    "0000034433000000", "0000311113000000", "0003111111300000", "0031111111134000",
    "0031121111124000", "0031111111134000", "0003111111334000", "0003311133330000",
    "0033303303333000", "0030003300030000", "0000030003000000", "0000300000300000"
  ],
  player_watcher: [
    "0000003300000000", "0000034433000000", "0000342244300000", "0000344444300000",
    "0000034433300000", "0000311111330000", "0003111111133000", "0031111111113300",
    "0031111111114300", "0003111111134300", "0003111111334300", "0003311133333000",
    "0033303303333000", "0030003300033000", "0000003000003000", "0000030000030000"
  ],
  player_necrobinder: [
    "0000003300000000", "0000031133000000", "0000314411300000", "0000311111330000",
    "0000031133333000", "0000311111130000", "0003111111133000", "0031111111113300",
    "0031111111111300", "0003111111131300", "0003111111331300", "0003311133333000",
    "0033303300333000", "0030003300003000", "0000030000000300", "0000300000000030"
  ],
  enemy_crab: [
    "0000000000000000", "0003000000030000", "0034300000343000", "0344433333444300",
    "3411111111111430", "3116111111116113", "3111111331111113", "0311113333111110",
    "0031111111111300", "0311111441111130", "3111333333331113", "3300311111300333",
    "3003003333003003", "0030300000030300", "0003000000030000", "0033000000330000"
  ],
  enemy_demon: [
    "0030000000003000", "0343000000034300", "0034300000343000", "0003433333430000",
    "0003111111130000", "0031511111513000", "0311551115511300", "3111111111111113",
    "3113311111133113", "0311133333311130", "0031111551111300", "0003311111133000",
    "0000310000130000", "0003300000033000", "0033000000003300", "0303000000030030"
  ],
  enemy_skeleton: [
    "0000003300000000", "0000034433000000", "0000344244300000", "0000344444300000",
    "0000033333000000", "0000322222300000", "0003222222230000", "0032232232223000",
    "0322303303222300", "0033003300333300", "0000311111303000", "0000031130003000",
    "0000313313000000", "0000310013000000", "0003300033000000", "0033300000333000"
  ],
  elite_dragon: [
    "0000030000003000", "0000343000034300", "0003414300341430", "0000343333434300",
    "0033311111113300", "0311111111111130", "3116611111111113", "3111111111111113",
    "0333111111111330", "0003111555511300", "0033115000511330", "0311500000005113",
    "0333000000003330", "0030330000330300", "0300000000000030", "3000000000000003"
  ],
  boss_slime: [
    "0000003333330000", "0000331111113300", "0003111111111130", "0031111444411113",
    "0311114444441110", "3111144444444113", "3113144334434113", "3113531444135313",
    "3113144444443113", "3111111111111113", "3111113333111113", "0311111111111130",
    "0031111111111300", "0003333333333300", "0003300000003300", "0033000000003300"
  ],
  merchant: [
    "0000033300000000", "0000322230000000", "0000323230000000", "0000322230000000",
    "0003111113000000", "0031111111300000", "0311111111130000", "0311111111133300",
    "0031111111344430", "0003333333444443", "0003111130344430", "0003111130033300",
    "0031133113000000", "0031300313000000", "0333000033300000", "0000000000000000"
  ],
  event_crystal: [
    "0000003300000000", "0000031130000000", "0000311223000000", "0003112222300000",
    "0031122222230000", "0311222222223000", "0312222222223000", "0032222222230000",
    "0003222222300000", "0000322223000000", "0000032230000000", "0000003300000000",
    "0000000000000000", "0000000000000000", "0000000000000000", "0000000000000000"
  ],
  rest_fire: [
    "0000000000000000", "0000000000000000", "0000000000000000", "0000000000000000",
    "0000000000000000", "0000000000000000", "0000000200000000", "0000002120000000",
    "0000002120000000", "0000021112000000", "0000211111200000", "0002111111120000",
    "0021111111112000", "0333333333333300", "3444444444444430", "3333333333333330"
  ],
  neow: [
    "0000003333000000", "0000031111300000", "0000311111130000", "0003111111113000",
    "0003111111113000", "0031131111311300", "0031343113431300", "0031131111311300",
    "0003111111113000", "0003113333113000", "0000311111130000", "0000033333300000",
    "0000000000000000", "0000000000000000", "0000000000000000", "0000000000000000"
  ]
};

const getPalette = (spriteKey, charType) => {
  if (spriteKey.startsWith('player')) {
     switch(charType) {
        case 'IRONCLAD': return {1: '#9f1239', 2: '#fbbf24', 3: '#111827', 4: '#f8fafc', 5: '#7c2d12'};
        case 'SILENT': return {1: '#166534', 2: '#bbf7d0', 3: '#111827', 4: '#dcfce7', 5: '#14532d'};
        case 'DEFECT': return {1: '#1d4ed8', 2: '#67e8f9', 3: '#0f172a', 4: '#e2e8f0', 5: '#0f766e'};
        case 'WATCHER': return {1: '#7e22ce', 2: '#fde68a', 3: '#111827', 4: '#fdf4ff', 5: '#c2410c'};
        case 'NECROBINDER': return {1: '#312e81', 2: '#22d3ee', 3: '#0f172a', 4: '#e5e7eb', 5: '#4c1d95'};
        default: return {1: '#dc2626', 2: '#fbbf24', 3: '#020617', 4: '#cbd5e1', 5: '#7c2d12'};
     }
  }
  if (spriteKey === 'enemy_crab') return {1: '#b45309', 2: '#fb923c', 3: '#431407', 4: '#fdba74', 5: '#7c2d12', 6: '#fef3c7'};
  if (spriteKey === 'enemy_demon') return {1: '#dc2626', 2: '#111827', 3: '#3f0d12', 4: '#f59e0b', 5: '#fecaca'};
  if (spriteKey === 'enemy_skeleton') return {1: '#e5e7eb', 2: '#94a3b8', 3: '#0f172a', 4: '#f8fafc', 5: '#b91c1c', 6: '#38bdf8'};
  if (spriteKey === 'elite_dragon') return {1: '#15803d', 2: '#facc15', 3: '#14532d', 4: '#fde68a', 5: '#ef4444', 6: '#7f1d1d'};
  if (spriteKey === 'boss_slime') return {1: '#65a30d', 2: '#fef08a', 3: '#365314', 4: '#a855f7', 5: '#fdf4ff'};
  if (spriteKey === 'event_crystal') return {1: '#22d3ee', 2: '#0284c7', 3: '#082f49'};
  if (spriteKey === 'rest_fire') return {1: '#fef08a', 2: '#f97316', 3: '#451a03', 4: '#78350f'};
  if (spriteKey === 'merchant') return {1: '#3b82f6', 2: '#facc15', 3: '#1e3a8a', 4: '#bfdbfe'};
  if (spriteKey === 'neow') return {1: '#14b8a6', 2: '#083344', 3: '#164e63', 4: '#cffafe'};
  return {1: '#64748b', 2: '#38bdf8', 3: '#0f172a', 4: '#94a3b8'};
};

const PixelSprite = ({ spriteKey, charType, className = "" }) => {
  const grid = PIXEL_SPRITES[spriteKey] || PIXEL_SPRITES.enemy_skeleton;
  const palette = getPalette(spriteKey, charType);

  return (
    <svg viewBox={`0 0 16 16`} className={className} style={{ shapeRendering: 'crispEdges', overflow: 'visible' }}>
      {grid.map((row, y) => 
        row.split('').map((cell, x) => {
          if (cell === '0') return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1.05" height="1.05" fill={palette[cell]} />
        })
      )}
    </svg>
  );
};

const getCombatPercent = (value, max) => {
  if (!max || max <= 0) return 0;
  return Math.max(0, (value / max) * 100);
};

const getPredictionRange = (currentPercent, nextPercent, isRightAligned, type) => {
  if (type === 'loss') {
    if (nextPercent >= currentPercent) return null;
    return isRightAligned
      ? { start: 100 - currentPercent, end: 100 - nextPercent }
      : { start: nextPercent, end: currentPercent };
  }

  if (nextPercent <= currentPercent) return null;
  return isRightAligned
    ? { start: 100 - nextPercent, end: 100 - currentPercent }
    : { start: currentPercent, end: nextPercent };
};

const CombatVitals = ({
  sectionLabel,
  title,
  hp,
  maxHp,
  block,
  blockLabel = 'Block',
  align = 'left',
  previewHp = null,
  previewBlock = null,
  incomingHp = null,
  incomingBlock = null,
  subline = null,
  footer = null,
  statuses = []
}) => {
  const isRightAligned = align === 'right';
  const hpPercent = Math.min(100, getCombatPercent(hp, maxHp));
  const blockPercent = getCombatPercent(block, maxHp);
  const cardPreviewHpPercent = previewHp == null ? hpPercent : Math.min(100, getCombatPercent(previewHp, maxHp));
  const cardPreviewBlockPercent = previewBlock == null ? blockPercent : getCombatPercent(previewBlock, maxHp);
  const incomingHpPercent = incomingHp == null ? hpPercent : Math.min(100, getCombatPercent(incomingHp, maxHp));
  const incomingBlockPercent = incomingBlock == null ? blockPercent : getCombatPercent(incomingBlock, maxHp);

  const hpPreviewGain = getPredictionRange(hpPercent, cardPreviewHpPercent, isRightAligned, 'gain');
  const hpPreviewLoss = getPredictionRange(hpPercent, cardPreviewHpPercent, isRightAligned, 'loss');
  const hpIncomingLoss = getPredictionRange(hpPercent, incomingHpPercent, isRightAligned, 'loss');
  const blockPreviewGain = getPredictionRange(blockPercent, cardPreviewBlockPercent, isRightAligned, 'gain');
  const blockPreviewLoss = getPredictionRange(blockPercent, cardPreviewBlockPercent, isRightAligned, 'loss');
  const blockIncomingLoss = getPredictionRange(blockPercent, incomingBlockPercent, isRightAligned, 'loss');

  return (
    <div className={`flex flex-col gap-3 ${isRightAligned ? 'items-end text-right' : 'items-start text-left'}`}>
      <div className="space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500">{sectionLabel}</div>
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
      </div>

      <div className={`w-full max-w-[18rem] ${isRightAligned ? 'ml-auto' : ''}`}>
        <div className="relative pt-1.5">
          {Math.max(block, previewBlock || 0, incomingBlock || 0) > 0 && (
            <>
              {Math.max(block, incomingBlock || 0) > 0 && (
                <div
                  className={`absolute top-0 h-[calc(100%-0.375rem)] rounded-full border-2 border-sky-400/85 bg-sky-300/10 shadow-[0_0_10px_rgba(56,189,248,0.35)] pointer-events-none ${isRightAligned ? 'right-0' : 'left-0'}`}
                  style={{ width: `${Math.max(blockPercent, incomingBlockPercent)}%` }}
                />
              )}
              {blockPreviewGain && (
                <div
                  className="absolute top-0 h-[calc(100%-0.375rem)] rounded-full border-2 border-sky-200/70 bg-sky-300/10 pointer-events-none"
                  style={{ left: `${blockPreviewGain.start}%`, width: `${blockPreviewGain.end - blockPreviewGain.start}%` }}
                />
              )}
              {blockPreviewLoss && (
                <div
                  className="absolute top-0 h-[calc(100%-0.375rem)] bg-sky-950/55 border-y-2 border-sky-300/20 pointer-events-none"
                  style={{ left: `${blockPreviewLoss.start}%`, width: `${blockPreviewLoss.end - blockPreviewLoss.start}%` }}
                />
              )}
              {blockIncomingLoss && (
                <div
                  className="absolute top-0 h-[calc(100%-0.375rem)] rounded-full bg-red-300/30 border-2 border-red-200/50 pointer-events-none z-[3]"
                  style={{ left: `${blockIncomingLoss.start}%`, width: `${blockIncomingLoss.end - blockIncomingLoss.start}%` }}
                />
              )}
            </>
          )}
          <div className="relative h-6 bg-slate-950 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
            <div
              className={`absolute top-0 bottom-0 bg-red-600 transition-all duration-500 ${isRightAligned ? 'right-0' : 'left-0'}`}
              style={{ width: `${hpPercent}%` }}
            />
            {hpPreviewGain && (
              <div
                className="absolute top-0 bottom-0 bg-emerald-300/25 pointer-events-none"
                style={{ left: `${hpPreviewGain.start}%`, width: `${hpPreviewGain.end - hpPreviewGain.start}%` }}
              />
            )}
            {hpPreviewLoss && (
              <div
                className="absolute top-0 bottom-0 bg-red-100/25 pointer-events-none"
                style={{ left: `${hpPreviewLoss.start}%`, width: `${hpPreviewLoss.end - hpPreviewLoss.start}%` }}
              />
            )}
            {hpIncomingLoss && (
              <div
                className="absolute top-0 bottom-0 bg-red-100/35 border-x border-dashed border-red-50/60 pointer-events-none z-[2]"
                style={{ left: `${hpIncomingLoss.start}%`, width: `${hpIncomingLoss.end - hpIncomingLoss.start}%` }}
              />
            )}
            <span className="relative z-10 text-xs font-bold text-white tracking-widest">
              {hp} / {maxHp}
            </span>
          </div>
        </div>

        <div className={`mt-2 flex items-center gap-1 text-xs font-semibold text-sky-300 ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{blockLabel}: {block}</span>
        </div>
      </div>

      {subline && (
        <div className={`flex flex-wrap items-center gap-2 text-sm ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
          {subline}
        </div>
      )}

      {statuses.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
          {statuses}
        </div>
      )}

      {footer && (
        <div className={`text-[11px] uppercase tracking-[0.28em] text-slate-500 ${isRightAligned ? 'text-right' : 'text-left'}`}>
          {footer}
        </div>
      )}
    </div>
  );
};


// --- MAIN COMPONENT ---

export default function App() {
  const [cardsReady, setCardsReady] = useState(Object.keys(CARD_DICT).length > 0);
  const [lang, setLang] = useState('en');
  const [titleView, setTitleView] = useState('heroes');
  const [collectionTab, setCollectionTab] = useState('IRONCLAD');
  const [activeSlot, setActiveSlot] = useState('1');
  const [slotSummaries, setSlotSummaries] = useState({});
  const [metaProgress, setMetaProgress] = useState(createDefaultMetaProgress());
  const [gameState, setGameState] = useState({
    characterKey: null,
    character: null,
    unlockedCards: [...STARTER_UNLOCKED_CARDS],
    unlockedRelics: [...STARTER_UNLOCKED_RELICS],
    hp: 80,
    maxHp: 80,
    gold: 99,
    floor: 0,
    act: 1,
    deck: [],
    relics: [],
    route: [],
    combat: null,
    runContent: null
  });

  const [currentNode, setCurrentNode] = useState(getNeowNode());
  const [hoveredInfo, setHoveredInfo] = useState(null);
  
  const [effect, setEffect] = useState(null);
  const [isMazeMoving, setIsMazeMoving] = useState(false);
  const [transitionMode, setTransitionMode] = useState('straight');

  // Animation States
  const [playerAnim, setPlayerAnim] = useState('');
  const [enemyAnim, setEnemyAnim] = useState('');
  const [isCombatResolving, setIsCombatResolving] = useState(false);
  const [playedCardIndex, setPlayedCardIndex] = useState(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [lockedCombatPreview, setLockedCombatPreview] = useState(null);
  const [rewardEffects, setRewardEffects] = useState([]);
  const [achievementToasts, setAchievementToasts] = useState([]);
  const [isInGameMenuOpen, setIsInGameMenuOpen] = useState(false);
  const [inGameMenuTab, setInGameMenuTab] = useState('options');

  const audioContextRef = React.useRef(null);
  const bgmAudioRef = React.useRef(null);
  const bgmTrackRef = React.useRef('');

  useEffect(() => {
    let cancelled = false;
    fetch('data/cards.csv')
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load cards.csv: ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        CARD_DICT = parseCardsCsv(text);
        setCardsReady(true);
      })
      .catch((error) => {
        console.error('Failed to load card data', error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSlotSummaries = useCallback(() => {
    const summaries = {};
    SAVE_SLOT_IDS.forEach((slotId) => {
      try {
        const raw = window.localStorage.getItem(getMetaStorageKey(slotId));
        if (!raw) {
          summaries[slotId] = null;
          return;
        }
        const parsed = JSON.parse(raw);
        summaries[slotId] = {
          highestActCleared: parsed.stats?.highestActCleared || 0,
          totalWins: parsed.stats?.totalWins || 0,
          unlockedCharacters: parsed.unlockedCharacters?.length || 0,
          completedAchievements: Object.values(parsed.achievements || {}).filter(item => item.completed).length
        };
      } catch (error) {
        summaries[slotId] = null;
      }
    });
    setSlotSummaries(summaries);
  }, []);

  const registerEnemyEncounter = useCallback((enemyData) => {
    if (!enemyData?.codexKey) return;
    setMetaProgress(prev => {
      const previous = prev.encounteredEnemies?.[enemyData.codexKey];
      return {
        ...prev,
        encounteredEnemies: {
          ...(prev.encounteredEnemies || {}),
          [enemyData.codexKey]: {
            codexKey: enemyData.codexKey,
            names: enemyData.names,
            tier: enemyData.tier,
            hp: Math.max(previous?.hp || 0, enemyData.hp || 0),
            spriteKey: enemyData.spriteKey,
            pattern: enemyData.codexPattern,
            encounters: (previous?.encounters || 0) + 1
          }
        }
      };
    });
  }, []);

  useEffect(() => {
    try {
      const savedSlot = window.localStorage.getItem(ACTIVE_SLOT_STORAGE_KEY);
      if (savedSlot && SAVE_SLOT_IDS.includes(savedSlot)) {
        setActiveSlot(savedSlot);
      }
    } catch (error) {
      console.warn('Failed to load active slot', error);
    }
  }, []);

  useEffect(() => {
    try {
      const savedMeta = window.localStorage.getItem(getMetaStorageKey(activeSlot));
      if (!savedMeta) return;
      const parsed = JSON.parse(savedMeta);
      const defaults = createDefaultMetaProgress();
      let nextMeta = {
        ...defaults,
        ...parsed,
        stats: { ...defaults.stats, ...(parsed.stats || {}) },
        settings: { ...defaults.settings, ...(parsed.settings || {}) },
        unlockedCharacters: mergeUnique(defaults.unlockedCharacters, parsed.unlockedCharacters || []),
        unlockedCards: mergeUnique(defaults.unlockedCards, parsed.unlockedCards || []),
        unlockedRelics: mergeUnique(defaults.unlockedRelics, parsed.unlockedRelics || []),
        achievements: { ...defaults.achievements, ...(parsed.achievements || {}) },
        encounteredEnemies: { ...(defaults.encounteredEnemies || {}), ...(parsed.encounteredEnemies || {}) }
      };
      Object.entries(nextMeta.achievements).forEach(([achievementId, status]) => {
        if (!status?.completed) return;
        const achievement = ACHIEVEMENT_DEFS.find(item => item.id === achievementId);
        if (achievement) nextMeta = applyAchievementRewards(nextMeta, achievement.rewards);
      });
      setMetaProgress(nextMeta);
      refreshSlotSummaries();
    } catch (error) {
      console.warn('Failed to load meta progress', error);
    }
  }, [activeSlot, refreshSlotSummaries]);

  useEffect(() => {
    try {
      window.localStorage.setItem(getMetaStorageKey(activeSlot), JSON.stringify(metaProgress));
      window.localStorage.setItem(ACTIVE_SLOT_STORAGE_KEY, activeSlot);
      refreshSlotSummaries();
    } catch (error) {
      console.warn('Failed to save meta progress', error);
    }
  }, [metaProgress, activeSlot, refreshSlotSummaries]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }, []);

  const playSound = useCallback((type = 'click') => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const settings = metaProgress.settings || createDefaultMetaProgress().settings;
      const masterVolume = Math.max(0, Math.min(1, (settings.masterVolume ?? 0) / 100));
      const channelKey = type === 'achievement'
        ? 'achievementVolume'
        : (type === 'attack' || type === 'hurt' || type === 'block' || type === 'enemyMove'
          ? 'combatVolume'
          : 'uiVolume');
      const channelVolume = Math.max(0, Math.min(1, (settings[channelKey] ?? 0) / 100));
      const volumeScale = settings.isMuted ? 0 : Math.min(4.2, Math.max(0, masterVolume * channelVolume * 2.9));
      if (volumeScale <= 0) return;

      const makeTone = (frequency, duration, gainValue, waveform = 'square', start = 0, endFrequency = null) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = waveform;
        osc.frequency.setValueAtTime(frequency, now + start);
        if (endFrequency) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + start + duration);
        }
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue * volumeScale), now + start + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + duration + 0.02);
      };

      const makeNoise = (duration, gainValue, start = 0, filterType = 'highpass', frequency = 1200) => {
        const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        source.buffer = buffer;
        filter.type = filterType;
        filter.frequency.setValueAtTime(frequency, now + start);
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue * volumeScale), now + start + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(now + start);
        source.stop(now + start + duration + 0.02);
      };

      const makeChord = (frequencies, duration, gainValue, waveform = 'triangle', start = 0) => {
        frequencies.forEach((frequency, index) => {
          makeTone(frequency, duration, gainValue, waveform, start + index * 0.003);
        });
      };

      const makeSequence = (notes, waveform = 'triangle') => {
        notes.forEach((note) => {
          makeTone(note.frequency, note.duration, note.gain, note.waveform || waveform, note.start, note.endFrequency || null);
        });
      };

      const makeEcho = (notes, delay = 0.12, falloff = 0.55) => {
        notes.forEach((note) => {
          makeTone(
            note.frequency,
            note.duration * 1.45,
            note.gain * falloff,
            note.waveform || 'triangle',
            note.start + delay,
            note.endFrequency || null
          );
        });
      };

      if (type === 'coin') {
        const notes = [
          { frequency: 988, duration: 0.09, gain: 0.14, waveform: 'square', start: 0 },
          { frequency: 1318.5, duration: 0.12, gain: 0.13, waveform: 'triangle', start: 0.05 },
          { frequency: 1567.98, duration: 0.14, gain: 0.11, waveform: 'triangle', start: 0.1 },
          { frequency: 1760, duration: 0.18, gain: 0.08, waveform: 'sine', start: 0.16 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.11, 0.5);
        makeChord([1318.5, 1567.98, 1975.53], 0.16, 0.045, 'triangle', 0.09);
        makeNoise(0.06, 0.03, 0.01, 'highpass', 3400);
        return;
      }
      if (type === 'card') {
        const notes = [
          { frequency: 587.33, duration: 0.08, gain: 0.11, waveform: 'triangle', start: 0 },
          { frequency: 783.99, duration: 0.1, gain: 0.12, waveform: 'square', start: 0.04 },
          { frequency: 987.77, duration: 0.14, gain: 0.1, waveform: 'sine', start: 0.09 },
          { frequency: 1174.66, duration: 0.18, gain: 0.07, waveform: 'sine', start: 0.16 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.1, 0.45);
        makeNoise(0.05, 0.022, 0, 'highpass', 2600);
        return;
      }
      if (type === 'relic') {
        const notes = [
          { frequency: 392, duration: 0.13, gain: 0.14, waveform: 'triangle', start: 0 },
          { frequency: 523.25, duration: 0.15, gain: 0.16, waveform: 'triangle', start: 0.08 },
          { frequency: 659.25, duration: 0.17, gain: 0.15, waveform: 'sine', start: 0.16 },
          { frequency: 783.99, duration: 0.22, gain: 0.13, waveform: 'sine', start: 0.24 },
          { frequency: 1046.5, duration: 0.34, gain: 0.09, waveform: 'sine', start: 0.32 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.14, 0.52);
        makeChord([523.25, 659.25, 783.99], 0.28, 0.06, 'triangle', 0.16);
        makeChord([783.99, 1046.5, 1318.5], 0.34, 0.05, 'sine', 0.28);
        makeNoise(0.12, 0.03, 0.11, 'bandpass', 2500);
        return;
      }
      if (type === 'heal') {
        const notes = [
          { frequency: 440, duration: 0.12, gain: 0.12, waveform: 'sine', start: 0 },
          { frequency: 554.37, duration: 0.15, gain: 0.13, waveform: 'triangle', start: 0.07 },
          { frequency: 659.25, duration: 0.2, gain: 0.12, waveform: 'sine', start: 0.15 },
          { frequency: 880, duration: 0.28, gain: 0.08, waveform: 'sine', start: 0.24 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.12, 0.48);
        makeChord([659.25, 880, 1108.73], 0.24, 0.04, 'sine', 0.17);
        return;
      }
      if (type === 'block') {
        const notes = [
          { frequency: 220, duration: 0.08, gain: 0.16, waveform: 'square', start: 0, endFrequency: 260 },
          { frequency: 330, duration: 0.12, gain: 0.12, waveform: 'triangle', start: 0.035, endFrequency: 392 },
          { frequency: 494, duration: 0.1, gain: 0.09, waveform: 'sine', start: 0.075, endFrequency: 440 },
          { frequency: 659.25, duration: 0.16, gain: 0.06, waveform: 'triangle', start: 0.12, endFrequency: 523.25 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.1, 0.42);
        makeNoise(0.05, 0.03, 0, 'bandpass', 1500);
        return;
      }
      if (type === 'enemyMove') {
        const notes = [
          { frequency: 164.81, duration: 0.11, gain: 0.11, waveform: 'sawtooth', start: 0, endFrequency: 130.81 },
          { frequency: 196, duration: 0.13, gain: 0.1, waveform: 'triangle', start: 0.06, endFrequency: 146.83 },
          { frequency: 246.94, duration: 0.11, gain: 0.08, waveform: 'square', start: 0.12, endFrequency: 174.61 },
          { frequency: 196, duration: 0.15, gain: 0.05, waveform: 'sine', start: 0.18, endFrequency: 123.47 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.12, 0.4);
        makeNoise(0.11, 0.035, 0.01, 'lowpass', 760);
        return;
      }

      if (type === 'attack') {
        const notes = [
          { frequency: 520, duration: 0.11, gain: 0.24, waveform: 'sawtooth', start: 0, endFrequency: 170 },
          { frequency: 760, duration: 0.09, gain: 0.16, waveform: 'triangle', start: 0.02, endFrequency: 280 },
          { frequency: 340, duration: 0.16, gain: 0.18, waveform: 'square', start: 0.04, endFrequency: 95 },
          { frequency: 980, duration: 0.14, gain: 0.1, waveform: 'sine', start: 0.07, endFrequency: 380 }
        ];
        makeNoise(0.16, 0.28, 0, 'highpass', 1900);
        makeNoise(0.12, 0.12, 0.05, 'bandpass', 1300);
        makeSequence(notes);
        makeEcho(notes, 0.09, 0.5);
        makeChord([740, 932, 1174.66], 0.12, 0.055, 'triangle', 0.05);
        return;
      }
      if (type === 'achievement') {
        const notes = [
          { frequency: 523.25, duration: 0.16, gain: 0.14, waveform: 'triangle', start: 0 },
          { frequency: 659.25, duration: 0.18, gain: 0.16, waveform: 'triangle', start: 0.11 },
          { frequency: 783.99, duration: 0.22, gain: 0.18, waveform: 'triangle', start: 0.24 },
          { frequency: 1046.5, duration: 0.28, gain: 0.14, waveform: 'sine', start: 0.38 },
          { frequency: 1318.5, duration: 0.38, gain: 0.11, waveform: 'sine', start: 0.5 }
        ];
        makeSequence(notes);
        makeEcho(notes, 0.15, 0.58);
        makeChord([523.25, 659.25, 783.99], 0.26, 0.065, 'triangle', 0.24);
        makeChord([1046.5, 1318.5, 1567.98], 0.42, 0.055, 'sine', 0.48);
        makeNoise(0.16, 0.035, 0.08, 'bandpass', 2600);
        return;
      }
      if (type === 'hurt') {
        const notes = [
          { frequency: 310, duration: 0.1, gain: 0.18, waveform: 'sawtooth', start: 0, endFrequency: 120 },
          { frequency: 220, duration: 0.14, gain: 0.16, waveform: 'square', start: 0.03, endFrequency: 75 },
          { frequency: 146.83, duration: 0.28, gain: 0.12, waveform: 'triangle', start: 0.07, endFrequency: 49 }
        ];
        makeNoise(0.18, 0.24, 0, 'bandpass', 850);
        makeNoise(0.12, 0.12, 0.03, 'lowpass', 500);
        makeSequence(notes);
        makeEcho(notes, 0.08, 0.4);
        makeChord([110, 82.41], 0.24, 0.06, 'triangle', 0.08);
        return;
      }
      const notes = [
        { frequency: 880, duration: 0.08, gain: 0.1, waveform: 'square', start: 0, endFrequency: 720 },
        { frequency: 1174.66, duration: 0.1, gain: 0.08, waveform: 'triangle', start: 0.04, endFrequency: 987.77 },
        { frequency: 1567.98, duration: 0.12, gain: 0.06, waveform: 'sine', start: 0.08, endFrequency: 1318.5 }
      ];
      makeNoise(0.08, 0.04, 0, 'highpass', 2400);
      makeSequence(notes);
      makeEcho(notes, 0.1, 0.45);
      makeChord([1318.5, 1567.98], 0.11, 0.03, 'triangle', 0.08);
    } catch (error) {
      console.warn('Failed to play sound', error);
    }
  }, [getAudioContext, metaProgress.settings]);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (event.target.closest('button')) {
        playSound('click');
      }
      const bgmAudio = bgmAudioRef.current;
      if (bgmAudio && bgmAudio.paused && bgmAudio.volume > 0) {
        bgmAudio.play().catch(() => {});
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [playSound]);

  const currentRoomType = gameState.combat?.active
    ? (currentNode?.type === 'Boss' ? 'Boss' : currentNode?.type === 'Elite' ? 'Elite' : 'Combat')
    : (currentNode?.type || 'Event');

  const syncBgmPlayback = useCallback(() => {
    const settings = metaProgress.settings || createDefaultMetaProgress().settings;
    const isBattleTrack = ['Combat', 'Elite', 'Boss'].includes(currentRoomType);
    const roomChannel = isBattleTrack ? settings.combatVolume : settings.uiVolume;
    const roomVolumeScale = currentRoomType === 'Reward' ? 0.55 : 0.8;
    const bgmVolume = settings.isMuted ? 0 : Math.max(0, Math.min(1, ((settings.masterVolume ?? 0) / 100) * ((roomChannel ?? 0) / 100) * roomVolumeScale));
    const nextTrack = currentRoomType === 'Reward'
      ? 'audio/bgm/reward-bgm.mp3'
      : ['Elite', 'Boss'].includes(currentRoomType)
        ? 'audio/bgm/boss-fight-bgm.mp3'
        : currentRoomType === 'Combat'
          ? 'audio/bgm/normal-fight-bgm.mp3'
          : currentRoomType === 'Shop'
            ? 'audio/bgm/merchant-bgm.mp3'
            : 'audio/bgm/title-bgm.mp3';
    let bgmAudio = bgmAudioRef.current;
    if (!bgmAudio) {
      bgmAudio = new Audio();
      bgmAudio.loop = true;
      bgmAudio.preload = 'auto';
      bgmAudioRef.current = bgmAudio;
    }

    if (bgmTrackRef.current !== nextTrack) {
      bgmAudio.pause();
      bgmAudio.src = nextTrack;
      bgmAudio.currentTime = 0;
      bgmTrackRef.current = nextTrack;
    }

    bgmAudio.volume = bgmVolume;
    if (bgmVolume <= 0) {
      bgmAudio.pause();
      return;
    }

    bgmAudio.play().catch(() => {});
  }, [currentRoomType, metaProgress.settings]);

  const beginRoomTransition = useCallback((applyNextScene) => {
    const modes = ['straight', 'corner-left', 'corner-right'];
    const nextMode = modes[Math.floor(Math.random() * modes.length)];
    setTransitionMode(nextMode);
    setIsMazeMoving(true);
    window.setTimeout(() => {
      applyNextScene();
    }, 430);
    window.setTimeout(() => {
      setIsMazeMoving(false);
    }, 980);
  }, []);

  useEffect(() => {
    syncBgmPlayback();
  }, [syncBgmPlayback]);

  useEffect(() => () => {
    const bgmAudio = bgmAudioRef.current;
    if (!bgmAudio) return;
    bgmAudio.pause();
    bgmAudio.removeAttribute('src');
    bgmAudio.load();
  }, []);

  const showAchievementToast = useCallback((achievement) => {
    const toast = { id: `${achievement.id}-${Date.now()}`, achievement };
    setAchievementToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setAchievementToasts(prev => prev.filter(item => item.id !== toast.id));
    }, 4200);
  }, []);

  const changeLanguage = (newLang) => {
      if (gameState.character) {
          if (window.confirm(UI.lang_warning[newLang])) {
              setLang(newLang);
              setGameState(prev => ({ ...prev, character: null, characterKey: null }));
              setTitleView('heroes');
          }
      } else {
          setLang(newLang);
      }
  };

  const handleLangChange = (e) => {
    changeLanguage(e.target.value);
  };

  const cycleLanguage = () => {
    const languages = ['en', 'ja', 'zh'];
    const currentIndex = languages.indexOf(lang);
    const nextLang = languages[(currentIndex + 1) % languages.length];
    changeLanguage(nextLang);
  };

  const addRewardEffect = useCallback((type, text, options = {}) => {
    const newEffect = {
      id: Date.now() + Math.random(),
      text,
      type,
      delay: options.delay || 0,
      x: `calc(50% + ${Math.random() * 80 - 40}px)`,
      y: `calc(40% + ${Math.random() * 60 - 30}px)`
    };
    setRewardEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setRewardEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 2000 + newEffect.delay);
  }, []);

  const recordMetaProgress = useCallback((statChanges = {}) => {
    setMetaProgress(prev => {
      const { metaProgress: nextMeta, newlyCompleted } = updateMetaProgressWithStats(prev, statChanges);
      newlyCompleted.forEach((achievement) => {
        playSound('achievement');
        showAchievementToast(achievement);
        addRewardEffect('achievement', `Achievement: ${achievement.title.en}`);
      });
      return nextMeta;
    });
  }, [addRewardEffect, lang, playSound, showAchievementToast]);

  const startRun = (char) => {
    const characterKey = Object.entries(CHARACTERS).find(([, value]) => value.name.en === char.name.en)?.[0];
    if (!characterKey || !metaProgress.unlockedCharacters.includes(characterKey)) return;
    const act = 1;
    const content = generateProceduralRun(act);
    const newRoute = generateMapRoute(content);
    setGameState({
      characterKey,
      character: char,
      unlockedCards: [...metaProgress.unlockedCards],
      unlockedRelics: [...metaProgress.unlockedRelics],
      hp: char.hp,
      maxHp: char.hp,
      gold: 99,
      floor: 0,
      act: act,
      deck: [...char.deck],
      relics: [...char.relics],
      route: newRoute,
      combat: null,
      runContent: content
    });
    setCurrentNode(getNeowNode());
    setHoveredInfo(null);
    setEffect(null);
    setIsMazeMoving(false);
    setTransitionMode('straight');
    setTitleView('heroes');
  };

  const handleChoice = useCallback((choice) => {
    if (isMazeMoving || isCombatResolving) return;

    const result = choice.action(gameState);
    if (result.reset) {
      setGameState(prev => ({ ...prev, character: null, characterKey: null }));
      setTitleView('heroes');
      return;
    }

    if (result.startNextAct) {
        const nextAct = gameState.act + 1;
        const content = generateProceduralRun(nextAct);
        const newRoute = generateMapRoute(content);
        
        const newState = {
            ...gameState,
            hp: gameState.maxHp,
            act: nextAct,
            runContent: content,
            route: newRoute
        };
        
        beginRoomTransition(() => {
          setGameState(newState);
          setCurrentNode(newRoute[0]); 
        });
        recordMetaProgress({ highestActCleared: gameState.act, highestGold: newState.gold });
        return;
    }

    setEffect(null);
    if (result.hp !== undefined && result.hp < gameState.hp) {
        setEffect('damage');
        addRewardEffect('damage', `-${gameState.hp - result.hp} HP`);
    }
    else if (result.hp !== undefined && result.hp > gameState.hp) {
        setEffect('heal');
        addRewardEffect('heal', `+${result.hp - gameState.hp} HP`);
        playSound('heal');
    }
    else if ((result.gold !== undefined && result.gold > gameState.gold) || 
             (result.relics !== undefined && result.relics.length > gameState.relics.length) || 
             (result.deck !== undefined && result.deck.length > gameState.deck.length)) setEffect('gain');
    
    if (result.gold !== undefined && result.gold > gameState.gold) { addRewardEffect('gold', `+${result.gold - gameState.gold} Gold`); playSound('coin'); }
    if (result.gold !== undefined && result.gold < gameState.gold) addRewardEffect('gold', `${result.gold - gameState.gold} Gold`);
    if (result.relics !== undefined && result.relics.length > gameState.relics.length) addRewardEffect('relic', '+ Relic');
    if (result.deck !== undefined && result.deck.length > gameState.deck.length) addRewardEffect('card', '+ Card');

    if (result.relics !== undefined && result.relics.length > gameState.relics.length) playSound('relic');
    if (result.deck !== undefined && result.deck.length > gameState.deck.length) playSound('card');

    const statChanges = {
      totalCardsCollected: result.deck !== undefined && result.deck.length > gameState.deck.length ? (result.deck.length - gameState.deck.length) : 0,
      totalRelicsCollected: result.relics !== undefined && result.relics.length > gameState.relics.length ? (result.relics.length - gameState.relics.length) : 0,
      highestGold: result.gold !== undefined ? result.gold : gameState.gold
    };

    setTimeout(() => setEffect(null), 500);

    const newState = { ...gameState, ...result };
    
    if (newState.hp <= 0) {
      newState.hp = 0;
      newState.combat = null;
      setGameState(newState);
      setCurrentNode(getDeathNode());
      recordMetaProgress(statChanges);
      return;
    }

    // Initialize Combat Engine State
    if (result.startCombat) {
      let enemyData = newState.runContent.allEnemies.find(e => e.id === result.startCombat);
      registerEnemyEncounter(enemyData);
      newState.combat = {
        active: true,
        enemyId: result.startCombat,
        enemyName: enemyData.names,
        enemySprite: enemyData.spriteKey,
        enemyHp: Math.max(1, enemyData.hp - (result.reduceHp || 0)),
        enemyMaxHp: enemyData.hp,
        playerBlock: result.bonusBlock || 0, 
        enemyBlock: 0, 
        playerStrength: 0, 
        enemyStrength: result.bonusEnemyStr || 0,
        enemyVuln: result.applyVuln || 0, 
        enemyWeak: 0, 
        playerVuln: 0, 
        turn: 1,
        drawPile: [...newState.deck].sort(() => Math.random() - 0.5),
        discardPile: [], 
        hand: [],
        cardsPlayed: 0,
        turnCardsPlayed: 0,
        activePowers: {
          demonForm: 0,
          noxiousFumes: 0,
          echoForm: 0,
          blockEachTurn: 0,
          drawEachTurn: 0
        }
      };

      if (newState.relics.includes('Vajra')) newState.combat.playerStrength += 1;
      if (newState.relics.includes('Anchor')) newState.combat.playerBlock += 10;
      if (newState.relics.includes('Bag of Marbles')) newState.combat.enemyVuln += 1;
      if (newState.relics.includes('Thread and Needle')) newState.combat.playerBlock += 4;
      if (newState.relics.includes('Pure Water')) { newState.combat.playerBlock += 5; newState.combat.enemyWeak += 1; }
      if (newState.relics.includes('Omen Forge')) { newState.combat.playerStrength += 2; newState.combat.playerVuln += 1; }

      newState.combat.intent = enemyData.getAction(1, newState.combat);
      drawCards(newState.combat, newState.relics.includes('Ring of the Snake') ? 5 : 3);
      if (newState.relics.includes('Lantern')) drawCards(newState.combat, 1);
    }

    if (result.stayOnFloor) {
      setGameState(newState);
      if (result.nextNode) setCurrentNode(result.nextNode);
      recordMetaProgress(statChanges);
      return;
    }

    const nextFloor = newState.floor + 1;
    newState.floor = nextFloor;
    
    let nextNode;
    if (nextFloor === 11 || nextFloor === 21) {
        nextNode = getActTransitionNode(newState.act);
    } else if (nextFloor > 30) {
        nextNode = getVictoryNode();
        recordMetaProgress({ totalWins: 1, highestActCleared: newState.act, highestGold: newState.gold });
    } else {
        const floorInAct = ((nextFloor - 1) % 10) + 1;
        nextNode = newState.route[floorInAct - 1];
    }

    beginRoomTransition(() => {
      setGameState(newState);
      setCurrentNode(nextNode);
    });
    if (nextFloor <= 30) recordMetaProgress(statChanges);
  }, [addRewardEffect, beginRoomTransition, gameState, isCombatResolving, isMazeMoving, lang, playSound, recordMetaProgress, registerEnemyEncounter]);

  const playCardInCombat = async (cardName, cardIndex) => {
    if (isMazeMoving || isCombatResolving) return;
    const committedHoverPreview = getCombatPreviewForCard(gameState, cardName);
    const committedIncomingPreview = getIntentPlayerPreview(gameState, committedHoverPreview ? {
      playerHp: committedHoverPreview.playerHp,
      playerBlock: committedHoverPreview.playerBlock
    } : {});
    setLockedCombatPreview({
      hovered: committedHoverPreview,
      incoming: committedIncomingPreview
    });
    setIsCombatResolving(true);
    setPlayedCardIndex(cardIndex);
    setHoveredCardIndex(null);

    let s = { ...gameState, deck: [...gameState.deck], relics: [...gameState.relics] };
    let c = {
      ...s.combat,
      hand: [...s.combat.hand],
      drawPile: [...s.combat.drawPile],
      discardPile: [...s.combat.discardPile],
      activePowers: { ...(s.combat.activePowers || {}) }
    };
    s.combat = c;
    let enemyData = s.runContent.allEnemies.find(e => e.id === c.enemyId);

    const preEnemyHp = c.enemyHp;
    const prePlayerBlock = c.playerBlock;
    const prePlayerHp = s.hp;

    // Player Phase
    const penNibTriggers = s.relics.includes('Pen Nib') && (((c.cardsPlayed || 0) + 1) % 3 === 0);
    const damageMultiplier = penNibTriggers ? 2 : 1;
    c.cardsPlayed = (c.cardsPlayed || 0) + 1;
    const cardDefinition = getCardDefinition(cardName);
    const isPowerCard = cardDefinition?.type === 'Power';
    const shouldEcho = (c.activePowers.echoForm || 0) > 0 && (c.turnCardsPlayed || 0) === 0;
    c.turnCardsPlayed = (c.turnCardsPlayed || 0) + 1;

    if (s.relics.includes('Cracked Core')) c.playerBlock += 2;
    executeCard(cardName, s, c, {
      damageMultiplier,
      onDamage: (amount, hitIndex) => addRewardEffect('damage', `-${amount} HP`, { delay: hitIndex * 120 })
    });
    if (shouldEcho) {
      executeCard(cardName, s, c, {
        damageMultiplier,
        onDamage: (amount, hitIndex) => addRewardEffect('damage', `-${amount} HP`, { delay: 180 + hitIndex * 120 })
      });
    }
    playSound('attack');
    const [playedCard] = c.hand.splice(cardIndex, 1);
    if (playedCard && !isPowerCard) {
      c.discardPile.push(playedCard);
    }
    c.hand.forEach(h => { c.discardPile.push(h); });
    c.hand = [];

    const dealtDamage = c.enemyHp < preEnemyHp;
    const gainedBlock = c.playerBlock > prePlayerBlock;
    const healed = s.hp > prePlayerHp;

    if (dealtDamage) setPlayerAnim('attack');
    else if (gainedBlock) setPlayerAnim('block');
    else setPlayerAnim('buff');

    if (gainedBlock) playSound('block');
    if (healed) { addRewardEffect('heal', `+${s.hp - prePlayerHp} HP`); playSound('heal'); }

    await new Promise(r => setTimeout(r, 250));
    
    setGameState({...s}); 
    if (dealtDamage) {
        setEnemyAnim('hurt');
    }
    
    await new Promise(r => setTimeout(r, 400));
    setPlayerAnim('');
    setEnemyAnim('');
    setPlayedCardIndex(null);

    // Check Victory
    if (c.enemyHp <= 0) {
      if (s.relics.includes('Burning Blood')) { s.hp = Math.min(s.maxHp, s.hp + 6); addRewardEffect('heal', '+6 HP (Relic)'); }
      if (s.relics.includes('Meat on the Bone') && s.hp <= s.maxHp / 2) { s.hp = Math.min(s.maxHp, s.hp + 12); addRewardEffect('heal', '+12 HP (Relic)'); }
      s.combat = null;
      setGameState({...s});
      setCurrentNode(getRewardNode(enemyData));
      recordMetaProgress({
        totalCombatWins: 1,
        totalEnemiesDefeated: 1,
        totalEliteWins: enemyData?.tier === 'elite' ? 1 : 0,
        totalCardsPlayed: 1,
        lowHpCombatSurvived: s.hp <= 10 ? 1 : 0,
        highestGold: s.gold
      });
      setLockedCombatPreview(null);
      setIsCombatResolving(false);
      return;
    }

    // Enemy Phase
    const prePlayerHpEnemyTurn = s.hp;
    
    c.enemyBlock = 0; 
    const preEnemyBlock = c.enemyBlock;
    
    playSound('enemyMove');
    c.intent.execute(s, c);
    
    const enemyDealtDamage = s.hp < prePlayerHpEnemyTurn;
    const enemyGainedBlock = c.enemyBlock > preEnemyBlock; 

    if (enemyDealtDamage) setEnemyAnim('attack');
    else if (enemyGainedBlock) setEnemyAnim('block');
    else setEnemyAnim('buff');

    await new Promise(r => setTimeout(r, 250));

    setGameState({...s}); 
    if (enemyDealtDamage) {
        playSound('hurt');
        setPlayerAnim('hurt');
        setEffect('damage');
        addRewardEffect('damage', `-${prePlayerHpEnemyTurn - s.hp}`);
        setTimeout(() => setEffect(null), 300);
    }
    if (enemyGainedBlock) playSound('block');

    await new Promise(r => setTimeout(r, 400));
    setPlayerAnim('');
    setEnemyAnim('');

    // Check Defeat
    if (s.hp <= 0) {
      s.hp = 0;
      s.combat = null;
      setGameState({...s});
      setCurrentNode(getDeathNode());
      recordMetaProgress({ totalCardsPlayed: 1, highestGold: s.gold });
      setLockedCombatPreview(null);
      setIsCombatResolving(false);
      return;
    }

    // Upkeep Phase
    const endedTurnWithoutBlock = c.playerBlock === 0;
    c.playerBlock = 0;
    if (s.relics.includes('Thread and Needle')) { c.playerBlock += 4; playSound('block'); }
    if (endedTurnWithoutBlock && s.relics.includes('Orichalcum')) { c.playerBlock += 6; addRewardEffect('heal', '+6 Block'); playSound('block'); }
    if (c.activePowers.demonForm > 0) c.playerStrength += c.activePowers.demonForm;
    if (c.activePowers.noxiousFumes > 0) applyDamageToEnemy(c.activePowers.noxiousFumes, c);
    if (c.activePowers.blockEachTurn > 0) { c.playerBlock += c.activePowers.blockEachTurn; playSound('block'); }
    
    if (c.enemyVuln > 0) c.enemyVuln--;
    if (c.enemyWeak > 0) c.enemyWeak--;
    if (c.playerVuln > 0) c.playerVuln--;
    c.turn++;
    c.turnCardsPlayed = 0;

    if (c.enemyHp <= 0) {
      if (s.relics.includes('Burning Blood')) { s.hp = Math.min(s.maxHp, s.hp + 6); addRewardEffect('heal', '+6 HP (Relic)'); }
      if (s.relics.includes('Meat on the Bone') && s.hp <= s.maxHp / 2) { s.hp = Math.min(s.maxHp, s.hp + 12); addRewardEffect('heal', '+12 HP (Relic)'); }
      s.combat = null;
      setGameState({...s});
      setCurrentNode(getRewardNode(enemyData));
      recordMetaProgress({
        totalCombatWins: 1,
        totalEnemiesDefeated: 1,
        totalEliteWins: enemyData?.tier === 'elite' ? 1 : 0,
        totalCardsPlayed: 1,
        lowHpCombatSurvived: s.hp <= 10 ? 1 : 0,
        highestGold: s.gold
      });
      setLockedCombatPreview(null);
      setIsCombatResolving(false);
      return;
    }

    // Prepare Next Turn
    c.intent = enemyData.getAction(c.turn, c);
    drawCards(c, 3 + (c.activePowers.drawEachTurn || 0)); 

    setGameState({...s});
    recordMetaProgress({ totalCardsPlayed: 1, highestGold: s.gold });
    setLockedCombatPreview(null);
    setIsCombatResolving(false);
  };

  const renderRewardIcon = (type) => {
     if(type==='gold') return <Coins className="w-6 h-6 text-amber-300"/>;
     if(type==='relic') return <RelicBadgeIcon className="w-6 h-6 text-violet-300"/>;
     if(type==='card') return <CardIcon className="w-6 h-6 text-cyan-300"/>;
     if(type==='heal') return <Heart className="w-6 h-6 text-green-300"/>;
     if(type==='damage') return <AttackIcon className="w-6 h-6 text-red-400"/>;
     return null;
  };

  const renderAchievementIcon = (iconKey, className = "w-6 h-6") => {
    if (iconKey === 'sword') return <AttackIcon className={className} />;
    if (iconKey === 'coins') return <Coins className={className} />;
    if (iconKey === 'sparkles') return <RelicBadgeIcon className={className} />;
    if (iconKey === 'scroll') return <CardIcon className={className} />;
    if (iconKey === 'map') return <MapIcon className={className} />;
    if (iconKey === 'skull') return <Skull className={className} />;
    if (iconKey === 'ghost') return <Ghost className={className} />;
    if (iconKey === 'library') return <Library className={className} />;
    if (iconKey === 'heart') return <Heart className={className} />;
    if (iconKey === 'flame') return <Flame className={className} />;
    return <Sparkles className={className} />;
  };

  const generalRelics = RELIC_POOL.filter(relic => !Object.values(CHARACTER_STARTER_RELIC).includes(relic));
  const unlockedAchievementCount = ACHIEVEMENT_DEFS.filter(achievement => metaProgress.achievements[achievement.id]?.completed).length;
  const enemyCodexEntries = ENEMY_CODEX_CATALOG.map((entry) => ({
    ...entry,
    encountered: metaProgress.encounteredEnemies?.[entry.key] || null
  }));
  const currentSlotSummary = slotSummaries[activeSlot];
  const setAudioSetting = (key, value) => {
    setMetaProgress(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };
  const resetCurrentSlotProgress = () => {
    if (!window.confirm(UI.reset_confirm[lang])) return;
    try {
      window.localStorage.removeItem(getMetaStorageKey(activeSlot));
    } catch (error) {
      console.warn('Failed to reset slot', error);
    }
    const freshMeta = createDefaultMetaProgress();
    setMetaProgress(freshMeta);
    setCollectionTab(freshMeta.unlockedCharacters[0] || 'IRONCLAD');
    refreshSlotSummaries();
  };

  const toggleMute = () => {
    setMetaProgress(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        isMuted: !prev.settings.isMuted
      }
    }));
  };

  const returnToTitle = useCallback(() => {
    setGameState(prev => ({ ...prev, character: null, characterKey: null, combat: null }));
    setCurrentNode(getNeowNode());
    setHoveredInfo(null);
    setEffect(null);
    setIsMazeMoving(false);
    setTransitionMode('straight');
    setIsCombatResolving(false);
    setPlayedCardIndex(null);
    setHoveredCardIndex(null);
    setRewardEffects([]);
    setAchievementToasts([]);
    setIsInGameMenuOpen(false);
    setInGameMenuTab('options');
    setTitleView('heroes');
  }, []);

  const hoveredCardPreview = useMemo(() => {
    if (!gameState.combat?.active || hoveredCardIndex == null) return null;
    const hoveredCard = gameState.combat.hand?.[hoveredCardIndex];
    return getCombatPreviewForCard(gameState, hoveredCard);
  }, [gameState, hoveredCardIndex]);
  const enemyIntentPreview = useMemo(() => (
    getIntentPlayerPreview(gameState, hoveredCardPreview ? {
      playerHp: hoveredCardPreview.playerHp,
      playerBlock: hoveredCardPreview.playerBlock
    } : {})
  ), [gameState, hoveredCardPreview]);
  const displayedHoverPreview = lockedCombatPreview?.hovered ?? hoveredCardPreview;
  const displayedEnemyIntentPreview = lockedCombatPreview?.incoming ?? enemyIntentPreview;

  if (!cardsReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-200">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          <span className="font-bold">Loading card data...</span>
        </div>
      </div>
    );
  }

  if (!gameState.character) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 md:p-6 text-slate-200 selection:bg-red-900 selection:text-white relative overflow-x-hidden overflow-y-auto">
        <SpireBackground roomType="Event" isMoving={false} lightClass="from-slate-800/40 via-slate-950/20 to-transparent" transitionMode="straight" />
        
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={cycleLanguage}
            title={`Language: ${lang.toUpperCase()}`}
            className="h-10 px-3 rounded border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-400 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
          <button
            onClick={toggleMute}
            title={metaProgress.settings.isMuted ? UI.unmute[lang] : UI.mute[lang]}
            className={`h-10 w-10 rounded border transition-colors flex items-center justify-center ${
              metaProgress.settings.isMuted
                ? 'bg-red-950/60 text-red-200 border-red-500/40'
                : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:border-slate-400'
            }`}
          >
            {metaProgress.settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative z-20 w-full flex flex-col items-center">
          
          <div className="flex flex-col items-center mb-8 md:mb-12 animate-slide-fade text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase flex flex-col md:flex-row items-center gap-2" style={{ fontFamily: 'Georgia, serif', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.8))' }}>
               <span className="text-slate-200" style={{ textShadow: '2px 2px 0 #1e293b, -2px -2px 0 #1e293b, 2px -2px 0 #1e293b, -2px 2px 0 #1e293b' }}>{UI.title_slay[lang]}</span>
               <span className="text-red-500 transform md:-rotate-2 md:-translate-y-1" style={{ textShadow: '2px 2px 0 #450a0a, -2px -2px 0 #450a0a, 2px -2px 0 #450a0a, -2px 2px 0 #450a0a' }}>{UI.title_tiny[lang]}</span>
               <span className="text-slate-200" style={{ textShadow: '2px 2px 0 #1e293b, -2px -2px 0 #1e293b, 2px -2px 0 #1e293b, -2px 2px 0 #1e293b' }}>{UI.title_spire[lang]}</span>
            </h1>
            <p className="text-slate-400 mt-4 tracking-[0.4em] uppercase text-sm font-bold">
              {titleView === 'heroes'
                ? UI.choose_lineage[lang]
                : titleView === 'achievements'
                  ? UI.achievements[lang]
                  : titleView === 'collection'
                    ? UI.collection[lang]
                    : titleView === 'codex'
                      ? UI.enemy_codex[lang]
                      : UI.options[lang]}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 animate-slide-fade flex-wrap justify-center">
            {[
              { id: 'heroes', label: UI.heroes[lang] },
              { id: 'achievements', label: `${UI.achievements[lang]} ${unlockedAchievementCount}/${ACHIEVEMENT_DEFS.length}` },
              { id: 'collection', label: UI.collection[lang] },
              { id: 'codex', label: UI.codex[lang] },
              { id: 'options', label: UI.options[lang] }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTitleView(tab.id)}
                className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                  titleView === tab.id
                    ? 'bg-slate-200 text-slate-950 border-slate-200'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {titleView === 'heroes' && (
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center max-w-6xl animate-slide-fade">
              {Object.entries(CHARACTERS).map(([key, char]) => {
                const isUnlocked = metaProgress.unlockedCharacters.includes(key);
                const unlockAchievement = getCharacterUnlockAchievement(key);
                return (
                  <button 
                    key={key} 
                    onClick={() => isUnlocked && startRun(char)} 
                    disabled={!isUnlocked}
                    className={`p-4 md:p-6 rounded-2xl flex flex-col items-center gap-3 md:gap-4 transition-all duration-300 w-full max-w-[17rem] md:w-64 group ${
                      isUnlocked
                        ? 'bg-slate-900 border border-slate-700 hover:border-slate-400 hover:scale-105 hover:shadow-2xl hover:shadow-white/5 cursor-pointer'
                        : 'bg-slate-950/90 border border-slate-800 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    <div className={`p-4 rounded-full bg-slate-800 border-2 border-slate-700 transition-colors ${isUnlocked ? `group-hover:border-current ${char.color}` : 'text-slate-600'}`}>
                      {char.icon}
                    </div>
                    <div className="text-center w-full">
                      <h2 className={`text-xl font-bold mb-2 ${isUnlocked ? char.color : 'text-slate-500'}`}>{char.name[lang]}</h2>
                      <div className="w-full h-px bg-slate-800 mb-3"></div>
                      <p className="text-sm text-slate-400 mb-1 flex justify-between px-2"><span>{UI.health[lang]}:</span> <span className="text-slate-200 font-bold">{char.hp}</span></p>
                      <p className="text-sm text-slate-400 mb-2 flex justify-between px-2"><span>{UI.relics[lang]}:</span> <span className="inline-flex items-center gap-1 text-slate-200 font-bold text-right ml-2"><RelicIcon relicName={char.relics[0]} className="w-4 h-4 shrink-0" />{getTranslatedRelic(char.relics[0], lang).name}</span></p>
                      <div className={`text-xs font-bold uppercase tracking-widest ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isUnlocked ? UI.unlocked[lang] : UI.locked[lang]}
                      </div>
                      {!isUnlocked && unlockAchievement && (
                        <p className="text-xs text-slate-500 mt-2">{getUnlockRequirementText(unlockAchievement.id, lang)}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {titleView === 'achievements' && (
            <div className="w-full max-w-5xl grid gap-4 animate-slide-fade px-1">
              {ACHIEVEMENT_DEFS.map((achievement) => {
                const [current, target] = achievement.progress(metaProgress.stats);
                const ratio = target === 0 ? 1 : current / target;
                const isComplete = metaProgress.achievements[achievement.id]?.completed;
                return (
                  <div key={achievement.id} className={`rounded-2xl border p-5 ${isComplete ? 'bg-emerald-950/30 border-emerald-700/50' : 'bg-slate-900/90 border-slate-700'}`}>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${isComplete ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                          {renderAchievementIcon(achievement.icon)}
                        </div>
                        <div>
                        <h3 className={`text-xl font-bold ${isComplete ? 'text-emerald-300' : 'text-slate-100'}`}>{achievement.title[lang]}</h3>
                        <p className="text-sm text-slate-400">{achievement.desc[lang]}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-bold uppercase tracking-widest ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isComplete ? UI.unlocked[lang] : UI.progress[lang]}
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden mb-2">
                      <div className={`h-full ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{UI.progress[lang]}: {current} / {target}</span>
                      <span>{UI.unlocks[lang]}: {achievement.rewards.characters.map(charKey => CHARACTERS[charKey].name[lang]).concat(achievement.rewards.relics).join(', ') || 'Relics'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {titleView === 'codex' && (
            <div className="w-full max-w-6xl grid gap-5 animate-slide-fade px-1">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/90 p-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100">{UI.enemy_codex[lang]}</h3>
                  <p className="text-sm text-slate-400">{UI.codex_hint[lang]}</p>
                </div>
                <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  {enemyCodexEntries.filter(entry => entry.encountered).length}/{enemyCodexEntries.length}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {enemyCodexEntries.map((entry, index) => {
                  const info = entry.encountered;
                  const tierLabel = entry.tier === 'boss'
                    ? COPY.fallback.boss[lang]
                    : entry.tier === 'elite'
                      ? COPY.fallback.elite[lang]
                      : COPY.fallback.normal[lang];
                  return (
                    <div key={entry.key} className={`rounded-2xl border p-4 transition-all ${info ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-950/90 border-slate-800'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center shrink-0 ${info ? 'bg-slate-950 border-slate-700' : 'bg-slate-950/60 border-slate-800'}`}>
                          {info ? (
                            <PixelSprite spriteKey={info.spriteKey} className="w-14 h-14" />
                          ) : (
                            <div className="text-3xl font-black text-slate-700">?</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[10px] uppercase tracking-[0.25em] font-bold mb-1 ${info ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {info ? tierLabel : `${UI.locked[lang]} #${index + 1}`}
                          </div>
                          <h3 className={`text-lg font-bold ${info ? 'text-slate-100' : 'text-slate-500'}`}>
                            {info ? info.names[lang] : UI.unknown_enemy[lang]}
                          </h3>
                          <div className="grid gap-2 mt-3 text-sm">
                            <div className="flex justify-between gap-3">
                              <span className="text-slate-500">{UI.enemy_type[lang]}</span>
                              <span className={info ? 'text-slate-200 font-bold' : 'text-slate-600'}>{info ? tierLabel : '???'}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-slate-500">{UI.max_hp_label[lang]}</span>
                              <span className={info ? 'text-slate-200 font-bold' : 'text-slate-600'}>{info ? info.hp : '???'}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-slate-500">{UI.encounter_count[lang]}</span>
                              <span className={info ? 'text-slate-200 font-bold' : 'text-slate-600'}>{info ? info.encounters : '???'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">{UI.intent_pattern[lang]}</div>
                        <div className={`text-sm leading-relaxed ${info ? 'text-slate-300' : 'text-slate-600'}`}>
                          {info ? info.pattern[lang] : '???'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {titleView === 'options' && (
            <div className="w-full max-w-6xl grid lg:grid-cols-[1.15fr_0.85fr] gap-5 animate-slide-fade px-1">
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100">{UI.save_slots[lang]}</h3>
                    <p className="text-sm text-slate-400">{UI.save_status[lang]}</p>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    {UI.active_slot[lang]}: {activeSlot}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {SAVE_SLOT_IDS.map((slotId) => {
                    const summary = slotSummaries[slotId];
                    const isActive = slotId === activeSlot;
                    return (
                      <button
                        key={slotId}
                        onClick={() => setActiveSlot(slotId)}
                        className={`text-left rounded-2xl border p-4 transition-all ${
                          isActive
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                            : 'bg-slate-950/90 border-slate-700 hover:border-slate-400 hover:-translate-y-1'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="text-lg font-bold text-slate-100">{UI.slot[lang]} {slotId}</span>
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isActive ? UI.active_slot[lang] : UI.save_status[lang]}
                          </span>
                        </div>
                        {!summary ? (
                          <div className="text-sm text-slate-500">{UI.no_save_data[lang]}</div>
                        ) : (
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between gap-3"><span className="text-slate-500">{UI.act[lang]}</span><span className="font-bold text-slate-200">{summary.highestActCleared}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">{COPY.fallback.wins[lang]}</span><span className="font-bold text-slate-200">{summary.totalWins}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">{UI.heroes[lang]}</span><span className="font-bold text-slate-200">{summary.unlockedCharacters}/{Object.keys(CHARACTERS).length}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-slate-500">{UI.achievements[lang]}</span><span className="font-bold text-slate-200">{summary.completedAchievements}/{ACHIEVEMENT_DEFS.length}</span></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-400">
                    {currentSlotSummary ? `${UI.slot[lang]} ${activeSlot}: ${currentSlotSummary.completedAchievements}/${ACHIEVEMENT_DEFS.length} ${UI.achievements[lang]}` : UI.no_save_data[lang]}
                  </div>
                  <button
                    onClick={resetCurrentSlotProgress}
                    className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-950/40 text-red-200 hover:bg-red-900/50 transition-colors font-bold"
                  >
                    {UI.reset_progress[lang]}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-2xl font-bold text-slate-100 mb-1">{UI.audio[lang]}</h3>
                <p className="text-sm text-slate-400 mb-5">{UI.active_slot[lang]}: {activeSlot}</p>

                {[
                  ['masterVolume', UI.master_volume[lang]],
                  ['uiVolume', UI.ui_volume[lang]],
                  ['combatVolume', UI.combat_volume[lang]],
                  ['achievementVolume', UI.achievement_volume[lang]]
                ].map(([key, label]) => (
                  <label key={key} className="block mb-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-bold text-slate-200">{label}</span>
                      <span className="text-sm text-slate-400">{metaProgress.settings[key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={metaProgress.settings[key]}
                      onChange={(event) => setAudioSetting(key, Number(event.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {titleView === 'collection' && (
            <div className="w-full max-w-6xl grid gap-5 animate-slide-fade px-1">
              <div className="flex flex-wrap gap-3">
                {Object.entries(CHARACTERS).map(([key, char]) => (
                  <button
                    key={key}
                    onClick={() => setCollectionTab(key)}
                    className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                      collectionTab === key
                        ? 'bg-slate-200 text-slate-950 border-slate-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-400 hover:text-white'
                    }`}
                  >
                    {char.name[lang]}
                  </button>
                ))}
              </div>

              {(() => {
                const char = CHARACTERS[collectionTab];
                const cards = CHARACTER_COLLECTIONS[collectionTab].cards;
                const relics = CHARACTER_COLLECTIONS[collectionTab].relics;
                const unlockedCards = cards.filter(card => metaProgress.unlockedCards.includes(card));
                const unlockedRelics = relics.filter(relic => metaProgress.unlockedRelics.includes(relic));
                return (
                  <>
                    <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-2xl font-bold ${char.color}`}>{char.name[lang]}</h3>
                        <span className={`text-xs font-bold uppercase tracking-widest ${metaProgress.unlockedCharacters.includes(collectionTab) ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {metaProgress.unlockedCharacters.includes(collectionTab) ? UI.unlocked[lang] : UI.locked[lang]}
                        </span>
                      </div>

                      <div className="mb-5">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{UI.starter_relic[lang]}</div>
                        <div className="grid gap-2">
                          {relics.map((relic) => {
                            const translatedRelic = getTranslatedRelic(relic, lang);
                            const isUnlocked = metaProgress.unlockedRelics.includes(relic);
                            return (
                              <div key={relic} className={`rounded-xl border p-3 ${isUnlocked ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="inline-flex items-center gap-2 font-bold"><RelicIcon relicName={relic} className="w-4 h-4 shrink-0 text-amber-300" />{translatedRelic.name}</span>
                                  <span className={`text-[10px] uppercase tracking-widest ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>{isUnlocked ? UI.unlocked[lang] : UI.locked[lang]}</span>
                                </div>
                                <div className="text-sm mt-1">{translatedRelic.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">{UI.unlocked_count[lang]}: {unlockedRelics.length} / {relics.length}</div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{UI.class_cards[lang]}</div>
                        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3 sm:p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {cards.map((card) => {
                              const translatedCard = getTranslatedCard(card, lang);
                              const isUnlocked = metaProgress.unlockedCards.includes(card);
                              const cardType = translatedCard.type || 'Skill';
                              const rarity = translatedCard.rarity || 'Common';
                              const typeMeta = CARD_TYPE_META[cardType] || CARD_TYPE_META.Skill;
                              const rarityMeta = CARD_RARITY_META[rarity] || CARD_RARITY_META.Common;
                              const descriptionLength = (translatedCard.desc || '').length;
                              const bgClass = cardType === 'Attack'
                                ? 'bg-gradient-to-b from-red-950/90 via-slate-900/95 to-slate-950/95'
                                : cardType === 'Power'
                                  ? 'bg-gradient-to-b from-violet-950/90 via-slate-900/95 to-slate-950/95'
                                  : cardType === 'Status'
                                    ? 'bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950/95'
                                    : 'bg-gradient-to-b from-sky-950/90 via-slate-900/95 to-slate-950/95';
                              const descClass = descriptionLength > 90
                                ? 'text-[9px] leading-[1.08]'
                                : descriptionLength > 60
                                  ? 'text-[10px] leading-[1.12]'
                                  : 'text-[11px] leading-snug';
                              return (
                                <div
                                  key={card}
                                  className={`relative min-h-[17rem] rounded-xl border-2 flex flex-col p-3 overflow-hidden ${bgClass} ${rarityMeta.glowClass} ${rarityMeta.borderClass || 'border-slate-700/70'} ${isUnlocked ? 'text-slate-100' : 'opacity-55 saturate-50 text-slate-500 border-slate-800 shadow-none'}`}
                                >
                                  <div className="text-center font-bold text-sm text-slate-100 mb-2 w-full border-b border-slate-700/50 pb-2">
                                    {translatedCard.name}
                                  </div>
                                  <div className={`flex-1 flex items-center justify-center text-center text-slate-300 px-1 ${isUnlocked ? '' : 'text-slate-500'} ${descClass}`}>
                                    {renderCardDescription(translatedCard.desc)}
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2">
                                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${typeMeta.badgeClass}`}>
                                      {typeMeta.label}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-[0.18em] ${rarityMeta.badgeClass}`}>
                                      {rarityMeta.label}
                                    </span>
                                  </div>
                                  <div className={`mt-2 text-[10px] font-bold uppercase tracking-[0.18em] ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {isUnlocked ? UI.unlocked[lang] : UI.locked[lang]}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">{UI.unlocked_count[lang]}: {unlockedCards.length} / {cards.length}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5">
                      <h3 className="text-xl font-bold text-amber-300 mb-4">{UI.spire_relics[lang]}</h3>
                      <div className="flex flex-wrap gap-2">
                        {generalRelics.map((relic) => (
                          <div key={relic} className={`px-2 py-1 rounded border text-xs inline-flex items-center gap-1.5 ${metaProgress.unlockedRelics.includes(relic) ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-600'}`}><RelicIcon relicName={relic} className="w-3.5 h-3.5 shrink-0" />
                            {getTranslatedRelic(relic, lang).name}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-slate-500 mt-3">{UI.unlocked_count[lang]}: {generalRelics.filter(relic => metaProgress.unlockedRelics.includes(relic)).length} / {generalRelics.length}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes floatEmber { 0% { transform: translateY(0) scale(1); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-100px) scale(0.5); opacity: 0; } }
          .animate-float-ember { animation: floatEmber linear infinite; }
          @keyframes slideFadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-slide-fade { animation: slideFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}} />
      </div>
    );
  }

  const getEnemySizeClass = (type) => {
    if (type === 'Boss') return "w-80 h-80 md:w-[32rem] md:h-[32rem]";
    if (type === 'Elite') return "w-72 h-72 md:w-96 md:h-96";
    if (type === 'Shop' || type === 'Event' || type === 'Rest' || type === 'Game Over' || type === 'Victory' || type === 'Transition') return "w-48 h-48 md:w-56 md:h-56";
    return "w-64 h-64 md:w-80 md:h-80";
  };

  const charKeyObj = CHARACTERS[gameState.characterKey] || Object.values(CHARACTERS).find(c => c.name.en === gameState.character.name.en);
  const charKeyString = charKeyObj?.name?.en?.replace(/THE /i, '').trim().toLowerCase() || 'ironclad';
  const playerSpriteKey = `player_${charKeyString}`;
  
  const displayFloor = gameState.floor === 0 ? 1 : gameState.floor > 30 ? 30 : gameState.floor;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row selection:bg-red-900 selection:text-white overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <div className="fixed top-4 right-4 z-[500] flex flex-col gap-3 pointer-events-none">
        {achievementToasts.map((toast) => (
          <div key={toast.id} className="w-[22rem] bg-slate-950/95 border border-emerald-500/40 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] overflow-hidden animate-slide-fade">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-yellow-300 to-emerald-400"></div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                {renderAchievementIcon(toast.achievement.icon, "w-6 h-6")}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-300 mb-1">{UI.achievement_unlocked[lang]}</div>
                <div className="font-bold text-slate-100 truncate">{toast.achievement.title[lang]}</div>
                <div className="text-sm text-slate-400">{toast.achievement.desc[lang]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Top-right controls for active game */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[300] flex items-center gap-2">
          <button
            onClick={cycleLanguage}
            title={`Language: ${lang.toUpperCase()}`}
            className="h-10 px-3 rounded border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-400 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
          <button
            onClick={toggleMute}
            title={metaProgress.settings.isMuted ? UI.unmute[lang] : UI.mute[lang]}
            className={`h-10 w-10 rounded border transition-colors flex items-center justify-center ${
              metaProgress.settings.isMuted
                ? 'bg-red-950/60 text-red-200 border-red-500/40'
                : 'bg-slate-900/80 text-slate-200 border-slate-700 hover:border-slate-400'
            }`}
          >
            {metaProgress.settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setInGameMenuTab('options');
              setIsInGameMenuOpen(true);
            }}
            title={UI.menu[lang]}
            className="h-10 w-10 rounded border bg-slate-900/80 text-slate-200 border-slate-700 hover:border-slate-400 transition-colors flex items-center justify-center"
          >
            <MenuIcon className="w-4 h-4" />
          </button>
      </div>

      {isInGameMenuOpen && (
        <div className="fixed inset-0 z-[400] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-1">{UI.menu[lang]}</div>
                <h2 className="text-2xl font-bold text-slate-100">
                  {inGameMenuTab === 'achievements' ? UI.achievements[lang] : UI.options[lang]}
                </h2>
              </div>
              <button
                onClick={() => setIsInGameMenuOpen(false)}
                className="px-3 py-1 rounded text-sm font-bold border bg-slate-800 text-slate-200 border-slate-600 hover:border-slate-400 transition-colors"
              >
                {UI.close[lang]}
              </button>
            </div>

            <div className="flex items-center gap-2 px-5 pt-4">
              {[
                ['options', UI.options[lang]],
                ['achievements', UI.achievements[lang]]
              ].map(([tabId, label]) => (
                <button
                  key={tabId}
                  onClick={() => setInGameMenuTab(tabId)}
                  className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                    inGameMenuTab === tabId
                      ? 'bg-slate-200 text-slate-950 border-slate-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {inGameMenuTab === 'achievements' ? (
                <div className="grid gap-4">
                  {ACHIEVEMENT_DEFS.map((achievement) => {
                    const [current, target] = achievement.progress(metaProgress.stats);
                    const ratio = target === 0 ? 1 : current / target;
                    const isComplete = metaProgress.achievements[achievement.id]?.completed;
                    return (
                      <div key={achievement.id} className={`rounded-2xl border p-5 ${isComplete ? 'bg-emerald-950/30 border-emerald-700/50' : 'bg-slate-950/80 border-slate-700'}`}>
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${isComplete ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                              {renderAchievementIcon(achievement.icon)}
                            </div>
                            <div>
                              <h3 className={`text-xl font-bold ${isComplete ? 'text-emerald-300' : 'text-slate-100'}`}>{achievement.title[lang]}</h3>
                              <p className="text-sm text-slate-400">{achievement.desc[lang]}</p>
                            </div>
                          </div>
                          <div className={`text-xs font-bold uppercase tracking-widest ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isComplete ? UI.unlocked[lang] : UI.progress[lang]}
                          </div>
                        </div>
                        <div className="h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-2">
                          <div className={`h-full ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }}></div>
                        </div>
                        <div className="text-xs text-slate-400">{UI.progress[lang]}: {current} / {target}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1fr_auto] gap-5">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-2xl font-bold text-slate-100 mb-1">{UI.audio[lang]}</h3>
                    <p className="text-sm text-slate-400 mb-5">{UI.active_slot[lang]}: {activeSlot}</p>

                    {[
                      ['masterVolume', UI.master_volume[lang]],
                      ['uiVolume', UI.ui_volume[lang]],
                      ['combatVolume', UI.combat_volume[lang]],
                      ['achievementVolume', UI.achievement_volume[lang]]
                    ].map(([key, label]) => (
                      <label key={key} className="block mb-5">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="font-bold text-slate-200">{label}</span>
                          <span className="text-sm text-slate-400">{metaProgress.settings[key]}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={metaProgress.settings[key]}
                          onChange={(event) => setAudioSetting(key, Number(event.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={toggleMute}
                      className={`px-4 py-3 rounded-xl border font-bold transition-colors ${
                        metaProgress.settings.isMuted
                          ? 'bg-red-950/60 text-red-200 border-red-500/40'
                          : 'bg-slate-800 text-slate-200 border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {metaProgress.settings.isMuted ? UI.unmute[lang] : UI.mute[lang]}
                    </button>
                    <button
                      onClick={returnToTitle}
                      className="px-4 py-3 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-200 hover:bg-amber-900/50 transition-colors font-bold"
                    >
                      {UI.return_to_title[lang]}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR - STATS & INVENTORY */}
      <div className="relative w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700 p-4 md:p-6 flex flex-col gap-4 md:gap-6 shadow-2xl z-[150] max-h-[40vh] md:max-h-none overflow-y-auto">
        <div className="text-center pb-4 border-b border-slate-700">
          <h1 className={`text-2xl font-bold ${gameState.character.color} tracking-wider uppercase mb-1`}>{gameState.character.name[lang]}</h1>
          <p className="text-sm text-slate-400 flex items-center justify-center gap-1">
            <MapIcon className="w-4 h-4" /> {UI.act[lang]} {gameState.act} - {UI.floor[lang]} {displayFloor}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
            <Heart className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-sm text-slate-400">{UI.health[lang]}</span>
            <span className="text-lg font-bold">{gameState.hp} / {gameState.maxHp}</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col items-center">
            <Coins className="w-6 h-6 text-yellow-400 mb-1" />
            <span className="text-sm text-slate-400">{UI.gold[lang]}</span>
            <span className="text-lg font-bold">{gameState.gold}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <RelicBadgeIcon className="w-4 h-4" /> {UI.relics[lang]} ({gameState.relics.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {gameState.relics.map((relic, i) => {
              const tr = getTranslatedRelic(relic, lang);
              return (
              <div key={i} onMouseEnter={() => setHoveredInfo({ title: tr.name, desc: tr.desc || COPY.fallback.unknownEffect[lang] })} onMouseLeave={() => setHoveredInfo(null)} className="bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 text-slate-300 cursor-help hover:bg-slate-700 hover:-translate-y-0.5 transition-all shadow-sm inline-flex items-center gap-1.5">
                <RelicIcon relicName={relic} className="w-3.5 h-3.5 shrink-0 text-amber-300" />{tr.name}
              </div>
            )})}
          </div>
        </div>

        <div className="flex-1 min-h-0 max-h-40 md:max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CardIcon className="w-4 h-4" /> {UI.deck[lang]} ({gameState.deck.length})
          </h2>
          <div className="flex flex-col gap-1">
            {gameState.deck.map((card, i) => {
              const tc = getTranslatedCard(card, lang);
              return (
              <div key={i} onMouseEnter={() => setHoveredInfo({ title: tc.name, desc: tc.desc || COPY.fallback.unknownEffect[lang] })} onMouseLeave={() => setHoveredInfo(null)} className="bg-slate-800 text-sm px-3 py-1.5 rounded border border-slate-700 text-slate-300 flex justify-between items-center cursor-help hover:bg-slate-700 hover:border-slate-500 transition-all shadow-sm">
                <span>{tc.name}</span>
              </div>
            )})}
          </div>
        </div>

        <div className="flex-1 min-h-0 max-h-36 md:max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-[#2a2420] rounded-lg border border-[#4a3b32] p-3 shadow-inner relative">
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}></div>
          <h2 className="text-sm font-bold text-[#b49b78] uppercase tracking-wider mb-3 flex items-center gap-2 relative z-10">
            <MapIcon className="w-4 h-4" /> {UI.spire_map[lang]}
          </h2>
          <div className="flex flex-col gap-1 relative pl-2 z-10">
            <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-[#5e4b3e] z-0 opacity-50 border-l border-dashed border-[#8b7355]"></div>
            {gameState.route.map((node, i) => {
              const floorNum = (gameState.act - 1) * 10 + i + 1;
              const isPast = floorNum < gameState.floor;
              const isCurrent = floorNum === gameState.floor;
              
              let icon;
              if (node.type === 'Combat') icon = <AttackIcon className="w-3 h-3 text-[#d1b098]" />;
              else if (node.type === 'Event') icon = <Sparkles className="w-3 h-3 text-[#8ca3c7]" />;
              else if (node.type === 'Shop') icon = <Coins className="w-3 h-3 text-[#c7b471]" />;
              else if (node.type === 'Elite') icon = <Skull className="w-3 h-3 text-[#b38bc7]" />;
              else if (node.type === 'Rest') icon = <Library className="w-3 h-3 text-[#c78b61]" />;
              else if (node.type === 'Boss') icon = <Skull className="w-3 h-3 text-[#c76161]" />;

              return (
                <div key={i} className={`flex items-center gap-3 z-10 p-1 rounded ${isCurrent ? 'bg-[#3b322a] border border-[#7a6552] shadow-lg scale-105' : ''} ${isPast ? 'opacity-30' : ''} transition-all`}>
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center bg-[#1f1a17] border ${isCurrent ? 'border-[#dfbc8e] shadow-[0_0_10px_rgba(223,188,142,0.5)]' : 'border-[#4a3b32]'}`}>
                    {icon}
                  </div>
                  <span className={`text-xs ${isCurrent ? 'text-[#dfbc8e] font-bold' : 'text-[#a38c75]'}`}>{UI.floor[lang]} {floorNum}: {node.type}</span>
                </div>
              );
            })}
          </div>
        </div>

        {hoveredInfo && (
          <div className="fixed bottom-4 left-4 right-4 md:left-[21rem] md:right-auto md:top-32 md:bottom-auto p-4 bg-slate-800 border border-slate-400 rounded-xl shadow-2xl md:w-64 z-[260] pointer-events-none animate-slide-fade">
            <h3 className="text-lg font-bold text-amber-400 mb-1">{hoveredInfo.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{renderTextWithIcons(hoveredInfo.desc)}</p>
          </div>
        )}
      </div>

      {/* MAIN PLAY AREA */}
      <div className={`flex-1 relative flex flex-col items-center justify-start p-0 bg-black transition-colors duration-300 min-h-[60vh] md:min-h-screen ${effect === 'damage' ? 'bg-red-950/40' : ''}`}>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <SpireBackground roomType={currentRoomType} isMoving={isMazeMoving} lightClass={getBgLight(currentRoomType)} transitionMode={transitionMode} />
        </div>

        {/* ENEMY / MERCHANT / EVENT SPRITE */}
        {currentNode?.spriteKey && (
          <div className={`absolute top-[2vh] md:top-[4vh] left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 pointer-events-none ${isMazeMoving ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] ${enemyAnim === 'attack' ? 'anim-enemy-attack' : enemyAnim === 'hurt' ? 'anim-sprite-hurt' : enemyAnim === 'block' ? 'anim-sprite-block' : enemyAnim === 'buff' ? 'anim-sprite-buff' : 'animate-float-delayed'}`}>
               <PixelSprite spriteKey={gameState.combat?.active ? gameState.combat.enemySprite : currentNode.spriteKey} className={getEnemySizeClass(currentNode.type)} />
            </div>
          </div>
        )}

        {/* MAIN UI CARD */}
        <div className={`relative z-20 w-[calc(100%-1rem)] ${gameState.combat?.active ? 'max-w-xl mt-[18vh] md:mt-[29vh] mb-6 flex-none rounded-2xl' : 'max-w-2xl mt-[17vh] md:mt-[26vh] mb-0 md:mb-4 rounded-t-2xl md:rounded-2xl flex flex-col flex-1 max-h-[74vh] md:max-h-[85vh]'} bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all ${isMazeMoving ? 'opacity-0 translate-y-24 scale-95 pointer-events-none duration-500' : 'animate-room-enter'} ${effect === 'damage' ? 'animate-shake border-red-500/70 shadow-red-900/50' : ''} ${effect === 'heal' ? 'border-green-500/70 shadow-green-900/50' : ''} ${effect === 'gain' ? 'border-yellow-500/70 shadow-yellow-900/50' : ''}`}>
          
          <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='uiNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23uiNoise)'/%3E%3C/svg%3E")` }}></div>

          {gameState.combat?.active ? (
            
            /* --- COMBAT ARENA UI --- */
            <div className="relative z-10">
              <div className="grid divide-y divide-slate-700/80 bg-gradient-to-b from-slate-900/95 via-slate-900/92 to-slate-950/95">
                <div className="px-5 py-5 md:px-6 md:py-6">
                  <CombatVitals
                    sectionLabel={currentNode.type}
                    title={gameState.combat.enemyName[lang] || gameState.combat.enemyName.en}
                    hp={gameState.combat.enemyHp}
                    maxHp={gameState.combat.enemyMaxHp}
                    block={gameState.combat.enemyBlock}
                    blockLabel={UI.block[lang]}
                    previewHp={displayedHoverPreview?.enemyHp}
                    previewBlock={displayedHoverPreview?.enemyBlock}
                    subline={
                      <span className="text-yellow-300 animate-pulse font-mono bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-700/50 inline-flex items-center gap-2">
                        {gameState.combat.intent?.type === 'attack' ? <AttackIcon className="w-4 h-4" /> : gameState.combat.intent?.type === 'defend' ? <Shield className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                        <span>{UI.intent[lang]}: {renderTextWithIcons(gameState.combat.intent.text[lang] || gameState.combat.intent.text.en)}</span>
                      </span>
                    }
                    statuses={[
                      gameState.combat.enemyStrength > 0 && <span key="enemy-str" className="text-orange-400 text-xs px-2 py-1 bg-orange-950/50 rounded border border-orange-900 drop-shadow inline-flex items-center gap-1"><Flame className="w-3 h-3" />+{gameState.combat.enemyStrength} {UI.str[lang]}</span>,
                      gameState.combat.enemyVuln > 0 && <span key="enemy-vuln" className="text-purple-400 text-xs px-2 py-1 bg-purple-950/50 rounded border border-purple-900 drop-shadow inline-flex items-center gap-1"><Eye className="w-3 h-3" />{gameState.combat.enemyVuln} {UI.vuln[lang]}</span>,
                      gameState.combat.enemyWeak > 0 && <span key="enemy-weak" className="text-blue-400 text-xs px-2 py-1 bg-blue-950/50 rounded border border-blue-900 drop-shadow inline-flex items-center gap-1"><Wind className="w-3 h-3" />{gameState.combat.enemyWeak} {UI.weak[lang]}</span>
                    ].filter(Boolean)}
                  />
                </div>

                <div className="px-5 py-5 md:px-6 md:py-6 bg-slate-800/40">
                  <CombatVitals
                    sectionLabel={UI.combat_status[lang]}
                    title={gameState.character?.name?.[lang] || gameState.character?.name?.en || UI.combat_status[lang]}
                    hp={gameState.hp}
                    maxHp={gameState.maxHp}
                    block={gameState.combat.playerBlock}
                    blockLabel={UI.block[lang]}
                    align="right"
                    previewHp={displayedHoverPreview?.playerHp}
                    previewBlock={displayedHoverPreview?.playerBlock}
                    incomingHp={displayedEnemyIntentPreview?.playerHp}
                    incomingBlock={displayedEnemyIntentPreview?.playerBlock}
                    statuses={[
                      gameState.combat.playerStrength > 0 && <span key="player-str" className="text-orange-400 text-xs px-2 py-1 bg-orange-950/50 rounded border border-orange-900 drop-shadow inline-flex items-center gap-1"><Flame className="w-3 h-3" />+{gameState.combat.playerStrength} {UI.str[lang]}</span>,
                      gameState.combat.playerVuln > 0 && <span key="player-vuln" className="text-purple-400 text-xs px-2 py-1 bg-purple-950/50 rounded border border-purple-900 drop-shadow inline-flex items-center gap-1"><Eye className="w-3 h-3" />{gameState.combat.playerVuln} {UI.vuln[lang]}</span>
                    ].filter(Boolean)}
                    footer={
                      <>
                        <div>{UI.turn[lang]}: <span className="text-slate-300 font-bold">{gameState.combat.turn}</span></div>
                        <div>{UI.draw_pile[lang]}: <span className="text-slate-300 font-bold">{gameState.combat.drawPile.length}</span></div>
                        <div>{UI.discard_pile[lang]}: <span className="text-slate-300 font-bold">{gameState.combat.discardPile.length}</span></div>
                      </>
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            
            /* --- STORY NODE UI --- */
            <div className="relative z-10 flex flex-col h-full overflow-y-auto custom-scrollbar pb-8">
              <div className="bg-slate-800/80 px-8 py-6 border-b border-slate-700 flex flex-col items-center justify-center gap-2 text-center shadow-lg">
                <div>
                  <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">{currentNode.type}</div>
                  <h2 className="text-3xl font-bold text-slate-100">{currentNode.title[lang] || (typeof currentNode.title === 'string' ? currentNode.title : '')}</h2>
                </div>
              </div>

              <div className="px-8 py-10 text-lg leading-relaxed text-slate-300 min-h-[160px] flex items-center justify-center text-center">
                <p className="animate-slide-fade">{currentNode.text[lang] || (typeof currentNode.text === 'string' ? currentNode.text : '')}</p>
              </div>

              <div className="p-6 bg-slate-950/80 border-t border-slate-800 pr-16 md:pr-24">
                <p className="text-xs text-slate-500 uppercase tracking-widest text-center mb-4">{UI.choose_path[lang]}</p>
                <div className="flex flex-col gap-3">
                  {currentNode.choices.map((choice, index) => {
                    const isDisabled = (choice.condition ? !choice.condition(gameState) : false) || isMazeMoving || isCombatResolving;
                    return (
                      <button
                        key={index}
                        onClick={() => handleChoice(choice)}
                        disabled={isDisabled}
                        className={`
                          w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden
                          ${isDisabled 
                            ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' 
                            : 'bg-slate-800/80 border-slate-600 hover:bg-slate-700 hover:border-slate-400 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-[1.02] cursor-pointer'}
                        `}
                      >
                        {!isDisabled && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        )}
                        <div className="flex items-start gap-4 relative z-10">
                          <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${isDisabled ? 'border-slate-700 text-slate-700' : 'border-slate-400 text-slate-400 group-hover:border-white group-hover:text-white'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className={`font-bold text-lg mb-1 drop-shadow-sm ${isDisabled ? 'text-slate-600' : 'text-slate-200'}`}>
                              {choice.label[lang] || (typeof choice.label === 'string' ? choice.label : '')}
                            </div>
                            <div className={`text-sm leading-relaxed ${isDisabled ? 'text-slate-700' : 'text-slate-400'}`}>
                              {renderTextWithIcons(choice.effectText[lang] || (typeof choice.effectText === 'string' ? choice.effectText : ''))}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PLAYER SPRITE */}
        <div className={`fixed bottom-2 right-1 md:bottom-6 md:right-8 z-[100] transition-opacity duration-500 pointer-events-none ${isMazeMoving ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] ${playerAnim === 'attack' ? 'anim-player-attack' : playerAnim === 'hurt' ? 'anim-sprite-hurt' : playerAnim === 'block' ? 'anim-sprite-block' : playerAnim === 'buff' ? 'anim-sprite-buff' : 'animate-float'}`}>
             <PixelSprite spriteKey={playerSpriteKey} charType={charKeyObj.name.en.replace(/THE /i, '').trim().toUpperCase()} className="w-32 h-32 sm:w-40 sm:h-40 md:w-72 md:h-72" />
          </div>
        </div>

        {/* FLOATING CARD HAND */}
        {gameState.combat?.active && (
          <div className="fixed bottom-2 sm:bottom-3 md:bottom-6 left-2 right-20 sm:right-28 md:left-auto md:right-40 w-auto md:w-[34rem] flex justify-end items-end h-44 sm:h-52 md:h-64 z-[200] pointer-events-none" style={{ perspective: '1000px' }}>
            {gameState.combat.hand.map((card, idx) => {
               const tc = getTranslatedCard(card, lang);
               const cardType = tc.type || 'Skill';
               const rarity = tc.rarity || 'Common';
               const typeMeta = CARD_TYPE_META[cardType] || CARD_TYPE_META.Skill;
               const rarityMeta = CARD_RARITY_META[rarity] || CARD_RARITY_META.Common;
               const descriptionLength = (tc.desc || '').length;
               
               const isPlaying = playedCardIndex === idx;
               const isHovered = hoveredCardIndex === idx && !isCombatResolving && !isPlaying;
               
               const bgClass = cardType === 'Attack'
                 ? 'bg-gradient-to-b from-red-950/90 via-slate-900/95 to-slate-950/95'
                 : cardType === 'Power'
                   ? 'bg-gradient-to-b from-violet-950/90 via-slate-900/95 to-slate-950/95'
                   : cardType === 'Status'
                     ? 'bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950/95'
                     : 'bg-gradient-to-b from-sky-950/90 via-slate-900/95 to-slate-950/95';
               const borderClass = isHovered
                 ? (cardType === 'Attack'
                    ? 'border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                    : cardType === 'Power'
                      ? 'border-violet-400 shadow-[0_0_30px_rgba(167,139,250,0.55)]'
                      : 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.5)]')
                 : `border-slate-700/70 ${rarityMeta.glowClass} ${rarityMeta.borderClass}`;
               const descClass = descriptionLength > 90
                 ? 'text-[8px] sm:text-[9px] md:text-[11px] leading-[1.08]'
                 : descriptionLength > 60
                   ? 'text-[9px] sm:text-[10px] md:text-[12px] leading-[1.12]'
                   : 'text-[10px] sm:text-[11px] md:text-sm leading-snug';
               
               const count = gameState.combat.hand.length;
               const cardsFromRight = count - 1 - idx;
               const normalized = count <= 1 ? 0 : cardsFromRight / (count - 1);
               const maxFanAngle = Math.min(22, 8 + count * 2);
               const curveLift = count > 6 ? 18 : 14;

               // Poker-style fan from the hero side:
               // right-most card stays almost upright, cards further left rotate
               // and rise along a shallow arc instead of a straight diagonal.
               const rotation = isHovered ? 0 : (2.5 - normalized * maxFanAngle);
               const translateY = isHovered ? -18 : Math.pow(normalized, 1.35) * curveLift;
               const scale = isHovered ? 1.2 : 1;
               const baseZIndex = idx + 1;
               const zIndex = isPlaying ? 300 : (isHovered ? 250 : baseZIndex);

               return (
                 <div 
                   key={idx} 
                   className={`relative -ml-9 sm:-ml-10 md:-ml-12 first:ml-0 transition-all duration-200 ease-out`}
                   style={{ 
                     zIndex,
                     transform: `translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
                     transformOrigin: 'bottom right'
                   }}
                 >
                   <button
                     onMouseEnter={() => setHoveredCardIndex(idx)}
                     onMouseLeave={() => setHoveredCardIndex(null)}
                     onClick={() => playCardInCombat(card, idx)}
                     disabled={isCombatResolving}
                     className={`relative block w-24 h-36 sm:w-28 sm:h-40 md:w-40 md:h-56 rounded-xl border-2 flex flex-col items-center p-2 sm:p-3 text-left overflow-hidden pointer-events-auto ${bgClass} ${borderClass} transition-colors duration-200
                       ${isPlaying ? 'animate-play-card shadow-[0_0_50px_rgba(255,255,255,0.8)] border-white' : ''}
                       ${!isCombatResolving && !isPlaying ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                   >
                     <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full ${isHovered ? 'animate-[shimmer_1.5s_infinite]' : ''}`}></div>
                     <div className="text-center font-bold text-[11px] sm:text-xs md:text-base text-slate-200 mb-1 sm:mb-2 w-full border-b border-slate-700/50 pb-1 sm:pb-2 drop-shadow-md relative z-10">
                       {tc.name}
                     </div>
                     <div className={`flex-1 w-full flex items-center justify-center px-1 text-slate-300 text-center drop-shadow-md relative z-10 ${descClass}`}>
                       {renderCardDescription(tc.desc)}
                     </div>
                     <div className="relative z-10 mt-1.5 w-full pt-1.5 border-t border-slate-700/50 flex items-center justify-between gap-2">
                       <span className={`rounded-full border px-2 py-0.5 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] ${typeMeta.badgeClass}`}>
                         {typeMeta.label}
                       </span>
                       <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] ${rarityMeta.badgeClass}`}>
                         {rarityMeta.label}
                       </span>
                     </div>
                     <div className={`absolute -top-6 -left-6 w-16 h-16 rounded-full blur-xl transition-all z-0 ${isHovered ? 'bg-white/10' : 'bg-white/5'}`}></div>
                   </button>
                 </div>
               );
            })}
          </div>
        )}

        {/* FLOATING REWARDS OVERLAY */}
        <div className="absolute inset-0 pointer-events-none z-[120] overflow-hidden">
          {rewardEffects.map(effect => (
            <div key={effect.id} className="absolute anim-float-up-fade flex items-center gap-2 text-2xl md:text-3xl font-extrabold drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
                 style={{ left: effect.x, top: effect.y, color: effect.color, animationDelay: `${effect.delay || 0}ms` }}>
               {renderRewardIcon(effect.type)} {renderFloatingEffectText(effect.text, effect.type)}
            </div>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 115, 85, 0.4); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 115, 85, 0.8); }
          
          /* The inner SVG handles transform translations to not override wrapper */
          @keyframes playerAttack { 0% { transform: translate(0, 0) scale(1); } 30% { transform: translate(-40px, -60px) scale(1.1); } 100% { transform: translate(0, 0) scale(1); } }
          .anim-player-attack { animation: playerAttack 0.4s ease-out forwards; }
          
          @keyframes enemyAttack { 0% { transform: translate(0, 0) scale(1); } 30% { transform: translate(0px, 60px) scale(1.1); } 100% { transform: translate(0, 0) scale(1); } }
          .anim-enemy-attack { animation: enemyAttack 0.4s ease-out forwards; }
          
          @keyframes spriteHurt { 0% { filter: brightness(1) sepia(0); transform: translateX(0); } 20% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-10px); } 80% { transform: translateX(10px); } 100% { filter: brightness(1) sepia(0); transform: translateX(0); } }
          .anim-sprite-hurt { animation: spriteHurt 0.4s ease-in-out forwards; }
          
          @keyframes spriteBlock { 0% { filter: drop-shadow(0 0 0px #60a5fa); transform: scale(1); } 50% { filter: drop-shadow(0 0 30px #3b82f6); transform: scale(1.05); } 100% { filter: drop-shadow(0 0 0px #60a5fa); transform: scale(1); } }
          .anim-sprite-block { animation: spriteBlock 0.5s ease-out forwards; }
          
          @keyframes spriteBuff { 0% { filter: brightness(1) drop-shadow(0 0 0px #eab308); transform: scale(1); } 50% { filter: brightness(1.3) drop-shadow(0 0 30px #eab308); transform: scale(1.05); } 100% { filter: brightness(1) drop-shadow(0 0 0px #eab308); transform: scale(1); } }
          .anim-sprite-buff { animation: spriteBuff 0.5s ease-out forwards; }

          @keyframes floatUpFade { 0% { opacity: 0; transform: translateY(20px) scale(0.8); } 15% { opacity: 1; transform: translateY(0px) scale(1.2); } 80% { opacity: 1; transform: translateY(-40px) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(0.9); } }
          .anim-float-up-fade { animation: floatUpFade 2s forwards ease-out; }

          @keyframes playCardAnim {
            0% { transform: translateY(0) scale(1); opacity: 1; filter: brightness(1.2); }
            30% { transform: translateY(-20vh) scale(1.3); opacity: 1; filter: brightness(2); }
            100% { transform: translateY(-30vh) scale(1.8); opacity: 0; filter: brightness(3); }
          }
          .animate-play-card { animation: playCardAnim 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          .animate-room-enter { animation: roomEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes roomEnter { 0% { opacity: 0; transform: scale(0.95) translateY(20px); filter: blur(4px); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }
          @keyframes roomPushForward { 0% { transform: translateZ(0) scale(1) translateY(0); filter: blur(0); } 55% { transform: scale(1.18) translateY(4px); filter: blur(1px); } 100% { transform: scale(1.45) translateY(12px); filter: blur(7px); opacity: 0.25; } }
          .animate-room-push-forward { animation: roomPushForward 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards; transform-origin: center center; }
            @keyframes cornerLeftWall { 0% { transform: translateX(55%) skewX(-6deg) scaleX(0.85); opacity: 0; } 18% { opacity: 1; } 100% { transform: translateX(0%) skewX(-18deg) scaleX(1.15); opacity: 1; } }
            .animate-corner-left-wall { animation: cornerLeftWall 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) forwards; transform-origin: right center; }
            @keyframes cornerLeftOpening { 0% { transform: translateX(0%) scaleX(1); opacity: 0; } 25% { opacity: 0.85; } 100% { transform: translateX(-18%) scaleX(1.14); opacity: 1; } }
            .animate-corner-left-opening { animation: cornerLeftOpening 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) forwards; }
            @keyframes cornerLeftFloor { 0% { transform: translateX(10%) scale(0.92); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateX(-8%) scale(1.12); opacity: 1; } }
            .animate-corner-left-floor { animation: cornerLeftFloor 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) forwards; transform-origin: bottom right; }
            @keyframes cornerRightWall { 0% { transform: translateX(-55%) skewX(6deg) scaleX(0.85); opacity: 0; } 18% { opacity: 1; } 100% { transform: translateX(0%) skewX(18deg) scaleX(1.15); opacity: 1; } }
            .animate-corner-right-wall { animation: cornerRightWall 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) forwards; transform-origin: left center; }
            @keyframes cornerRightOpening { 0% { transform: translateX(0%) scaleX(1); opacity: 0; } 25% { opacity: 0.85; } 100% { transform: translateX(18%) scaleX(1.14); opacity: 1; } }
            .animate-corner-right-opening { animation: cornerRightOpening 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) forwards; }
            @keyframes cornerRightFloor { 0% { transform: translateX(-10%) scale(0.92); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateX(8%) scale(1.12); opacity: 1; } }
            .animate-corner-right-floor { animation: cornerRightFloor 0.9s cubic-bezier(0.2, 0.9, 0.2, 1) forwards; transform-origin: bottom left; }
            @keyframes roomFadeVeil { 0% { opacity: 0; } 40% { opacity: 0.12; } 68% { opacity: 1; } 100% { opacity: 0; } }
            .animate-room-fade-veil { animation: roomFadeVeil 0.98s ease-in-out forwards; }

          @keyframes floatEmber { 0% { transform: translate3d(0, 8px, 0) scale(0.9); opacity: 0; } 18% { opacity: 0.9; } 60% { transform: translate3d(10px, -48px, 0) scale(1.08); opacity: 0.72; } 100% { transform: translate3d(-10px, -120px, 0) scale(0.55); opacity: 0; } }
          .animate-float-ember { animation: floatEmber linear infinite; }
          @keyframes driftAsh { 0% { transform: translate3d(0, -6px, 0) scale(1); opacity: 0; } 15% { opacity: 0.72; } 55% { transform: translate3d(14px, -28px, 0) scale(1.08); opacity: 0.5; } 100% { transform: translate3d(-16px, -84px, 0) scale(0.55); opacity: 0; } }
          .animate-drift-ash { animation: driftAsh linear infinite; }
          @keyframes magmaSheet { 0% { transform: translateX(-2%) scaleY(0.98); opacity: 0.5; } 50% { transform: translateX(2%) scaleY(1.06); opacity: 0.82; } 100% { transform: translateX(-2%) scaleY(0.98); opacity: 0.5; } }
          .animate-magma-sheet { animation: magmaSheet 4.8s ease-in-out infinite; }
          @keyframes magmaRiver { 0% { transform: translateX(-8%) skewX(-3deg); filter: saturate(1); } 50% { transform: translateX(8%) skewX(3deg); filter: saturate(1.25); } 100% { transform: translateX(-8%) skewX(-3deg); filter: saturate(1); } }
          .animate-magma-river { animation: magmaRiver linear infinite; }
          @keyframes crystalColumn { 0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.58; } 50% { transform: translateY(-14px) scaleY(1.08); opacity: 0.92; } }
          .animate-crystal-column { animation: crystalColumn ease-in-out infinite; transform-origin: bottom center; }
          @keyframes crystalGlow { 0%, 100% { transform: scale(0.92); opacity: 0.18; } 50% { transform: scale(1.18); opacity: 0.42; } }
          .animate-crystal-glow { animation: crystalGlow ease-in-out infinite; }
          @keyframes arcaneShaft { 0%, 100% { opacity: 0.1; transform: translateX(0) scaleX(0.95); } 50% { opacity: 0.3; transform: translateX(8px) scaleX(1.08); } }
          .animate-arcane-shaft { animation: arcaneShaft ease-in-out infinite; }
          @keyframes heatSheet { 0%, 100% { transform: scaleY(0.95) translateY(0); opacity: 0.2; } 50% { transform: scaleY(1.12) translateY(-8px); opacity: 0.42; } }
          .animate-heat-sheet { animation: heatSheet 4.6s ease-in-out infinite; }
          @keyframes brazierFlicker { 0%, 100% { transform: scale(0.95); opacity: 0.16; } 30% { transform: scale(1.08); opacity: 0.3; } 55% { transform: scale(0.98); opacity: 0.22; } 75% { transform: scale(1.12); opacity: 0.38; } }
          .animate-brazier-flicker { animation: brazierFlicker ease-in-out infinite; }
          @keyframes lanternSway { 0%, 100% { transform: translateY(0) rotate(-4deg); opacity: 0.65; } 50% { transform: translateY(5px) rotate(4deg); opacity: 0.95; } }
          .animate-lantern-sway { animation: lanternSway ease-in-out infinite; transform-origin: top center; }
          @keyframes bannerSway { 0%, 100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(3deg) translateY(4px); } }
          .animate-banner-sway { animation: bannerSway ease-in-out infinite; transform-origin: top center; }
          @keyframes marketDust { 0% { transform: translate3d(0, 8px, 0); opacity: 0; } 20% { opacity: 0.25; } 100% { transform: translate3d(28px, -36px, 0); opacity: 0; } }
          .animate-market-dust { animation: marketDust linear infinite; }
          @keyframes runeDrift { 0%, 100% { opacity: 0.08; transform: translateY(0) scaleX(0.95); } 45% { opacity: 0.34; transform: translateY(6px) scaleX(1.04); } 75% { opacity: 0.18; transform: translateY(-3px) scaleX(1); } }
          .animate-rune-drift { animation: runeDrift ease-in-out infinite; }
          @keyframes obeliskCore { 0%, 100% { opacity: 0.18; transform: scale(0.96); } 50% { opacity: 0.42; transform: scale(1.06); } }
          .animate-obelisk-core { animation: obeliskCore 4.2s ease-in-out infinite; }
          @keyframes altarBreath { 0%, 100% { opacity: 0.22; transform: scale(0.96); } 50% { opacity: 0.48; transform: scale(1.08); } }
          .animate-altar-breath { animation: altarBreath 4.8s ease-in-out infinite; }
          @keyframes bossMist { 0% { transform: translate3d(-8px, 0, 0) scale(0.94); opacity: 0; } 20% { opacity: 0.2; } 60% { transform: translate3d(12px, -14px, 0) scale(1.08); opacity: 0.28; } 100% { transform: translate3d(26px, -32px, 0) scale(1.15); opacity: 0; } }
          .animate-boss-mist { animation: bossMist ease-in-out infinite; }
          @keyframes starTwinkle { 0%, 100% { opacity: 0.18; transform: scale(0.88); } 40% { opacity: 0.95; transform: scale(1.18); } 65% { opacity: 0.42; transform: scale(0.98); } }
          .animate-star-twinkle { animation: starTwinkle ease-in-out infinite; }
          @keyframes victorySky { 0%, 100% { transform: translateX(-4%) scaleX(0.98); opacity: 0.22; } 50% { transform: translateX(4%) scaleX(1.06); opacity: 0.4; } }
          .animate-victory-sky { animation: victorySky 7.5s ease-in-out infinite; }
          @keyframes smokeSheet { 0% { transform: translateY(10px) scaleY(0.96); opacity: 0.18; } 50% { transform: translateY(-6px) scaleY(1.05); opacity: 0.34; } 100% { transform: translateY(10px) scaleY(0.96); opacity: 0.18; } }
          .animate-smoke-sheet { animation: smokeSheet 6.2s ease-in-out infinite; }
          @keyframes hallDust { 0% { transform: translate3d(0, 0, 0); opacity: 0; } 22% { opacity: 0.2; } 100% { transform: translate3d(22px, -26px, 0); opacity: 0; } }
          .animate-hall-dust { animation: hallDust linear infinite; }
          @keyframes hallBeam { 0%, 100% { transform: translateX(0) scaleX(0.96); opacity: 0.08; } 50% { transform: translateX(10px) scaleX(1.04); opacity: 0.22; } }
          .animate-hall-beam { animation: hallBeam ease-in-out infinite; }

          @keyframes shimmer { 100% { transform: translateX(100%); } }
          @keyframes slideFadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-slide-fade { animation: slideFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          .animate-float { animation: float 4s ease-in-out infinite; }
          @keyframes floatDelayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          .animate-float-delayed { animation: floatDelayed 4s ease-in-out infinite 2s; }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
          .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        `}} />
      </div>
    </div>
  );
}





