import { env, waitUntil } from 'cloudflare:workers';

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

const CACHE_KEY_PREFIX = 'cache:';
const refreshTasks = new Map<string, Promise<unknown>>();

function getCacheKey(key: string) {
  return `${CACHE_KEY_PREFIX}${key}`;
}

function isCacheEntry<T>(value: unknown): value is CacheEntry<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'updatedAt' in value &&
    typeof value.updatedAt === 'number' &&
    'value' in value
  );
}

async function readFromKv<T>(key: string): Promise<CacheEntry<T> | undefined> {
  try {
    const entry = await env.KV.get<CacheEntry<T>>(getCacheKey(key), 'json');
    if (!isCacheEntry<T>(entry)) {
      return undefined;
    }

    return entry;
  } catch (error) {
    console.error(`Failed to read cache entry "${key}" from KV`, error);
    return undefined;
  }
}

async function writeToKv<T>(key: string, entry: CacheEntry<T>, expireAfterMs: number) {
  try {
    await env.KV.put(getCacheKey(key), JSON.stringify(entry), {
      expirationTtl: Math.max(60, Math.ceil(expireAfterMs / 1000)),
    });
  } catch (error) {
    console.error(`Failed to write cache entry "${key}" to KV`, error);
  }
}

async function readCache<T>(key: string) {
  return readFromKv<T>(key);
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

    await writeToKv(options.key, entry, options.expireAfterMs);

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

  const cached = await readCache<T>(options.key);
  if (!cached) {
    return (await refreshCache(options)).value;
  }

  const age = Date.now() - cached.updatedAt;
  if (age < options.revalidateAfterMs) {
    return cached.value;
  }

  if (age < options.expireAfterMs) {
    waitUntil(
      refreshCache(options).catch((error) => {
        console.error(`Failed to refresh cache entry "${options.key}"`, error);
      }),
    );
    return cached.value;
  }

  return (await refreshCache(options)).value;
}
