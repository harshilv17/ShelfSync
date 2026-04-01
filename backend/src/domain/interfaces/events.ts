export interface IDomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
}

export interface IEventBus {
  publish<T extends IDomainEvent>(event: T): Promise<void>;
  subscribe<T extends IDomainEvent>(eventName: string, handler: (event: T) => Promise<void>): void;
}
