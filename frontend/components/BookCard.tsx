'use client';

import { useState } from 'react';
import BorrowButton from './BorrowButton';
import ReserveButton from './ReserveButton';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onBorrow?: () => void;
  onReserve?: () => void;
}

export default function BookCard({ book, onBorrow, onReserve }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  return (
    <article
      id={`book-card-${book.id}`}
      className="
        group relative flex flex-col gap-4
        rounded-2xl border border-slate-700/60
        bg-slate-800/50 backdrop-blur-sm
        p-5 transition-all duration-300
        hover:border-slate-600 hover:bg-slate-800/80
        hover:shadow-xl hover:shadow-black/30
        hover:-translate-y-0.5
      "
    >
      {/* Availability badge */}
      <div className="absolute top-4 right-4">
        {isAvailable ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Unavailable
          </span>
        )}
      </div>

      {/* Book info */}
      <div className="flex flex-col gap-1 pr-24">
        <h2 className="text-base font-semibold text-slate-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
          {book.title}
        </h2>
        <p className="text-sm text-slate-400">{book.author}</p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {book.publishedYear}
        </span>
        {book.branchName && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {book.branchName}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {book.availableCopies}/{book.totalCopies} copies
        </span>
      </div>

      {/* Action */}
      <div className="mt-auto pt-1">
        {isAvailable ? (
          <BorrowButton book={book} onSuccess={onBorrow} />
        ) : (
          <ReserveButton book={book} onSuccess={onReserve} />
        )}
      </div>
    </article>
  );
}
