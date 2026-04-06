'use client';

import { useState } from 'react';
import { reservationService } from '@/services/api';
import { ReservationStatusBadge } from '@/components/StatusBadge';
import type { Reservation, BookCondition } from '@/types';

// ── Mock reservations (replace with real GET /reservations/my when available) ──
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-00000001',
    bookId: '00000000-0000-0000-0000-000000000002',
    bookTitle: 'Clean Architecture',
    userId: 'user-demo',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'res-00000002',
    bookId: '00000000-0000-0000-0000-000000000004',
    bookTitle: 'Domain-Driven Design',
    userId: 'user-demo',
    status: 'FULFILLED',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// ── Quick-reserve form ────────────────────────────────────────────────────────

function QuickReserveForm({ onReserved }: { onReserved: (bookId: string) => void }) {
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await reservationService.create({ bookId: bookId.trim() });
      setSuccess(true);
      onReserved(bookId.trim());
      setBookId('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-200">Reserve a Book</h2>
        <p className="text-sm text-slate-500">Enter the Book ID to place a reservation.</p>
      </div>

      <div className="flex gap-3">
        <input
          id="reservation-book-id"
          type="text"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="e.g. 00000000-0000-0000-0000-000000000002"
          className="
            flex-1 rounded-xl border border-slate-700
            bg-slate-900 px-4 py-2.5 text-sm text-slate-200
            placeholder:text-slate-500 focus:outline-none
            focus:ring-2 focus:ring-amber-500 focus:border-transparent
            font-mono
          "
        />
        <button
          id="reservation-submit-btn"
          type="submit"
          disabled={loading || !bookId.trim()}
          className="
            flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold
            bg-amber-600/80 text-white border border-amber-500/30
            hover:bg-amber-500 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : null}
          Reserve
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Reservation placed successfully!
        </p>
      )}
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

  const handleNewReservation = (bookId: string) => {
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      bookId,
      bookTitle: `Book (${bookId.slice(0, 8)}…)`,
      userId: 'user-demo',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newRes, ...prev]);
  };

  const pending   = reservations.filter((r) => r.status === 'PENDING');
  const fulfilled = reservations.filter((r) => r.status === 'FULFILLED');
  const others    = reservations.filter((r) => r.status === 'CANCELLED' || r.status === 'EXPIRED');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 flex flex-col gap-8">

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Reservations</h1>
        <p className="text-slate-400">Reserve books that are currently unavailable.</p>
      </div>

      {/* Quick-reserve form */}
      <QuickReserveForm onReserved={handleNewReservation} />

      {/* Pending */}
      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending ({pending.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((r) => (
              <ReservationRow key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}

      {/* Fulfilled */}
      {fulfilled.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Fulfilled ({fulfilled.length})
          </h2>
          <div className="flex flex-col gap-2">
            {fulfilled.map((r) => (
              <ReservationRow key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}

      {/* Others */}
      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">History</h2>
          <div className="flex flex-col gap-2">
            {others.map((r) => (
              <ReservationRow key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}

      {reservations.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-sm">
          No reservations yet.
        </div>
      )}
    </div>
  );
}

function ReservationRow({ reservation: r }: { reservation: Reservation }) {
  return (
    <div
      id={`reservation-row-${r.id}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3"
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-200 truncate">{r.bookTitle}</p>
        <p className="text-xs text-slate-500">
          Reserved on {new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <ReservationStatusBadge status={r.status} />
    </div>
  );
}
