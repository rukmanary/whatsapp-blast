export function readJson<T>(key: string, fallback: T): T {
  try {
    if (!('localStorage' in globalThis)) return fallback;
    const raw = globalThis.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    if (!('localStorage' in globalThis)) return;
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

