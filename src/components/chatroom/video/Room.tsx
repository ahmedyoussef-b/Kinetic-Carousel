// src/components/chatroom/video/Room.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Video, { Room as TwilioRoom, LocalParticipant, RemoteParticipant } from 'twilio-video';
import Participant from './Participant';

interface RoomProps {
    roomName: string;
    token: string;
}

const Room: React.FC<RoomProps> = ({ roomName, token }) => {
    const [room, setRoom] = useState<TwilioRoom | null>(null);
    const [participants, setParticipants] = useState<Map<string, RemoteParticipant>>(new Map());

    useEffect(() => {
        const participantConnected = (participant: RemoteParticipant) => {
            setParticipants(prevParticipants => new Map(prevParticipants).set(participant.sid, participant));
        };

        const participantDisconnected = (participant: RemoteParticipant) => {
            setParticipants(prevParticipants => {
                const newParticipants = new Map(prevParticipants);
                newParticipants.delete(participant.sid);
                return newParticipants;
            });
        };

        Video.connect(token, {
            name: roomName,
        }).then(room => {
            setRoom(room);
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            room.participants.forEach(participant => {
                setParticipants(prevParticipants => new Map(prevParticipants).set(participant.sid, participant));
            });
        });

        return () => {
            setRoom(currentRoom => {
                if (currentRoom && currentRoom.state === 'connected') {
                    currentRoom.disconnect();
                    return null;
                }
                return currentRoom;
            });
        };
    }, [roomName, token]);

    const remoteParticipants = Array.from(participants.values()).map(p => (
        <Participant key={p.sid} participant={p} />
    ));

    return (
        <div className="h-full">
            <div className="relative h-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 h-full overflow-y-auto">
                    {room && <Participant key={room.localParticipant.sid} participant={room.localParticipant} />}
                    {remoteParticipants}
                </div>
            </div>
        </div>
    );
};

export default Room;
