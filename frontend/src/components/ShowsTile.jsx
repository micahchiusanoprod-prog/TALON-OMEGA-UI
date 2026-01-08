import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Tv,
  Play,
  Star,
  Clock,
  Download,
  Search,
  HelpCircle,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import { Input } from './ui/input';

// Mock scraped TV show data
const mockShows = [
  { id: '1', title: 'Survival Protocol', year: '2024', rating: 8.9, seasons: 2, episodes: 18, genre: 'Drama', poster: 'from-emerald-600 to-teal-500', progress: 65, downloaded: 12 },
  { id: '2', title: 'The Compound', year: '2023', rating: 8.2, seasons: 3, episodes: 30, genre: 'Thriller', poster: 'from-violet-600 to-purple-500', progress: 100, downloaded: 30 },
  { id: '3', title: 'Off Grid', year: '2024', rating: 7.8, seasons: 1, episodes: 8, genre: 'Documentary', poster: 'from-amber-600 to-orange-500', progress: 25, downloaded: 8 },
  { id: '4', title: 'Last Broadcast', year: '2023', rating: 8.5, seasons: 2, episodes: 20, genre: 'Sci-Fi', poster: 'from-blue-600 to-indigo-500', progress: 40, downloaded: 10 },
  { id: '5', title: 'Preppers', year: '2024', rating: 7.4, seasons: 4, episodes: 48, genre: 'Reality', poster: 'from-rose-600 to-pink-500', progress: 0, downloaded: 0 },
  { id: '6', title: 'Dark Winter', year: '2023', rating: 8.8, seasons: 1, episodes: 10, genre: 'Horror', poster: 'from-slate-700 to-gray-900', progress: 80, downloaded: 10 },
];

const ShowCard = ({ show, viewMode }) => {
  const progressColor = show.progress === 100 ? 'bg-success' : show.progress > 0 ? 'bg-primary' : 'bg-secondary';
  
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${show.poster} flex items-center justify-center flex-shrink-0 relative`}>
          <Tv className="w-5 h-5 text-white/50" />
          {show.progress > 0 && show.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-b-lg overflow-hidden">
              <div className={`h-full ${progressColor}`} style={{ width: `${show.progress}%` }} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{show.title}</p>
            {show.progress === 100 && (
              <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded">Complete</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{show.seasons}S • {show.episodes} episodes • {show.genre}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-amber-400">{show.rating}</span>
            </div>
            {show.downloaded > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Download className="w-3 h-3" /> {show.downloaded}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="group cursor-pointer">
      <div className={`aspect-video rounded-lg bg-gradient-to-br ${show.poster} flex items-center justify-center relative overflow-hidden`}>
        <Tv className="w-8 h-8 text-white/30" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Play className="w-10 h-10 text-white" />
        </div>
        {show.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div className={`h-full ${progressColor}`} style={{ width: `${show.progress}%` }} />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5 text-[10px] text-white">
          {show.seasons}S
        </div>
      </div>
      <p className="text-sm font-medium mt-2 truncate">{show.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{show.episodes} eps</span>
        <span>•</span>
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-amber-400">{show.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default function ShowsTile() {
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'watching', label: 'Watching' },
    { id: 'completed', label: 'Completed' },
    { id: 'downloaded', label: 'Downloaded' },
  ];
  
  const filteredShows = mockShows.filter(show => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'watching') return show.progress > 0 && show.progress < 100;
    if (activeFilter === 'completed') return show.progress === 100;
    if (activeFilter === 'downloaded') return show.downloaded > 0;
    return true;
  });
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="shows-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-violet-400" />
            TV Shows
            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {mockShows.length} shows
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search TV shows..." 
            className="pl-9 h-9 bg-secondary/50 border-border"
          />
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
        
        {/* Shows Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredShows.map(show => (
              <ShowCard key={show.id} show={show} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredShows.map(show => (
              <ShowCard key={show.id} show={show} viewMode={viewMode} />
            ))}
          </div>
        )}
        
        {/* Continue Watching */}
        {mockShows.filter(s => s.progress > 0 && s.progress < 100).length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">CONTINUE WATCHING</p>
            <div className="flex gap-2 overflow-x-auto">
              {mockShows.filter(s => s.progress > 0 && s.progress < 100).slice(0, 3).map(show => (
                <div key={show.id} className="flex-shrink-0 w-28">
                  <div className={`aspect-video rounded bg-gradient-to-br ${show.poster} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white/70" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div className="h-full bg-primary" style={{ width: `${show.progress}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-medium mt-1 truncate">{show.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Stats Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{mockShows.reduce((acc, s) => acc + s.downloaded, 0)} episodes downloaded</span>
          <span>Last sync: 1h ago</span>
        </div>
      </CardContent>
    </Card>
  );
}
