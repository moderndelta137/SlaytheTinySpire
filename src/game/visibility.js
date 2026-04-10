import { LOCAL_PLAYER_ID } from './schema';

const createPublicCombatPlayerView = (player = {}, partyPlayer = {}) => ({
  playerId: player.playerId || partyPlayer.playerId,
  name: partyPlayer.name || 'Player',
  characterKey: partyPlayer.characterKey || null,
  connected: partyPlayer.connected !== false,
  alive: player.alive !== false,
  downed: Boolean(player.downed),
  skipped: Boolean(partyPlayer.skipped),
  hp: player.hp ?? partyPlayer.hp ?? 0,
  maxHp: player.maxHp ?? partyPlayer.maxHp ?? 0,
  block: player.block || 0,
  strength: player.strength || 0,
  vuln: player.vuln || 0,
  weak: player.weak || 0,
  endedTurn: Boolean(player.endedTurn),
  handCount: (player.hand || []).length,
  drawCount: (player.drawPile || []).length,
  discardCount: (player.discardPile || []).length
});

export const createClientVisibleState = ({
  sessionState,
  playerId = LOCAL_PLAYER_ID
}) => {
  const partyPlayers = sessionState?.party?.players || {};
  const combatPlayers = sessionState?.combat?.players || {};
  const localPartyPlayer = partyPlayers[playerId] || null;
  const localCombatPlayer = combatPlayers[playerId] || null;

  return {
    version: sessionState?.version || 1,
    config: { ...(sessionState?.config || {}) },
    net: { ...(sessionState?.net || {}) },
    run: { ...(sessionState?.run || {}) },
    lobby: {
      readyPlayerIds: [...(sessionState?.lobby?.readyPlayerIds || [])],
      players: Object.fromEntries(
        Object.entries(sessionState?.lobby?.players || {}).map(([id, player]) => [
          id,
          {
            playerId: player.playerId,
            name: player.name,
            connected: player.connected !== false,
            ready: Boolean(player.ready),
            selectedCharacterKey: player.selectedCharacterKey || null
          }
        ])
      )
    },
    party: {
      order: [...(sessionState?.party?.order || [])],
      players: Object.fromEntries(
        Object.entries(partyPlayers).map(([id, player]) => [
          id,
          {
            playerId: player.playerId,
            name: player.name,
            characterKey: player.characterKey || null,
            connected: player.connected !== false,
            alive: player.alive !== false,
            downed: Boolean(player.downed),
            skipped: Boolean(player.skipped),
            hp: player.hp ?? 0,
            maxHp: player.maxHp ?? 0,
            gold: player.gold ?? 0,
            relics: id === playerId ? [...(player.relics || [])] : [],
            deckCount: (player.deck || []).length
          }
        ])
      )
    },
    combat: sessionState?.combat
      ? {
          combatId: sessionState.combat.combatId,
          turn: sessionState.combat.turn,
          phase: sessionState.combat.phase,
          enemy: { ...(sessionState.combat.enemy || {}) },
          publicPlayers: Object.fromEntries(
            Object.entries(combatPlayers).map(([id, player]) => [
              id,
              createPublicCombatPlayerView(player, partyPlayers[id])
            ])
          ),
          localPlayer: localCombatPlayer
            ? {
                ...createPublicCombatPlayerView(localCombatPlayer, localPartyPlayer),
                hand: [...(localCombatPlayer.hand || [])],
                drawPile: [...(localCombatPlayer.drawPile || [])],
                discardPile: [...(localCombatPlayer.discardPile || [])],
                activePowers: { ...(localCombatPlayer.activePowers || {}) }
              }
            : null,
          log: [...(sessionState.combat.log || [])]
        }
      : null,
    roomVote: sessionState?.roomVote
      ? {
          roomId: sessionState.roomVote.roomId,
          phase: sessionState.roomVote.phase,
          votes: { ...(sessionState.roomVote.votes || {}) },
          openedAt: sessionState.roomVote.openedAt || null,
          deadlineAt: sessionState.roomVote.deadlineAt || null,
          finalChoiceId: sessionState.roomVote.finalChoiceId || null,
          finalChoicePlayerId: sessionState.roomVote.finalChoicePlayerId || null
        }
      : null,
    reward: sessionState?.reward
      ? {
          roomId: sessionState.reward.roomId,
          openedAt: sessionState.reward.openedAt || null,
          deadlineAt: sessionState.reward.deadlineAt || null,
          perPlayer: Object.fromEntries(
            Object.entries(sessionState.reward.perPlayer || {}).map(([id, reward]) => [
              id,
              {
                playerId: reward.playerId,
                roomId: reward.roomId,
                rewardTier: reward.rewardTier,
                selected: Boolean(reward.selected),
                autoResolved: Boolean(reward.autoResolved),
                choice: reward.choice ? { ...reward.choice } : null,
                options: id === playerId
                  ? { ...(reward.options || {}) }
                  : {
                      gold: reward.options?.gold || 0,
                      hasCard: Boolean(reward.options?.card),
                      hasRelic: Boolean(reward.options?.relic),
                      heal: reward.options?.heal || 0
                    }
              }
            ])
          )
        }
      : null
  };
};

