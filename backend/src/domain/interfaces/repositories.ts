import { Book } from '../entities/Book';
import { BookCopy } from '../entities/BookCopy';
import { Loan } from '../entities/Loan';
import { Reservation } from '../entities/Reservation';
import { User } from '../entities/User';
import { Branch } from '../entities/Branch';

export interface IBookRepository {
  findById(id: string): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  save(book: Book): Promise<void>;
}

export interface IBookCopyRepository {
  findById(id: string): Promise<BookCopy | null>;
  findByBookId(bookId: string): Promise<BookCopy[]>;
  save(copy: BookCopy): Promise<void>;
}

export interface ILoanRepository {
  findById(id: string): Promise<Loan | null>;
  findActiveLoansByUser(userId: string): Promise<Loan[]>;
  save(loan: Loan): Promise<void>;
}

export interface IReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findByBookSequence(bookId: string): Promise<Reservation[]>; // Ordered by requestedAt
  save(reservation: Reservation): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IBranchRepository {
  findById(id: string): Promise<Branch | null>;
  save(branch: Branch): Promise<void>;
}
