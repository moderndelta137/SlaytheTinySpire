const createChoice = (id, label, effectText, condition = null) => ({
  id,
  label,
  effectText,
  condition
});

const createNode = ({ nodeId, title, type, spriteKey, text, choices, enemyId = null, enemyTier = null, meta = {} }) => ({
  nodeId,
  title,
  type,
  spriteKey,
  text,
  choices,
  enemyId,
  enemyTier,
  meta
});

export const isChoiceAvailable = (choice, state) => {
  if (!choice?.condition) return true;
  if (choice.condition.kind === 'min_hp') return (state.hp || 0) > choice.condition.value;
  if (choice.condition.kind === 'min_gold') return (state.gold || 0) >= choice.condition.value;
  if (choice.condition.kind === 'has_relic') return (state.relics || []).includes(choice.condition.value);
  return true;
};

export const createRewardNode = (enemy, { copy, localizeTemplate }) => {
  const rewardTier = enemy?.tier || 'normal';
  const goldAmount = rewardTier === 'boss' ? 40 : rewardTier === 'elite' ? 30 : 25;
  const relicChoice = createChoice(
    'take_relic',
    localizeTemplate({ en: 'Take Relic', ja: 'レリックを取る', zh: '拿取遗物' }),
    localizeTemplate({ en: 'Gain 1 relic.', ja: 'レリックを1つ得る。', zh: '获得1件遗物。' })
  );

  const choices = [
    createChoice('take_gold', copy.nodes.reward.takeGold, copy.nodes.reward.takeGoldEffect),
    createChoice('take_card', copy.nodes.reward.addCard, copy.nodes.reward.addCardEffect),
    rewardTier === 'elite' || rewardTier === 'boss'
      ? relicChoice
      : createChoice('bandage', copy.nodes.reward.bandage, copy.nodes.reward.bandageEffect)
  ];

  return createNode({
    nodeId: `reward:${enemy?.id || 'unknown'}`,
    title: copy.nodes.reward.title,
    type: 'Reward',
    spriteKey: 'event_crystal',
    text: copy.nodes.reward.text,
    choices,
    enemyId: enemy?.id || null,
    enemyTier: rewardTier,
    meta: { rewardTier, goldAmount }
  });
};

export const createActTransitionNode = (currentAct, { copy, localizeTemplate }) => createNode({
  nodeId: `act_transition:${currentAct}`,
  title: localizeTemplate(copy.nodes.actTransition.title, { act: currentAct }),
  type: 'Transition',
  spriteKey: 'event_crystal',
  text: copy.nodes.actTransition.text,
  choices: [createChoice('ascend', copy.nodes.actTransition.ascend, copy.nodes.actTransition.ascendEffect)],
  meta: { act: currentAct }
});

export const createNeowNode = ({ copy }) => createNode({
  nodeId: 'event:neow',
  title: copy.nodes.neow.title,
  type: 'Event',
  spriteKey: 'neow',
  text: copy.nodes.neow.text,
  choices: [
    createChoice('choose_card', copy.nodes.neow.chooseCard, copy.nodes.neow.chooseCardEffect),
    createChoice('sacrifice', copy.nodes.neow.sacrifice, copy.nodes.neow.sacrificeEffect),
    createChoice('accept_gold', copy.nodes.neow.acceptGold, copy.nodes.neow.acceptGoldEffect)
  ],
  meta: { eventKind: 'neow' }
});

export const createRestSiteNode = ({ copy }) => createNode({
  nodeId: 'rest:campfire',
  title: copy.nodes.rest.title,
  type: 'Rest',
  spriteKey: 'rest_fire',
  text: copy.nodes.rest.text,
  choices: [
    createChoice('rest', copy.nodes.rest.rest, copy.nodes.rest.restEffect),
    createChoice('smith', copy.nodes.rest.smith, copy.nodes.rest.smithEffect),
    createChoice('forage', copy.nodes.rest.forage, copy.nodes.rest.forageEffect),
    createChoice('dig', copy.nodes.rest.dig, copy.nodes.rest.digEffect, { kind: 'has_relic', value: 'Shovel' })
  ]
});

export const createShopNode = ({ copy }) => createNode({
  nodeId: 'shop:merchant',
  title: copy.nodes.shop.title,
  type: 'Shop',
  spriteKey: 'merchant',
  text: copy.nodes.shop.text,
  choices: [
    createChoice('buy_relic', copy.nodes.shop.buyRelic, copy.nodes.shop.buyRelicEffect, { kind: 'min_gold', value: 75 }),
    createChoice('buy_card', copy.nodes.shop.buyCard, copy.nodes.shop.buyCardEffect, { kind: 'min_gold', value: 50 }),
    createChoice('leave', copy.nodes.shop.leave, copy.nodes.shop.leaveEffect)
  ]
});

