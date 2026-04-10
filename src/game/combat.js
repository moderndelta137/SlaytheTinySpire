const cloneCombatGameState = (gameState) => {
  const combat = gameState?.combat;
  if (!combat) return null;

  return {
    ...gameState,
    deck: [...(gameState.deck || [])],
    relics: [...(gameState.relics || [])],
    combat: {
      ...combat,
      hand: [...(combat.hand || [])],
      drawPile: [...(combat.drawPile || [])],
      discardPile: [...(combat.discardPile || [])],
      activePowers: { ...(combat.activePowers || {}) },
      intent: combat.intent ? { ...combat.intent } : null
    }
  };
};

const drawCards = (combat, num, rng) => {
  const drawn = [...(combat.hand || [])];
  let drawnCount = 0;

  while (drawnCount < num) {
    if (combat.drawPile.length === 0) {
      if (combat.discardPile.length === 0) break;
      combat.drawPile = rng.shuffle(combat.discardPile);
      combat.discardPile = [];
    }
    drawn.push(combat.drawPile.pop());
    drawnCount += 1;
  }

  combat.hand = drawn;
};

const getNumericEffect = (spec, key, fallback = 0) => {
  const raw = spec?.[key];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calcDamage = (base, combat, damageMultiplier = 1) => {
  let damage = Math.floor((base + combat.playerStrength) * damageMultiplier);
  if (combat.enemyVuln > 0) damage = Math.floor(damage * 1.5);
  return damage;
};

const applyDamageToEnemy = (damage, combat) => {
  const actualDamage = Math.max(0, damage - combat.enemyBlock);
  combat.enemyBlock = Math.max(0, combat.enemyBlock - damage);
  combat.enemyHp -= actualDamage;
  return actualDamage;
};

const applyDamageToPlayer = (base, state, combat) => {
  let damage = base + (combat.enemyStrength || 0);
  if (combat.enemyWeak > 0) damage = Math.floor(damage * 0.75);
  if (combat.playerVuln > 0) damage = Math.floor(damage * 1.5);
  const actualDamage = Math.max(0, damage - combat.playerBlock);
  combat.playerBlock = Math.max(0, combat.playerBlock - damage);
  state.hp -= actualDamage;
  return actualDamage;
};

const executeCard = (cardName, state, combat, { damageMultiplier = 1, onDamage, getCardDefinition, rng }) => {
  const definition = getCardDefinition(cardName);
  if (!definition || definition.effectSpec.unplayable === '1') return definition;

  const spec = definition.effectSpec;
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
      const actualDamage = applyDamageToEnemy(calcDamage(damage, combat, damageMultiplier), combat);
      if (actualDamage > 0 && onDamage) onDamage(actualDamage);
    }
  }
  if (block > 0) combat.playerBlock += block;
  if (draw > 0) drawCards(combat, draw, rng);
  if (strength > 0) combat.playerStrength += strength;
  if (vulnerable > 0) combat.enemyVuln += vulnerable;
  if (weak > 0) combat.enemyWeak += weak;
  if (heal > 0) state.hp = Math.min(state.maxHp, state.hp + heal);
  if (selfDamage > 0) state.hp = Math.max(1, state.hp - selfDamage);
  if (spec.double_strength === '1') combat.playerStrength *= 2;

  if (perfected) {
    const [baseDamage, perStrikeBonus] = perfected;
    const strikeCount = state.deck.filter((card) => card.includes('Strike')).length;
    const actualDamage = applyDamageToEnemy(calcDamage(baseDamage + strikeCount * perStrikeBonus, combat, damageMultiplier), combat);
    if (actualDamage > 0 && onDamage) onDamage(actualDamage);
  }

  if (claw) {
    const [baseDamage, growth] = claw;
    combat.clawBase = combat.clawBase || baseDamage;
    const actualDamage = applyDamageToEnemy(calcDamage(combat.clawBase, combat, damageMultiplier), combat);
    if (actualDamage > 0 && onDamage) onDamage(actualDamage);
    combat.clawBase += growth;
  }

  if (spec.power) {
    const [powerKey, rawValue] = spec.power.split(':');
    const powerValue = Number(rawValue || 0);
    if (powerKey === 'strength') combat.playerStrength += powerValue;
    if (powerKey === 'demon_form') combat.activePowers.demonForm += powerValue;
    if (powerKey === 'noxious_fumes') combat.activePowers.noxiousFumes += powerValue;
    if (powerKey === 'echo_form') combat.activePowers.echoForm += Math.max(1, powerValue);
    if (powerKey === 'block_each_turn') combat.activePowers.blockEachTurn += powerValue;
    if (powerKey === 'draw_each_turn') combat.activePowers.drawEachTurn += powerValue;
  }

  return definition;
};

