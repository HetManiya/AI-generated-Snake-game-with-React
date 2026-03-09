import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Terminal, Cpu } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 font-digital selection:bg-fuchsia-500/50 flex flex-col scanlines screen-tear">
      <div className="static-noise"></div>
      
      {/* Header */}
      <header className="w-full p-4 flex items-center justify-between border-b-4 border-fuchsia-500 bg-black z-10">
        <div className="flex items-center gap-4">
          <Terminal className="text-fuchsia-500 w-8 h-8 animate-pulse" />
          <div className="text-2xl font-bold tracking-widest glitch-text" data-text="SYS.OP.TERMINAL">
            SYS.OP.TERMINAL
          </div>
        </div>
        <div className="h-4 w-32 bg-cyan-400 animate-pulse"></div>
        <Cpu className="text-cyan-400 w-8 h-8" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="w-full border-2 border-cyan-400 p-1 relative">
            <div className="absolute -top-3 left-4 bg-black px-2 text-fuchsia-500 text-xl">MODULE: SERPENT</div>
            <SnakeGame />
          </div>
        </div>
      </main>

      {/* Footer / Music Player */}
      <footer className="w-full p-4 border-t-4 border-cyan-400 bg-black z-20 relative">
        <div className="absolute -top-4 right-4 bg-black px-2 text-fuchsia-500 text-xl">MODULE: AUDIO</div>
        <MusicPlayer />
      </footer>
    </div>
  );
}