export const createDeathNode = ({ copy }) => createNode({
  nodeId: 'terminal:death',
  title: copy.nodes.death.title,
  type: 'Game Over',
  spriteKey: 'neow',
  text: copy.nodes.death.text,
  choices: [createChoice('retry', copy.nodes.death.retry, copy.nodes.death.retryEffect)]
});

export const createVictoryNode = ({ copy }) => createNode({
  nodeId: 'terminal:victory',
  title: copy.nodes.victory.title,
  type: 'Victory',
  spriteKey: 'neow',
  text: copy.nodes.victory.text,
  choices: [createChoice('play_again', copy.nodes.victory.playAgain, copy.nodes.victory.playAgainEffect)]
});

export const createEventNode = (eventId, { goldCost, hpCost }, { copy, localizeTemplate }) => createNode({
  nodeId: eventId,
  title: copy.nodes.mysteriousDiscovery.title,
  type: 'Event',
  spriteKey: 'event_crystal',
  text: copy.nodes.mysteriousDiscovery.text,
  choices: [
    createChoice('take_risk', copy.nodes.mysteriousDiscovery.takeRisk, localizeTemplate(copy.nodes.mysteriousDiscovery.takeRiskEffect, { hpCost })),
    createChoice('trade', copy.nodes.mysteriousDiscovery.trade, localizeTemplate(copy.nodes.mysteriousDiscovery.tradeEffect, { goldCost }), { kind: 'min_gold', value: goldCost }),
    createChoice('leave', copy.nodes.mysteriousDiscovery.leave, copy.nodes.mysteriousDiscovery.leaveEffect)
  ],
  meta: { eventKind: 'mysterious_discovery', goldCost, hpCost }
});

export const createCombatNode = (enemy, { copy }) => createNode({
  nodeId: `combat:${enemy.id}`,
  title: enemy.names,
  type: 'Combat',
  spriteKey: enemy.spriteKey,
  text: copy.nodes.combat.text,
  choices: [
    createChoice('engage', copy.nodes.combat.engage, copy.nodes.combat.engageEffect),
    createChoice('ambush', copy.nodes.combat.ambush, copy.nodes.combat.ambushEffect, { kind: 'min_hp', value: 5 })
  ],
  enemyId: enemy.id,
  enemyTier: enemy.tier
});

export const createEliteNode = (enemy, { copy }) => createNode({
  nodeId: `elite:${enemy.id}`,
  title: {
    en: copy.nodes.elite.title.en.replace('{name}', enemy.names.en),
    ja: copy.nodes.elite.title.ja.replace('{name}', enemy.names.ja),
    zh: copy.nodes.elite.title.zh.replace('{name}', enemy.names.zh)
  },
  type: 'Elite',
  spriteKey: enemy.spriteKey,
  text: copy.nodes.elite.text,
  choices: [
    createChoice('engage', copy.nodes.elite.engage, copy.nodes.elite.engageEffect),
    createChoice('defend', copy.nodes.elite.defend, copy.nodes.elite.defendEffect)
  ],
  enemyId: enemy.id,
  enemyTier: enemy.tier
});

export const createBossNode = (enemy, { copy }) => createNode({
  nodeId: `boss:${enemy.id}`,
  title: {
    en: copy.nodes.boss.title.en.replace('{name}', enemy.names.en),
    ja: copy.nodes.boss.title.ja.replace('{name}', enemy.names.ja),
    zh: copy.nodes.boss.title.zh.replace('{name}', enemy.names.zh)
  },
  type: 'Boss',
  spriteKey: enemy.spriteKey,
  text: copy.nodes.boss.text,
  choices: [
    createChoice('engage', copy.nodes.boss.engage, copy.nodes.boss.engageEffect),
    createChoice('brace', copy.nodes.boss.brace, copy.nodes.boss.braceEffect)
  ],
  enemyId: enemy.id,
  enemyTier: enemy.tier
});

