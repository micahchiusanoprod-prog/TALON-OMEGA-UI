import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  ArrowLeft,
  Play,
  Pause,
  Film,
  Tv,
  Gamepad2,
  Music,
  Star,
  Clock,
  Shuffle,
  ChevronRight,
  Search,
  Sparkles,
  Download,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Plus,
  X,
  FileText,
  QrCode,
  Wifi,
  Users,
  Trophy,
  Dice5,
  Swords,
  Camera,
  FolderLock,
  Share2,
  UserPlus,
  BookOpen,
  Image,
  Lock,
  Settings,
  Info
} from 'lucide-react';
import { Input } from './ui/input';
import config from '../config';

// ============================================================
// ENTERTAINMENT PAGE - Full Feature Surface
// ============================================================

// Navigation sections
const navSections = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'movies', label: 'Movies & TV', icon: Film },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'vault', label: 'Vault', icon: FolderLock },
  { id: 'share', label: 'File Drop', icon: Share2 },
];

// Mock content data
const mockMovies = [
  { id: 'm1', title: 'Apocalypse Dawn', year: '2024', rating: 8.4, duration: '2h 18m', genre: 'Action', gradient: 'from-red-500 to-orange-500', downloaded: true, progress: 45 },
  { id: 'm2', title: 'Silent Earth', year: '2023', rating: 7.9, duration: '1h 52m', genre: 'Sci-Fi', gradient: 'from-blue-500 to-cyan-500', downloaded: true, progress: 0 },
  { id: 'm3', title: 'Grid Down', year: '2023', rating: 7.5, duration: '1h 48m', genre: 'Drama', gradient: 'from-amber-500 to-red-500', downloaded: false, progress: 100 },
  { id: 'm4', title: 'Bunker Protocol', year: '2024', rating: 8.7, duration: '2h 22m', genre: 'Action', gradient: 'from-slate-600 to-gray-800', downloaded: true, progress: 0 },
  { id: 'm5', title: 'Last Signal', year: '2024', rating: 8.1, duration: '1h 55m', genre: 'Thriller', gradient: 'from-violet-500 to-purple-500', downloaded: true, progress: 20 },
  { id: 'm6', title: 'The Compound', year: '2023', rating: 8.2, duration: '2h 05m', genre: 'Drama', gradient: 'from-emerald-500 to-teal-500', downloaded: true, progress: 0 },
];

const mockShows = [
  { id: 's1', title: 'Survival Protocol', year: '2024', rating: 8.9, seasons: 2, episodes: 16, genre: 'Drama', gradient: 'from-emerald-500 to-teal-500', progress: 65, nextEp: 'S2E5' },
  { id: 's2', title: 'Off Grid', year: '2024', rating: 7.8, seasons: 1, episodes: 8, genre: 'Documentary', gradient: 'from-amber-500 to-orange-500', progress: 25, nextEp: 'S1E3' },
  { id: 's3', title: 'Dark Winter', year: '2023', rating: 8.8, seasons: 1, episodes: 10, genre: 'Horror', gradient: 'from-slate-700 to-gray-900', progress: 80, nextEp: 'S1E9' },
  { id: 's4', title: 'Mesh Network', year: '2024', rating: 7.5, seasons: 1, episodes: 6, genre: 'Tech', gradient: 'from-cyan-500 to-blue-500', progress: 0, nextEp: 'S1E1' },
];

const mockGames = [
  { id: 'g1', title: 'Tactical Ops', genre: 'Strategy', players: '1-4', playTime: '12h', gradient: 'from-red-500 to-orange-500', offline: true, multiplayer: true },
  { id: 'g2', title: 'Wilderness Survival', genre: 'Simulation', players: '1', playTime: '45h', gradient: 'from-green-500 to-emerald-500', offline: true, multiplayer: false },
  { id: 'g3', title: 'Chess Master', genre: 'Board', players: '1-2', playTime: '8h', gradient: 'from-amber-500 to-yellow-500', offline: true, multiplayer: true },
  { id: 'g4', title: 'Card Battles', genre: 'Card', players: '2-4', playTime: '15h', gradient: 'from-indigo-500 to-violet-500', offline: true, multiplayer: true },
  { id: 'g5', title: 'Trivia Challenge', genre: 'Quiz', players: '2-8', playTime: '2h', gradient: 'from-pink-500 to-rose-500', offline: true, multiplayer: true },
  { id: 'g6', title: 'Puzzle Quest', genre: 'Puzzle', players: '1', playTime: '20h', gradient: 'from-cyan-500 to-blue-500', offline: true, multiplayer: false },
];

