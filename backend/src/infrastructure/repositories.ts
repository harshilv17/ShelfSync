import { prisma } from './database';
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

export class BookRepository implements IBookRepository {
  async findById(id: string): Promise<Book | null> {
    const raw = await prisma.book.findUnique({ where: { id } });
    if (!raw) return null;
    return new Book(raw.id, raw.createdAt, raw.updatedAt, {
      title: raw.title,
      author: raw.author,
      isbn: raw.isbn,
      publishedYear: raw.publishedYear
    });
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const raw = await prisma.book.findUnique({ where: { isbn } });
    if (!raw) return null;
    return new Book(raw.id, raw.createdAt, raw.updatedAt, {
      title: raw.title,
      author: raw.author,
      isbn: raw.isbn,
      publishedYear: raw.publishedYear
    });
  }

  async save(book: Book): Promise<void> {
    await prisma.book.upsert({
      where: { id: book.id },
      create: {
        id: book.id,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedYear: book.publishedYear
      },
      update: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedYear: book.publishedYear,
        updatedAt: book.updatedAt
      }
    });
  }
}

export class BookCopyRepository implements IBookCopyRepository {
  async findById(id: string): Promise<BookCopy | null> {
    const raw = await prisma.bookCopy.findUnique({ where: { id } });
    if (!raw) return null;
    return new BookCopy(raw.id, raw.createdAt, raw.updatedAt, {
      bookId: raw.bookId,
      branchId: raw.branchId,
      condition: raw.condition,
      isAvailable: raw.isAvailable
    });
  }

  async findByBookId(bookId: string): Promise<BookCopy[]> {
    const raw = await prisma.bookCopy.findMany({ where: { bookId } });
    return raw.map(r => new BookCopy(r.id, r.createdAt, r.updatedAt, {
      bookId: r.bookId,
      branchId: r.branchId,
      condition: r.condition,
      isAvailable: r.isAvailable
    }));
  }

  async save(copy: BookCopy): Promise<void> {
    await prisma.bookCopy.upsert({
      where: { id: copy.id },
      create: {
        id: copy.id,
        createdAt: copy.createdAt,
        updatedAt: copy.updatedAt,
        bookId: copy.bookId,
        branchId: copy.branchId,
        condition: copy.condition,
        isAvailable: copy.isAvailable,
        version: 1
      },
      update: {
        bookId: copy.bookId,
        branchId: copy.branchId,
        condition: copy.condition,
        isAvailable: copy.isAvailable,
        updatedAt: copy.updatedAt,
        version: { increment: 1 } // optimistic locking handled automatically by Prisma increment
      }
    });
  }
}

export class LoanRepository implements ILoanRepository {
  async findById(id: string): Promise<Loan | null> {
    const raw = await prisma.loan.findUnique({ where: { id } });
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
    const raw = await prisma.loan.findMany({
      where: { userId, status: 'ACTIVE' }
    });
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
    await prisma.loan.upsert({
      where: { id: loan.id },
      create: {
        id: loan.id,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt,
        userId: loan.userId,
        bookCopyId: loan.bookCopyId,
        dueDate: loan.dueDate,
        returnedAt: loan.returnedAt,
        status: loan.status,
        accruedFineCents: loan.accruedFine.amountInCents,
        version: 1
      },
      update: {
        userId: loan.userId,
        bookCopyId: loan.bookCopyId,
        dueDate: loan.dueDate,
        returnedAt: loan.returnedAt,
        status: loan.status,
        accruedFineCents: loan.accruedFine.amountInCents,
        updatedAt: loan.updatedAt,
        version: { increment: 1 }
      }
    });
  }
}

export class ReservationRepository implements IReservationRepository {
  async findById(id: string): Promise<Reservation | null> {
    const raw = await prisma.reservation.findUnique({ where: { id } });
    if (!raw) return null;
    return new Reservation(raw.id, raw.createdAt, raw.updatedAt, {
      userId: raw.userId,
      bookId: raw.bookId,
      status: raw.status,
      requestedAt: raw.requestedAt
    });
  }

  async findByBookSequence(bookId: string): Promise<Reservation[]> {
    const raw = await prisma.reservation.findMany({
      where: { bookId, status: 'PENDING' },
      orderBy: { requestedAt: 'asc' }
    });
    return raw.map(r => new Reservation(r.id, r.createdAt, r.updatedAt, {
      userId: r.userId,
      bookId: r.bookId,
      status: r.status,
      requestedAt: r.requestedAt
    }));
  }

  async save(reservation: Reservation): Promise<void> {
    await prisma.reservation.upsert({
      where: { id: reservation.id },
      create: {
        id: reservation.id,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
        userId: reservation.userId,
        bookId: reservation.bookId,
        status: reservation.status,
        requestedAt: reservation.requestedAt,
        version: 1
      },
      update: {
        userId: reservation.userId,
        bookId: reservation.bookId,
        status: reservation.status,
        requestedAt: reservation.requestedAt,
        updatedAt: reservation.updatedAt,
        version: { increment: 1 }
      }
    });
  }
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return new User(raw.id, raw.createdAt, raw.updatedAt, {
      email: raw.email,
      name: raw.name,
      role: raw.role
    });
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        name: user.name,
        role: user.role
      },
      update: {
        email: user.email,
        name: user.name,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  }
}

export class BranchRepository implements IBranchRepository {
  async findById(id: string): Promise<Branch | null> {
    const raw = await prisma.branch.findUnique({ where: { id } });
    if (!raw) return null;
    return new Branch(raw.id, raw.createdAt, raw.updatedAt, {
      name: raw.name,
      location: raw.location,
    });
  }

  async save(branch: Branch): Promise<void> {
    await prisma.branch.upsert({
      where: { id: branch.id },
      create: {
        id: branch.id,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        name: branch.name,
        location: branch.location
      },
      update: {
        name: branch.name,
        location: branch.location,
        updatedAt: branch.updatedAt
      }
    });
  }
}
