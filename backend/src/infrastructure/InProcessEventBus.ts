import { IDomainEvent, IEventBus } from '../domain/interfaces/events';

export class InProcessEventBus implements IEventBus {
  private handlers: Map<string, ((event: any) => Promise<void>)[]> = new Map();

  async publish<T extends IDomainEvent>(event: T): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) || [];
    
    // Publish asynchronously without blocking the main workflow
    Promise.allSettled(
      eventHandlers.map(handler => handler(event))
    ).catch(error => {
      console.error(`Failed to execute event handler for ${event.eventName}`, error);
    });
  }

  subscribe<T extends IDomainEvent>(eventName: string, handler: (event: T) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }
}
