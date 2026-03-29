"use client";

import { useState, useEffect, useCallback } from "react";

async function measureCacheSize(): Promise<number> {
  if (typeof caches === "undefined") return 0;
  const keys = await caches.keys();
  let total = 0;
  for (const key of keys) {
    const cache = await caches.open(key);
    const requests = await cache.keys();
    for (const req of requests) {
      const res = await cache.match(req);
      if (res) {
        const blob = await res.blob();
        total += blob.size;
      }
    }
  }
  return total;
}

export function useCacheManager() {
  const [cacheSize, setCacheSize] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    measureCacheSize().then(setCacheSize);
  }, []);

  const clearCache = useCallback(async () => {
    if (typeof caches === "undefined") return;
    setIsClearing(true);
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    setCacheSize(0);
    setIsClearing(false);
  }, []);

  return { cacheSize, isClearing, clearCache };
}
