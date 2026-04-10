# Co-op Implementation Plan

## Goal

Add online co-op with:

- 2 players for v1, with schemas designed to scale to 4 later
- shared run progression and room voting
- separate player builds, decks, relics, and rewards
- simultaneous player turns during combat
- one shared enemy turn after all active players end turn
- reconnect support with disconnected players skipped until they return

## Finalized Rules

- Players may choose the same or different characters.
- Room choices are voted on per player.
- After voting closes, the final choice is selected randomly from submitted votes.
- If the room vote timer expires and nobody voted, pick the first valid choice deterministically.
- Rewards are separate per player.
- Reward options follow the same structure for all players, but actual relic/card results are rolled from that player's own pools.
- Relics are unique per player only. Different players may own the same relic.
- Combat allows each active player to play independently during the player phase.
- The enemy acts once after every alive, connected player has ended turn.
- Enemy stats scale with player count.
- If a player dies during combat, they are downed for the rest of that combat.
- If at least one player survives the combat, downed players revive afterward at 10% max HP.
- If all players are downed, the run ends.
- Disconnected players may reconnect. Until then they are skipped.
- Shared combat visibility is limited to HP, block, and status/buffs/debuffs.
- Room voting timeout is 30 seconds.
- Reward selection timeout is 30 seconds.
- Reward timeout auto-pick is deterministic in this order:
  1. gold
  2. first valid relic
  3. first valid card

## Architecture

Use host-authoritative simulation over P2P transport:

- WebRTC data channels for peer-to-peer transport
- a small signaling service for session setup
- one peer designated as host
- host validates and applies gameplay actions
- host broadcasts state sync messages to all peers

This keeps networking P2P while avoiding multi-authority desync problems.

## Planned State Model

Top-level state:

- `config`
- `net`
- `lobby`
- `run`
- `party`
- `combat`
- `reward`
- `log`

Key ownership split:

- shared state: run progression, room voting, current room, shared enemy, timers
- per-player state: character, HP, deck, relics, combat piles, rewards, disconnect status

## Planned Modules

- `src/game/schema.ts`
- `src/game/rng.ts`
- `src/game/lobbyReducer.ts`
- `src/game/runReducer.ts`
- `src/game/roomReducer.ts`
- `src/game/combatReducer.ts`
- `src/game/rewardReducer.ts`
- `src/game/visibility.ts`
- `src/net/protocol.ts`
- `src/net/host.ts`
- `src/net/client.ts`

The current React app should become a renderer and input layer, not the source of game truth.

## Milestones

### 1. Extract Core RNG and Run Generation

- move random utilities into a seeded RNG module
- extract procedural run generation into pure game modules
- keep current UI behavior unchanged
- remove direct `Math.random()` usage from extracted generation code

### 2. Replace Inline Room Closures

- stop embedding room behavior as inline `action(state)` functions inside UI code
- introduce serializable room IDs and choice IDs
- resolve room effects through reducer logic instead of direct closures

### 3. Extract Single-Player Combat Engine

- move combat resolution out of `App.jsx`
- define pure reducer-style combat transitions
- keep current single-player behavior and visuals intact

### 4. Expand State to Multi-Player Party Model

- convert one-player run state into `playersById`
- split shared enemy state from per-player combat state
- add downed/revive handling and skipped-player logic

### 5. Add Local Debug Co-op

- simulate 2 players in one browser
- verify room voting, simultaneous turns, reward timing, and revive logic
- tune enemy scaling before networking

### 6. Add Networking

- add signaling flow and room join/create
- implement host-authoritative action protocol
- send full-state syncs first, optimize later if needed
- add reconnect flow

### 7. Add Multiplayer UI

- lobby screen
- player ready states
- vote timer and reward timer
- ally combat status strip
- disconnect/skipped state messaging

## Determinism Requirements

All co-op-critical systems must use seeded RNG:

- run generation
- enemy instantiation
- room vote fallback decisions if randomness is required
- per-player reward generation
- deck shuffles and combat draw order

Direct `Math.random()` must be removed from simulation code before networking.

## First Refactor Slice

Start with a behavior-preserving extraction:

1. add `src/game/rng.js`
2. add `src/game/procedural.js`
3. move seeded RNG and run generation there
4. keep map node rendering in `App.jsx` for now
5. wire `App.jsx` to the extracted generator
6. verify the build still passes

## Deferred for v1

- host migration
- multi-enemy combat encounters
- ally-targeting cards/effects
- deep anti-cheat protections
- 3-4 player UI polish

