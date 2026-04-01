/**
 * Base abstract class for all domain entities.
 * Ensures consistent tracking of identity and lifecycle timestamps.
 */
export abstract class BaseEntity {
  protected readonly _id: string;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: string, createdAt: Date, updatedAt: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Updates the updatedAt timestamp. Called internally by subclasses
   * whenever their state is modified.
   */
  protected markModified(): void {
    this._updatedAt = new Date();
  }
}