const createRedactedCombatPlayer = (player = {}, partyPlayer = {}, isLocalPlayer = false) => {
  if (isLocalPlayer) {
    return {
      ...player,
      hand: [...(player.hand || [])],
      drawPile: [...(player.drawPile || [])],
      discardPile: [...(player.discardPile || [])],
      activePowers: { ...(player.activePowers || {}) }
    };
  }

  return {
    ...player,
    hand: new Array((player.hand || []).length).fill(null),
    drawPile: new Array((player.drawPile || []).length).fill(null),
    discardPile: new Array((player.discardPile || []).length).fill(null),
    activePowers: {},
    playerId: player.playerId || partyPlayer.playerId
  };
};

const createRedactedPartyPlayer = (player = {}, isLocalPlayer = false) => {
  if (isLocalPlayer) {
    return {
      ...player,
      deck: [...(player.deck || [])],
      relics: [...(player.relics || [])],
      unlocks: {
        cards: [...(player.unlocks?.cards || [])],
        relics: [...(player.unlocks?.relics || [])]
      },
      combat: player.combat
        ? {
            ...player.combat,
            hand: [...(player.combat.hand || [])],
            drawPile: [...(player.combat.drawPile || [])],
            discardPile: [...(player.combat.discardPile || [])],
            activePowers: { ...(player.combat.activePowers || {}) }
          }
        : player.combat
    };
  }

  return {
    ...player,
    deck: [],
    relics: [],
    unlocks: {
      cards: [],
      relics: []
    },
    combat: player.combat
      ? {
          ...player.combat,
          hand: new Array((player.combat.hand || []).length).fill(null),
          drawPile: new Array((player.combat.drawPile || []).length).fill(null),
          discardPile: new Array((player.combat.discardPile || []).length).fill(null),
          activePowers: {}
        }
      : player.combat
  };
};

export const createTransportSessionState = ({
  sessionState,
  playerId = LOCAL_PLAYER_ID
}) => {
  const partyPlayers = sessionState?.party?.players || {};
  const combatPlayers = sessionState?.combat?.players || {};

  return {
    ...sessionState,
    lobby: {
      ...(sessionState?.lobby || {}),
      players: Object.fromEntries(
        Object.entries(sessionState?.lobby?.players || {}).map(([id, player]) => [
          id,
          {
            ...player,
            selectedCharacterKey: player?.selectedCharacterKey || null
          }
        ])
      ),
      readyPlayerIds: [...(sessionState?.lobby?.readyPlayerIds || [])]
    },
    party: {
      ...(sessionState?.party || {}),
      order: [...(sessionState?.party?.order || [])],
      players: Object.fromEntries(
        Object.entries(partyPlayers).map(([id, player]) => [
          id,
          createRedactedPartyPlayer(player, id === playerId)
        ])
      )
    },
    combat: sessionState?.combat
      ? {
          ...(sessionState.combat || {}),
          enemy: { ...(sessionState.combat.enemy || {}) },
          log: [...(sessionState.combat.log || [])],
          players: Object.fromEntries(
            Object.entries(combatPlayers).map(([id, player]) => [
              id,
              createRedactedCombatPlayer(player, partyPlayers[id], id === playerId)
            ])
          )
        }
      : null,
    roomVote: sessionState?.roomVote
      ? {
          ...(sessionState.roomVote || {}),
          votes: { ...(sessionState.roomVote.votes || {}) }
        }
      : null,
    reward: sessionState?.reward
      ? {
          ...(sessionState.reward || {}),
          perPlayer: Object.fromEntries(
            Object.entries(sessionState.reward.perPlayer || {}).map(([id, reward]) => [
              id,
              id === playerId
                ? {
                    ...reward,
                    options: { ...(reward.options || {}) }
                  }
                : {
                    ...reward,
                    options: {
                      gold: reward.options?.gold || 0,
                      heal: reward.options?.heal || 0,
                      card: null,
                      relic: null
                    },
                    choice: reward.choice ? { ...reward.choice } : null
                  }
            ])
          )
        }
      : null
  };
};
