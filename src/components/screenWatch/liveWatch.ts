// Shared protocol for live-only screen watch (ScreenRecorder ⇄ ScreenWatchPanel). Nothing is stored:
// everything travels over private Supabase Realtime channels guarded by realtime.messages policies.

export const LOBBY_TOPIC = 'screen-watch-lobby';
export const userTopic = (userId: string) => `screen-watch:${userId}`;

/** How often the recorder sends what happened (ms): low enough to feel live. */
export const SEND_MS = 250;
/** A broadcast message must stay well under the Realtime payload limit, so big batches are split. */
export const PART_CHARS = 60_000;

/** In the lobby: one entry per recordable browser tab on the platform right now. */
export type LobbyPresence = { sid: string; uid: string; at: string };
/** On a person's stream channel: the principal watching one of their tabs. */
export type ViewerPresence = { viewer: true; sid: string };
/** One piece of a batch of rrweb events (JSON text split into n parts). */
export type StreamPart = { sid: string; id: number; i: number; n: number; d: string; path: string; w: number; h: number };
