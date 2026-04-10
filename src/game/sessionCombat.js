import { createSeededRng } from './rng';
import { deriveSeed, LOCAL_PLAYER_ID } from './schema';

const drawCardsForCombatPlayer = (combatPlayer, num, rng) => {
  const nextCombat = {
    ...combatPlayer,
    hand: [...(combatPlayer.hand || [])],
    drawPile: [...(combatPlayer.drawPile || [])],
    discardPile: [...(combatPlayer.discardPile || [])]
  };

  while (nextCombat.hand.length < num) {
    if (nextCombat.drawPile.length === 0) {
      if (nextCombat.discardPile.length === 0) break;
      nextCombat.drawPile = rng.shuffle(nextCombat.discardPile);
      nextCombat.discardPile = [];
    }
    nextCombat.hand.push(nextCombat.drawPile.pop());
  }

  return nextCombat;
};

const advanceCombatPlayerToNextTurn = ({
  combatPlayer,
  partyPlayer,
  runSeed,
  turn
}) => {
  if (!combatPlayer || !partyPlayer || partyPlayer.hp <= 0) return combatPlayer;

  const nextCombat = {
    ...combatPlayer,
    hand: [],
    drawPile: [...(combatPlayer.drawPile || [])],
    discardPile: [
      ...(combatPlayer.discardPile || []),
      ...(combatPlayer.hand || [])
    ],
    activePowers: { ...(combatPlayer.activePowers || {}) }
  };

  const endedTurnWithoutBlock = (nextCombat.block || 0) === 0;
  nextCombat.block = 0;
  if (partyPlayer.relics?.includes('Thread and Needle')) nextCombat.block += 4;
  if (endedTurnWithoutBlock && partyPlayer.relics?.includes('Orichalcum')) nextCombat.block += 6;
  if ((nextCombat.activePowers?.demonForm || 0) > 0) {
    nextCombat.strength = (nextCombat.strength || 0) + nextCombat.activePowers.demonForm;
  }
  if ((nextCombat.activePowers?.blockEachTurn || 0) > 0) {
    nextCombat.block += nextCombat.activePowers.blockEachTurn;
  }
  if ((nextCombat.vuln || 0) > 0) nextCombat.vuln -= 1;
  if ((nextCombat.weak || 0) > 0) nextCombat.weak -= 1;
  nextCombat.cardsPlayedThisTurn = 0;

  const nextTurnDraws = 3 + (nextCombat.activePowers?.drawEachTurn || 0);
  const rng = createSeededRng(deriveSeed(runSeed, 'shared-next-turn-draw', partyPlayer.playerId, turn));
  const drawnCombat = drawCardsForCombatPlayer(nextCombat, nextTurnDraws, rng);

  return {
    ...drawnCombat,
    endedTurn: false
  };
};

const syncPartyPlayersFromCombatPlayers = (partyPlayers = {}, combatPlayers = {}) => (
  Object.fromEntries(
    Object.entries(partyPlayers).map(([playerId, playerState]) => {
      const combatPlayer = combatPlayers[playerId];
      if (!combatPlayer) return [playerId, playerState];
      return [
        playerId,
        {
          ...playerState,
          hp: combatPlayer.hp !== undefined ? combatPlayer.hp : playerState.hp,
          maxHp: combatPlayer.maxHp !== undefined ? combatPlayer.maxHp : playerState.maxHp,
          alive: combatPlayer.hp > 0,
          downed: combatPlayer.hp <= 0,
          combat: {
            ...(playerState.combat || {}),
            block: combatPlayer.block || 0,
            strength: combatPlayer.strength || 0,
            vuln: combatPlayer.vuln || 0,
            weak: combatPlayer.weak || 0,
            hand: [...(combatPlayer.hand || [])],
            drawPile: [...(combatPlayer.drawPile || [])],
            discardPile: [...(combatPlayer.discardPile || [])],
            cardsPlayedThisCombat: combatPlayer.cardsPlayedThisCombat || 0,
            cardsPlayedThisTurn: combatPlayer.cardsPlayedThisTurn || 0,
            activePowers: { ...(combatPlayer.activePowers || {}) },
            endedTurn: Boolean(combatPlayer.endedTurn)
          }
        }
      ];
    })
  )
);

