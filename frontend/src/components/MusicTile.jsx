import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Music, 
  Heart, 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  Disc,
  Mic2,
  Video,
  Search
} from 'lucide-react';
import { Input } from './ui/input';

// Mock album covers (placeholders)
const mockAlbums = [
  { id: '1', title: 'Album 1', artist: 'Artist A', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: '2', title: 'Album 2', artist: 'Artist B', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { id: '3', title: 'Album 3', artist: 'Artist C', color: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: '4', title: 'Album 4', artist: 'Artist D', color: 'bg-gradient-to-br from-green-500 to-teal-500' },
  { id: '5', title: 'Album 5', artist: 'Artist E', color: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { id: '6', title: 'Album 6', artist: 'Artist F', color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
];

const AlbumCard = ({ album, size = 'normal' }) => (
  <button
    className={`${size === 'small' ? 'w-20' : 'w-full'} group`}
    data-testid={`album-${album.id}`}
  >
    <div className={`${album.color} ${size === 'small' ? 'w-20 h-20' : 'aspect-square'} rounded-lg flex items-center justify-center relative overflow-hidden`}>
      <Disc className="w-8 h-8 text-white/50" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <Play className="w-8 h-8 text-white" />
      </div>
    </div>
    <p className={`${size === 'small' ? 'text-xs' : 'text-sm'} font-medium mt-1.5 truncate`}>{album.title}</p>
    <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
  </button>
);

const SongRow = ({ title, artist, isPlaying, isLiked }) => (
  <div className={`flex items-center gap-3 p-2 rounded-lg ${isPlaying ? 'bg-primary/10' : 'hover:bg-secondary/50'} transition-colors`}>
    <div className={`w-8 h-8 rounded ${isPlaying ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center`}>
      {isPlaying ? (
        <Pause className="w-4 h-4 text-primary-foreground" />
      ) : (
        <Play className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium truncate ${isPlaying ? 'text-primary' : ''}`}>{title}</p>
      <p className="text-xs text-muted-foreground truncate">{artist}</p>
    </div>
    <button className={`p-1 ${isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}>
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
    </button>
  </div>
);

export default function MusicTile() {
  const [activeSection, setActiveSection] = useState('mostPlayed');
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="music-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Music className="w-5 h-5 text-primary" />
          Music
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini Player */}
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Disc className="w-6 h-6 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">No track playing</p>
              <p className="text-xs text-muted-foreground">Connect to play music</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-secondary rounded-full mb-3">
            <div className="h-full w-0 bg-primary rounded-full" />
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button className="text-muted-foreground hover:text-foreground">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Section Tabs */}
        <div className="flex gap-1 glass rounded-lg p-1">
          {[
            { id: 'mostPlayed', label: 'Most Played', icon: ListMusic },
            { id: 'liked', label: 'Liked', icon: Heart },
            { id: 'albums', label: 'Albums', icon: Disc },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeSection === id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}
              data-testid={`section-${id}`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        {activeSection === 'mostPlayed' && (
          <div className="space-y-1" data-testid="most-played-section">
            <div className="text-center py-8">
              <ListMusic className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No play history yet</p>
              <p className="text-xs text-muted-foreground/70">Start playing music to see your most played</p>
            </div>
          </div>
        )}
        
        {activeSection === 'liked' && (
          <div className="space-y-1" data-testid="liked-section">
            <div className="text-center py-8">
              <Heart className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No liked songs yet</p>
              <p className="text-xs text-muted-foreground/70">Tap the heart on songs you love</p>
            </div>
          </div>
        )}
        
        {activeSection === 'albums' && (
          <div className="space-y-3" data-testid="albums-section">
            <div className="grid grid-cols-3 gap-3">
              {mockAlbums.slice(0, 6).map((album) => (
                <AlbumCard key={album.id} album={album} size="small" />
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Album covers are placeholders. Import your library to see real artwork.
            </p>
          </div>
        )}
        
        {/* Additional Sections (Structure Only) */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">COMING SOON</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="glass rounded-lg p-3 text-center opacity-60">
              <Mic2 className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Lyrics</p>
            </div>
            <div className="glass rounded-lg p-3 text-center opacity-60">
              <Video className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Music Videos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
