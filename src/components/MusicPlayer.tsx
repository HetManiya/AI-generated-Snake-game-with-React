import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { tracks } from '../data/tracks';

interface MusicPlayerProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ onPlayStateChange }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, currentTrackIndex, onPlayStateChange]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto bg-black border-2 border-fuchsia-500 p-4 relative">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center gap-4 w-1/3">
        <div className="w-14 h-14 border-2 border-cyan-400 overflow-hidden relative">
          <img 
            src={currentTrack.cover} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-cyan-400 mix-blend-overlay"></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-fuchsia-500 font-bold truncate text-lg uppercase tracking-widest">
            {currentTrack.title}
          </span>
          <span className="text-cyan-400 text-sm truncate uppercase tracking-widest">
            ID: {currentTrack.artist}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 w-1/3">
        <button 
          onClick={prevTrack}
          className="text-cyan-400 hover:text-fuchsia-500 transition-colors p-2 border border-transparent hover:border-fuchsia-500"
        >
          <SkipBack size={32} />
        </button>
        <button 
          onClick={togglePlay}
          className="text-black bg-cyan-400 hover:bg-fuchsia-500 transition-colors p-2 border-2 border-cyan-400 hover:border-fuchsia-500"
        >
          {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-1" />}
        </button>
        <button 
          onClick={nextTrack}
          className="text-cyan-400 hover:text-fuchsia-500 transition-colors p-2 border border-transparent hover:border-fuchsia-500"
        >
          <SkipForward size={32} />
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 w-1/3">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-fuchsia-500 hover:text-cyan-400 transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-24 h-2 bg-black border border-cyan-400 appearance-none cursor-pointer accent-fuchsia-500"
        />
      </div>
    </div>
  );
}
