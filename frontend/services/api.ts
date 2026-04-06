import type {
  ApiResponse,
  Book,
  Loan,
  Reservation,
  BorrowBookRequest,
  BorrowBookResponse,
  ReturnBookRequest,
  ReturnBookResponse,
  CreateReservationRequest,
  CreateReservationResponse,
} from '@/types';

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// ─── Mock token (replace with real auth flow) ─────────────────────────────────
// In production: retrieve from auth context / cookie / next-auth session.
const getToken = (): string =>
  typeof window !== 'undefined'
    ? (localStorage.getItem('libranet_token') ?? '')
    : '';

// ─── Core HTTP utility ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    const message =
      typeof json.error?.message === 'string'
        ? json.error.message
        : JSON.stringify(json.error?.message ?? 'Unknown error');
    throw new ApiError(json.error?.code ?? 'REQUEST_FAILED', message, res.status);
  }

  return json.data as T;
}

// ─── Typed error class ────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Mock data (replace when endpoints exist) ─────────────────────────────────

const MOCK_BOOKS: Book[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '9781491903124',
    publishedYear: 2017,
    availableCopies: 2,
    totalCopies: 3,
    branchName: 'Central Branch',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    isbn: '9780134494166',
    publishedYear: 2017,
    availableCopies: 0,
    totalCopies: 2,
    branchName: 'Central Branch',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    isbn: '9780135957059',
    publishedYear: 2019,
    availableCopies: 1,
    totalCopies: 1,
    branchName: 'North Branch',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    isbn: '9780321125217',
    publishedYear: 2003,
    availableCopies: 0,
    totalCopies: 2,
    branchName: 'South Branch',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    title: 'System Design Interview',
    author: 'Alex Xu',
    isbn: '9798664253665',
    publishedYear: 2020,
    availableCopies: 3,
    totalCopies: 4,
    branchName: 'East Branch',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest & Stein',
    isbn: '9780262033848',
    publishedYear: 2009,
    availableCopies: 1,
    totalCopies: 3,
    branchName: 'Central Branch',
  },
];

const MOCK_LOANS: Loan[] = [
  {
    id: 'loan-00000001',
    bookId: '00000000-0000-0000-0000-000000000002',
    bookTitle: 'Clean Architecture',
    bookAuthor: 'Robert C. Martin',
    userId: 'user-demo',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'loan-00000002',
    bookId: '00000000-0000-0000-0000-000000000004',
    bookTitle: 'Domain-Driven Design',
    bookAuthor: 'Eric Evans',
    userId: 'user-demo',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'OVERDUE',
  },
];

// ─── Book Service ─────────────────────────────────────────────────────────────

export const bookService = {
  /** Lists all books — currently mocked; swap `return MOCK_BOOKS` for real fetch */
  async getAll(): Promise<Book[]> {
    // Uncomment to hit real endpoint when available:
    // return request<Book[]>('/books');
    return Promise.resolve(MOCK_BOOKS);
  },
};

// ─── Loan Service ─────────────────────────────────────────────────────────────

export const loanService = {
  /** Returns active loans for the current user — currently mocked */
  async getMy(): Promise<Loan[]> {
    // return request<Loan[]>('/loans/my');
    return Promise.resolve(MOCK_LOANS);
  },

  /** POST /api/loans */
  async borrow(payload: BorrowBookRequest): Promise<BorrowBookResponse> {
    return request<BorrowBookResponse>('/loans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** PUT /api/loans/:id/return */
  async returnBook(loanId: string, payload: ReturnBookRequest): Promise<ReturnBookResponse> {
    return request<ReturnBookResponse>(`/loans/${loanId}/return`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

// ─── Reservation Service ──────────────────────────────────────────────────────

export const reservationService = {
  /** POST /api/reservations */
  async create(payload: CreateReservationRequest): Promise<CreateReservationResponse> {
    return request<CreateReservationResponse>('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
