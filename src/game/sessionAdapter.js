import { CLIENT_ACTIONS, HOST_MESSAGES, createHostMessage, isClientActionType } from './protocol';
import { LOCAL_PLAYER_ID } from './schema';
import { applyRoomVoteToSession } from './sessionRooms';
import { createClientVisibleState } from './visibility';

const isKnownPlayer = (sessionState, playerId) => Boolean(sessionState?.party?.players?.[playerId]);

const isHostPlayer = (sessionState, playerId) => {
  const hostPlayerId = sessionState?.net?.hostPlayerId || LOCAL_PLAYER_ID;
  return playerId === hostPlayerId;
};

const updateLobbyPlayer = (sessionState, playerId, patch) => ({
  ...sessionState,
  lobby: {
    ...(sessionState.lobby || {}),
    players: {
      ...(sessionState.lobby?.players || {}),
      [playerId]: {
        ...(sessionState.lobby?.players?.[playerId] || {}),
        ...patch
      }
    }
  }
});

const updateReadyPlayerIds = (sessionState) => ({
  ...sessionState,
  lobby: {
    ...(sessionState.lobby || {}),
    readyPlayerIds: Object.values(sessionState.lobby?.players || {})
      .filter((player) => player?.ready)
      .map((player) => player.playerId)
  }
});

const updateRewardChoice = (sessionState, playerId, choiceId) => {
  const rewardEntry = sessionState?.reward?.perPlayer?.[playerId];
  if (!rewardEntry) return sessionState;

  return {
    ...sessionState,
    reward: {
      ...(sessionState.reward || {}),
      perPlayer: {
        ...(sessionState.reward?.perPlayer || {}),
        [playerId]: {
          ...rewardEntry,
          selected: true,
          autoResolved: false,
          choice: { choiceId }
        }
      }
    }
  };
};

const updateCombatEndedTurn = (sessionState, playerId) => {
  const partyPlayer = sessionState?.party?.players?.[playerId];
  const combatPlayer = sessionState?.combat?.players?.[playerId];
  if (!partyPlayer || !combatPlayer) return sessionState;

  return {
    ...sessionState,
    party: {
      ...(sessionState.party || {}),
      players: {
        ...(sessionState.party?.players || {}),
        [playerId]: {
          ...partyPlayer,
          combat: {
            ...(partyPlayer.combat || {}),
            endedTurn: true
          }
        }
      }
    },
    combat: {
      ...(sessionState.combat || {}),
      players: {
        ...(sessionState.combat?.players || {}),
        [playerId]: {
          ...combatPlayer,
          endedTurn: true
        }
      }
    }
  };
};

const getCombatPlayerState = (sessionState, playerId) => ({
  partyPlayer: sessionState?.party?.players?.[playerId],
  combatPlayer: sessionState?.combat?.players?.[playerId]
});

const validateCombatAction = (sessionState, playerId, combatId) => {
  if (sessionState?.run?.status !== 'in_combat') return 'Combat is not active.';
  if (combatId && sessionState?.combat?.combatId && combatId !== sessionState.combat.combatId) {
    return 'Combat id does not match the active combat.';
  }

  const { partyPlayer, combatPlayer } = getCombatPlayerState(sessionState, playerId);
  if (!partyPlayer || !combatPlayer) return 'Combat participant not found.';
  if (partyPlayer.hp <= 0 || combatPlayer.alive === false || combatPlayer.downed) return 'Player cannot act while downed.';
  if (combatPlayer.endedTurn) return 'Player has already ended their turn.';

  return null;
};

const reject = (reason) => ({
  accepted: false,
  reason
});

