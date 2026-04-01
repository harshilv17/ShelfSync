import { BaseEntity } from './BaseEntity';

export type ReservationStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface ReservationProps {
  userId: string;
  bookId: string;
  status: ReservationStatus;
  requestedAt: Date;
}

export class Reservation extends BaseEntity {
  private _userId: string;
  private _bookId: string;
  private _status: ReservationStatus;
  private _requestedAt: Date;

  constructor(id: string, createdAt: Date, updatedAt: Date, props: ReservationProps) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._bookId = props.bookId;
    this._status = props.status;
    this._requestedAt = props.requestedAt;
  }

  get userId(): string { return this._userId; }
  get bookId(): string { return this._bookId; }
  get status(): ReservationStatus { return this._status; }
  get requestedAt(): Date { return this._requestedAt; }

  fulfill(): void {
    if (this._status !== 'PENDING') {
      throw new Error("Only pending reservations can be fulfilled.");
    }
    this._status = 'FULFILLED';
    this.markModified();
  }

  cancel(): void {
    if (this._status !== 'PENDING') {
      throw new Error("Only pending reservations can be cancelled.");
    }
    this._status = 'CANCELLED';
    this.markModified();
  }

  expire(): void {
    if (this._status !== 'PENDING') {
      throw new Error("Only pending reservations can expire.");
    }
    this._status = 'EXPIRED';
    this.markModified();
  }
}
