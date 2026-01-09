import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
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
  MoreHorizontal,
  X,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Input } from './ui/input';

// Content sections
const sections = [
  { id: 'all', label: 'All', icon: Sparkles, color: 'from-pink-500 to-violet-500' },
  { id: 'movies', label: 'Movies', icon: Film, color: 'from-red-500 to-orange-500' },
  { id: 'shows', label: 'Shows', icon: Tv, color: 'from-violet-500 to-purple-500' },
  { id: 'games', label: 'Games', icon: Gamepad2, color: 'from-green-500 to-emerald-500' },
  { id: 'music', label: 'Music', icon: Music, color: 'from-cyan-500 to-blue-500' },
];

// All content items
const allContent = [
  // Movies
  { id: 'm1', title: 'Apocalypse Dawn', type: 'movie', year: '2024', rating: 8.4, duration: '2h 18m', genre: 'Action', gradient: 'from-red-500 to-orange-500', downloaded: true },
  { id: 'm2', title: 'Silent Earth', type: 'movie', year: '2023', rating: 7.9, duration: '1h 52m', genre: 'Sci-Fi', gradient: 'from-blue-500 to-cyan-500', downloaded: true },
  { id: 'm3', title: 'Grid Down', type: 'movie', year: '2023', rating: 7.5, duration: '1h 48m', genre: 'Drama', gradient: 'from-amber-500 to-red-500', downloaded: false },
  { id: 'm4', title: 'Bunker Protocol', type: 'movie', year: '2024', rating: 8.7, duration: '2h 22m', genre: 'Action', gradient: 'from-slate-600 to-gray-800', downloaded: true },
  // Shows
  { id: 's1', title: 'Survival Protocol', type: 'show', year: '2024', rating: 8.9, seasons: 2, genre: 'Drama', gradient: 'from-emerald-500 to-teal-500', progress: 65 },
  { id: 's2', title: 'The Compound', type: 'show', year: '2023', rating: 8.2, seasons: 3, genre: 'Thriller', gradient: 'from-violet-500 to-purple-500', progress: 100 },
  { id: 's3', title: 'Off Grid', type: 'show', year: '2024', rating: 7.8, seasons: 1, genre: 'Documentary', gradient: 'from-amber-500 to-orange-500', progress: 25 },
  { id: 's4', title: 'Dark Winter', type: 'show', year: '2023', rating: 8.8, seasons: 1, genre: 'Horror', gradient: 'from-slate-700 to-gray-900', progress: 80 },
  // Games
  { id: 'g1', title: 'Tactical Ops', type: 'game', genre: 'Strategy', players: '1-4', playTime: '12h', gradient: 'from-red-500 to-orange-500', offline: true },
  { id: 'g2', title: 'Wilderness Survival', type: 'game', genre: 'Simulation', players: '1', playTime: '45h', gradient: 'from-green-500 to-emerald-500', offline: true },
  { id: 'g3', title: 'Chess Master', type: 'game', genre: 'Board', players: '1-2', playTime: '8h', gradient: 'from-amber-500 to-yellow-500', offline: true },
  { id: 'g4', title: 'Card Battles', type: 'game', genre: 'Card', players: '2-4', playTime: '15h', gradient: 'from-indigo-500 to-violet-500', offline: true },
  // Music - Albums
  { id: 'a1', title: 'Road Warriors', type: 'album', artist: 'Dust Storm', tracks: 12, gradient: 'from-pink-500 to-rose-500' },
  { id: 'a2', title: 'Silent Frequencies', type: 'album', artist: 'Radio Ghost', tracks: 10, gradient: 'from-cyan-500 to-blue-500' },
  { id: 'a3', title: 'Campfire Sessions', type: 'album', artist: 'Acoustic Drift', tracks: 8, gradient: 'from-orange-500 to-amber-500' },
  { id: 'a4', title: 'Digital Decay', type: 'album', artist: 'Neon Collapse', tracks: 14, gradient: 'from-purple-500 to-pink-500' },
];

