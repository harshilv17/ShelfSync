import { ILoanRepository, IBookCopyRepository } from '../domain/interfaces/repositories';
import { IEventBus } from '../domain/interfaces/events';
import { LoanNotFoundError } from '../domain/errors/DomainErrors';
import { CopyCondition } from '../domain/entities/BookCopy';
import { Money } from '../domain/Money';

export interface IFinePolicy {
  calculateFine(dueDate: Date, returnedAt: Date): Money;
}

export class StandardFinePolicy implements IFinePolicy {
  private readonly DAILY_RATE_CENTS = 50; // $0.50 per day
  private readonly GRACE_PERIOD_DAYS = 3;

  calculateFine(dueDate: Date, returnedAt: Date): Money {
    const timeDiff = returnedAt.getTime() - dueDate.getTime();
    if (timeDiff <= 0) return Money.fromCents(0);
    
    const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysLate <= this.GRACE_PERIOD_DAYS) {
      return Money.fromCents(0);
    }
    
    const chargeableDays = daysLate - this.GRACE_PERIOD_DAYS;
    return Money.fromCents(chargeableDays * this.DAILY_RATE_CENTS);
  }
}

export class ReturnBookService {
  constructor(
    private loanRepository: ILoanRepository,
    private bookCopyRepository: IBookCopyRepository,
    private eventBus: IEventBus,
    private finePolicy: IFinePolicy = new StandardFinePolicy()
  ) {}

  async execute(loanId: string, newCondition: CopyCondition): Promise<void> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new LoanNotFoundError(loanId);
    }

    const copy = await this.bookCopyRepository.findById(loan.bookCopyId);
    if (!copy) {
      throw new Error("Critical integrity error: Book copy missing for loan.");
    }

    // 1. Mark loan as returned
    loan.returnResource();

    // 2. Calculate fines
    const fine = this.finePolicy.calculateFine(loan.dueDate, loan.returnedAt!);
    if (fine.amountInCents > 0) {
      loan.addFine(fine);
    }

    // 3. Mark copy as returned
    copy.markAsReturned(newCondition);

    // 4. Save
    await this.loanRepository.save(loan);
    await this.bookCopyRepository.save(copy);

    // 5. Publish Event for Reservation fulfillment queue
    await this.eventBus.publish({
      eventName: 'BookReturned',
      occurredAt: new Date(),
      payload: {
        bookId: copy.bookId,
        copyId: copy.id,
        branchId: copy.branchId
      }
    } as any); // using any here for quick typed payload handling without defining strict event classes
  }
}
