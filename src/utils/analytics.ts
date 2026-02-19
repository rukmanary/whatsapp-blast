import type { Analytics as FirebaseAnalytics } from "firebase/analytics";

type EventParams = Record<string, string | number | boolean | null | undefined>;

type FirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  appId?: string;
  measurementId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

export type AnalyticsInitOptions = {
  firebase?: FirebaseConfig;
};

type AnalyticsProvider = {
  init: () => Promise<boolean>;
  pageView: (path: string) => void;
  event: (name: string, params?: EventParams) => void;
};

let provider: AnalyticsProvider | null = null;
let errorTrackingEnabled = false;

function truncate(value: string, maxLen: number) {
  if (value.length <= maxLen) return value;
  return `${value.slice(0, Math.max(0, maxLen - 1))}…`;
}

function safeString(value: unknown) {
  return String(value ?? "").trim();
}

function safeBasename(urlLike: unknown) {
  const raw = safeString(urlLike);
  if (!raw) return "";
  try {
    const u = new URL(raw, window.location.href);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    const parts = raw.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  }
}

function enableErrorTracking() {
  if (errorTrackingEnabled) return;
  errorTrackingEnabled = true;

  window.addEventListener(
    "error",
    (event) => {
      const ev = event as ErrorEvent;
      const message = safeString(ev.message);
      const stack = safeString(ev.error instanceof Error ? ev.error.stack : "");
      const file = safeBasename(ev.filename);

      trackEvent("js_error", {
        message: truncate(message || "Unknown error", 120),
        file: truncate(file, 80),
        line: typeof ev.lineno === "number" ? ev.lineno : undefined,
        col: typeof ev.colno === "number" ? ev.colno : undefined,
        stack: stack ? truncate(stack, 200) : undefined,
      });
    },
    true,
  );

  window.addEventListener("unhandledrejection", (event) => {
    const ev = event as PromiseRejectionEvent;
    const reason = ev.reason;
    const message =
      reason instanceof Error
        ? safeString(reason.message)
        : typeof reason === "string"
          ? reason
          : safeString(
              (reason as { message?: unknown } | null | undefined)?.message,
            );
    const stack = reason instanceof Error ? safeString(reason.stack) : "";

    trackEvent("unhandled_rejection", {
      message: truncate(message || "Unhandled rejection", 120),
      stack: stack ? truncate(stack, 200) : undefined,
    });
  });
}

function createFirebaseProvider(firebase?: FirebaseConfig): AnalyticsProvider {
  let analytics: FirebaseAnalytics | null = null;
  let logEventFn:
    | ((
        a: FirebaseAnalytics,
        name: string,
        params?: Record<string, unknown>,
      ) => void)
    | null = null;

  const init = async () => {
    const apiKey = safeString(firebase?.apiKey);
    const authDomain = safeString(firebase?.authDomain);
    const projectId = safeString(firebase?.projectId);
    const appId = safeString(firebase?.appId);
    const measurementId = safeString(firebase?.measurementId);

    if (!apiKey || !authDomain || !projectId || !appId || !measurementId)
      return false;

    const { initializeApp } = await import("firebase/app");
    const { getAnalytics, logEvent, setAnalyticsCollectionEnabled } =
      await import("firebase/analytics");

    const app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      appId,
      measurementId,
      storageBucket: safeString(firebase?.storageBucket) || undefined,
      messagingSenderId: safeString(firebase?.messagingSenderId) || undefined,
    });

    analytics = getAnalytics(app);
    logEventFn = logEvent;
    setAnalyticsCollectionEnabled(analytics, true);
    return true;
  };

  const pageView = (path: string) => {
    if (!analytics || !logEventFn) return;
    logEventFn(analytics, "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  };

  const event = (name: string, params?: EventParams) => {
    if (!analytics || !logEventFn) return;
    logEventFn(analytics, name, params ?? {});
  };

  return { init, pageView, event };
}

export async function initAnalytics(options?: AnalyticsInitOptions) {
  const firebaseApiKey = safeString(options?.firebase?.apiKey);
  const firebaseMeas = safeString(options?.firebase?.measurementId);

  if (!firebaseApiKey || !firebaseMeas) {
    provider = null;
    return false;
  }

  provider = createFirebaseProvider(options?.firebase);

  const ok = await provider.init();
  if (!ok) {
    provider = null;
    return false;
  }

  enableErrorTracking();
  return true;
}

export function trackPageView(path: string) {
  provider?.pageView(path);
}

export function trackEvent(name: string, params?: EventParams) {
  provider?.event(name, params);
}