// Music tracks data
const musicTracks = [
  { id: 't1', title: 'Horizon Line', artist: 'Dust Storm', album: 'Road Warriors', duration: '4:23', favorite: true, gradient: 'from-pink-500 to-rose-500' },
  { id: 't2', title: 'Desert Highway', artist: 'Dust Storm', album: 'Road Warriors', duration: '3:45', favorite: false, gradient: 'from-pink-500 to-rose-500' },
  { id: 't3', title: 'Static Dreams', artist: 'Radio Ghost', album: 'Silent Frequencies', duration: '5:12', favorite: true, gradient: 'from-cyan-500 to-blue-500' },
  { id: 't4', title: 'Lost Signal', artist: 'Radio Ghost', album: 'Silent Frequencies', duration: '4:01', favorite: false, gradient: 'from-cyan-500 to-blue-500' },
  { id: 't5', title: 'Embers', artist: 'Acoustic Drift', album: 'Campfire Sessions', duration: '3:28', favorite: true, gradient: 'from-orange-500 to-amber-500' },
  { id: 't6', title: 'Starlight Lullaby', artist: 'Acoustic Drift', album: 'Campfire Sessions', duration: '4:55', favorite: false, gradient: 'from-orange-500 to-amber-500' },
  { id: 't7', title: 'Neon Nights', artist: 'Neon Collapse', album: 'Digital Decay', duration: '3:33', favorite: false, gradient: 'from-purple-500 to-pink-500' },
  { id: 't8', title: 'System Failure', artist: 'Neon Collapse', album: 'Digital Decay', duration: '4:47', favorite: true, gradient: 'from-purple-500 to-pink-500' },
];

// User playlists
const userPlaylists = [
  { id: 'p1', name: 'Road Trip Vibes', trackCount: 24, gradient: 'from-amber-500 to-orange-500' },
  { id: 'p2', name: 'Night Watch', trackCount: 18, gradient: 'from-indigo-500 to-purple-500' },
  { id: 'p3', name: 'Calm & Focus', trackCount: 12, gradient: 'from-emerald-500 to-teal-500' },
];

// Sample lyrics
const sampleLyrics = `[Verse 1]
Standing on the edge of time
Watching as the world unwinds
Every signal starts to fade
But we're not afraid

[Chorus]
On the horizon line
We'll find our way back home
Through the static and the noise
We're never alone

[Verse 2]
Miles of empty road ahead
Following where the stars have led
The radio plays our song
As we carry on

[Chorus]
On the horizon line
We'll find our way back home
Through the static and the noise
We're never alone

[Bridge]
When the lights go out
And the power's down
We'll still be standing strong
Together we belong`;