export const generateMapRoute = (runContent, { copy, rng }) => {
  const route = [];
  let normalIdx = 0;
  let eliteIdx = 0;
  let eventIdx = 0;

  route.push(createCombatNode(runContent.normals[normalIdx++], { copy }));

  const distribution = rng.shuffle(['Combat', 'Combat', 'Event', 'Event', 'Shop', 'Elite', 'Rest', 'Rest']);
  const eliteIndex = distribution.indexOf('Elite');
  if (eliteIndex < 2) {
    const safeIndex = rng.nextInt(6) + 2;
    [distribution[eliteIndex], distribution[safeIndex]] = [distribution[safeIndex], distribution[eliteIndex]];
  }

  distribution.forEach((type) => {
    if (type === 'Combat') route.push(createCombatNode(runContent.normals[normalIdx++], { copy }));
    else if (type === 'Event') route.push(runContent.events[eventIdx++]);
    else if (type === 'Shop') route.push(createShopNode({ copy }));
    else if (type === 'Elite') route.push(createEliteNode(runContent.elites[eliteIdx++], { copy }));
    else if (type === 'Rest') route.push(createRestSiteNode({ copy }));
  });

  route.push(createBossNode(runContent.boss, { copy }));
  return route;
};

export const resolveRoomChoice = ({
  node,
  choiceId,
  state,
  rng,
  pickRewardCard,
  pickRewardRelic,
  appendRelicIfAvailable
}) => {
  switch (node.type) {
    case 'Reward': {
      const rewardTier = node.meta.rewardTier || 'normal';
      const goldAmount = node.meta.goldAmount || 25;
      if (choiceId === 'take_gold') return { gold: state.gold + goldAmount };
      if (choiceId === 'take_card') return { deck: [...state.deck, pickRewardCard(state, rewardTier)] };
      if (choiceId === 'take_relic') return { relics: appendRelicIfAvailable(state, pickRewardRelic(state, rewardTier)) };
      if (choiceId === 'bandage') return { hp: Math.min(state.maxHp, state.hp + 15) };
      return {};
    }
    case 'Transition':
      return choiceId === 'ascend' ? { startNextAct: true } : {};
    case 'Event': {
      if (node.meta.eventKind === 'neow') {
        if (choiceId === 'choose_card') return { deck: [...state.deck, pickRewardCard(state)] };
        if (choiceId === 'sacrifice') {
          return {
            maxHp: state.maxHp - 8,
            hp: Math.min(state.hp, state.maxHp - 8),
            relics: appendRelicIfAvailable(state, pickRewardRelic(state))
          };
        }
        if (choiceId === 'accept_gold') return { gold: state.gold + 100 };
      }
      if (node.meta.eventKind === 'mysterious_discovery') {
        if (choiceId === 'take_risk') {
          return {
            hp: state.hp - node.meta.hpCost,
            relics: appendRelicIfAvailable(state, pickRewardRelic(state))
          };
        }
        if (choiceId === 'trade') {
          return {
            gold: state.gold - node.meta.goldCost,
            deck: [...state.deck, pickRewardCard(state)]
          };
        }
        if (choiceId === 'leave') return {};
      }
      return {};
    }
    case 'Rest':
      if (choiceId === 'rest') return { hp: Math.min(state.maxHp, state.hp + Math.floor(state.maxHp * 0.3)) };
      if (choiceId === 'smith') {
        if (state.deck.length === 0) return {};
        const newDeck = [...state.deck];
        const idx = rng.nextInt(newDeck.length);
        if (!newDeck[idx].endsWith('+')) newDeck[idx] = `${newDeck[idx]}+`;
        return { deck: newDeck };
      }
      if (choiceId === 'forage') return { gold: state.gold + 15, maxHp: state.maxHp + 2, hp: state.hp + 2 };
      if (choiceId === 'dig') return { relics: appendRelicIfAvailable(state, pickRewardRelic(state)) };
      return {};
    case 'Shop':
      if (choiceId === 'buy_relic') return { gold: state.gold - 75, relics: appendRelicIfAvailable(state, pickRewardRelic(state)) };
      if (choiceId === 'buy_card') return { gold: state.gold - 50, deck: [...state.deck, pickRewardCard(state)] };
      if (choiceId === 'leave') return {};
      return {};
    case 'Game Over':
    case 'Victory':
      return choiceId === 'retry' || choiceId === 'play_again' ? { reset: true } : {};
    case 'Combat':
      if (choiceId === 'engage') return { startCombat: node.enemyId, stayOnFloor: true };
      if (choiceId === 'ambush') return { hp: state.hp - 5, startCombat: node.enemyId, applyVuln: 2, stayOnFloor: true };
      return {};
    case 'Elite':
      if (choiceId === 'engage') return { startCombat: node.enemyId, stayOnFloor: true };
      if (choiceId === 'defend') return { startCombat: node.enemyId, bonusBlock: 15, bonusEnemyStr: 1, stayOnFloor: true };
      return {};
    case 'Boss':
      if (choiceId === 'engage') return { startCombat: node.enemyId, stayOnFloor: true };
      if (choiceId === 'brace') return { startCombat: node.enemyId, bonusBlock: 20, stayOnFloor: true };
      return {};
    default:
      return {};
  }
};
