const DB = "https://crazy-12-default-rtdb.firebaseio.com";
const APPLE_PATH = `${DB}/m11.json`;
const AVIATOR_PATH = `${DB}/pre/hipr/hipr.json`;

export const MASTER_CODE = "DASU-81JK-88HG-BNA1";
const FLAG = "cvip_fb_mode";

export function enableFirebaseMode() {
  localStorage.setItem(FLAG, "1");
}

export function disableFirebaseMode() {
  try {
    localStorage.removeItem(FLAG);
  } catch {
    /* ignore */
  }
}

export function isFirebaseMode() {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

/** bad counts per row, bottom row first */
export const BAD_PER_ROW = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

/** Builds a random layout: rows[row][col] = true when the apple is rotten. */
export function randomAppleLayout(): boolean[][] {
  return BAD_PER_ROW.map((bads) => {
    const row = [false, false, false, false, false];
    const idx = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, bads);
    idx.forEach((i) => (row[i] = true));
    return row;
  });
}

function layoutToPayload(layout: boolean[][]) {
  const out: Record<string, Record<string, string>> = {};
  layout.forEach((row, r) =>
    row.forEach((bad, c) => {
      const key = `m${r * 5 + c + 1}`;
      out[key] = { [key]: bad ? "1" : "0" };
    }),
  );
  return out;
}

/** Reads the current 50 apple values from Firebase (bottom row = m1..m5). */
export async function fetchAppleLayout(): Promise<boolean[][] | null> {
  try {
    const res = await fetch(`${APPLE_PATH}?t=${Date.now()}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, Record<string, string>> | null;
    if (!data) return null;
    const layout: boolean[][] = [];
    for (let r = 0; r < 10; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < 5; c++) {
        const key = `m${r * 5 + c + 1}`;
        const node = data[key];
        const raw = node ? node[key] : "0";
        row.push(String(raw) === "1");
      }
      layout.push(row);
    }
    return layout;
  } catch {
    return null;
  }
}

/** Writes a fresh random layout to Firebase and returns it. */
export async function resetAppleLayout(): Promise<boolean[][]> {
  const layout = randomAppleLayout();
  try {
    await fetch(APPLE_PATH, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layoutToPayload(layout)),
    });
  } catch {
    /* keep local layout when the write fails */
  }
  return layout;
}

/** Reads the aviator prediction multiplier from Firebase. */
export async function fetchAviatorOdd(): Promise<number | null> {
  try {
    const res = await fetch(`${AVIATOR_PATH}?t=${Date.now()}`);
    if (!res.ok) return null;
    const raw = (await res.json()) as unknown;
    const value = typeof raw === "object" && raw !== null ? Object.values(raw)[0] : raw;
    const num = Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isFinite(num) && num > 0 ? num : null;
  } catch {
    return null;
  }
}