const applyPostCombatRelics = (state, summary) => {
  if (state.relics.includes('Burning Blood')) {
    const healAmount = Math.min(6, state.maxHp - state.hp);
    state.hp = Math.min(state.maxHp, state.hp + 6);
    if (healAmount > 0) summary.postCombatHeals.push({ amount: healAmount, source: 'Burning Blood' });
  }
  if (state.relics.includes('Meat on the Bone') && state.hp <= state.maxHp / 2) {
    const healAmount = Math.min(12, state.maxHp - state.hp);
    state.hp = Math.min(state.maxHp, state.hp + 12);
    if (healAmount > 0) summary.postCombatHeals.push({ amount: healAmount, source: 'Meat on the Bone' });
  }
};

const getCardPriority = (cardName, getCardDefinition, enemyHp) => {
  const definition = getCardDefinition(cardName);
  if (!definition || definition.effectSpec.unplayable === '1') return -1;
  if (definition.type === 'Attack') return enemyHp <= 18 ? 5 : 4;
  if (definition.type === 'Power') return 3;
  if (definition.type === 'Skill') return 2;
  return 1;
};

export const selectScriptedCombatCardIndex = ({ combatState, enemyState, getCardDefinition }) => {
  const rankedCards = (combatState.hand || [])
    .map((cardName, index) => ({
      cardName,
      index,
      priority: getCardPriority(cardName, getCardDefinition, enemyState.hp)
    }))
    .filter((entry) => entry.priority >= 0)
    .sort((a, b) => b.priority - a.priority || a.index - b.index);

  return rankedCards[0] || null;
};

export const resolveCombatParticipantCardPlay = ({
  playerState,
  combatState,
  enemyState,
  cardIndex,
  getCardDefinition,
  rng
}) => {
  if (!playerState || !combatState || !enemyState) return null;
  if (cardIndex == null || cardIndex < 0 || cardIndex >= (combatState.hand || []).length) return null;

  const nextPlayer = {
    ...playerState,
    hp: playerState.hp,
    maxHp: playerState.maxHp,
    deck: [...(playerState.deck || [])],
    relics: [...(playerState.relics || [])]
  };
  const nextCombat = {
    playerBlock: combatState.block || 0,
    playerStrength: combatState.strength || 0,
    playerVuln: combatState.vuln || 0,
    playerWeak: combatState.weak || 0,
    hand: [...(combatState.hand || [])],
    drawPile: [...(combatState.drawPile || [])],
    discardPile: [...(combatState.discardPile || [])],
    cardsPlayed: combatState.cardsPlayedThisCombat || 0,
    turnCardsPlayed: combatState.cardsPlayedThisTurn || 0,
    activePowers: { ...(combatState.activePowers || {}) },
    enemyHp: enemyState.hp,
    enemyMaxHp: enemyState.maxHp,
    enemyBlock: enemyState.block || 0,
    enemyStrength: enemyState.strength || 0,
    enemyVuln: enemyState.vuln || 0,
    enemyWeak: enemyState.weak || 0
  };

  const summary = {
    totalDamage: 0,
    playedCard: null,
    healed: 0
  };
  const cardName = nextCombat.hand[cardIndex];
  const prePlayerHp = nextPlayer.hp;
  const playedDefinition = executeCard(cardName, nextPlayer, nextCombat, {
    getCardDefinition,
    rng,
    onDamage: (amount) => {
      summary.totalDamage += amount;
    }
  });
  const [playedCard] = nextCombat.hand.splice(cardIndex, 1);
  if (playedCard && playedDefinition?.type !== 'Power') nextCombat.discardPile.push(playedCard);
  if (nextCombat.hand.length > 0) {
    nextCombat.discardPile.push(...nextCombat.hand);
    nextCombat.hand = [];
  }
  summary.playedCard = playedCard || cardName;
  summary.healed += Math.max(0, nextPlayer.hp - prePlayerHp);

  return {
    playerState: {
      ...playerState,
      hp: nextPlayer.hp
    },
    combatState: {
      ...combatState,
      block: nextCombat.playerBlock,
      strength: nextCombat.playerStrength,
      vuln: nextCombat.playerVuln,
      weak: nextCombat.playerWeak,
      hand: [],
      drawPile: [...nextCombat.drawPile],
      discardPile: [...nextCombat.discardPile],
      cardsPlayedThisCombat: nextCombat.cardsPlayed,
      cardsPlayedThisTurn: nextCombat.turnCardsPlayed,
      activePowers: { ...nextCombat.activePowers },
      endedTurn: false
    },
    enemyState: {
      ...enemyState,
      hp: nextCombat.enemyHp,
      block: nextCombat.enemyBlock,
      strength: nextCombat.enemyStrength,
      vuln: nextCombat.enemyVuln,
      weak: nextCombat.enemyWeak
    },
    summary
  };
};

