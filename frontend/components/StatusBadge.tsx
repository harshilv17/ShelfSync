import type { LoanStatus, ReservationStatus } from '@/types';

const LOAN_STATUS_STYLES: Record<LoanStatus, string> = {
  ACTIVE:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
  RETURNED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  OVERDUE:  'bg-red-500/10 border-red-500/20 text-red-400',
};

const RESERVATION_STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
  FULFILLED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  EXPIRED:   'bg-red-500/10 border-red-500/20 text-red-400',
};

interface LoanStatusBadgeProps {
  status: LoanStatus;
}

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${LOAN_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${RESERVATION_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
