import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from './authMiddleware';
import { BorrowBookSchema, ReturnBookSchema, ReservationSchema } from './schemas';
import { BorrowBookService } from '../application/BorrowBookService';
import { ReturnBookService } from '../application/ReturnBookService';
import { ReservationService } from '../application/ReservationService';
import { BookCopyRepository, LoanRepository, ReservationRepository } from '../infrastructure/repositories';
import { RedisLockManager } from '../infrastructure/RedisLockManager';
import { InProcessEventBus } from '../infrastructure/InProcessEventBus';
import { DomainError } from '../domain/errors/DomainErrors';
import { z } from 'zod';

const router = Router();

// Dependency Injection Setup
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const lockManager = new RedisLockManager(redisUrl);
const eventBus = new InProcessEventBus();
const bookCopyRepo = new BookCopyRepository();
const loanRepo = new LoanRepository();
const reservationRepo = new ReservationRepository();

const borrowService = new BorrowBookService(bookCopyRepo, loanRepo, lockManager);
const returnService = new ReturnBookService(loanRepo, bookCopyRepo, eventBus);
const reservationService = new ReservationService(reservationRepo, bookCopyRepo, eventBus);

const handleDomainError = (res: Response, error: any) => {
  if (error instanceof DomainError) {
    res.status(400).json({ success: false, error: { code: error.name, message: error.message } });
  } else if (error instanceof z.ZodError) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues } });
  } else {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } });
  }
};

// Borrow a book
router.post('/loans', authenticate, async (req: Request, res: Response) => {
  try {
    const { bookId, branchId } = BorrowBookSchema.parse(req.body);
    const loan = await borrowService.execute(req.user!.userId, bookId, branchId);
    
    res.status(201).json({
      success: true,
      data: {
        id: loan.id,
        dueDate: loan.dueDate,
        status: loan.status
      }
    });
  } catch (error) {
    handleDomainError(res, error);
  }
});

// Return a book
router.put('/loans/:id/return', authenticate, async (req: Request, res: Response) => {
  try {
    const { condition } = ReturnBookSchema.parse({ loanId: req.params.id, ...req.body });
    await returnService.execute(req.params.id as string, condition);
    
    res.status(200).json({ success: true, data: { message: "Book returned successfully" } });
  } catch (error) {
    handleDomainError(res, error);
  }
});

// Reserve a book
router.post('/reservations', authenticate, async (req: Request, res: Response) => {
  try {
    const { bookId } = ReservationSchema.parse(req.body);
    const reservation = await reservationService.createReservation(req.user!.userId, bookId);
    
    res.status(201).json({
      success: true,
      data: {
        id: reservation.id,
        status: reservation.status
      }
    });
  } catch (error) {
    handleDomainError(res, error);
  }
});

export default router;
