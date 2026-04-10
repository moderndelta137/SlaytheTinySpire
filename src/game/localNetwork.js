export const LOCAL_NETWORK_EVENTS = Object.freeze({
  JOIN: 'join',
  LEAVE: 'leave',
  ACTION: 'action',
  SYNC: 'sync',
  START_RUN: 'start_run'
});

export const sanitizeForChannel = (value) => {
  if (typeof value === 'function' || value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeForChannel(entry))
      .filter((entry) => entry !== undefined);
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, sanitizeForChannel(entry)])
      .filter(([, entry]) => entry !== undefined)
  );
};

export const createLocalNetworkPeer = ({ roomId, playerId, onMessage }) => {
  if (!roomId || !playerId) return null;

  const channelName = `slay-the-tiny-spire:${roomId}`;
  const channel = new BroadcastChannel(channelName);
  const listener = (event) => {
    const payload = event?.data;
    if (!payload || payload.playerId === playerId) return;
    onMessage?.(payload);
  };

  channel.addEventListener('message', listener);

  return {
    roomId,
    playerId,
    post(message) {
      channel.postMessage(sanitizeForChannel({
        ...message,
        playerId
      }));
    },
    close() {
      channel.removeEventListener('message', listener);
      channel.close();
    }
  };
};

export const createLocalRoomId = () => String(Math.floor(100000 + Math.random() * 900000));
