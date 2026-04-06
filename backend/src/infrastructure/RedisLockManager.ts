import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { ILockManager } from '../domain/interfaces/lockManager';
import { LockAcquisitionError } from '../domain/errors/DomainErrors';

export class RedisLockManager implements ILockManager {
  private redis: Redis;
  private connected = false;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true            // don't connect until first use
    });

    this.redis.on('error', (err) => {
      if (this.connected) {
        console.warn('[RedisLockManager] Redis connection lost:', err.message);
        this.connected = false;
      }
      // Silently swallow repeated connection errors to avoid log spam
    });

    this.redis.on('connect', () => {
      this.connected = true;
      console.log('[RedisLockManager] Connected to Redis');
    });
  }

  async acquire(resourceKey: string, ttlMs: number = 5000): Promise<() => Promise<void>> {
    // Attempt to connect if not yet connected
    if (!this.connected) {
      try {
        await this.redis.connect();
      } catch {
        console.warn('[RedisLockManager] Redis unavailable — lock acquisition will fail');
      }
    }

    const lockKey = `lock:${resourceKey}`;
    const token = randomUUID();

    // Try to acquire lock
    // SET key value NX PX timeout
    const acquired = await this.redis.set(lockKey, token, 'PX', ttlMs, 'NX');

    if (!acquired) {
      throw new LockAcquisitionError(resourceKey);
    }

    // Return the release function
    let released = false;
    return async () => {
      if (released) return;

      // Lua script to ensure we only delete the lock if we still own it (token matches)
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
      `;
      
      await this.redis.eval(luaScript, 1, lockKey, token);
      released = true;
    };
  }
}
