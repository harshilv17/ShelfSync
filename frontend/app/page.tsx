import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard – LibraNet',
  description: 'Your library dashboard. View active loans, browse books, and manage reservations.',
};

const STAT_CARDS = [
  {
    label: 'Browse Books',
    description: 'Explore our full catalog across all branches.',
    href: '/books',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    label: 'My Loans',
    description: 'Manage your active and overdue loans.',
    href: '/loans',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'blue',
  },
  {
    label: 'Reservations',
    description: 'Reserve unavailable books for when they\'re back.',
    href: '/reservations',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'amber',
  },
] as const;

const COLOR_MAP = {
  indigo: {
    icon: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'hover:border-indigo-500/40',
    arrow: 'text-indigo-400',
  },
  blue: {
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'hover:border-blue-500/40',
    arrow: 'text-blue-400',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/40',
    arrow: 'text-amber-400',
  },
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 flex flex-col gap-12">

      {/* Hero */}
      <section className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 w-fit">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-medium text-indigo-400">Multi-Branch Library System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 leading-tight tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            LibraNet
          </span>
        </h1>

        <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
          A distributed library management system. Browse books across branches, borrow instantly,
          and reserve copies when they&apos;re unavailable.
        </p>
      </section>

      {/* Quick-access cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {STAT_CARDS.map(({ label, description, href, icon, color }) => {
          const styles = COLOR_MAP[color];
          return (
            <Link
              key={href}
              href={href}
              id={`dashboard-card-${color}`}
              className={`
                group flex flex-col gap-4 rounded-2xl border border-slate-700/60
                bg-slate-800/50 p-6 backdrop-blur-sm
                transition-all duration-300
                hover:bg-slate-800/80 hover:-translate-y-0.5
                hover:shadow-xl hover:shadow-black/30
                ${styles.border}
              `}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.bg} ${styles.icon}`}>
                {icon}
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <h2 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {label}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>

              <div className={`flex items-center gap-1 text-sm font-medium ${styles.arrow}`}>
                Go to {label}
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Architecture callout */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-6 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">System Architecture</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {[
            { label: 'Node.js + Express', sub: 'Backend API' },
            { label: 'PostgreSQL + Prisma', sub: 'Data Layer' },
            { label: 'Redis Locks', sub: 'Concurrency' },
            { label: 'Next.js App Router', sub: 'Frontend' },
          ].map(({ label, sub }) => (
            <div key={label} className="flex flex-col gap-0.5 rounded-lg bg-slate-800 px-3 py-2.5 border border-slate-700/50">
              <span className="font-medium text-slate-300">{label}</span>
              <span className="text-xs text-slate-500">{sub}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