const updateLocalPlayerCombat = (player, participantResolution) => ({
  ...player,
  hp: participantResolution.playerState.hp,
  combat: {
    ...(player.combat || {}),
    block: participantResolution.combatState.block || 0,
    strength: participantResolution.combatState.strength || 0,
    vuln: participantResolution.combatState.vuln || 0,
    weak: participantResolution.combatState.weak || 0,
    hand: [...(participantResolution.combatState.hand || [])],
    drawPile: [...(participantResolution.combatState.drawPile || [])],
    discardPile: [...(participantResolution.combatState.discardPile || [])],
    cardsPlayedThisCombat: participantResolution.combatState.cardsPlayedThisCombat || 0,
    cardsPlayedThisTurn: participantResolution.combatState.cardsPlayedThisTurn || 0,
    activePowers: { ...(participantResolution.combatState.activePowers || {}) },
    endedTurn: false
  }
});

export const applyCombatParticipantResolutionToSession = ({
  session,
  participantResolution,
  combatLog,
  playerId = LOCAL_PLAYER_ID
}) => {
  const participantPlayer = session.party?.players?.[playerId];
  if (!session.combat || !participantPlayer || !participantResolution) return session;

  const nextPartyPlayers = {
    ...(session.party?.players || {}),
    [playerId]: updateLocalPlayerCombat(participantPlayer, participantResolution)
  };

  return {
    ...session,
    party: {
      ...(session.party || {}),
      players: nextPartyPlayers
    },
    combat: {
      ...(session.combat || {}),
      log: combatLog.slice(-8),
      enemy: {
        ...(session.combat?.enemy || {}),
        hp: participantResolution.enemyState.hp,
        maxHp: participantResolution.enemyState.maxHp,
        block: participantResolution.enemyState.block || 0,
        strength: participantResolution.enemyState.strength || 0,
        vuln: participantResolution.enemyState.vuln || 0,
        weak: participantResolution.enemyState.weak || 0
      },
      players: {
        ...(session.combat?.players || {}),
        [playerId]: {
          ...(session.combat?.players?.[playerId] || {}),
          hp: participantResolution.playerState.hp,
          maxHp: participantResolution.playerState.maxHp,
          block: participantResolution.combatState.block || 0,
          strength: participantResolution.combatState.strength || 0,
          vuln: participantResolution.combatState.vuln || 0,
          weak: participantResolution.combatState.weak || 0,
          hand: [...(participantResolution.combatState.hand || [])],
          drawPile: [...(participantResolution.combatState.drawPile || [])],
          discardPile: [...(participantResolution.combatState.discardPile || [])],
          cardsPlayedThisCombat: participantResolution.combatState.cardsPlayedThisCombat || 0,
          cardsPlayedThisTurn: participantResolution.combatState.cardsPlayedThisTurn || 0,
          activePowers: { ...(participantResolution.combatState.activePowers || {}) },
          endedTurn: Boolean(participantResolution.combatState.endedTurn)
        }
      }
    }
  };
};

export const applyCombatEndedTurnToSession = ({
  session,
  combatLog,
  playerId = LOCAL_PLAYER_ID
}) => {
  const participantPlayer = session.party?.players?.[playerId];
  const participantCombat = session.combat?.players?.[playerId];
  if (!session.combat || !participantPlayer || !participantCombat) return session;

  const nextCombatPlayers = {
    ...(session.combat?.players || {}),
    [playerId]: {
      ...participantCombat,
      endedTurn: true
    }
  };
  const nextPartyPlayers = {
    ...(session.party?.players || {}),
    [playerId]: {
      ...participantPlayer,
      hp: nextCombatPlayers[playerId].hp ?? participantPlayer.hp,
      combat: {
        ...(participantPlayer.combat || {}),
        block: nextCombatPlayers[playerId].block || 0,
        strength: nextCombatPlayers[playerId].strength || 0,
        vuln: nextCombatPlayers[playerId].vuln || 0,
        weak: nextCombatPlayers[playerId].weak || 0,
        hand: [...(nextCombatPlayers[playerId].hand || [])],
        drawPile: [...(nextCombatPlayers[playerId].drawPile || [])],
        discardPile: [...(nextCombatPlayers[playerId].discardPile || [])],
        cardsPlayedThisCombat: nextCombatPlayers[playerId].cardsPlayedThisCombat || 0,
        cardsPlayedThisTurn: nextCombatPlayers[playerId].cardsPlayedThisTurn || 0,
        activePowers: { ...(nextCombatPlayers[playerId].activePowers || {}) },
        endedTurn: true
      }
    }
  };

  return {
    ...session,
    party: {
      ...(session.party || {}),
      players: nextPartyPlayers
    },
    combat: {
      ...(session.combat || {}),
      log: combatLog.slice(-8),
      players: nextCombatPlayers
    }
  };
};