export const resolveScriptedAllyTurn = ({ playerState, combatState, enemyState, getCardDefinition, rng }) => {
  if (!playerState || !combatState || !enemyState) return null;

  let currentPlayer = { ...playerState };
  let currentCombat = {
    ...combatState,
    hand: [...(combatState.hand || [])],
    drawPile: [...(combatState.drawPile || [])],
    discardPile: [...(combatState.discardPile || [])],
    activePowers: { ...(combatState.activePowers || {}) }
  };
  let currentEnemy = { ...enemyState };
  const summary = {
    totalDamage: 0,
    playedCards: [],
    healed: 0
  };

  while ((currentCombat.hand || []).length > 0) {
    const nextPick = selectScriptedCombatCardIndex({
      combatState: currentCombat,
      enemyState: currentEnemy,
      getCardDefinition
    });
    if (!nextPick) break;

    const cardResolution = resolveCombatParticipantCardPlay({
      playerState: currentPlayer,
      combatState: currentCombat,
      enemyState: currentEnemy,
      cardIndex: nextPick.index,
      getCardDefinition,
      rng: rng.fork(`ally-card-${summary.playedCards.length}`)
    });
    if (!cardResolution) break;

    currentPlayer = cardResolution.playerState;
    currentCombat = cardResolution.combatState;
    currentEnemy = cardResolution.enemyState;
    summary.totalDamage += cardResolution.summary.totalDamage;
    summary.healed += cardResolution.summary.healed;
    if (cardResolution.summary.playedCard) {
      summary.playedCards.push(cardResolution.summary.playedCard);
    }

    if (currentEnemy.hp <= 0) break;
  }

  currentCombat.discardPile = [
    ...(currentCombat.discardPile || []),
    ...(currentCombat.hand || [])
  ];
  currentCombat.hand = [];

  return {
    playerState: currentPlayer,
    combatState: {
      ...currentCombat,
      endedTurn: true
    },
    enemyState: currentEnemy,
    summary
  };
};

