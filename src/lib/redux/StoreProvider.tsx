// src/lib/redux/StoreProvider.tsx
'use client'

import { Provider } from 'react-redux'
import { useEffect, useRef } from 'react'
import { store } from '@/lib/redux/store';
import { useGetSessionQuery } from '@/lib/redux/api/authApi';
import { setLoading } from '@/lib/redux/slices/authSlice';
import type { ReactNode } from 'react';

function AuthInitializer({ children }: { children: ReactNode }) {
    const hasFetched = useRef(false);
    // Automatically triggers the session fetch on component mount
    const { isLoading, isUninitialized } = useGetSessionQuery();
    const dispatch = store.dispatch;

    useEffect(() => {
        // This effect runs once on mount to ensure the initial loading state is managed correctly.
        if (!hasFetched.current) {
            hasFetched.current = true;
        }
        // Keep the global loading state in sync with the RTK Query hook's status.
        dispatch(setLoading(isLoading || isUninitialized));
    }, [isLoading, isUninitialized, dispatch]);
    
    // Render children immediately. Pages that need auth data will use selectors
    // and show their own loading states until the data is available.
    return <>{children}</>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
