import { Collection } from 'mongodb';
import { getDb } from './database';
import { Book } from '../domain/entities/Book';
import { BookCopy } from '../domain/entities/BookCopy';
import { Loan } from '../domain/entities/Loan';
import { Reservation } from '../domain/entities/Reservation';
import { User } from '../domain/entities/User';
import { Branch } from '../domain/entities/Branch';
import {
  IBookRepository,
  IBookCopyRepository,
  ILoanRepository,
  IReservationRepository,
  IUserRepository,
  IBranchRepository
} from '../domain/interfaces/repositories';

// ---------------------------------------------------------------------------
// Helper to get typed collections
// ---------------------------------------------------------------------------
function books(): Collection     { return getDb().collection('books'); }
function bookCopies(): Collection { return getDb().collection('bookCopies'); }
function loans(): Collection     { return getDb().collection('loans'); }
function reservations(): Collection { return getDb().collection('reservations'); }
function users(): Collection     { return getDb().collection('users'); }
function branches(): Collection  { return getDb().collection('branches'); }

// ---------------------------------------------------------------------------
// BookRepository
// ---------------------------------------------------------------------------
export class BookRepository implements IBookRepository {
  async findById(id: string): Promise<Book | null> {
    const raw = await books().findOne({ id });
    if (!raw) return null;
    return new Book(raw.id, raw.createdAt, raw.updatedAt, {
      title: raw.title,
      author: raw.author,
      isbn: raw.isbn,
      publishedYear: raw.publishedYear
    });
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const raw = await books().findOne({ isbn });
    if (!raw) return null;
    return new Book(raw.id, raw.createdAt, raw.updatedAt, {
      title: raw.title,
      author: raw.author,
      isbn: raw.isbn,
      publishedYear: raw.publishedYear
    });
  }

  async save(book: Book): Promise<void> {
    await books().updateOne(
      { id: book.id },
      {
        $set: {
          id: book.id,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publishedYear: book.publishedYear
        }
      },
      { upsert: true }
    );
  }
}

// ---------------------------------------------------------------------------
// BookCopyRepository
// ---------------------------------------------------------------------------
export class BookCopyRepository implements IBookCopyRepository {
  async findById(id: string): Promise<BookCopy | null> {
    const raw = await bookCopies().findOne({ id });
    if (!raw) return null;
    return new BookCopy(raw.id, raw.createdAt, raw.updatedAt, {
      bookId: raw.bookId,
      branchId: raw.branchId,
      condition: raw.condition,
      isAvailable: raw.isAvailable
    });
  }

  async findByBookId(bookId: string): Promise<BookCopy[]> {
    const raw = await bookCopies().find({ bookId }).toArray();
    return raw.map(r => new BookCopy(r.id, r.createdAt, r.updatedAt, {
      bookId: r.bookId,
      branchId: r.branchId,
      condition: r.condition,
      isAvailable: r.isAvailable
    }));
  }

  async save(copy: BookCopy): Promise<void> {
    await bookCopies().updateOne(
      { id: copy.id },
      {
        $set: {
          id: copy.id,
          createdAt: copy.createdAt,
          updatedAt: copy.updatedAt,
          bookId: copy.bookId,
          branchId: copy.branchId,
          condition: copy.condition,
          isAvailable: copy.isAvailable
        },
        $inc: { version: 1 }
      },
      { upsert: true }
    );
  }
}

// ---------------------------------------------------------------------------
// LoanRepository
// ---------------------------------------------------------------------------
export class LoanRepository implements ILoanRepository {
  async findById(id: string): Promise<Loan | null> {
    const raw = await loans().findOne({ id });
    if (!raw) return null;
    return new Loan(raw.id, raw.createdAt, raw.updatedAt, {
      userId: raw.userId,
      bookCopyId: raw.bookCopyId,
      dueDate: raw.dueDate,
      returnedAt: raw.returnedAt ?? undefined,
      status: raw.status,
      accruedFineCents: raw.accruedFineCents
    });
  }

  async findActiveLoansByUser(userId: string): Promise<Loan[]> {
    const raw = await loans().find({ userId, status: 'ACTIVE' }).toArray();
    return raw.map(r => new Loan(r.id, r.createdAt, r.updatedAt, {
      userId: r.userId,
      bookCopyId: r.bookCopyId,
      dueDate: r.dueDate,
      returnedAt: r.returnedAt ?? undefined,
      status: r.status,
      accruedFineCents: r.accruedFineCents
    }));
  }

  async save(loan: Loan): Promise<void> {
    await loans().updateOne(
      { id: loan.id },
      {
        $set: {
          id: loan.id,
          createdAt: loan.createdAt,
          updatedAt: loan.updatedAt,
          userId: loan.userId,
          bookCopyId: loan.bookCopyId,
          dueDate: loan.dueDate,
          returnedAt: loan.returnedAt,
          status: loan.status,
          accruedFineCents: loan.accruedFine.amountInCents
        },
        $inc: { version: 1 }
      },
      { upsert: true }
    );
  }
}

// ---------------------------------------------------------------------------
// ReservationRepository
// ---------------------------------------------------------------------------
export class ReservationRepository implements IReservationRepository {
  async findById(id: string): Promise<Reservation | null> {
    const raw = await reservations().findOne({ id });
    if (!raw) return null;
    return new Reservation(raw.id, raw.createdAt, raw.updatedAt, {
      userId: raw.userId,
      bookId: raw.bookId,
      status: raw.status,
      requestedAt: raw.requestedAt
    });
  }

  async findByBookSequence(bookId: string): Promise<Reservation[]> {
    const raw = await reservations()
      .find({ bookId, status: 'PENDING' })
      .sort({ requestedAt: 1 })
      .toArray();
    return raw.map(r => new Reservation(r.id, r.createdAt, r.updatedAt, {
      userId: r.userId,
      bookId: r.bookId,
      status: r.status,
      requestedAt: r.requestedAt
    }));
  }

  async save(reservation: Reservation): Promise<void> {
    await reservations().updateOne(
      { id: reservation.id },
      {
        $set: {
          id: reservation.id,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt,
          userId: reservation.userId,
          bookId: reservation.bookId,
          status: reservation.status,
          requestedAt: reservation.requestedAt
        },
        $inc: { version: 1 }
      },
      { upsert: true }
    );
  }
}

// ---------------------------------------------------------------------------
// UserRepository
// ---------------------------------------------------------------------------
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const raw = await users().findOne({ id });
    if (!raw) return null;
    return new User(raw.id, raw.createdAt, raw.updatedAt, {
      email: raw.email,
      name: raw.name,
      role: raw.role
    });
  }

  async save(user: User): Promise<void> {
    await users().updateOne(
      { id: user.id },
      {
        $set: {
          id: user.id,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { upsert: true }
    );
  }
}

// ---------------------------------------------------------------------------
// BranchRepository
// ---------------------------------------------------------------------------
export class BranchRepository implements IBranchRepository {
  async findById(id: string): Promise<Branch | null> {
    const raw = await branches().findOne({ id });
    if (!raw) return null;
    return new Branch(raw.id, raw.createdAt, raw.updatedAt, {
      name: raw.name,
      location: raw.location,
    });
  }

  async save(branch: Branch): Promise<void> {
    await branches().updateOne(
      { id: branch.id },
      {
        $set: {
          id: branch.id,
          createdAt: branch.createdAt,
          updatedAt: branch.updatedAt,
          name: branch.name,
          location: branch.location
        }
      },
      { upsert: true }
    );
  }
}
