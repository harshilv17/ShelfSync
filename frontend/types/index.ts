// ─── Domain Enums ───────────────────────────────────────────────────────────

export type BookCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'LOST';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export type ReservationStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export type UserRole = 'MEMBER' | 'LIBRARIAN' | 'ADMIN';

// ─── Domain Models ───────────────────────────────────────────────────────────

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  availableCopies: number;
  totalCopies: number;
  branchId?: string;
  branchName?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  userId: string;
  dueDate: string;       // ISO 8601 date string
  returnedAt?: string;   // ISO 8601 date string
  status: LoanStatus;
  condition?: BookCondition;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  status: ReservationStatus;
  createdAt: string;     // ISO 8601 date string
}

export interface User {
  userId: string;
  role: UserRole;
  email?: string;
  name?: string;
}

// ─── API Layer ───────────────────────────────────────────────────────────────

/** Wraps every backend response in { success, data | error } */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string | unknown[];
  };
}

// Loan endpoints
export interface BorrowBookRequest {
  bookId: string;
  branchId?: string;
}

export interface BorrowBookResponse {
  id: string;
  dueDate: string;
  status: LoanStatus;
}

export interface ReturnBookRequest {
  condition: BookCondition;
}

export interface ReturnBookResponse {
  message: string;
}

// Reservation endpoints
export interface CreateReservationRequest {
  bookId: string;
}

export interface CreateReservationResponse {
  id: string;
  status: ReservationStatus;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
