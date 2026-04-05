import { z } from 'zod';

export const BorrowBookSchema = z.object({
  bookId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
});

export const ReturnBookSchema = z.object({
  loanId: z.string().uuid(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'LOST']),
});

export const ReservationSchema = z.object({
  bookId: z.string().uuid(),
});

export const AddBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(10),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
});
