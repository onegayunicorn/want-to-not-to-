export class RateLimiter {
  constructor({ limit = 3, windowMs = 60_000, clock = () => Date.now() } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.clock = clock;
    this.buckets = new Map();
  }

  check(bucketKey) {
    const now = this.clock();
    const current = this.buckets.get(bucketKey);
    if (!current || now - current.windowStart >= this.windowMs) {
      this.buckets.set(bucketKey, { windowStart: now, count: 1 });
      return { allowed: true, remaining: this.limit - 1 };
    }
    if (current.count >= this.limit) return { allowed: false, remaining: 0 };
    current.count += 1;
    return { allowed: true, remaining: this.limit - current.count };
  }

  expire() {
    const now = this.clock();
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.windowStart >= this.windowMs) this.buckets.delete(key);
    }
  }
}
