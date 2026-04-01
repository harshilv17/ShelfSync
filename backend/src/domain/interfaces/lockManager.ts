export interface ILockManager {
  /**
   * Acquires a distributed lock for a specific resource key.
   * Resolves to a release function that must be called in a finally block.
   * Throws LockAcquisitionError if the lock cannot be acquired within the timeout.
   */
  acquire(resourceKey: string, ttlMs?: number): Promise<() => Promise<void>>;
}
