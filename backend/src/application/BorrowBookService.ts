import { IBookCopyRepository, ILoanRepository } from '../domain/interfaces/repositories';
import { ILockManager } from '../domain/interfaces/lockManager';
import { Loan } from '../domain/entities/Loan';
import { BookCopy } from '../domain/entities/BookCopy';
import { BookNotAvailableError, AlreadyBorrowedError } from '../domain/errors/DomainErrors';
import { randomUUID } from 'crypto';

export class BorrowBookService {
  constructor(
    private bookCopyRepository: IBookCopyRepository,
    private loanRepository: ILoanRepository,
    private lockManager: ILockManager
  ) {}

  async execute(userId: string, bookId: string, branchId?: string): Promise<Loan> {
    // 1. Check if user already has an active loan for a copy of this book
    const activeLoans = await this.loanRepository.findActiveLoansByUser(userId);
    for (const loan of activeLoans) {
      const copy = await this.bookCopyRepository.findById(loan.bookCopyId);
      if (copy && copy.bookId === bookId) {
        throw new AlreadyBorrowedError(userId, bookId);
      }
    }

    // 2. Find an available copy
    const allCopies = await this.bookCopyRepository.findByBookId(bookId);
    let availableCopy: BookCopy | null = allCopies.find(c => c.isAvailable && (!branchId || c.branchId === branchId)) || null;

    if (!availableCopy) {
      throw new BookNotAvailableError(bookId);
    }

    const copyId = availableCopy.id;

    // 3. Acquire distributed lock for the copy
    const releaseLock = await this.lockManager.acquire(`copy:${copyId}`, 5000);

    try {
      // 4. Double check availability after acquiring lock
      availableCopy = await this.bookCopyRepository.findById(copyId);
      if (!availableCopy || !availableCopy.isAvailable) {
        throw new BookNotAvailableError(bookId);
      }

      // 5. Update copy state
      availableCopy.markAsBorrowed();

      // 6. Create loan
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days default loan period

      const loan = new Loan(
        randomUUID(),
        new Date(),
        new Date(),
        {
          userId,
          bookCopyId: copyId,
          dueDate,
          status: 'ACTIVE',
          accruedFineCents: 0
        }
      );

      // 7. Save in order
      await this.bookCopyRepository.save(availableCopy);
      await this.loanRepository.save(loan);

      return loan;
    } finally {
      // 8. Always release the lock
      await releaseLock();
    }
  }
}
