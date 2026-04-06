'use client';

import { useState, useEffect, useCallback } from 'react';
import { loanService } from '@/services/api';
import type { Loan, AsyncState } from '@/types';

export function useLoans() {
  const [state, setState] = useState<AsyncState<Loan[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchLoans = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const loans = await loanService.getMy();
      setState({ data: loans, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load loans';
      setState({ data: null, isLoading: false, error: message });
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  return { ...state, refetch: fetchLoans };
}
