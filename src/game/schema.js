export const DEFAULT_GAME_CONFIG = {
  maxPlayers: 2,
  maxPlayersCap: 4,
  roomVoteTimeoutMs: 30000,
  rewardTimeoutMs: 30000
};

export const createRunSeed = () => `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const deriveSeed = (baseSeed, ...parts) => [baseSeed || 'seed', ...parts].join(':');

export const createLobbyPlayerState = ({ playerId, name = 'Player', selectedCharacterKey = null, connected = true, ready = false } = {}) => ({
  playerId,
  name,
  connected,
  ready,
  selectedCharacterKey
});

export const createPartyPlayerState = ({
  playerId,
  name = 'Player',
  characterKey = null,
  hp = 0,
  maxHp = 0,
  gold = 99,
  deck = [],
  relics = [],
  unlocks = { cards: [], relics: [] }
} = {}) => ({
  playerId,
  name,
  characterKey,
  connected: true,
  alive: true,
  downed: false,
  skipped: false,
  hp,
  maxHp,
  gold,
  deck: [...deck],
  relics: [...relics],
  unlocks: {
    cards: [...(unlocks.cards || [])],
    relics: [...(unlocks.relics || [])]
  },
  combat: {
    block: 0,
    strength: 0,
    vuln: 0,
    weak: 0,
    hand: [],
    drawPile: [],
    discardPile: [],
    cardsPlayedThisCombat: 0,
    cardsPlayedThisTurn: 0,
    activePowers: {
      demonForm: 0,
      noxiousFumes: 0,
      echoForm: 0,
      blockEachTurn: 0,
      drawEachTurn: 0
    },
    endedTurn: false
  }
});

export const createSessionState = ({
  runId = null,
  hostPlayerId = 'local-player',
  players = []
} = {}) => ({
  version: 1,
  config: { ...DEFAULT_GAME_CONFIG },
  net: {
    hostPlayerId,
    protocolVersion: 1
  },
  lobby: {
    players: Object.fromEntries(players.map((player) => [player.playerId, player])),
    readyPlayerIds: players.filter((player) => player.ready).map((player) => player.playerId)
  },
  run: {
    runId,
    status: 'lobby',
    seed: null,
    act: 1,
    floor: 0,
    route: [],
    currentRoom: null
  },
  party: {
    order: players.map((player) => player.playerId),
    players: {}
  },
  combat: null,
  roomVote: null,
  reward: null,
  log: []
});

export const createInitialSoloRuntimeState = () => ({
  runSeed: null,
  characterKey: null,
  character: null,
  unlockedCards: [],
  unlockedRelics: [],
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

export const LOCAL_PLAYER_ID = 'local-player';

export const adaptSoloRuntimeToSession = ({
  runtimeState,
  currentNode,
  playerId = LOCAL_PLAYER_ID,
  playerName = 'Local Player'
}) => {
  const hasCharacter = Boolean(runtimeState?.characterKey && runtimeState?.character);
  const lobbyPlayer = createLobbyPlayerState({
    playerId,
    name: playerName,
    selectedCharacterKey: runtimeState?.characterKey || null,
    connected: true,
    ready: hasCharacter
  });

  const partyPlayer = createPartyPlayerState({
    playerId,
    name: playerName,
    characterKey: runtimeState?.characterKey || null,
    hp: runtimeState?.hp || 0,
    maxHp: runtimeState?.maxHp || 0,
    gold: runtimeState?.gold || 0,
    deck: runtimeState?.deck || [],
    relics: runtimeState?.relics || [],
    unlocks: {
      cards: runtimeState?.unlockedCards || [],
      relics: runtimeState?.unlockedRelics || []
    }
  });

  if (runtimeState?.combat) {
    partyPlayer.combat = {
      block: runtimeState.combat.playerBlock || 0,
      strength: runtimeState.combat.playerStrength || 0,
      vuln: runtimeState.combat.playerVuln || 0,
      weak: runtimeState.combat.playerWeak || 0,
      hand: [...(runtimeState.combat.hand || [])],
      drawPile: [...(runtimeState.combat.drawPile || [])],
      discardPile: [...(runtimeState.combat.discardPile || [])],
      cardsPlayedThisCombat: runtimeState.combat.cardsPlayed || 0,
      cardsPlayedThisTurn: runtimeState.combat.turnCardsPlayed || 0,
      activePowers: { ...(runtimeState.combat.activePowers || {}) },
      endedTurn: Boolean(runtimeState.combat.playerEndedTurn)
    };
  }

  const session = createSessionState({
    runId: runtimeState?.runSeed || null,
    hostPlayerId: playerId,
    players: [lobbyPlayer]
  });

  session.run = {
    runId: runtimeState?.runSeed || null,
    status: !hasCharacter
      ? 'lobby'
      : runtimeState?.combat?.active
        ? 'in_combat'
        : currentNode?.type === 'Reward'
          ? 'reward'
          : currentNode?.type === 'Victory'
            ? 'victory'
            : currentNode?.type === 'Game Over'
              ? 'game_over'
              : 'in_room',
    seed: runtimeState?.runSeed || null,
    act: runtimeState?.act || 1,
    floor: runtimeState?.floor || 0,
    route: [...(runtimeState?.route || [])],
    currentRoom: currentNode || null
  };

  session.party = {
    order: [playerId],
    players: {
      [playerId]: partyPlayer
    }
  };

  session.combat = runtimeState?.combat?.active
    ? {
        combatId: `${runtimeState.runSeed || 'solo'}:${runtimeState.combat.enemyId}:${runtimeState.combat.turn}`,
        turn: runtimeState.combat.turn || 1,
        phase: runtimeState.combat.phase || 'player',
        enemy: {
          enemyId: runtimeState.combat.enemyId,
          name: runtimeState.combat.enemyName,
          spriteKey: runtimeState.combat.enemySprite,
          hp: runtimeState.combat.enemyHp,
          maxHp: runtimeState.combat.enemyMaxHp,
          block: runtimeState.combat.enemyBlock || 0,
          strength: runtimeState.combat.enemyStrength || 0,
          vuln: runtimeState.combat.enemyVuln || 0,
          weak: runtimeState.combat.enemyWeak || 0,
          intent: runtimeState.combat.intent || null
        },
        players: {
          [playerId]: {
            playerId,
            hp: runtimeState.hp,
            maxHp: runtimeState.maxHp,
            alive: runtimeState.hp > 0,
            downed: runtimeState.hp <= 0,
            ...partyPlayer.combat
          }
        }
      }
    : null;

  return session;
};

export const applySoloRuntimeToSession = ({
  sessionState,
  runtimeState,
  currentNode,
  playerId = LOCAL_PLAYER_ID,
  playerName = 'Local Player'
}) => {
  const baseSession = sessionState || createSessionState({ hostPlayerId: playerId });
  const snapshot = adaptSoloRuntimeToSession({
    runtimeState,
    currentNode,
    playerId,
    playerName
  });

  const lobbyPlayers = {
    ...(baseSession.lobby?.players || {}),
    ...(snapshot.lobby?.players || {})
  };

  const readyPlayerIds = Array.from(new Set([
    ...Object.keys(lobbyPlayers).filter((id) => lobbyPlayers[id]?.ready)
  ]));

  const partyPlayers = {
    ...(baseSession.party?.players || {}),
    ...(snapshot.party?.players || {})
  };

  const order = Array.from(new Set([
    ...(baseSession.party?.order || []),
    ...(snapshot.party?.order || [])
  ]));

  return {
    ...baseSession,
    version: snapshot.version,
    config: { ...(baseSession.config || {}), ...(snapshot.config || {}) },
    net: {
      ...(baseSession.net || {}),
      ...(snapshot.net || {}),
      hostPlayerId: baseSession.net?.hostPlayerId || snapshot.net?.hostPlayerId || playerId
    },
    lobby: {
      players: lobbyPlayers,
      readyPlayerIds
    },
    run: {
      ...(baseSession.run || {}),
      ...(snapshot.run || {})
    },
    party: {
      order,
      players: partyPlayers
    },
    combat: snapshot.combat,
    roomVote: baseSession.roomVote || null,
    reward: snapshot.reward,
    log: baseSession.log || []
  };
};

export const projectSessionToSoloRuntime = ({
  sessionState,
  fallbackRuntimeState,
  playerId = LOCAL_PLAYER_ID
}) => {
  const player = sessionState?.party?.players?.[playerId];
  const run = sessionState?.run || {};
  const combat = sessionState?.combat;

  if (!player) {
    return {
      ...createInitialSoloRuntimeState(),
      unlockedCards: [...(fallbackRuntimeState?.unlockedCards || [])],
      unlockedRelics: [...(fallbackRuntimeState?.unlockedRelics || [])]
    };
  }

  return {
    runSeed: run.seed || fallbackRuntimeState?.runSeed || null,
    characterKey: player.characterKey || fallbackRuntimeState?.characterKey || null,
    character: fallbackRuntimeState?.character || null,
    unlockedCards: [...(player.unlocks?.cards || fallbackRuntimeState?.unlockedCards || [])],
    unlockedRelics: [...(player.unlocks?.relics || fallbackRuntimeState?.unlockedRelics || [])],
    hp: player.hp,
    maxHp: player.maxHp,
    gold: player.gold,
    floor: run.floor || 0,
    act: run.act || 1,
    deck: [...(player.deck || [])],
    relics: [...(player.relics || [])],
    route: [...(run.route || [])],
    combat: combat
      ? {
          active: true,
          enemyId: combat.enemy?.enemyId,
          enemyName: combat.enemy?.name,
          enemySprite: combat.enemy?.spriteKey,
          enemyHp: combat.enemy?.hp,
          enemyMaxHp: combat.enemy?.maxHp,
          playerBlock: player.combat?.block || 0,
          enemyBlock: combat.enemy?.block || 0,
          playerStrength: player.combat?.strength || 0,
          enemyStrength: combat.enemy?.strength || 0,
          enemyVuln: combat.enemy?.vuln || 0,
          enemyWeak: combat.enemy?.weak || 0,
          playerVuln: player.combat?.vuln || 0,
          playerWeak: player.combat?.weak || 0,
          turn: combat.turn || 1,
          phase: combat.phase || 'player',
          playerEndedTurn: Boolean(player.combat?.endedTurn),
          drawPile: [...(player.combat?.drawPile || [])],
          discardPile: [...(player.combat?.discardPile || [])],
          hand: [...(player.combat?.hand || [])],
          cardsPlayed: player.combat?.cardsPlayedThisCombat || 0,
          turnCardsPlayed: player.combat?.cardsPlayedThisTurn || 0,
          activePowers: { ...(player.combat?.activePowers || {}) },
          intent: combat.enemy?.intent || null
        }
      : null,
    runContent: fallbackRuntimeState?.runContent || null
  };
};
