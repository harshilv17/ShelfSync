import { BaseEntity } from './BaseEntity';

export type CopyCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'LOST';

export interface BookCopyProps {
  bookId: string;
  branchId: string;
  condition: CopyCondition;
  isAvailable: boolean;
}

export class BookCopy extends BaseEntity {
  private _bookId: string;
  private _branchId: string;
  private _condition: CopyCondition;
  private _isAvailable: boolean;

  constructor(id: string, createdAt: Date, updatedAt: Date, props: BookCopyProps) {
    super(id, createdAt, updatedAt);
    this._bookId = props.bookId;
    this._branchId = props.branchId;
    this._condition = props.condition;
    this._isAvailable = props.isAvailable;
  }

  get bookId(): string {
    return this._bookId;
  }

  get branchId(): string {
    return this._branchId;
  }

  get condition(): CopyCondition {
    return this._condition;
  }

  get isAvailable(): boolean {
    return this._isAvailable && this._condition !== 'LOST';
  }

  markAsBorrowed(): void {
    if (!this.isAvailable) {
      throw new Error("Cannot borrow an unavailable book copy");
    }
    this._isAvailable = false;
    this.markModified();
  }

  markAsReturned(newCondition: CopyCondition): void {
    this._isAvailable = true;
    this._condition = newCondition;
    this.markModified();
  }

  markAsLost(): void {
    this._isAvailable = false;
    this._condition = 'LOST';
    this.markModified();
  }

  transferToBranch(newBranchId: string): void {
    if (!this.isAvailable) {
      throw new Error("Cannot transfer a book that is currently not available");
    }
    this._branchId = newBranchId;
    this.markModified();
  }
}
