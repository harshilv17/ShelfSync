import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { ILockManager } from '../domain/interfaces/lockManager';
import { LockAcquisitionError } from '../domain/errors/DomainErrors';

export class RedisLockManager implements ILockManager {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async acquire(resourceKey: string, ttlMs: number = 5000): Promise<() => Promise<void>> {
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
