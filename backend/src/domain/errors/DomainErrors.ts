/**
 * Base custom error class for the domain.
 */
export abstract class DomainError extends Error {
  public abstract readonly name: string;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BookNotAvailableError extends DomainError {
  public readonly name = 'BookNotAvailableError';
  constructor(bookTitle: string) {
    super(`The book "${bookTitle}" is currently not available for borrowing.`);
  }
}

export class BookNotFoundError extends DomainError {
  public readonly name = 'BookNotFoundError';
  constructor(identifier: string) {
    super(`Book with identifier "${identifier}" could not be found.`);
  }
}

export class LoanNotFoundError extends DomainError {
  public readonly name = 'LoanNotFoundError';
  constructor(loanId: string) {
    super(`Loan record "${loanId}" could not be found.`);
  }
}

export class AlreadyBorrowedError extends DomainError {
  public readonly name = 'AlreadyBorrowedError';
  constructor(userId: string, bookTitle: string) {
    super(`User "${userId}" has already borrowed the book "${bookTitle}".`);
  }
}

export class ReservationAlreadyExistsError extends DomainError {
  public readonly name = 'ReservationAlreadyExistsError';
  constructor(userId: string, bookTitle: string) {
    super(`User "${userId}" already has an active reservation for "${bookTitle}".`);
  }
}

export class InsufficientPermissionsError extends DomainError {
  public readonly name = 'InsufficientPermissionsError';
  constructor(action: string) {
    super(`You do not have sufficient permissions to perform this action: ${action}.`);
  }
}

export class LockAcquisitionError extends DomainError {
  public readonly name = 'LockAcquisitionError';
  constructor(resourceKey: string) {
    super(`Failed to acquire distributed lock for resource: ${resourceKey}.`);
  }
}

export class ReservationNotAllowedError extends DomainError {
  public readonly name = 'ReservationNotAllowedError';
  constructor(userId: string, bookTitle: string, reason: string) {
     super(`User "${userId}" cannot reserve "${bookTitle}": ${reason}`);
  }
}
