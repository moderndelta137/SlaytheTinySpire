import { CLIENT_ACTIONS } from './protocol';
import { LOCAL_NETWORK_EVENTS, createLocalNetworkPeer, sanitizeForChannel } from './localNetwork';
import { createTransportSessionState } from './visibility';

export const LOCAL_NETWORK_SIMPLE_ACTIONS = new Set([
  CLIENT_ACTIONS.SELECT_CHARACTER,
  CLIENT_ACTIONS.SET_READY,
  CLIENT_ACTIONS.VOTE_ROOM_CHOICE,
  CLIENT_ACTIONS.SELECT_REWARD
]);

export const isImmediateLocalNetworkAction = (action) => (
  LOCAL_NETWORK_SIMPLE_ACTIONS.has(action?.type)
);

const SIGNAL_EVENTS = Object.freeze({
  JOIN: 'rtc_join',
  REQUEST_SNAPSHOT: 'rtc_request_snapshot',
  OFFER: 'rtc_offer',
  ANSWER: 'rtc_answer',
  ICE: 'rtc_ice',
  SNAPSHOT: 'rtc_snapshot',
  ACTION: 'rtc_action',
  LEAVE: 'rtc_leave'
});

const createSignalChannel = ({ roomId, playerId, onSignal }) => {
  const origin = window.location.origin;
  const eventsUrl = `${origin}/__signal/events?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(playerId)}`;
  const eventSource = new EventSource(eventsUrl);
  const listener = (event) => {
    if (!event?.data) return;
    try {
      const payload = JSON.parse(event.data);
      if (!payload || payload.playerId === playerId) return;
      onSignal?.(payload);
    } catch (error) {
      console.warn('Failed to parse signaling payload', error);
    }
  };
  eventSource.addEventListener('message', listener);
  return {
    async post(message) {
      await fetch(`${origin}/__signal/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizeForChannel({
          roomId,
          ...message,
          playerId
        }))
      }).catch((error) => {
        console.warn('Failed to post signaling message', error);
      });
    },
    close() {
      eventSource.removeEventListener('message', listener);
      eventSource.close();
    }
  };
};

const parseRtcMessage = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse RTC session payload', error);
    return null;
  }
};

const createRtcStore = ({
  roomId,
  playerId,
  mode,
  guestName,
  onSync,
  onJoin,
  onAction,
  onLeave,
  onStatus
}) => {
  const isHost = mode === 'local-host';
  const isClient = mode === 'local-client';
  const peerConnection = new RTCPeerConnection();
  onStatus?.({
    transport: 'webrtc',
    phase: isHost ? 'waiting' : 'signaling'
  });
  const signalChannel = createSignalChannel({
    roomId,
    playerId,
    onSignal: async (payload) => {
      if (payload.targetPlayerId && payload.targetPlayerId !== playerId) return;

      if (payload.type === SIGNAL_EVENTS.JOIN && isHost) {
        remotePlayerId = payload.playerId;
        onStatus?.({
          transport: 'webrtc',
          phase: 'connecting'
        });
        onJoin?.(payload);
        if (latestSyncPayload) {
          signalChannel.post({
            type: SIGNAL_EVENTS.SNAPSHOT,
            targetPlayerId: remotePlayerId,
            snapshot: latestSyncPayload
          });
        }
        ensureDataChannel();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalChannel.post({
          type: SIGNAL_EVENTS.OFFER,
          targetPlayerId: remotePlayerId,
          description: offer
        });
        return;
      }

      if (payload.type === SIGNAL_EVENTS.REQUEST_SNAPSHOT && isHost) {
        remotePlayerId = payload.playerId;
        if (latestSyncPayload) {
          signalChannel.post({
            type: SIGNAL_EVENTS.SNAPSHOT,
            targetPlayerId: remotePlayerId,
            snapshot: latestSyncPayload
          });
        }
        if (!dataChannel || dataChannel.readyState !== 'open') {
          ensureDataChannel();
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          signalChannel.post({
            type: SIGNAL_EVENTS.OFFER,
            targetPlayerId: remotePlayerId,
            description: offer
          });
        }
        return;
      }

      if (payload.type === SIGNAL_EVENTS.OFFER && isClient) {
        remotePlayerId = payload.playerId;
        onStatus?.({
          transport: 'webrtc',
          phase: 'connecting'
        });
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.description));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalChannel.post({
          type: SIGNAL_EVENTS.ANSWER,
          targetPlayerId: remotePlayerId,
          description: answer
        });
        return;
      }

      if (payload.type === SIGNAL_EVENTS.ANSWER && isHost) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.description));
        return;
      }

      if (payload.type === SIGNAL_EVENTS.ICE && payload.candidate) {
        try {
          if (payload.candidate.sdpMid == null && payload.candidate.sdpMLineIndex == null) {
            return;
          }
          await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (error) {
          console.warn('Failed to add RTC ICE candidate', error);
        }
        return;
      }

      if (payload.type === SIGNAL_EVENTS.SNAPSHOT && payload.snapshot) {
        onSync?.(payload.snapshot);
        return;
      }

      if (payload.type === SIGNAL_EVENTS.ACTION && payload.action) {
        onAction?.(payload.action, payload);
        return;
      }

      if (payload.type === SIGNAL_EVENTS.LEAVE) {
        onLeave?.(payload);
        remotePlayerId = null;
        onStatus?.({
          transport: 'webrtc',
          phase: 'disconnected'
        });
        if (dataChannel) {
          dataChannel.close();
          dataChannel = null;
        }
      }
    }
  });

  let remotePlayerId = null;
  let dataChannel = null;
  let latestSyncPayload = null;
  let queuedMessages = [];

  const buildSyncPayload = ({ sessionState, currentNode, runContent }) => ({
    type: LOCAL_NETWORK_EVENTS.SYNC,
    sessionState: createTransportSessionState({
      sessionState,
      playerId: remotePlayerId
    }),
    currentNode,
    runContent: runContent || null
  });

  const sendRtcMessage = (message) => {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      queuedMessages.push(message);
      return false;
    }
    dataChannel.send(JSON.stringify(sanitizeForChannel(message)));
    return true;
  };

  const flushQueuedMessages = () => {
    if (!dataChannel || dataChannel.readyState !== 'open' || queuedMessages.length === 0) return;
    const messages = queuedMessages;
    queuedMessages = [];
    messages.forEach((message) => {
      dataChannel.send(JSON.stringify(sanitizeForChannel(message)));
    });
  };

  const handleRtcPayload = (payload) => {
    if (payload.type === LOCAL_NETWORK_EVENTS.SYNC && payload.sessionState) {
      onSync?.(payload);
      return;
    }
    if (payload.type === LOCAL_NETWORK_EVENTS.ACTION) {
      onAction?.(payload.action, payload);
    }
  };

  const bindDataChannel = (channel) => {
    dataChannel = channel;
    dataChannel.onmessage = (event) => {
      const payload = parseRtcMessage(event.data);
      if (payload) handleRtcPayload(payload);
    };
    dataChannel.onopen = () => {
      onStatus?.({
        transport: 'webrtc',
        phase: 'connected'
      });
      if (isHost && latestSyncPayload) {
        dataChannel.send(JSON.stringify(sanitizeForChannel(latestSyncPayload)));
      }
      flushQueuedMessages();
    };
    dataChannel.onclose = () => {
      dataChannel = null;
      onStatus?.({
        transport: 'webrtc',
        phase: 'disconnected'
      });
    };
  };

  const ensureDataChannel = () => {
    if (!isHost || dataChannel) return;
    bindDataChannel(peerConnection.createDataChannel('session'));
  };

  peerConnection.onicecandidate = (event) => {
    if (!event.candidate || !remotePlayerId) return;
    signalChannel.post({
      type: SIGNAL_EVENTS.ICE,
      targetPlayerId: remotePlayerId,
      candidate: event.candidate
    });
  };

  peerConnection.ondatachannel = (event) => {
    bindDataChannel(event.channel);
  };

  if (isClient) {
    signalChannel.post({
      type: SIGNAL_EVENTS.JOIN,
      name: guestName
    });
  }

  return {
    roomId,
    playerId,
    mode,
    close() {
      if (remotePlayerId) {
        signalChannel.post({
          type: SIGNAL_EVENTS.LEAVE,
          targetPlayerId: remotePlayerId
        });
      }
      if (dataChannel) dataChannel.close();
      peerConnection.close();
      signalChannel.close();
      onStatus?.({
        transport: 'webrtc',
        phase: 'offline'
      });
    },
    broadcastSync({ sessionState, currentNode, runContent }) {
      if (!isHost) return;
      if (!remotePlayerId) return;
      latestSyncPayload = buildSyncPayload({
        sessionState,
        currentNode,
        runContent
      });
      if (remotePlayerId && (!dataChannel || dataChannel.readyState !== 'open')) {
        signalChannel.post({
          type: SIGNAL_EVENTS.SNAPSHOT,
          targetPlayerId: remotePlayerId,
          snapshot: latestSyncPayload
        });
      }
      sendRtcMessage(latestSyncPayload);
    },
    dispatchAction(action) {
      if (remotePlayerId && (
        isImmediateLocalNetworkAction(action)
        || !dataChannel
        || dataChannel.readyState !== 'open'
      )) {
        signalChannel.post({
          type: SIGNAL_EVENTS.ACTION,
          targetPlayerId: remotePlayerId,
          action
        });
        return;
      }
      sendRtcMessage({
        type: LOCAL_NETWORK_EVENTS.ACTION,
        action
      });
    },
    reconnect() {
      if (isClient) {
        onStatus?.({
          transport: 'webrtc',
          phase: 'signaling'
        });
        signalChannel.post({
          type: SIGNAL_EVENTS.JOIN,
          name: guestName
        });
        signalChannel.post({
          type: SIGNAL_EVENTS.REQUEST_SNAPSHOT
        });
        return;
      }
      if (isHost && remotePlayerId && latestSyncPayload) {
        signalChannel.post({
          type: SIGNAL_EVENTS.SNAPSHOT,
          targetPlayerId: remotePlayerId,
          snapshot: latestSyncPayload
        });
      }
    }
  };
};

const createBroadcastFallbackStore = ({
  roomId,
  playerId,
  mode,
  guestName = 'Guest Player',
  onSync,
  onJoin,
  onAction,
  onLeave,
  onStatus
}) => {
  const isHost = mode === 'local-host';
  const isClient = mode === 'local-client';
  let remotePlayerId = null;
  const peer = createLocalNetworkPeer({
    roomId,
    playerId,
    onMessage: (payload) => {
      if (payload.type === LOCAL_NETWORK_EVENTS.SYNC && payload.sessionState) {
        onSync?.(payload);
        return;
      }

      if (payload.type === LOCAL_NETWORK_EVENTS.JOIN && isHost) {
        remotePlayerId = payload.playerId;
        onJoin?.(payload);
        return;
      }

      if (payload.type === LOCAL_NETWORK_EVENTS.ACTION && isHost) {
        remotePlayerId = payload.playerId;
        onAction?.(payload.action, payload);
        return;
      }

      if (payload.type === LOCAL_NETWORK_EVENTS.LEAVE && isHost) {
        onLeave?.(payload);
      }
    }
  });

  if (!peer) return null;
  onStatus?.({
    transport: 'broadcast',
    phase: 'connected'
  });

  if (isClient) {
    peer.post({
      type: LOCAL_NETWORK_EVENTS.JOIN,
      name: guestName
    });
  }

  return {
    roomId,
    playerId,
    mode,
    close() {
      peer.post({
        type: LOCAL_NETWORK_EVENTS.LEAVE
      });
      peer.close();
      onStatus?.({
        transport: 'broadcast',
        phase: 'offline'
      });
    },
    broadcastSync({ sessionState, currentNode, runContent }) {
      if (!isHost) return;
      if (!remotePlayerId) return;
      peer.post({
        type: LOCAL_NETWORK_EVENTS.SYNC,
        sessionState: createTransportSessionState({
          sessionState,
          playerId: remotePlayerId
        }),
        currentNode,
        runContent: runContent || null
      });
    },
    dispatchAction(action) {
      peer.post({
        type: LOCAL_NETWORK_EVENTS.ACTION,
        action
      });
    },
    reconnect() {
      if (isClient) {
        peer.post({
          type: LOCAL_NETWORK_EVENTS.JOIN,
          name: guestName
        });
      }
    }
  };
};

export const createLocalSessionStore = (options) => {
  if (typeof RTCPeerConnection === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return createBroadcastFallbackStore(options);
  }
  return createRtcStore(options);
};
