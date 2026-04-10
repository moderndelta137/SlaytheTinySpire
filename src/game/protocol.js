export const CLIENT_ACTIONS = Object.freeze({
  JOIN_LOBBY: 'JOIN_LOBBY',
  SELECT_CHARACTER: 'SELECT_CHARACTER',
  SET_READY: 'SET_READY',
  START_RUN: 'START_RUN',
  VOTE_ROOM_CHOICE: 'VOTE_ROOM_CHOICE',
  PLAY_CARD: 'PLAY_CARD',
  END_TURN: 'END_TURN',
  AUTO_PLAY_ALLY: 'AUTO_PLAY_ALLY',
  END_ALLY_TURN: 'END_ALLY_TURN',
  SELECT_REWARD: 'SELECT_REWARD',
  HEARTBEAT: 'HEARTBEAT',
  RECONNECT: 'RECONNECT'
});

export const HOST_MESSAGES = Object.freeze({
  JOIN_ACCEPTED: 'JOIN_ACCEPTED',
  STATE_SYNC: 'STATE_SYNC',
  PLAYER_CONNECTED: 'PLAYER_CONNECTED',
  PLAYER_DISCONNECTED: 'PLAYER_DISCONNECTED',
  ROOM_TIMER_STARTED: 'ROOM_TIMER_STARTED',
  REWARD_TIMER_STARTED: 'REWARD_TIMER_STARTED',
  ACTION_REJECTED: 'ACTION_REJECTED',
  DESYNC_NOTICE: 'DESYNC_NOTICE'
});

export const createClientAction = (type, payload = {}) => ({
  type,
  ...payload
});

export const createHostMessage = (type, payload = {}) => ({
  type,
  ...payload
});

export const isClientActionType = (type) => Object.values(CLIENT_ACTIONS).includes(type);

export const isHostMessageType = (type) => Object.values(HOST_MESSAGES).includes(type);
