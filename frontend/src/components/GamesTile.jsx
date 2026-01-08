import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Gamepad2,
  Play,
  Clock,
  Users,
  Wifi,
  WifiOff,
  Search,
  HelpCircle,
  Grid,
  List,
  Trophy,
  Zap
} from 'lucide-react';
import { Input } from './ui/input';

// Mock games data
const mockGames = [
  { id: '1', title: 'Tactical Ops', genre: 'Strategy', players: '1-4', playTime: '12h 30m', cover: 'from-red-600 to-orange-500', offline: true, lastPlayed: '2h ago' },
  { id: '2', title: 'Wilderness Survival', genre: 'Simulation', players: '1', playTime: '45h 12m', cover: 'from-green-600 to-emerald-500', offline: true, lastPlayed: '1d ago' },
  { id: '3', title: 'Chess Master', genre: 'Board', players: '1-2', playTime: '8h 45m', cover: 'from-amber-600 to-yellow-500', offline: true, lastPlayed: '3h ago' },
  { id: '4', title: 'Radio Commander', genre: 'Strategy', players: '1', playTime: '22h 18m', cover: 'from-blue-600 to-cyan-500', offline: true, lastPlayed: '5d ago' },
  { id: '5', title: 'Puzzle Escape', genre: 'Puzzle', players: '1-2', playTime: '6h 20m', cover: 'from-purple-600 to-pink-500', offline: true, lastPlayed: 'Never' },
  { id: '6', title: 'Card Battles', genre: 'Card', players: '2-4', playTime: '15h 55m', cover: 'from-indigo-600 to-violet-500', offline: true, lastPlayed: '12h ago' },
];

const GameCard = ({ game, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${game.cover} flex items-center justify-center flex-shrink-0`}>
          <Gamepad2 className="w-6 h-6 text-white/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{game.title}</p>
            {game.offline && (
              <WifiOff className="w-3 h-3 text-success flex-shrink-0" title="Works offline" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{game.genre} • {game.players} players</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{game.playTime}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0">
          <Play className="w-4 h-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="group cursor-pointer">
      <div className={`aspect-square rounded-lg bg-gradient-to-br ${game.cover} flex items-center justify-center relative overflow-hidden`}>
        <Gamepad2 className="w-10 h-10 text-white/30" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Play className="w-10 h-10 text-white" />
        </div>
        {game.offline && (
          <div className="absolute top-2 right-2 bg-success/90 rounded-full p-1" title="Works offline">
            <WifiOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <p className="text-sm font-medium mt-2 truncate">{game.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{game.genre}</span>
        <span>•</span>
        <Users className="w-3 h-3" />
        <span>{game.players}</span>
      </div>
    </div>
  );
};

export default function GamesTile() {
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'recent', label: 'Recent' },
    { id: 'multiplayer', label: 'Multiplayer' },
    { id: 'strategy', label: 'Strategy' },
  ];
  
  const filteredGames = mockGames.filter(game => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recent') return game.lastPlayed !== 'Never';
    if (activeFilter === 'multiplayer') return game.players !== '1';
    if (activeFilter === 'strategy') return game.genre === 'Strategy';
    return true;
  });
  
  // Calculate total play time
  const totalHours = mockGames.reduce((acc, game) => {
    const hours = parseInt(game.playTime.split('h')[0]) || 0;
    return acc + hours;
  }, 0);
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="games-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-green-400" />
            Games
            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {mockGames.length} installed
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-lg p-2 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold">{totalHours}h</p>
            <p className="text-[10px] text-muted-foreground">Total Played</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <p className="text-sm font-bold">24</p>
            <p className="text-[10px] text-muted-foreground">Achievements</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-green-400" />
            <p className="text-sm font-bold">{mockGames.filter(g => g.offline).length}</p>
            <p className="text-[10px] text-muted-foreground">Offline Ready</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Games Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-3">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} viewMode={viewMode} />
            ))}
          </div>
        )}
        
        {/* Recently Played */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">RECENTLY PLAYED</p>
          <div className="flex gap-2">
            {mockGames.filter(g => g.lastPlayed !== 'Never').slice(0, 3).map(game => (
              <div key={game.id} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2 flex-1">
                <div className={`w-8 h-8 rounded bg-gradient-to-br ${game.cover} flex items-center justify-center`}>
                  <Gamepad2 className="w-4 h-4 text-white/50" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{game.title}</p>
                  <p className="text-[10px] text-muted-foreground">{game.lastPlayed}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
