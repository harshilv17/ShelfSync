'use client';

import { useState } from 'react';
import { loanService } from '@/services/api';
import type { Book, BookCondition } from '@/types';

interface BorrowButtonProps {
  book: Book;
  onSuccess?: () => void;
}

export default function BorrowButton({ book, onSuccess }: BorrowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrowed, setBorrowed] = useState(false);

  const handleBorrow = async () => {
    setLoading(true);
    setError(null);

    try {
      await loanService.borrow({
        bookId: book.id,
        ...(book.branchId ? { branchId: book.branchId } : {}),
      });
      setBorrowed(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow book');
    } finally {
      setLoading(false);
    }
  };

  if (borrowed) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400 font-medium">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Borrowed!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        id={`borrow-btn-${book.id}`}
        onClick={handleBorrow}
        disabled={loading || book.availableCopies === 0}
        className="
          inline-flex items-center justify-center gap-2
          rounded-lg px-4 py-2 text-sm font-semibold
          bg-indigo-600 text-white
          transition-all duration-200
          hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        "
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Borrowing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Borrow
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
