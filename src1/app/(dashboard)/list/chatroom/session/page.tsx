// src/app/(dashboard)/list/chatroom/session/page.tsx
'use client';

import React, { Suspense, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux-hooks';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SessionRoom from '@/components/chatroom/session/SessionRoom';
import { endSession, fetchSessionState } from '@/lib/redux/slices/sessionSlice';
import { addSessionReportFromActiveSession } from '@/lib/redux/slices/reportSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { addNotification } from '@/lib/redux/slices/notificationSlice';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function SessionPageContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const { activeSession, loading: sessionLoading } = useAppSelector(state => state.session);
    const user = useAppSelector(selectCurrentUser);
    const authLoading = useAppSelector(selectIsAuthLoading);
    
    useEffect(() => {
        // Wait for authentication to resolve before fetching session data
        if (!authLoading && user && sessionId && !activeSession && !sessionLoading) {
            dispatch(fetchSessionState(sessionId));
        } else if (!authLoading && (!user || !sessionId)) {
            // If auth is resolved but no user or no session ID, redirect
            router.replace(user ? `/${user.role.toLowerCase()}` : '/login');
        }
    }, [sessionId, activeSession, authLoading, sessionLoading, user, dispatch, router]);

    const handleEndSession = async () => {
        if (!activeSession || !user) return;
    
        try {
            await dispatch(endSession(activeSession.id)).unwrap();

            // Generate and save report to Redux state
            dispatch(addSessionReportFromActiveSession({
                session: activeSession,
                hostName: user.name || user.email,
            }));

            dispatch(addNotification({
              type: 'session_ended',
              title: 'Session terminée',
              message: 'La session a été fermée et le rapport a été généré.',
            }));
        
            if (user.role === 'TEACHER') {
                router.replace('/list/chatroom/reports');
            } else if (user.role === 'ADMIN') {
                router.replace('/admin/chatroom');
            } else {
                router.replace('/dashboard');
            }
        } catch (error) {
            console.error("Failed to end session:", error);
        }
    };

    // Show a loading state while checking auth or fetching session
    if (authLoading || (sessionId && (sessionLoading || !activeSession))) {
        return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spinner size="lg" />
                <p className="ml-4">Chargement de la session...</p>
            </div>
        );
    }
    
    // If we have a session ID but no active session after loading, it means it's not found or invalid
    if (sessionId && !activeSession) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-lg text-center p-8">
                    <CardHeader>
                        <CardTitle>Session non trouvée</CardTitle>
                        <CardDescription>
                            Cette session n'est plus active ou l'ID est incorrect.
                        </CardDescription>
                    </CardHeader>
                    <Link href={user ? `/${user.role.toLowerCase()}` : '/login'}>
                        <Button>Retour au tableau de bord</Button>
                    </Link>
                </Card>
            </div>
        );
    }
    
    // If we have an active session, render the room
    if (activeSession) {
        return <SessionRoom onEndSession={handleEndSession} />;
    }

    // Fallback while redirecting
    return null;
}

// Wrap with Suspense to handle useSearchParams
export default function SessionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        }>
            <SessionPageContent />
        </Suspense>
    );
}
