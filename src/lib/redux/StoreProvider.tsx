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
    const { isLoading, isUninitialized } = useGetSessionQuery();
    const dispatch = store.dispatch;

    useEffect(() => {
        if (!hasFetched.current) {
            // The query is automatically initiated by RTK Query on mount.
            // We just need to manage the global loading state.
            hasFetched.current = true;
        }
        dispatch(setLoading(isLoading || isUninitialized));
    }, [isLoading, isUninitialized, dispatch]);
    
    return <>{children}</>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
