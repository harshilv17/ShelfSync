'use client';

import { useState } from 'react';
import BookCard from '@/components/BookCard';
import { useBooks } from '@/hooks/useBooks';

export default function BooksPage() {
  const { data: books, isLoading, error, refetch } = useBooks();
  const [search, setSearch] = useState('');

  const filtered = books?.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Book Catalog</h1>
        <p className="text-slate-400">Browse and borrow books across all branches.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="book-search"
          type="search"
          placeholder="Search by title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full rounded-xl border border-slate-700
            bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-slate-200
            placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-colors
          "
        />
      </div>

      {/* States */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-700/40" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
          <button onClick={refetch} className="ml-auto text-xs underline hover:no-underline">Retry</button>
        </div>
      )}

      {!isLoading && !error && filtered && (
        <>
          <p className="text-xs text-slate-500">{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</p>
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500">No books match your search.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} onBorrow={refetch} onReserve={refetch} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
