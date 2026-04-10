const getEnemyPatternText = (sequence, enemyMoveLabels) => ({
  en: sequence.map((move) => enemyMoveLabels[move.type].en).join(' -> '),
  ja: sequence.map((move) => enemyMoveLabels[move.type].ja).join(' -> '),
  zh: sequence.map((move) => enemyMoveLabels[move.type].zh).join(' -> ')
});

const getPatternMap = () => ({
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
});

export const generateProceduralRun = ({
  act,
  rng,
  enemyLibrary,
  enemyMoveLabels,
  copy,
  localizeTemplate,
  getEnemyCodexKey,
  applyDamageToPlayer
}) => {
  const hpMult = act === 1 ? 1 : act === 2 ? 1.4 : 1.75;
  const damageMult = act === 1 ? 1 : act === 2 ? 1.35 : 1.65;
  const patternMap = getPatternMap();

  const instantiateEnemy = (template, tier) => {
    const isBoss = tier === 'boss';
    const scaledDamage = Math.max(4, Math.floor(template.baseDamage * damageMult));
    const hpVariance = isBoss ? 0 : rng.nextInt(8);
    const hp = Math.floor(template.baseHp * hpMult) + hpVariance;
    const sequence = patternMap[template.pattern](scaledDamage, isBoss);
    const codexKey = getEnemyCodexKey(tier, template.names.en);
    const codexPattern = getEnemyPatternText(sequence, enemyMoveLabels);

    return {
      id: `${template.key.toUpperCase()}_${rng.nextInt(1000)}`,
      tier,
      names: template.names,
      hp,
      spriteKey: template.spriteKey,
      codexKey,
      codexPattern,
      getAction: (turn, combat) => {
        const move = sequence[(turn - 1) % sequence.length];
        if (move.type === 'attack') {
          let projectedDmg = move.val + (combat.enemyStrength || 0);
          if (combat.enemyWeak > 0) projectedDmg = Math.floor(projectedDmg * 0.75);
          if (combat.playerVuln > 0) projectedDmg = Math.floor(projectedDmg * 1.5);
          return {
            type: 'attack',
            value: move.val,
            projectedDmg,
            text: localizeTemplate(copy.enemyIntent.attack, { projectedDmg }),
            execute: (state, nextCombat) => applyDamageToPlayer(move.val, state, nextCombat)
          };
        }
        if (move.type === 'defend') {
          return {
            type: 'defend',
            value: move.val,
            text: localizeTemplate(copy.enemyIntent.defend, { value: move.val }),
            execute: (state, nextCombat) => {
              nextCombat.enemyBlock += move.val;
            }
          };
        }
        return {
          type: 'buff',
          value: move.val,
          text: localizeTemplate(copy.enemyIntent.buff, { value: move.val }),
          execute: (state, nextCombat) => {
            nextCombat.enemyStrength += move.val;
          }
        };
      }
    };
  };

  const normals = rng.shuffle(enemyLibrary.normal).slice(0, 10).map((template) => instantiateEnemy(template, 'normal'));
  const elites = rng.shuffle(enemyLibrary.elite).slice(0, 4).map((template) => instantiateEnemy(template, 'elite'));
  const bossTemplate = enemyLibrary.boss.find((entry) => entry.act === act) || enemyLibrary.boss[0];
  const boss = instantiateEnemy(bossTemplate, 'boss');

  return { normals, elites, boss, allEnemies: [...normals, ...elites, boss] };
};
