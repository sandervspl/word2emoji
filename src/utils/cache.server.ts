import { getRequest } from '@tanstack/react-start/server';

type CacheEntry<T> = {
  updatedAt: number;
  value: T;
};

type CacheOptions<T> = {
  key: string;
  revalidateAfterMs: number;
  expireAfterMs: number;
  load: () => Promise<T>;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const refreshTasks = new Map<string, Promise<unknown>>();
type EdgeCacheStorage = CacheStorage & { default?: Cache };

function getEdgeCache() {
  if (typeof caches === 'undefined') {
    return undefined;
  }

  return (caches as EdgeCacheStorage).default;
}

function getCacheRequest(key: string) {
  const url = new URL(getRequest().url);
  url.pathname = `/_cache/${encodeURIComponent(key)}`;
  url.search = '';

  return new Request(url.toString(), { method: 'GET' });
}

async function readFromEdgeCache<T>(key: string): Promise<CacheEntry<T> | undefined> {
  const edgeCache = getEdgeCache();
  if (!edgeCache) {
    return undefined;
  }

  const response = await edgeCache.match(getCacheRequest(key));
  if (!response) {
    return undefined;
  }

  try {
    return (await response.json()) as CacheEntry<T>;
  } catch {
    return undefined;
  }
}

async function writeToEdgeCache<T>(key: string, entry: CacheEntry<T>, expireAfterMs: number) {
  const edgeCache = getEdgeCache();
  if (!edgeCache) {
    return;
  }

  await edgeCache.put(
    getCacheRequest(key),
    new Response(JSON.stringify(entry), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${Math.ceil(expireAfterMs / 1000)}`,
      },
    }),
  );
}

function readFromMemory<T>(key: string, expireAfterMs: number): CacheEntry<T> | undefined {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    return undefined;
  }

  if (Date.now() - entry.updatedAt >= expireAfterMs) {
    memoryCache.delete(key);
    return undefined;
  }

  return entry;
}

function writeToMemory<T>(key: string, entry: CacheEntry<T>) {
  memoryCache.set(key, entry);
}

async function readCache<T>(key: string, expireAfterMs: number) {
  const edgeEntry = await readFromEdgeCache<T>(key);
  if (edgeEntry) {
    return edgeEntry;
  }

  return readFromMemory<T>(key, expireAfterMs);
}

async function refreshCache<T>(options: CacheOptions<T>) {
  const existingTask = refreshTasks.get(options.key) as Promise<CacheEntry<T>> | undefined;
  if (existingTask) {
    return existingTask;
  }

  const task = (async () => {
    const value = await options.load();
    const entry: CacheEntry<T> = {
      updatedAt: Date.now(),
      value,
    };

    writeToMemory(options.key, entry);
    await writeToEdgeCache(options.key, entry, options.expireAfterMs);

    return entry;
  })().finally(() => {
    refreshTasks.delete(options.key);
  });

  refreshTasks.set(options.key, task);

  return task;
}

export async function getCachedValue<T>(options: CacheOptions<T>) {
  if (process.env.NODE_ENV !== 'production') {
    return options.load();
  }

  const cached = await readCache<T>(options.key, options.expireAfterMs);
  if (!cached) {
    return (await refreshCache(options)).value;
  }

  const age = Date.now() - cached.updatedAt;
  if (age < options.revalidateAfterMs) {
    return cached.value;
  }

  if (age < options.expireAfterMs) {
    void refreshCache(options);
    return cached.value;
  }

  return (await refreshCache(options)).value;
}
