'use client';

import { useState } from 'react';
import { reservationService } from '@/services/api';
import type { Book } from '@/types';

interface ReserveButtonProps {
  book: Book;
  onSuccess?: () => void;
}

export default function ReserveButton({ book, onSuccess }: ReserveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserved, setReserved] = useState(false);

  const handleReserve = async () => {
    setLoading(true);
    setError(null);

    try {
      await reservationService.create({ bookId: book.id });
      setReserved(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reserve book');
    } finally {
      setLoading(false);
    }
  };

  if (reserved) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-sm text-amber-400 font-medium">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Reserved!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        id={`reserve-btn-${book.id}`}
        onClick={handleReserve}
        disabled={loading}
        className="
          inline-flex items-center justify-center gap-2
          rounded-lg px-4 py-2 text-sm font-semibold
          bg-amber-600/80 text-white
          border border-amber-500/30
          transition-all duration-200
          hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-500/20
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Reserving…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Reserve
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