export const initializeCombatState = ({ state, result, enemyData, rng }) => {
  const combat = {
    active: true,
    phase: 'player',
    playerEndedTurn: false,
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
    drawPile: rng.shuffle(state.deck || []),
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

  if (state.relics.includes('Vajra')) combat.playerStrength += 1;
  if (state.relics.includes('Anchor')) combat.playerBlock += 10;
  if (state.relics.includes('Bag of Marbles')) combat.enemyVuln += 1;
  if (state.relics.includes('Thread and Needle')) combat.playerBlock += 4;
  if (state.relics.includes('Pure Water')) {
    combat.playerBlock += 5;
    combat.enemyWeak += 1;
  }
  if (state.relics.includes('Omen Forge')) {
    combat.playerStrength += 2;
    combat.playerVuln += 1;
  }

  combat.intent = enemyData.getAction(1, combat);
  drawCards(combat, state.relics.includes('Ring of the Snake') ? 5 : 3, rng.fork('opening-hand'));
  if (state.relics.includes('Lantern')) drawCards(combat, 1, rng.fork('lantern-draw'));

  return combat;
};

export const getCombatPreviewForCard = ({ gameState, cardName, getCardDefinition, rng }) => {
  if (!gameState?.combat || !cardName) return null;

  const simState = cloneCombatGameState(gameState);
  const simCombat = simState?.combat;
  if (!simState || !simCombat) return null;

  const cardDefinition = getCardDefinition(cardName);
  if (!cardDefinition) return null;

  const penNibTriggers = simState.relics.includes('Pen Nib') && (((simCombat.cardsPlayed || 0) + 1) % 3 === 0);
  const damageMultiplier = penNibTriggers ? 2 : 1;
  const shouldEcho = (simCombat.activePowers.echoForm || 0) > 0 && (simCombat.turnCardsPlayed || 0) === 0;

  if (simState.relics.includes('Cracked Core')) simCombat.playerBlock += 2;
  executeCard(cardName, simState, simCombat, { damageMultiplier, getCardDefinition, rng });
  if (shouldEcho) executeCard(cardName, simState, simCombat, { damageMultiplier, getCardDefinition, rng: rng.fork('echo') });

  return {
    playerHp: simState.hp,
    playerBlock: simCombat.playerBlock,
    enemyHp: simCombat.enemyHp,
    enemyBlock: simCombat.enemyBlock
  };
};

export const getIntentPlayerPreview = (gameState, overrides = {}) => {
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

export const resolveCombatTurn = ({ gameState, cardName, cardIndex, enemyData, getCardDefinition, rng }) => {
  const cardResolution = resolveCombatCardPlay({ gameState, cardName, cardIndex, getCardDefinition, rng });
  if (!cardResolution || cardResolution.summary.outcome !== 'continue') return cardResolution;
  return resolveCombatEnemyPhase({
    gameState: cardResolution.state,
    enemyData,
    rng: rng.fork('legacy-enemy-phase')
  });
};

export const resolveCombatCardPlay = ({ gameState, cardName, cardIndex, getCardDefinition, rng }) => {
  const nextState = cloneCombatGameState(gameState);
  const combat = nextState?.combat;
  if (!nextState || !combat) return null;

  const summary = {
    playerDamageEvents: [],
    playerHealed: 0,
    enemyDamageTaken: 0,
    enemyDamageDealt: 0,
    playerPhaseAnimation: 'buff',
    enemyPhaseAnimation: 'buff',
    upkeepBlockGain: 0,
    postCombatHeals: [],
    outcome: 'continue'
  };

  const preEnemyHp = combat.enemyHp;
  const prePlayerBlock = combat.playerBlock;
  const prePlayerHp = nextState.hp;

  const penNibTriggers = nextState.relics.includes('Pen Nib') && (((combat.cardsPlayed || 0) + 1) % 3 === 0);
  const damageMultiplier = penNibTriggers ? 2 : 1;
  combat.cardsPlayed = (combat.cardsPlayed || 0) + 1;
  const cardDefinition = getCardDefinition(cardName);
  const isPowerCard = cardDefinition?.type === 'Power';
  const shouldEcho = (combat.activePowers.echoForm || 0) > 0 && (combat.turnCardsPlayed || 0) === 0;
  combat.turnCardsPlayed = (combat.turnCardsPlayed || 0) + 1;

  if (nextState.relics.includes('Cracked Core')) combat.playerBlock += 2;
  executeCard(cardName, nextState, combat, {
    damageMultiplier,
    getCardDefinition,
    rng: rng.fork('player-card'),
    onDamage: (amount) => summary.playerDamageEvents.push(amount)
  });
  if (shouldEcho) {
    executeCard(cardName, nextState, combat, {
      damageMultiplier,
      getCardDefinition,
      rng: rng.fork('echo-card'),
      onDamage: (amount) => summary.playerDamageEvents.push(amount)
    });
  }

  const [playedCard] = combat.hand.splice(cardIndex, 1);
  if (playedCard && !isPowerCard) combat.discardPile.push(playedCard);

  summary.enemyDamageTaken = Math.max(0, preEnemyHp - combat.enemyHp);
  summary.playerHealed = Math.max(0, nextState.hp - prePlayerHp);
  const gainedBlock = combat.playerBlock > prePlayerBlock;

  if (summary.enemyDamageTaken > 0) summary.playerPhaseAnimation = 'attack';
  else if (gainedBlock) summary.playerPhaseAnimation = 'block';

  if (combat.enemyHp <= 0) {
    applyPostCombatRelics(nextState, summary);
    nextState.combat = null;
    summary.outcome = 'victory';
    return { state: nextState, summary };
  }

  combat.phase = 'player';
  combat.playerEndedTurn = false;

  return { state: nextState, summary };
};

export const resolveCombatEnemyPhase = ({ gameState, enemyData, rng }) => {
  const nextState = cloneCombatGameState(gameState);
  const combat = nextState?.combat;
  if (!nextState || !combat) return null;

  const summary = {
    playerDamageEvents: [],
    playerHealed: 0,
    enemyDamageTaken: 0,
    enemyDamageDealt: 0,
    playerPhaseAnimation: 'buff',
    enemyPhaseAnimation: 'buff',
    upkeepBlockGain: 0,
    postCombatHeals: [],
    outcome: 'continue'
  };

  combat.phase = 'enemy';
  combat.playerEndedTurn = true;
  combat.hand.forEach((card) => combat.discardPile.push(card));
  combat.hand = [];

  const preEnemyBlock = combat.enemyBlock = 0;
  const prePlayerHpEnemyTurn = nextState.hp;
  combat.intent.execute(nextState, combat);
  summary.enemyDamageDealt = Math.max(0, prePlayerHpEnemyTurn - nextState.hp);
  const enemyGainedBlock = combat.enemyBlock > preEnemyBlock;
  if (summary.enemyDamageDealt > 0) summary.enemyPhaseAnimation = 'attack';
  else if (enemyGainedBlock) summary.enemyPhaseAnimation = 'block';

  if (nextState.hp <= 0) {
    nextState.hp = 0;
    nextState.combat = null;
    summary.outcome = 'defeat';
    return { state: nextState, summary };
  }

  const endedTurnWithoutBlock = combat.playerBlock === 0;
  combat.playerBlock = 0;
  if (nextState.relics.includes('Thread and Needle')) {
    combat.playerBlock += 4;
    summary.upkeepBlockGain += 4;
  }
  if (endedTurnWithoutBlock && nextState.relics.includes('Orichalcum')) {
    combat.playerBlock += 6;
    summary.upkeepBlockGain += 6;
  }
  if (combat.activePowers.demonForm > 0) combat.playerStrength += combat.activePowers.demonForm;
  if (combat.activePowers.noxiousFumes > 0) applyDamageToEnemy(combat.activePowers.noxiousFumes, combat);
  if (combat.activePowers.blockEachTurn > 0) {
    combat.playerBlock += combat.activePowers.blockEachTurn;
    summary.upkeepBlockGain += combat.activePowers.blockEachTurn;
  }

  if (combat.enemyVuln > 0) combat.enemyVuln -= 1;
  if (combat.enemyWeak > 0) combat.enemyWeak -= 1;
  if (combat.playerVuln > 0) combat.playerVuln -= 1;
  combat.turn += 1;
  combat.turnCardsPlayed = 0;

  if (combat.enemyHp <= 0) {
    applyPostCombatRelics(nextState, summary);
    nextState.combat = null;
    summary.outcome = 'victory';
    return { state: nextState, summary };
  }

  combat.intent = enemyData.getAction(combat.turn, combat);
  drawCards(combat, 3 + (combat.activePowers.drawEachTurn || 0), rng.fork('next-turn-draw'));
  combat.phase = 'player';
  combat.playerEndedTurn = false;

  return { state: nextState, summary };
};
