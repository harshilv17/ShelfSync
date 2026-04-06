'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookService } from '@/services/api';
import type { Book, AsyncState } from '@/types';

export function useBooks() {
  const [state, setState] = useState<AsyncState<Book[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchBooks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const books = await bookService.getAll();
      setState({ data: books, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load books';
      setState({ data: null, isLoading: false, error: message });
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { ...state, refetch: fetchBooks };
}
