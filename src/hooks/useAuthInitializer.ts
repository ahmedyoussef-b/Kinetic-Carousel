// src/hooks/useAuthInitializer.ts
'use client';

import { useEffect, useRef } from 'react';
import { useGetSessionQuery } from '@/lib/redux/api/authApi';
import { useAppDispatch } from './redux-hooks';
import { setLoading } from '@/lib/redux/slices/authSlice';

/**
 * Custom hook to initialize the user's auth state.
 * It ensures the session is fetched only once on initial load,
 * even in React's Strict Mode.
 */
export const useAuthInitializer = () => {
    const dispatch = useAppDispatch();
    // Use a ref to track if the fetch has already been initiated.
    const hasFetched = useRef(false);

    // Trigger the query, but the logic inside onQueryStarted in authApi
    // will handle dispatching setUser or logout actions.
    const { isLoading, isUninitialized } = useGetSessionQuery();
    
    // We only need to manually dispatch the loading state.
    useEffect(() => {
        console.log(`⚛️ [useAuthInitializer] Auth loading state changed. isLoading: ${isLoading}, isUninitialized: ${isUninitialized}`);
        dispatch(setLoading(isLoading || isUninitialized));
    }, [isLoading, isUninitialized, dispatch]);
};