export const applyClientActionToSession = ({
  sessionState,
  action
}) => {
  if (!isClientActionType(action?.type)) return reject('Unknown action type.');
  if (!action?.playerId && action?.type !== CLIENT_ACTIONS.JOIN_LOBBY) return reject('Missing playerId.');
  if (action?.playerId && !isKnownPlayer(sessionState, action.playerId) && action.type !== CLIENT_ACTIONS.JOIN_LOBBY) {
    return reject('Unknown player.');
  }

  switch (action.type) {
    case CLIENT_ACTIONS.JOIN_LOBBY:
      return {
        accepted: true,
        sessionState
      };

    case CLIENT_ACTIONS.SELECT_CHARACTER:
      return {
        accepted: true,
        sessionState: updateLobbyPlayer(sessionState, action.playerId, {
          selectedCharacterKey: action.characterKey || null
        })
      };

    case CLIENT_ACTIONS.SET_READY:
      return {
        accepted: true,
        sessionState: updateReadyPlayerIds(
          updateLobbyPlayer(sessionState, action.playerId, {
            ready: Boolean(action.ready)
          })
        )
      };

    case CLIENT_ACTIONS.START_RUN:
      if (!isHostPlayer(sessionState, action.playerId)) return reject('Only the host can start the run.');
      return {
        accepted: true,
        sessionState
      };

    case CLIENT_ACTIONS.VOTE_ROOM_CHOICE:
      if (sessionState?.run?.status !== 'in_room') return reject('Room voting is not active.');
      return {
        accepted: true,
        sessionState: applyRoomVoteToSession({
          session: sessionState,
          roomId: action.roomId,
          choiceId: action.choiceId,
          playerId: action.playerId,
          deadlineAt: sessionState?.roomVote?.deadlineAt || (Date.now() + (sessionState?.config?.roomVoteTimeoutMs || 30000))
        })
      };

    case CLIENT_ACTIONS.SELECT_REWARD:
      if (sessionState?.run?.status !== 'reward') return reject('Reward selection is not active.');
      return {
        accepted: true,
        sessionState: updateRewardChoice(sessionState, action.playerId, action.rewardId || action.choiceId)
      };

    case CLIENT_ACTIONS.END_TURN:
    case CLIENT_ACTIONS.END_ALLY_TURN:
      if (sessionState?.run?.status !== 'in_combat') return reject('Combat is not active.');
      return {
        accepted: true,
        sessionState: updateCombatEndedTurn(sessionState, action.playerId)
      };

    case CLIENT_ACTIONS.PLAY_CARD:
      {
        const combatError = validateCombatAction(sessionState, action.playerId, action.combatId);
        if (combatError) return reject(combatError);

        const { combatPlayer } = getCombatPlayerState(sessionState, action.playerId);
        const hand = combatPlayer?.hand || [];
        if (!Number.isInteger(action.cardIndex) || action.cardIndex < 0 || action.cardIndex >= hand.length) {
          return reject('Card index is invalid for the current hand.');
        }
        if (action.cardName && hand[action.cardIndex] !== action.cardName) {
          return reject('Card does not match the current hand state.');
        }
        return {
          accepted: true,
          sessionState
        };
      }

    case CLIENT_ACTIONS.AUTO_PLAY_ALLY:
      {
        const combatError = validateCombatAction(sessionState, action.playerId, action.combatId);
        if (combatError) return reject(combatError);

        const { combatPlayer } = getCombatPlayerState(sessionState, action.playerId);
        if ((combatPlayer?.hand || []).length === 0) {
          return reject('Player has no cards to auto-play.');
        }
        return {
          accepted: true,
          sessionState
        };
      }

    case CLIENT_ACTIONS.HEARTBEAT:
    case CLIENT_ACTIONS.RECONNECT:
      return {
        accepted: true,
        sessionState
      };

    default:
      return reject('Unsupported action.');
  }
};

export const createStateSyncMessage = ({
  sessionState,
  playerId = LOCAL_PLAYER_ID,
  ackActionId
}) => createHostMessage(HOST_MESSAGES.STATE_SYNC, {
  state: createClientVisibleState({ sessionState, playerId }),
  ackActionId
});

export const createActionRejectedMessage = (reason) => (
  createHostMessage(HOST_MESSAGES.ACTION_REJECTED, { reason })
);

export const createLocalSessionBridge = ({
  playerId = LOCAL_PLAYER_ID
} = {}) => ({
  toClientState(sessionState) {
    return createClientVisibleState({ sessionState, playerId });
  },
  toStateSyncMessage(sessionState, ackActionId) {
    return createStateSyncMessage({ sessionState, playerId, ackActionId });
  },
  applyAction(sessionState, action) {
    return applyClientActionToSession({ sessionState, action });
  }
});
