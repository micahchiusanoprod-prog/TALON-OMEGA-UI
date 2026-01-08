import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Film,
  Play,
  Star,
  Clock,
  Download,
  Search,
  HelpCircle,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Input } from './ui/input';

// Mock scraped movie data
const mockMovies = [
  { id: '1', title: 'Apocalypse Dawn', year: '2024', rating: 8.4, duration: '2h 18m', genre: 'Action', poster: 'from-red-600 to-orange-500', downloaded: true },
  { id: '2', title: 'Silent Earth', year: '2023', rating: 7.9, duration: '1h 52m', genre: 'Sci-Fi', poster: 'from-blue-600 to-cyan-500', downloaded: true },
  { id: '3', title: 'The Last Signal', year: '2024', rating: 8.1, duration: '2h 05m', genre: 'Thriller', poster: 'from-purple-600 to-pink-500', downloaded: false },
  { id: '4', title: 'Grid Down', year: '2023', rating: 7.5, duration: '1h 48m', genre: 'Drama', poster: 'from-green-600 to-teal-500', downloaded: true },
  { id: '5', title: 'Bunker Protocol', year: '2024', rating: 8.7, duration: '2h 22m', genre: 'Action', poster: 'from-amber-600 to-red-500', downloaded: false },
  { id: '6', title: 'Radio Silence', year: '2023', rating: 7.2, duration: '1h 38m', genre: 'Horror', poster: 'from-gray-700 to-gray-900', downloaded: true },
];

const MovieCard = ({ movie, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
        <div className={`w-12 h-16 rounded bg-gradient-to-br ${movie.poster} flex items-center justify-center flex-shrink-0`}>
          <Film className="w-5 h-5 text-white/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{movie.title}</p>
            {movie.downloaded && (
              <Download className="w-3 h-3 text-success flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{movie.year} • {movie.genre} • {movie.duration}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-amber-400">{movie.rating}</span>
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
      <div className={`aspect-[2/3] rounded-lg bg-gradient-to-br ${movie.poster} flex items-center justify-center relative overflow-hidden`}>
        <Film className="w-8 h-8 text-white/30" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Play className="w-10 h-10 text-white" />
        </div>
        {movie.downloaded && (
          <div className="absolute top-2 right-2 bg-success/90 rounded-full p-1">
            <Download className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <p className="text-sm font-medium mt-2 truncate">{movie.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{movie.year}</span>
        <span>•</span>
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-amber-400">{movie.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default function MoviesTile() {
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showHelp, setShowHelp] = useState(false);
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'downloaded', label: 'Downloaded' },
    { id: 'action', label: 'Action' },
    { id: 'scifi', label: 'Sci-Fi' },
  ];
  
  const filteredMovies = mockMovies.filter(movie => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'downloaded') return movie.downloaded;
    return movie.genre.toLowerCase() === activeFilter;
  });
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="movies-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-400" />
            Movies
            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {mockMovies.length} titles
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
              onClick={() => setShowHelp(!showHelp)}
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
            placeholder="Search movies..." 
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
        
        {/* Movies Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-3">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} viewMode={viewMode} />
            ))}
          </div>
        )}
        
        {/* Stats Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{mockMovies.filter(m => m.downloaded).length} downloaded</span>
          <span>Last sync: 2h ago</span>
        </div>
      </CardContent>
    </Card>
  );
}