const mockAlbums = [
  { id: 'a1', title: 'Road Warriors', artist: 'Dust Storm', tracks: 12, gradient: 'from-pink-500 to-rose-500' },
  { id: 'a2', title: 'Silent Frequencies', artist: 'Radio Ghost', tracks: 10, gradient: 'from-cyan-500 to-blue-500' },
  { id: 'a3', title: 'Campfire Sessions', artist: 'Acoustic Drift', tracks: 8, gradient: 'from-orange-500 to-amber-500' },
  { id: 'a4', title: 'Digital Decay', artist: 'Neon Collapse', tracks: 14, gradient: 'from-purple-500 to-pink-500' },
];

// ============================================================
// PLACEHOLDER BADGES
// ============================================================

const PlaceholderBadge = ({ label = 'Planned', variant = 'default' }) => {
  const variants = {
    default: 'bg-muted/50 text-muted-foreground border-muted-foreground/20',
    mock: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    planned: 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30',
    notWired: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${variants[variant]}`}>
      <Info className="w-3 h-3" />
      {label}
    </span>
  );
};

// ============================================================
// MOVIE NIGHT MODE MODAL
// ============================================================

const MovieNightModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const jellyfinUrl = `${config.JELLYFIN_BASE}${config.JELLYFIN_WEB_PATH || '/web/'}`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-violet-500/20 to-pink-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Movie Night Mode</h2>
                <p className="text-xs text-muted-foreground">Share the big screen experience</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Hotspot */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                Connect to OMEGA Hotspot
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Have your guests connect their phones to the OMEGA WiFi network.
              </p>
              <div className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Network Name</p>
                    <p className="font-mono font-bold">OMEGA-Hotspot</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Password</p>
                    <p className="font-mono font-bold">omega2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 2: QR Code */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" />
                Scan to Open Jellyfin
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Guests can scan this QR code to open the movie selection screen.
              </p>
              <div className="flex justify-center p-4 glass rounded-xl">
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-800" />
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Opens: {jellyfinUrl}
              </p>
            </div>
          </div>
          
          {/* Step 3: Vote */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Vote on What to Watch
              </h3>
              <p className="text-sm text-muted-foreground">
                Everyone can browse and vote for their favorite. Most votes wins!
              </p>
            </div>
          </div>
          
          <PlaceholderBadge label="Mock Data - Not Wired" variant="mock" />
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <Button className="w-full gap-2" onClick={onClose}>
            <Play className="w-4 h-4" />
            Start Movie Night
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CONTENT CARDS
// ============================================================

const MovieCard = ({ item, size = 'normal' }) => (
  <div className="group cursor-pointer" data-testid={`movie-card-${item.id}`}>
    <div className={`${size === 'large' ? 'aspect-video' : 'aspect-[2/3]'} rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]`}>
      <Film className="absolute inset-0 m-auto w-10 h-10 text-white/20" />
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-gray-900 ml-0.5" />
          </div>
        </div>
      </div>
      
      {item.progress > 0 && item.progress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div className="h-full bg-white" style={{ width: `${item.progress}%` }} />
        </div>
      )}
      
      {item.downloaded && (
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 rounded-full p-1.5 shadow-md">
          <Download className="w-3 h-3 text-emerald-500" />
        </div>
      )}
    </div>
    <div className="mt-2">
      <p className="font-semibold text-sm truncate">{item.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{item.year}</span>
        <span>{item.duration || `${item.seasons}S`}</span>
        {item.rating && (
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-amber-500 font-medium">{item.rating}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const GameCard = ({ item }) => (
  <div className="group cursor-pointer" data-testid={`game-card-${item.id}`}>
    <div className="aspect-square rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]">
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
      <Gamepad2 className="absolute inset-0 m-auto w-12 h-12 text-white/30" />
      
      {item.multiplayer && (
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
          <Users className="w-3 h-3" />
          {item.players}
        </div>
      )}
      
      {item.offline && (
        <div className="absolute top-2 right-2 bg-emerald-500/90 rounded-full p-1.5 shadow-md">
          <Download className="w-3 h-3 text-white" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Play
          </Button>
        </div>
      </div>
    </div>
    <div className="mt-2">
      <p className="font-semibold text-sm truncate">{item.title}</p>
      <p className="text-xs text-muted-foreground">{item.genre} • {item.playTime}</p>
    </div>
  </div>
);

// ============================================================
// SECTION COMPONENTS
// ============================================================

const OverviewSection = ({ onMovieNight }) => (
  <div className="space-y-8">
    {/* Continue Watching */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Continue Watching
        </h3>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          See All <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {mockMovies.filter(m => m.progress > 0 && m.progress < 100).map(movie => (
          <MovieCard key={movie.id} item={movie} />
        ))}
        {mockShows.filter(s => s.progress > 0 && s.progress < 100).map(show => (
          <MovieCard key={show.id} item={show} />
        ))}
      </div>
    </div>
    
    {/* Movie Night Banner */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-6 shadow-xl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTItMi00LTItNC0yczItMiAyLTRjMC0yLTItNC0yLTRzMi0yIDQtMmMyLTIgNC0yIDQtMnMtMiAyLTIgNGMwIDIgMiA0IDIgNHMtMiAyLTQgMmMtMiAyLTQgMi00IDJzMi0yIDItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Movie Night Mode</h3>
          <p className="text-white/80 text-sm">Share your screen with family. Everyone votes on what to watch!</p>
        </div>
        <Button onClick={onMovieNight} className="bg-white text-purple-700 hover:bg-white/90 gap-2 shadow-lg">
          <QrCode className="w-4 h-4" />
          Start Movie Night
        </Button>
      </div>
    </div>
    
    {/* Newly Added */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Newly Added
        </h3>
        <PlaceholderBadge label="Mock Data" variant="mock" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {mockMovies.slice(0, 6).map(movie => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    </div>
    
    {/* Quick Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { icon: Film, label: 'Movies', count: 24, color: 'from-red-500 to-orange-500' },
        { icon: Tv, label: 'TV Shows', count: 12, color: 'from-violet-500 to-purple-500' },
        { icon: Gamepad2, label: 'Games', count: 8, color: 'from-green-500 to-emerald-500' },
        { icon: Music, label: 'Albums', count: 18, color: 'from-cyan-500 to-blue-500' },
      ].map((stat, i) => (
        <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
          <stat.icon className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{stat.count}</p>
          <p className="text-sm opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const MoviesSection = () => (
  <div className="space-y-8">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">All Movies</h3>
        <PlaceholderBadge label="Mock Data" variant="mock" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {mockMovies.map(movie => (
          <MovieCard key={movie.id} item={movie} />
        ))}
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-bold mb-4">TV Shows</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockShows.map(show => (
          <MovieCard key={show.id} item={show} size="large" />
        ))}
      </div>
    </div>
  </div>
);

const GamesSection = () => (
  <div className="space-y-8">
    {/* Games Hub Header */}
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Games Hub</h2>
          <p className="text-sm text-muted-foreground">Offline arcade, tournaments, and party games</p>
        </div>
      </div>
      
      {/* Game Modes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Dice5, label: 'Arcade', desc: 'Single player', color: 'from-amber-500 to-orange-500' },
          { icon: Trophy, label: 'Tournaments', desc: 'Compete', color: 'from-yellow-500 to-amber-500' },
          { icon: Users, label: 'Party Mode', desc: '2-8 players', color: 'from-pink-500 to-rose-500' },
          { icon: Swords, label: 'Trivia', desc: 'Team scoring', color: 'from-violet-500 to-purple-500' },
        ].map((mode, i) => (
          <button key={i} className={`p-4 rounded-xl bg-gradient-to-br ${mode.color} text-white text-left hover:scale-[1.02] transition-transform shadow-lg`}>
            <mode.icon className="w-6 h-6 mb-2" />
            <p className="font-semibold">{mode.label}</p>
            <p className="text-xs opacity-80">{mode.desc}</p>
          </button>
        ))}
      </div>
      
      <PlaceholderBadge label="Planned - Not Wired" variant="planned" />
    </div>
    
    {/* Game Grid */}
    <div>
      <h3 className="text-lg font-bold mb-4">Available Games</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {mockGames.map(game => (
          <GameCard key={game.id} item={game} />
        ))}
      </div>
    </div>
  </div>
);

const MusicSection = () => (
  <div className="space-y-8">
    {/* Music Player Placeholder */}
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
          <Music className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Now Playing</h3>
          <p className="text-sm text-muted-foreground">Horizon Line - Dust Storm</p>
          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-1/3" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm"><SkipBack className="w-5 h-5" /></Button>
        <Button size="lg" className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
          <Play className="w-6 h-6 text-white" />
        </Button>
        <Button variant="ghost" size="sm"><SkipForward className="w-5 h-5" /></Button>
      </div>
      
      <PlaceholderBadge label="Mock - Audio Not Wired" variant="mock" />
    </div>
    
    {/* Beat Maker Placeholder */}
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Beat Maker
        </h3>
        <PlaceholderBadge label="Planned" variant="planned" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">Create your own beats with the offline drum machine and sequencer.</p>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-secondary/50 hover:bg-primary/20 cursor-pointer transition-colors" />
        ))}
      </div>
    </div>
    
    {/* Albums */}
    <div>
      <h3 className="text-lg font-bold mb-4">Albums</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockAlbums.map(album => (
          <div key={album.id} className="group cursor-pointer">
            <div className={`aspect-square rounded-xl bg-gradient-to-br ${album.gradient} relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]`}>
              <Music className="absolute inset-0 m-auto w-12 h-12 text-white/30" />
            </div>
            <div className="mt-2">
              <p className="font-semibold text-sm truncate">{album.title}</p>
              <p className="text-xs text-muted-foreground">{album.artist} • {album.tracks} tracks</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PhotosSection = () => (
  <div className="space-y-6">
    <div className="glass rounded-2xl p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Image className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold mb-2">Photos Hub</h2>
      <p className="text-muted-foreground mb-4">Browse, share, and organize your offline photo library</p>
      <PlaceholderBadge label="Planned - Coming Soon" variant="planned" />
    </div>
    
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
      ))}
    </div>
  </div>
);

const VaultSection = () => (
  <div className="glass rounded-2xl p-6 text-center max-w-md mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
      <FolderLock className="w-8 h-8 text-white" />
    </div>
    <h2 className="text-xl font-bold mb-2">Personal Documents Vault</h2>
    <p className="text-muted-foreground mb-4">Secure storage for important documents with optional PIN lock and admin bypass.</p>
    
    <div className="space-y-3 text-left mb-6">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
        <Lock className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">PIN Protection</p>
          <p className="text-xs text-muted-foreground">Optional 4-digit PIN lock</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Admin Bypass</p>
          <p className="text-xs text-muted-foreground">Configurable emergency access</p>
        </div>
      </div>
    </div>
    
    <PlaceholderBadge label="Planned - Not Implemented" variant="planned" />
  </div>
);

const FileDropSection = () => (
  <div className="glass rounded-2xl p-6 text-center max-w-md mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
      <Share2 className="w-8 h-8 text-white" />
    </div>
    <h2 className="text-xl font-bold mb-2">File Drop / Share</h2>
    <p className="text-muted-foreground mb-4">Quick file sharing between devices on the local network.</p>
    
    <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 mb-4">
      <p className="text-sm text-muted-foreground">Drop files here or click to select</p>
    </div>
    
    <PlaceholderBadge label="Planned - Not Implemented" variant="planned" />
  </div>
);

// ============================================================
// MAIN ENTERTAINMENT PAGE
// ============================================================

export default function EntertainmentPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMovieNight, setShowMovieNight] = useState(false);
  
  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection onMovieNight={() => setShowMovieNight(true)} />;
      case 'movies': return <MoviesSection />;
      case 'games': return <GamesSection />;
      case 'music': return <MusicSection />;
      case 'photos': return <PhotosSection />;
      case 'vault': return <VaultSection />;
      case 'share': return <FileDropSection />;
      default: return <OverviewSection onMovieNight={() => setShowMovieNight(true)} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background" data-testid="entertainment-page">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold">Entertainment</h1>
            </div>
            
            <div className="flex-1" />
            
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search entertainment..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-secondary/50 border-0 rounded-full text-sm"
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="fixed top-[57px] left-0 right-0 z-40 glass border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
            {navSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                  data-testid={`nav-${section.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-8 max-w-[1600px]">
        {renderSection()}
      </main>
      
      {/* New User Setup Entry Point */}
      <div className="fixed bottom-4 right-4 z-30">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 shadow-lg bg-background"
          data-testid="new-user-setup"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New User Setup</span>
        </Button>
      </div>
      
      {/* Movie Night Modal */}
      <MovieNightModal isOpen={showMovieNight} onClose={() => setShowMovieNight(false)} />
    </div>
  );
}