const ContentCard = ({ item, size = 'normal' }) => {
  const isGame = item.type === 'game';
  const isAlbum = item.type === 'album';
  const isShow = item.type === 'show';
  
  const TypeIcon = isGame ? Gamepad2 : isAlbum ? Music : isShow ? Tv : Film;
  
  return (
    <div className="group cursor-pointer">
      <div className={`${size === 'small' ? 'aspect-square' : isShow ? 'aspect-video' : 'aspect-[2/3]'} rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]`}>
        <TypeIcon className="absolute inset-0 m-auto w-8 h-8 text-white/20" />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
            <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-white flex items-center justify-center shadow-xl">
              <Play className="w-5 h-5 text-gray-900 ml-0.5" />
            </div>
          </div>
        </div>
        
        {isShow && item.progress > 0 && item.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-white" style={{ width: `${item.progress}%` }} />
          </div>
        )}
        
        {item.downloaded && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 rounded-full p-1.5 shadow-md">
            <Download className="w-3 h-3 text-emerald-500" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-md">
          {item.type}
        </div>
      </div>
      <div className="mt-2">
        <p className="font-semibold text-sm truncate">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.year && <span>{item.year}</span>}
          {item.artist && <span>{item.artist}</span>}
          {item.genre && <span>{item.genre}</span>}
          {item.rating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-amber-500 dark:text-amber-400 font-medium">{item.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Music Player Component
const MusicPlayer = ({ currentTrack, isPlaying, onPlayPause, onNext, onPrev, onToggleFavorite, tracks, onSelectTrack }) => {
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [progress, setProgress] = useState(35);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const formatTime = (percent) => {
    const totalSeconds = 263; // 4:23 example
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-4">
      {/* Now Playing Card */}
      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="flex items-start gap-4">
          {/* Album Art */}
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br ${currentTrack.gradient} flex-shrink-0 shadow-lg relative overflow-hidden`}>
            <Music className="absolute inset-0 m-auto w-10 h-10 text-white/30" />
            {isPlaying && (
              <div className="absolute bottom-2 left-2 right-2 flex items-end justify-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ 
                    height: `${8 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.1}s`
                  }} />
                ))}
              </div>
            )}
          </div>
          
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg truncate">{currentTrack.title}</h3>
                <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                <p className="text-xs text-muted-foreground">{currentTrack.album}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(currentTrack.id)}
                className={`h-9 w-9 p-0 ${currentTrack.favorite ? 'text-pink-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`w-5 h-5 ${currentTrack.favorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 space-y-1">
              <div className="h-2 bg-secondary rounded-full overflow-hidden cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = ((e.clientX - rect.left) / rect.width) * 100;
                  setProgress(Math.max(0, Math.min(100, percent)));
                }}
              >
                <div className={`h-full bg-gradient-to-r ${currentTrack.gradient} rounded-full transition-all relative`} style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffle(!isShuffle)}
            className={`h-9 w-9 p-0 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onPrev} className="h-10 w-10 p-0">
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={onPlayPause}
            className={`h-14 w-14 rounded-full bg-gradient-to-r ${currentTrack.gradient} hover:opacity-90 shadow-lg`}
          >
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onNext} className="h-10 w-10 p-0">
            <SkipForward className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRepeat(!isRepeat)}
            className={`h-9 w-9 p-0 ${isRepeat ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Volume */}
        <div className="flex items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8 p-0 text-muted-foreground"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              setVolume(Math.max(0, Math.min(100, percent)));
              setIsMuted(false);
            }}
          >
            <div className="h-full bg-primary rounded-full" style={{ width: isMuted ? 0 : `${volume}%` }} />
          </div>
          <span className="text-xs text-muted-foreground w-8">{isMuted ? 0 : volume}%</span>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLyrics(!showLyrics)}
            className={`gap-2 ${showLyrics ? 'bg-primary/10 border-primary text-primary' : ''}`}
          >
            <FileText className="w-4 h-4" />
            {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPlaylists(!showPlaylists)}
            className={`gap-2 ${showPlaylists ? 'bg-primary/10 border-primary text-primary' : ''}`}
          >
            <ListMusic className="w-4 h-4" />
            {showPlaylists ? 'Hide Playlists' : 'Add to Playlist'}
          </Button>
        </div>
      </div>
      
      {/* Lyrics Section */}
      {showLyrics && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Lyrics
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setShowLyrics(false)} className="h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {sampleLyrics}
            </pre>
          </div>
        </div>
      )}
      
      {/* Playlists Section */}
      {showPlaylists && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              Your Playlists
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setShowPlaylists(false)} className="h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Create New Playlist */}
          <Button variant="outline" className="w-full gap-2 border-dashed">
            <Plus className="w-4 h-4" />
            Create New Playlist
          </Button>
          
          {/* Existing Playlists */}
          <div className="space-y-2">
            {userPlaylists.map(playlist => (
              <div 
                key={playlist.id}
                className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${playlist.gradient} flex items-center justify-center shadow`}>
                  <ListMusic className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{playlist.name}</p>
                  <p className="text-xs text-muted-foreground">{playlist.trackCount} tracks</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Track List */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">All Tracks</h4>
          <span className="text-xs text-muted-foreground">{tracks.length} songs</span>
        </div>
        
        <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                track.id === currentTrack.id 
                  ? 'bg-primary/10' 
                  : 'hover:bg-white/5'
              }`}
            >
              <span className="w-6 text-center text-xs text-muted-foreground">
                {track.id === currentTrack.id && isPlaying ? (
                  <div className="flex items-center justify-center gap-0.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ 
                        height: `${6 + Math.random() * 6}px`,
                        animationDelay: `${i * 0.15}s`
                      }} />
                    ))}
                  </div>
                ) : idx + 1}
              </span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${track.gradient} flex items-center justify-center flex-shrink-0`}>
                <Music className="w-4 h-4 text-white/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${track.id === currentTrack.id ? 'font-semibold text-primary' : ''}`}>
                  {track.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-muted-foreground">{track.duration}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(track.id); }}
                className={`h-8 w-8 p-0 ${track.favorite ? 'text-pink-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
              >
                <Heart className={`w-4 h-4 ${track.favorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function EntertainmentTile() {
  const [activeSection, setActiveSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState(musicTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState(musicTracks);
  
  const filteredContent = allContent.filter(item => {
    if (activeSection === 'all') return true;
    if (activeSection === 'movies') return item.type === 'movie';
    if (activeSection === 'shows') return item.type === 'show';
    if (activeSection === 'games') return item.type === 'game';
    if (activeSection === 'music') return item.type === 'album';
    return true;
  }).filter(item => 
    searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleToggleFavorite = (trackId) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, favorite: !t.favorite } : t
    ));
    if (currentTrack.id === trackId) {
      setCurrentTrack(prev => ({ ...prev, favorite: !prev.favorite }));
    }
  };
  
  const handleNext = () => {
    const currentIdx = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (currentIdx + 1) % tracks.length;
    setCurrentTrack(tracks[nextIdx]);
  };
  
  const handlePrev = () => {
    const currentIdx = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIdx = currentIdx === 0 ? tracks.length - 1 : currentIdx - 1;
    setCurrentTrack(tracks[prevIdx]);
  };
  
  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" data-testid="entertainment-tile">
      {/* Vibrant Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 to-emerald-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTItMi00LTItNC0yczItMiAyLTRjMC0yLTItNC0yLTRzMi0yIDQtMmMyLTIgNC0yIDQtMnMtMiAyLTIgNGMwIDIgMiA0IDIgNHMtMiAyLTQgMmMtMiAyLTQgMi00IDJzMi0yIDItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">Entertainment</h2>
                <p className="text-white/80 text-xs sm:text-sm hidden sm:block">Movies • Shows • Games • Music</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Shuffle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Surprise</span>
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            {[
              { icon: Film, label: 'Movies', count: 24, color: 'bg-red-500/30' },
              { icon: Tv, label: 'Shows', count: 12, color: 'bg-violet-500/30' },
              { icon: Gamepad2, label: 'Games', count: 6, color: 'bg-green-500/30' },
              { icon: Music, label: 'Albums', count: 18, color: 'bg-cyan-500/30' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1 text-white" />
                <p className="text-sm sm:text-lg font-bold text-white">{stat.count}</p>
                <p className="text-[8px] sm:text-[10px] text-white/70 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search entertainment..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-11 bg-slate-100 dark:bg-slate-800/50 border-0 rounded-xl text-sm"
            />
          </div>
        </div>
        
        {/* Section Tabs - Vibrant Pills */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
        
        {/* Music Section with Player */}
        {activeSection === 'music' ? (
          <MusicPlayer 
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={handleNext}
            onPrev={handlePrev}
            onToggleFavorite={handleToggleFavorite}
            tracks={tracks}
            onSelectTrack={(track) => {
              setCurrentTrack(track);
              setIsPlaying(true);
            }}
          />
        ) : (
          <>
            {/* Content Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredContent.slice(0, 8).map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
            
            {/* See All Button */}
            <div className="flex justify-center">
              <Button variant="outline" size="sm" className="rounded-full px-4 sm:px-6 gap-2 border-2 text-xs sm:text-sm">
                View All {activeSection === 'all' ? 'Content' : sections.find(s => s.id === activeSection)?.label}
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </>
        )}
        
        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              45 offline
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              128h watched
            </span>
          </div>
          <span>Last sync: 30 min ago</span>
        </div>
      </CardContent>
    </Card>
  );
}
