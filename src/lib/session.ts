export type ActiveSession = { code: string; userId: string; expiresAt: string };

const KEY = "cvip_session";
const ID_KEY = "cvip_user_id";

export function saveSession(s: ActiveSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function readSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ActiveSession;
    if (new Date(s.expiresAt).getTime() <= Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveUserId(id: string) {
  localStorage.setItem(ID_KEY, id);
}

export function readUserId() {
  return localStorage.getItem(ID_KEY) ?? "";
}

export function ensureUserId() {
  let id = readUserId();
  if (!id) {
    id = `U${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString(36).toUpperCase().slice(-4)}`;
    saveUserId(id);
  }
  return id;
}

/* ---------- pending game + "returning from telegram" flow ---------- */

const GAME_KEY = "cvip_pending_game";
const AWAIT_KEY = "cvip_awaiting_code";

/** Remembers which game the user was trying to open before activation. */
export function savePendingGame(to: string) {
  localStorage.setItem(GAME_KEY, to);
}

export function readPendingGame(): string {
  return localStorage.getItem(GAME_KEY) ?? "";
}

/** Marks that the user was sent to the Telegram bot to fetch a code. */
export function markAwaitingCode() {
  localStorage.setItem(AWAIT_KEY, "1");
}

export function isAwaitingCode() {
  return localStorage.getItem(AWAIT_KEY) === "1";
}

export function clearAwaitingCode() {
  localStorage.removeItem(AWAIT_KEY);
}

/* ---------- history of codes the user already used ---------- */

export type CodeHistoryItem = { code: string; userId: string; expiresAt: string };

const HISTORY_KEY = "cvip_code_history";

export function readCodeHistory(): CodeHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as CodeHistoryItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addCodeToHistory(item: CodeHistoryItem) {
  const list = readCodeHistory().filter((i) => i.code !== item.code);
  list.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 10)));
}

export function isCodeValid(item: CodeHistoryItem) {
  return !!item.expiresAt && new Date(item.expiresAt).getTime() > Date.now();
}