export const applyLocalCombatCardToSession = ({
  session,
  participantResolution,
  combatLog,
  playerId = LOCAL_PLAYER_ID
}) => applyCombatParticipantResolutionToSession({
  session,
  participantResolution: {
    ...participantResolution,
    combatState: {
      ...(participantResolution?.combatState || {}),
      endedTurn: false
    }
  },
  combatLog,
  playerId
});

export const applyCombatRewardTransitionToSession = ({
  session,
  rewardNode,
  nextPartyPlayers,
  runSeed,
  buildRewardState
}) => ({
  ...session,
  run: {
    ...(session.run || {}),
    status: 'reward',
    currentRoom: rewardNode
  },
  party: {
    ...(session.party || {}),
    players: nextPartyPlayers
  },
  combat: null,
  reward: buildRewardState({
    session: {
      ...session,
      party: {
        ...(session.party || {}),
        players: nextPartyPlayers
      }
    },
    rewardNode,
    runSeed
  })
});

export const applyCombatDeathToSession = ({
  session,
  deathNode,
  nextPartyPlayers
}) => ({
  ...session,
  run: {
    ...(session.run || {}),
    status: 'game_over',
    currentRoom: deathNode
  },
  party: {
    ...(session.party || {}),
    players: nextPartyPlayers
  },
  combat: null,
  reward: null
});

export const applyEnemyPhaseToSession = ({
  session,
  enemyPhaseState,
  alliedPartyPlayers,
  alliedCombatPlayers,
  combatLog,
  maxHp,
  playerId = LOCAL_PLAYER_ID
}) => {
  const localPlayer = session.party?.players?.[playerId];
  if (!session.combat || !localPlayer) return session;

  const basePartyPlayers = alliedPartyPlayers || session.party?.players || {};
  const nextCombatPlayers = Object.fromEntries(
    Object.entries(alliedCombatPlayers || {}).map(([combatPlayerId, combatPlayer]) => {
      if (combatPlayerId === playerId) {
        return [
          combatPlayerId,
          {
            ...(session.combat?.players?.[combatPlayerId] || {}),
            hp: enemyPhaseState.hp,
            maxHp: maxHp,
            block: enemyPhaseState.combat?.playerBlock || 0,
            strength: enemyPhaseState.combat?.playerStrength || 0,
            vuln: enemyPhaseState.combat?.playerVuln || 0,
            weak: enemyPhaseState.combat?.playerWeak || 0,
            hand: [...(enemyPhaseState.combat?.hand || [])],
            drawPile: [...(enemyPhaseState.combat?.drawPile || [])],
            discardPile: [...(enemyPhaseState.combat?.discardPile || [])],
            cardsPlayedThisCombat: enemyPhaseState.combat?.cardsPlayed || 0,
            cardsPlayedThisTurn: enemyPhaseState.combat?.turnCardsPlayed || 0,
            activePowers: { ...(enemyPhaseState.combat?.activePowers || {}) },
            endedTurn: Boolean(enemyPhaseState.combat?.playerEndedTurn)
          }
        ];
      }

      return [
        combatPlayerId,
        advanceCombatPlayerToNextTurn({
          combatPlayer,
          partyPlayer: basePartyPlayers[combatPlayerId],
          runSeed: session.run?.seed || session.run?.runId || 'run',
          turn: enemyPhaseState.combat?.turn || session.combat.turn
        })
      ];
    })
  );

  const nextPartyPlayers = syncPartyPlayersFromCombatPlayers(basePartyPlayers, nextCombatPlayers);

  return {
    ...session,
    party: {
      ...(session.party || {}),
      players: nextPartyPlayers
    },
    combat: {
      ...(session.combat || {}),
      turn: enemyPhaseState.combat?.turn || session.combat.turn,
      phase: enemyPhaseState.combat?.phase || 'player',
      log: combatLog.slice(-8),
      enemy: {
        ...(session.combat?.enemy || {}),
        hp: enemyPhaseState.combat?.enemyHp,
        maxHp: enemyPhaseState.combat?.enemyMaxHp,
        block: enemyPhaseState.combat?.enemyBlock || 0,
        strength: enemyPhaseState.combat?.enemyStrength || 0,
        vuln: enemyPhaseState.combat?.enemyVuln || 0,
        weak: enemyPhaseState.combat?.enemyWeak || 0,
        intent: enemyPhaseState.combat?.intent || session.combat?.enemy?.intent || null
      },
      players: nextCombatPlayers
    }
  };
};
