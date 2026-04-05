import { IReservationRepository, IBookCopyRepository, IUserRepository } from '../domain/interfaces/repositories';
import { Reservation } from '../domain/entities/Reservation';
import { ReservationAlreadyExistsError, ReservationNotAllowedError, BookNotFoundError } from '../domain/errors/DomainErrors';
import { IDomainEvent, IEventBus } from '../domain/interfaces/events';
import { randomUUID } from 'crypto';

export class ReservationService {
  constructor(
    private reservationRepository: IReservationRepository,
    private bookCopyRepository: IBookCopyRepository,
    private eventBus: IEventBus
  ) {
    // Listen for book returns to trigger the reservation queue
    this.eventBus.subscribe('BookReturned', this.handleBookReturned.bind(this));
  }

  async createReservation(userId: string, bookId: string): Promise<Reservation> {
    // 1. Check if user already has a pending reservation
    const queue = await this.reservationRepository.findByBookSequence(bookId);
    if (queue.some(r => r.userId === userId)) {
      throw new ReservationAlreadyExistsError(userId, bookId);
    }

    // 2. We could check if a book copy is actually available right now
    // If it is, maybe throw an error because they can just borrow it instead
    const allCopies = await this.bookCopyRepository.findByBookId(bookId);
    if (allCopies.length === 0) {
      throw new BookNotFoundError(bookId);
    }

    if (allCopies.some(c => c.isAvailable)) {
      throw new ReservationNotAllowedError(userId, bookId, "A copy of this book is currently available to borrow.");
    }

    // 3. Create Reservation
    const reservation = new Reservation(
      randomUUID(),
      new Date(),
      new Date(),
      {
        userId,
        bookId,
        status: 'PENDING',
        requestedAt: new Date()
      }
    );

    await this.reservationRepository.save(reservation);
    return reservation;
  }

  /**
   * Internal queue processor triggered by BookReturned events
   */
  private async handleBookReturned(event: any): Promise<void> {
    const bookId = event.payload.bookId;
    // Get the queue ordered by oldest requestedAt
    const pendingReservations = await this.reservationRepository.findByBookSequence(bookId);
    
    if (pendingReservations.length > 0) {
      const nextReservation = pendingReservations[0];
      nextReservation.fulfill();
      await this.reservationRepository.save(nextReservation);

      // In a real system, we'd also publish a 'ReservationReady' event here
      // which would trigger an email/SMS bounded context
      await this.eventBus.publish({
        eventName: 'ReservationReady',
        occurredAt: new Date(),
        payload: {
          reservationId: nextReservation.id,
          userId: nextReservation.userId,
          bookId: bookId
        }
      } as any);
    }
  }
}
