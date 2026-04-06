'use client';

import { useState } from 'react';
import { loanService } from '@/services/api';
import type { Loan, BookCondition } from '@/types';

interface ReturnButtonProps {
  loan: Loan;
  onSuccess?: () => void;
}

const CONDITIONS: BookCondition[] = ['NEW', 'GOOD', 'FAIR', 'POOR', 'LOST'];

export default function ReturnButton({ loan, onSuccess }: ReturnButtonProps) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<BookCondition>('GOOD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returned, setReturned] = useState(false);

  const handleReturn = async () => {
    setLoading(true);
    setError(null);

    try {
      await loanService.returnBook(loan.id, { condition });
      setReturned(true);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  if (returned) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400 font-medium">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Returned
      </div>
    );
  }

  return (
    <div className="relative">
      {!open ? (
        <button
          id={`return-btn-${loan.id}`}
          onClick={() => setOpen(true)}
          className="
            inline-flex items-center justify-center gap-2
            rounded-lg px-4 py-2 text-sm font-semibold
            bg-slate-700 text-slate-200
            border border-slate-600
            transition-all duration-200
            hover:bg-slate-600 hover:border-slate-500
            active:scale-[0.97]
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Return
        </button>
      ) : (
        <div className="
          absolute bottom-full mb-2 right-0 z-10
          w-56 rounded-xl border border-slate-700
          bg-slate-800 shadow-xl shadow-black/40 p-3
          flex flex-col gap-3
        ">
          <p className="text-xs font-medium text-slate-400">Book condition on return:</p>

          <select
            id={`return-condition-${loan.id}`}
            value={condition}
            onChange={(e) => setCondition(e.target.value as BookCondition)}
            className="
              w-full rounded-lg bg-slate-700 border border-slate-600
              text-sm text-slate-200 px-2.5 py-1.5
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => { setOpen(false); setError(null); }}
              disabled={loading}
              className="
                flex-1 rounded-lg py-1.5 text-sm font-medium
                bg-slate-700 text-slate-300
                hover:bg-slate-600 transition-colors
                disabled:opacity-50
              "
            >
              Cancel
            </button>
            <button
              id={`return-confirm-btn-${loan.id}`}
              onClick={handleReturn}
              disabled={loading}
              className="
                flex-1 rounded-lg py-1.5 text-sm font-semibold
                bg-indigo-600 text-white
                hover:bg-indigo-500 transition-colors
                disabled:opacity-50
              "
            >
              {loading ? '…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
