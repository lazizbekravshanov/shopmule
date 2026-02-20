// Offline mutation queue — persists pending API calls to localStorage
// and replays them when the network is restored.

const QUEUE_KEY = 'shopmule:offline_queue';

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: number;
  label: string;       // Human-readable label for the UI
  retries: number;
}

// ─── Queue access helpers ────────────────────────────────────────────────────

function readQueue(): QueuedRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full — nothing we can do
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const offlineQueue = {
  /** Add a failed request to the queue */
  enqueue(item: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): string {
    const id = `oq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const queued: QueuedRequest = { ...item, id, timestamp: Date.now(), retries: 0 };
    const current = readQueue();
    writeQueue([...current, queued]);
    window.dispatchEvent(new CustomEvent('offline-queue-change'));
    return id;
  },

  /** Remove a single item by id */
  remove(id: string): void {
    writeQueue(readQueue().filter((i) => i.id !== id));
    window.dispatchEvent(new CustomEvent('offline-queue-change'));
  },

  /** All pending items */
  getAll(): QueuedRequest[] {
    return readQueue();
  },

  /** Count of pending items */
  count(): number {
    return readQueue().length;
  },

  /** Replay all queued requests in order. Returns number of successfully replayed items. */
  async drain(): Promise<{ succeeded: number; failed: number }> {
    const items = readQueue();
    if (items.length === 0) return { succeeded: 0, failed: 0 };

    let succeeded = 0;
    let failed = 0;
    const remaining: QueuedRequest[] = [];

    for (const item of items) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          body: item.body ?? undefined,
          headers: { 'Content-Type': 'application/json', ...item.headers },
          credentials: 'include',
        });

        if (res.ok) {
          succeeded++;
        } else if (res.status >= 400 && res.status < 500) {
          // Client error (e.g. 404, 409) — item is invalid, discard it
          succeeded++; // count as "resolved" so it doesn't pile up
        } else {
          // Server error — keep in queue for retry
          remaining.push({ ...item, retries: item.retries + 1 });
          failed++;
        }
      } catch {
        // Network still unavailable — keep in queue
        remaining.push({ ...item, retries: item.retries + 1 });
        failed++;
      }
    }

    writeQueue(remaining);
    window.dispatchEvent(new CustomEvent('offline-queue-change'));
    return { succeeded, failed };
  },

  /** Clear the entire queue (e.g. on logout) */
  clear(): void {
    writeQueue([]);
    window.dispatchEvent(new CustomEvent('offline-queue-change'));
  },
};

// ─── Helper: wrap a fetch call to auto-queue on network failure ───────────────

export async function fetchWithOfflineQueue<T>(
  url: string,
  options: RequestInit & { label: string }
): Promise<T | null> {
  const { label, ...fetchOptions } = options;

  if (!navigator.onLine) {
    offlineQueue.enqueue({
      url,
      method: fetchOptions.method ?? 'GET',
      body: typeof fetchOptions.body === 'string' ? fetchOptions.body : null,
      headers: (fetchOptions.headers as Record<string, string>) ?? {},
      label,
    });
    return null;
  }

  try {
    const res = await fetch(url, { credentials: 'include', ...fetchOptions });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as T;
  } catch (err) {
    if (err instanceof TypeError) {
      // Network error — queue it
      offlineQueue.enqueue({
        url,
        method: fetchOptions.method ?? 'GET',
        body: typeof fetchOptions.body === 'string' ? fetchOptions.body : null,
        headers: (fetchOptions.headers as Record<string, string>) ?? {},
        label,
      });
      return null;
    }
    throw err;
  }
}
