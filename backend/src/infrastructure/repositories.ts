import { Collection, Document } from 'mongodb';
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

/* ─── helpers ─────────────────────────────────────────────────────── */

function col(name: string): Collection {
  return getDb().collection(name);
}

/** Domain entities use string UUIDs as _id, so we read them back as strings. */
function id(doc: Document): string {
  return doc._id as unknown as string;
}

/* ─── Book ────────────────────────────────────────────────────────── */

export class BookRepository implements IBookRepository {
  async findById(bookId: string): Promise<Book | null> {
    const raw = await col('books').findOne({ _id: bookId as any });
    if (!raw) return null;
    return new Book(id(raw), raw.createdAt, raw.updatedAt, {
      title: raw.title,
      author: raw.author,
      isbn: raw.isbn,
      publishedYear: raw.publishedYear
    });
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const raw = await col('books').findOne({ isbn });
    if (!raw) return null;
    return new Book(id(raw), raw.createdAt, raw.updatedAt, {
      title: raw.title,
      author: raw.author,
      isbn: raw.isbn,
      publishedYear: raw.publishedYear
    });
  }

  async save(book: Book): Promise<void> {
    await col('books').updateOne(
      { _id: book.id as any },
      {
        $set: {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publishedYear: book.publishedYear,
          updatedAt: book.updatedAt
        },
        $setOnInsert: { createdAt: book.createdAt }
      },
      { upsert: true }
    );
  }
}

/* ─── BookCopy ────────────────────────────────────────────────────── */

export class BookCopyRepository implements IBookCopyRepository {
  async findById(copyId: string): Promise<BookCopy | null> {
    const raw = await col('bookCopies').findOne({ _id: copyId as any });
    if (!raw) return null;
    return new BookCopy(id(raw), raw.createdAt, raw.updatedAt, {
      bookId: raw.bookId,
      branchId: raw.branchId,
      condition: raw.condition,
      isAvailable: raw.isAvailable
    });
  }

  async findByBookId(bookId: string): Promise<BookCopy[]> {
    const docs = await col('bookCopies').find({ bookId }).toArray();
    return docs.map(r => new BookCopy(id(r), r.createdAt, r.updatedAt, {
      bookId: r.bookId,
      branchId: r.branchId,
      condition: r.condition,
      isAvailable: r.isAvailable
    }));
  }

  async save(copy: BookCopy): Promise<void> {
    await col('bookCopies').updateOne(
      { _id: copy.id as any },
      {
        $set: {
          bookId: copy.bookId,
          branchId: copy.branchId,
          condition: copy.condition,
          isAvailable: copy.isAvailable,
          updatedAt: copy.updatedAt
        },
        $setOnInsert: { createdAt: copy.createdAt, version: 0 },
        $inc: { version: 1 }
      },
      { upsert: true }
    );
  }
}

/* ─── Loan ────────────────────────────────────────────────────────── */

export class LoanRepository implements ILoanRepository {
  async findById(loanId: string): Promise<Loan | null> {
    const raw = await col('loans').findOne({ _id: loanId as any });
    if (!raw) return null;
    return new Loan(id(raw), raw.createdAt, raw.updatedAt, {
      userId: raw.userId,
      bookCopyId: raw.bookCopyId,
      dueDate: raw.dueDate,
      returnedAt: raw.returnedAt ?? undefined,
      status: raw.status,
      accruedFineCents: raw.accruedFineCents
    });
  }

  async findActiveLoansByUser(userId: string): Promise<Loan[]> {
    const docs = await col('loans').find({ userId, status: 'ACTIVE' }).toArray();
    return docs.map(r => new Loan(id(r), r.createdAt, r.updatedAt, {
      userId: r.userId,
      bookCopyId: r.bookCopyId,
      dueDate: r.dueDate,
      returnedAt: r.returnedAt ?? undefined,
      status: r.status,
      accruedFineCents: r.accruedFineCents
    }));
  }

  async save(loan: Loan): Promise<void> {
    await col('loans').updateOne(
      { _id: loan.id as any },
      {
        $set: {
          userId: loan.userId,
          bookCopyId: loan.bookCopyId,
          dueDate: loan.dueDate,
          returnedAt: loan.returnedAt,
          status: loan.status,
          accruedFineCents: loan.accruedFine.amountInCents,
          updatedAt: loan.updatedAt
        },
        $setOnInsert: { createdAt: loan.createdAt, version: 0 },
        $inc: { version: 1 }
      },
      { upsert: true }
    );
  }
}

/* ─── Reservation ─────────────────────────────────────────────────── */

export class ReservationRepository implements IReservationRepository {
  async findById(reservationId: string): Promise<Reservation | null> {
    const raw = await col('reservations').findOne({ _id: reservationId as any });
    if (!raw) return null;
    return new Reservation(id(raw), raw.createdAt, raw.updatedAt, {
      userId: raw.userId,
      bookId: raw.bookId,
      status: raw.status,
      requestedAt: raw.requestedAt
    });
  }

  async findByBookSequence(bookId: string): Promise<Reservation[]> {
    const docs = await col('reservations')
      .find({ bookId, status: 'PENDING' })
      .sort({ requestedAt: 1 })
      .toArray();
    return docs.map(r => new Reservation(id(r), r.createdAt, r.updatedAt, {
      userId: r.userId,
      bookId: r.bookId,
      status: r.status,
      requestedAt: r.requestedAt
    }));
  }

  async save(reservation: Reservation): Promise<void> {
    await col('reservations').updateOne(
      { _id: reservation.id as any },
      {
        $set: {
          userId: reservation.userId,
          bookId: reservation.bookId,
          status: reservation.status,
          requestedAt: reservation.requestedAt,
          updatedAt: reservation.updatedAt
        },
        $setOnInsert: { createdAt: reservation.createdAt, version: 0 },
        $inc: { version: 1 }
      },
      { upsert: true }
    );
  }
}

/* ─── User ────────────────────────────────────────────────────────── */

export class UserRepository implements IUserRepository {
  async findById(userId: string): Promise<User | null> {
    const raw = await col('users').findOne({ _id: userId as any });
    if (!raw) return null;
    return new User(id(raw), raw.createdAt, raw.updatedAt, {
      email: raw.email,
      name: raw.name,
      role: raw.role
    });
  }

  async save(user: User): Promise<void> {
    await col('users').updateOne(
      { _id: user.id as any },
      {
        $set: {
          email: user.email,
          name: user.name,
          role: user.role,
          updatedAt: user.updatedAt
        },
        $setOnInsert: { createdAt: user.createdAt }
      },
      { upsert: true }
    );
  }
}

/* ─── Branch ──────────────────────────────────────────────────────── */

export class BranchRepository implements IBranchRepository {
  async findById(branchId: string): Promise<Branch | null> {
    const raw = await col('branches').findOne({ _id: branchId as any });
    if (!raw) return null;
    return new Branch(id(raw), raw.createdAt, raw.updatedAt, {
      name: raw.name,
      location: raw.location
    });
  }

  async save(branch: Branch): Promise<void> {
    await col('branches').updateOne(
      { _id: branch.id as any },
      {
        $set: {
          name: branch.name,
          location: branch.location,
          updatedAt: branch.updatedAt
        },
        $setOnInsert: { createdAt: branch.createdAt }
      },
      { upsert: true }
    );
  }
}
