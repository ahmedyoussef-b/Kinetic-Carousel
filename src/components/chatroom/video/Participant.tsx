// src/components/chatroom/video/Participant.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LocalParticipant, RemoteParticipant, Track, TrackPublication } from 'twilio-video';

interface ParticipantProps {
    participant: LocalParticipant | RemoteParticipant;
}

const Participant: React.FC<ParticipantProps> = ({ participant }) => {
    const [videoTracks, setVideoTracks] = useState<(Track | undefined)[]>([]);
    const [audioTracks, setAudioTracks] = useState<(Track | undefined)[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const trackpubsToTracks = (trackMap: Map<string, TrackPublication>) => Array.from(trackMap.values())
        .map(publication => publication.track)
        .filter(track => track !== null);

    useEffect(() => {
        setVideoTracks(trackpubsToTracks(participant.videoTracks));
        setAudioTracks(trackpubsToTracks(participant.audioTracks));

        const trackSubscribed = (track: Track) => {
            if (track.kind === 'video') {
                setVideoTracks(videoTracks => [...videoTracks, track]);
            } else {
                setAudioTracks(audioTracks => [...audioTracks, track]);
            }
        };

        const trackUnsubscribed = (track: Track) => {
            if (track.kind === 'video') {
                setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
            } else {
                setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
            }
        };

        participant.on('trackSubscribed', trackSubscribed);
        participant.on('trackUnsubscribed', trackUnsubscribed);

        return () => {
            setVideoTracks([]);
            setAudioTracks([]);
            participant.removeAllListeners();
        };
    }, [participant]);

    useEffect(() => {
        const videoTrack = videoTracks[0];
        if (videoTrack) {
            videoTrack.attach(videoRef.current!);
            return () => {
                videoTrack.detach();
            };
        }
    }, [videoTracks]);

    useEffect(() => {
        const audioTrack = audioTracks[0];
        if (audioTrack) {
            audioTrack.attach(audioRef.current!);
            return () => {
                audioTrack.detach();
            };
        }
    }, [audioTracks]);

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <video ref={videoRef} autoPlay={true} className="w-full h-full object-cover" />
            <audio ref={audioRef} autoPlay={true} muted={'local' in participant} />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {participant.identity}
            </div>
        </div>
    );
};

export default Participant;
