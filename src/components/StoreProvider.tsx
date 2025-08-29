// src/lib/redux/StoreProvider.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from './store'
import { useAuthInitializer } from '@/hooks/useAuthInitializer' // Import the new custom hook

function AuthManager({ children }: { children: React.React.Node }) {
    // This custom hook now contains the logic to fetch the session only once
    // and manage the global loading state.
    console.log("⚛️ [StoreProvider] AuthManager is rendering. Calling useAuthInitializer.");
    useAuthInitializer();
    
    // Render children immediately; loading states are handled by individual pages.
    return <>{children}</>;
}


export function StoreProvider({
  children,
}: {
  children: React.React.Node
}) {
  return (
    <Provider store={store}>
      <AuthManager>{children}</AuthManager>
    </Provider>
  )
}
