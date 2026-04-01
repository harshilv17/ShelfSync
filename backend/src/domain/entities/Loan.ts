import { BaseEntity } from './BaseEntity';
import { Money } from '../Money';

export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'LOST';

export interface LoanProps {
  userId: string;
  bookCopyId: string;
  dueDate: Date;
  returnedAt?: Date;
  status: LoanStatus;
  accruedFineCents: number;
}

export class Loan extends BaseEntity {
  private _userId: string;
  private _bookCopyId: string;
  private _dueDate: Date;
  private _returnedAt?: Date;
  private _status: LoanStatus;
  private _accruedFine: Money;

  constructor(id: string, createdAt: Date, updatedAt: Date, props: LoanProps) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._bookCopyId = props.bookCopyId;
    this._dueDate = props.dueDate;
    this._returnedAt = props.returnedAt;
    this._status = props.status;
    this._accruedFine = Money.fromCents(props.accruedFineCents || 0);
  }

  get userId(): string {
    return this._userId;
  }

  get bookCopyId(): string {
    return this._bookCopyId;
  }

  get dueDate(): Date {
    return this._dueDate;
  }

  get returnedAt(): Date | undefined {
    return this._returnedAt;
  }

  get status(): LoanStatus {
    return this._status;
  }

  get accruedFine(): Money {
    return this._accruedFine;
  }

  /**
   * Applies an additional fine to this loan.
   */
  addFine(fine: Money): void {
    this._accruedFine = this._accruedFine.add(fine);
    if (this._status === 'ACTIVE' && new Date() > this._dueDate) {
      this._status = 'OVERDUE';
    }
    this.markModified();
  }

  /**
   * Marks the loan as returned.
   */
  returnResource(): void {
    if (this._status === 'RETURNED') {
      throw new Error("Loan is already returned.");
    }
    this._status = 'RETURNED';
    this._returnedAt = new Date();
    this.markModified();
  }

  /**
   * Marks the book as lost.
   */
  markAsLost(): void {
    if (this._status === 'RETURNED') {
      throw new Error("Cannot mark a returned loan as lost.");
    }
    this._status = 'LOST';
    this.markModified();
  }
}
