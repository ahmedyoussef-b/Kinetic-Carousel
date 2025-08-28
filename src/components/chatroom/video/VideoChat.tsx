// src/components/chatroom/video/VideoChat.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Room from './Room';
import { SafeUser } from '@/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VideoChatProps {
    roomName: string;
    user: SafeUser;
}

const VideoChat: React.FC<VideoChatProps> = ({ roomName, user }) => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const getToken = async () => {
            try {
                const response = await fetch('/api/video/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ room: roomName }), // Explicitly send roomName
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch token: ${response.statusText}`);
                }
                const data = await response.json();
                setToken(data.token);
            } catch (error) {
                console.error("Erreur lors de la récupération du jeton Twilio:", error);
            }
        };

        getToken();
    }, [roomName, user.id]); // Depend on user.id to ensure user is loaded

    if (!token) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card>
                    <CardContent className="p-8 flex items-center">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <span>Connexion à la classe virtuelle...</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <Room roomName={roomName} token={token} />;
};

export default VideoChat;
