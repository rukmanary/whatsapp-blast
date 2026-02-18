type EventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __GA_MEASUREMENT_ID__?: string;
  }
}

let initializedId: string | null = null;

function normalizeMeasurementId(value: unknown) {
  const id = String(value ?? '').trim();
  if (!id) return '';
  if (id.startsWith('%VITE_')) return '';
  return id;
}

function ensureGtagShim() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  });
}

export function initAnalytics(measurementId?: string) {
  const id = normalizeMeasurementId(measurementId);
  if (!id) return false;
  if (initializedId === id) return true;

  ensureGtagShim();

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${id}"]`
  );
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }

  window.gtag?.('js', new Date());
  window.gtag?.('config', id, { send_page_view: false });

  initializedId = id;
  return true;
}

export function trackPageView(path: string) {
  if (!initializedId) return;
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(name: string, params?: EventParams) {
  if (!initializedId) return;
  window.gtag?.('event', name, params ?? {});
}

