// src/components/chatroom/video/Participant.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  RemoteTrack,
  LocalTrack,
  TrackPublication,
  RemoteTrackPublication,
  LocalTrackPublication,
} from 'twilio-video';

interface ParticipantProps {
  participant: LocalParticipant | RemoteParticipant;
}

const Participant: React.FC<ParticipantProps> = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState<(RemoteTrack | LocalTrack | undefined)[]>([]);
  const [audioTracks, setAudioTracks] = useState<(RemoteTrack | LocalTrack | undefined)[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // This function handles subscribing to tracks and attaching them to the DOM.
    const trackSubscribed = (track: RemoteTrack | LocalTrack) => {
      if (track.kind === 'video') {
        setVideoTracks(prev => [...prev, track]);
      } else if (track.kind === 'audio') {
        setAudioTracks(prev => [...prev, track]);
      }
    };

    // This function handles unsubscribing from tracks and detaching them from the DOM.
    const trackUnsubscribed = (track: RemoteTrack | LocalTrack) => {
      if (track.kind === 'video') {
        setVideoTracks(prev => prev.filter(t => t !== track));
      } else if (track.kind === 'audio') {
        setAudioTracks(prev => prev.filter(t => t !== track));
      }
    };
    
    // Set initial tracks that are already subscribed.
    const initialVideoTracks = Array.from(participant.videoTracks.values())
      .map(publication => publication.track)
      .filter((track): track is RemoteTrack | LocalTrack => track !== null);
    const initialAudioTracks = Array.from(participant.audioTracks.values())
      .map(publication => publication.track)
      .filter((track): track is RemoteTrack | LocalTrack => track !== null);

    setVideoTracks(initialVideoTracks);
    setAudioTracks(initialAudioTracks);

    // Listen for new tracks being subscribed to.
    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);

    return () => {
      participant.off('trackSubscribed', trackSubscribed);
      participant.off('trackUnsubscribed', trackUnsubscribed);
    };
  }, [participant]);

  // Effect to attach/detach video tracks to the video element.
  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  // Effect to attach/detach audio tracks to the audio element.
  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
      <video ref={videoRef} autoPlay={true} className="w-full h-full object-cover" />
      <audio ref={audioRef} autoPlay={true} muted={'identity' in participant && participant.identity === participant.identity} />
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {participant.identity}
      </div>
    </div>
  );
};

export default Participant;
