const CHANNEL = "synarava-widget-library";
const STORAGE_KEY = "synarava:widget-library:changed";

/** Notifies all listeners (same-tab + cross-tab) that widget library state changed. */
export function notifyWidgetLibraryChanged(): void {
  if (typeof BroadcastChannel !== "undefined") {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage({ type: "changed" });
    ch.close();
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable (private mode, etc.) — ignore
  }
}
