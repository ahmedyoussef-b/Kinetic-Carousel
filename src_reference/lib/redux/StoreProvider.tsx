// src/lib/redux/StoreProvider.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from './store'
import { useGetSessionQuery } from './api/authApi'
import { useEffect } from 'react'
import { setAuthLoading } from './features/auth/authSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
    // This hook ensures that on initial load, we make a request to check the session.
    // The onQueryStarted listener in the authApi will then dispatch setUser if a session exists.
    const { isLoading, isUninitialized } = useGetSessionQuery();

    // Manually manage the top-level loading state in the auth slice.
    useEffect(() => {
        store.dispatch(setAuthLoading(isLoading || isUninitialized));
    }, [isLoading, isUninitialized]);
    
    // Render children immediately; loading states are handled by individual pages.
    return <>{children}</>;
}


export function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
