import { LOCAL_PLAYER_ID } from './schema';
import { createSeededRng } from './rng';
import { deriveSeed } from './schema';

const mergeLocalPlayerResult = (player, result) => ({
  ...player,
  hp: result.hp !== undefined ? result.hp : player.hp,
  maxHp: result.maxHp !== undefined ? result.maxHp : player.maxHp,
  gold: result.gold !== undefined ? result.gold : player.gold,
  deck: result.deck !== undefined ? [...result.deck] : [...(player.deck || [])],
  relics: result.relics !== undefined ? [...result.relics] : [...(player.relics || [])]
});

export const applyRoomResultToSession = ({
  session,
  result,
  nextNode,
  floor,
  act,
  route,
  status = 'in_room',
  playerId = LOCAL_PLAYER_ID
}) => {
  const localPlayer = session.party?.players?.[playerId];
  if (!localPlayer) return session;

  const nextPlayers = {
    ...(session.party?.players || {}),
    [playerId]: mergeLocalPlayerResult(localPlayer, result)
  };
  const shouldPreserveRoomVote = status === 'in_room'
    && session.roomVote
    && nextNode?.nodeId
    && session.roomVote.roomId === nextNode.nodeId;

  return {
    ...session,
    run: {
      ...(session.run || {}),
      status,
      act,
      floor,
      route: route ? [...route] : [...(session.run?.route || [])],
      currentRoom: nextNode || session.run?.currentRoom || null
    },
    party: {
      ...(session.party || {}),
      players: nextPlayers
    },
    roomVote: shouldPreserveRoomVote ? session.roomVote : null,
    reward: status === 'reward' ? session.reward : null
  };
};

export const applyRoomTerminalStateToSession = ({
  session,
  nextNode,
  status,
  result = {},
  playerId = LOCAL_PLAYER_ID
}) => applyRoomResultToSession({
  session,
  result,
  nextNode,
  floor: session.run?.floor || 0,
  act: session.run?.act || 1,
  route: session.run?.route || [],
  status,
  playerId
});

export const applyRoomVoteToSession = ({
  session,
  roomId,
  choiceId,
  playerId = LOCAL_PLAYER_ID,
  deadlineAt,
  openedAt = Date.now()
}) => {
  const existingVote = session.roomVote?.roomId === roomId ? session.roomVote : null;
  const votes = {
    ...(existingVote?.votes || {}),
    [playerId]: choiceId
  };

  return {
    ...session,
    roomVote: {
      roomId,
      phase: existingVote?.phase === 'resolved' ? 'resolved' : 'collecting_votes',
      votes,
      openedAt: existingVote?.openedAt || openedAt,
      deadlineAt: existingVote?.deadlineAt || deadlineAt,
      finalChoiceId: existingVote?.finalChoiceId || null,
      finalChoicePlayerId: existingVote?.finalChoicePlayerId || null
    }
  };
};

export const finalizeRoomVoteInSession = ({
  session,
  roomId,
  finalChoiceId,
  finalChoicePlayerId = null
}) => {
  if (session.roomVote?.roomId !== roomId) return session;
  return {
    ...session,
    roomVote: {
      ...(session.roomVote || {}),
      phase: 'resolved',
      finalChoiceId,
      finalChoicePlayerId
    }
  };
};

export const getEligibleRoomParticipants = (session) => (
  (session.party?.order || []).filter((playerId) => {
    const player = session.party?.players?.[playerId];
    return player?.connected !== false && !player?.skipped;
  })
);

export const getRoomVoteResolution = ({
  session,
  roomId,
  availableChoiceIds = [],
  runSeed,
  now = Date.now()
}) => {
  const roomVote = session?.roomVote;
  if (!roomVote || roomVote.roomId !== roomId || roomVote.phase !== 'collecting_votes') {
    return { status: 'idle' };
  }

  const eligibleVoters = getEligibleRoomParticipants(session);
  const submittedVoters = eligibleVoters.filter((playerId) => roomVote.votes?.[playerId]);
  const isTimedOut = now >= (roomVote.deadlineAt || 0);
  const isReady = submittedVoters.length >= eligibleVoters.length && eligibleVoters.length > 0;

  if (!isReady && !isTimedOut) {
    return {
      status: 'pending',
      waitMs: Math.max(0, (roomVote.deadlineAt || now) - now)
    };
  }

  const submittedEntries = submittedVoters
    .map((playerId) => ({
      playerId,
      choiceId: roomVote.votes[playerId]
    }))
    .filter((entry) => availableChoiceIds.includes(entry.choiceId));

  if (submittedEntries.length === 0) {
    return {
      status: 'resolved',
      finalChoiceId: availableChoiceIds[0] || null,
      finalChoicePlayerId: null
    };
  }

  const rng = createSeededRng(
    deriveSeed(
      runSeed,
      'room-vote-resolution',
      roomVote.roomId,
      ...submittedEntries.flatMap((entry) => [entry.playerId, entry.choiceId])
    )
  );
  const pickedEntry = submittedEntries[Math.floor(rng.next() * submittedEntries.length)] || submittedEntries[0];
  return {
    status: 'resolved',
    finalChoiceId: pickedEntry.choiceId,
    finalChoicePlayerId: pickedEntry.playerId
  };
};

export const finalizeRewardState = ({
  rewardState,
  eligiblePlayerIds = [],
  getDefaultChoiceId,
  now = Date.now()
}) => {
  if (!rewardState) return { status: 'idle' };

  const selectedPlayers = eligiblePlayerIds.filter((playerId) => rewardState.perPlayer?.[playerId]?.choice?.choiceId);
  const isTimedOut = now >= (rewardState.deadlineAt || 0);
  const isReady = selectedPlayers.length >= eligiblePlayerIds.length && eligiblePlayerIds.length > 0;

  if (!isReady && !isTimedOut) {
    return {
      status: 'pending',
      waitMs: Math.max(0, (rewardState.deadlineAt || now) - now)
    };
  }

  return {
    status: 'resolved',
    rewardState: {
      ...rewardState,
      perPlayer: Object.fromEntries(
        Object.entries(rewardState.perPlayer || {}).map(([playerId, rewardPreview]) => {
          const existingChoiceId = rewardPreview?.choice?.choiceId;
          const choiceId = existingChoiceId || getDefaultChoiceId?.(rewardPreview, playerId) || null;
          return [
            playerId,
            {
              ...rewardPreview,
              selected: true,
              autoResolved: !existingChoiceId,
              choice: choiceId ? { choiceId } : rewardPreview?.choice || null
            }
          ];
        })
      )
    }
  };
};
