'use client';

import ReturnButton from '@/components/ReturnButton';
import { LoanStatusBadge } from '@/components/StatusBadge';
import { useLoans } from '@/hooks/useLoans';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

export default function LoansPage() {
  const { data: loans, isLoading, error, refetch } = useLoans();

  const activeLoans = loans?.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE') ?? [];
  const pastLoans   = loans?.filter((l) => l.status === 'RETURNED') ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Borrowed Books</h1>
          <p className="text-slate-400">Track your active borrows and return books.</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-700/40" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Active Loans */}
      {!isLoading && !error && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Active Borrows ({activeLoans.length})
            </h2>

            {activeLoans.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 py-12 text-center text-slate-500 text-sm">
                No active borrows. Head to{' '}
                <a href="/books" className="text-indigo-400 hover:underline">Books</a> to borrow one.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeLoans.map((loan) => {
                  const overdue = isOverdue(loan.dueDate) && loan.status === 'ACTIVE';
                  return (
                    <div
                      key={loan.id}
                      id={`loan-card-${loan.id}`}
                      className={`
                        relative flex items-start justify-between gap-4
                        rounded-2xl border p-5 backdrop-blur-sm
                        transition-all duration-200
                        ${overdue
                          ? 'border-red-500/30 bg-red-500/5'
                          : 'border-slate-700/60 bg-slate-800/50 hover:bg-slate-800/80'
                        }
                      `}
                    >
                      {/* Overdue indicator */}
                      {overdue && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                            Overdue
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 truncate">{loan.bookTitle}</p>
                        <p className="text-sm text-slate-400">{loan.bookAuthor}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className={overdue ? 'text-red-400' : ''}>
                            Due: {formatDate(loan.dueDate)}
                          </span>
                          <LoanStatusBadge status={loan.status} />
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <ReturnButton loan={loan} onSuccess={refetch} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Past Loans */}
          {pastLoans.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Return History ({pastLoans.length})
              </h2>

              <div className="flex flex-col gap-2">
                {pastLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/40 bg-slate-800/20 px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-300 truncate">{loan.bookTitle}</p>
                      <p className="text-xs text-slate-500">{loan.bookAuthor}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {loan.returnedAt && (
                        <span className="text-xs text-slate-500">
                          Returned {formatDate(loan.returnedAt)}
                        </span>
                      )}
                      <LoanStatusBadge status={loan.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
