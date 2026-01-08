import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Play,
  Film,
  Tv,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  Shuffle,
  HelpCircle
} from 'lucide-react';

// Featured content for Omega Netflix
const featuredContent = {
  title: 'Survival Protocol',
  type: 'Series',
  year: '2024',
  rating: 8.9,
  description: 'In a world where communication has collapsed, a group of preppers must navigate survival while maintaining contact through amateur radio.',
  gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
  progress: 65,
  nextEp: 'S2 E4: Radio Silence'
};

const trendingContent = [
  { id: '1', title: 'Apocalypse Dawn', type: 'Movie', rating: 8.4, gradient: 'from-red-600 to-orange-500' },
  { id: '2', title: 'The Compound', type: 'Series', rating: 8.2, gradient: 'from-violet-600 to-purple-500' },
  { id: '3', title: 'Grid Down', type: 'Movie', rating: 7.5, gradient: 'from-amber-600 to-red-500' },
  { id: '4', title: 'Dark Winter', type: 'Series', rating: 8.8, gradient: 'from-slate-700 to-gray-900' },
];

const continueWatching = [
  { id: '1', title: 'Survival Protocol', episode: 'S2 E3', progress: 65, gradient: 'from-emerald-600 to-teal-500', timeLeft: '18m left' },
  { id: '2', title: 'Off Grid', episode: 'E3', progress: 45, gradient: 'from-amber-600 to-orange-500', timeLeft: '32m left' },
  { id: '3', title: 'Last Broadcast', episode: 'S1 E8', progress: 20, gradient: 'from-blue-600 to-indigo-500', timeLeft: '45m left' },
];

const quickCategories = [
  { id: 'action', label: 'Action', count: 12 },
  { id: 'survival', label: 'Survival', count: 8 },
  { id: 'documentary', label: 'Documentary', count: 15 },
  { id: 'thriller', label: 'Thriller', count: 10 },
];

export default function OmegaNetflixTile() {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <Card className="glass-strong border-border-strong overflow-hidden" data-testid="omega-netflix-tile">
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-r ${featuredContent.gradient} p-6`}>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-red-500 px-2 py-0.5 rounded text-white">OMEGA</span>
            <span className="text-xs font-medium text-white/80">NETFLIX</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{featuredContent.title}</h2>
          <div className="flex items-center gap-3 text-sm text-white/80 mb-3">
            <span>{featuredContent.type}</span>
            <span>•</span>
            <span>{featuredContent.year}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-400">{featuredContent.rating}</span>
            </div>
          </div>
          <p className="text-sm text-white/70 mb-4 line-clamp-2">{featuredContent.description}</p>
          
          <div className="flex items-center gap-3">
            <Button className="bg-white text-black hover:bg-white/90 font-semibold gap-2">
              <Play className="w-4 h-4 fill-black" />
              Continue
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
              <Shuffle className="w-4 h-4" />
              Random
            </Button>
          </div>
          
          {/* Progress indicator */}
          {featuredContent.progress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                <span>{featuredContent.nextEp}</span>
                <span>{featuredContent.progress}%</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${featuredContent.progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="space-y-5 pt-4">
        {/* Continue Watching */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Continue Watching
            </h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
              See All <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {continueWatching.map(item => (
              <div key={item.id} className="group cursor-pointer">
                <div className={`aspect-video rounded-lg bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                    <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div className="h-full bg-red-500" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
                <p className="text-xs font-medium mt-1.5 truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.episode} • {item.timeLeft}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trending */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              Trending Now
            </h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
              See All <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {trendingContent.map((item, index) => (
              <div key={item.id} className="flex-shrink-0 w-28 group cursor-pointer">
                <div className={`aspect-[2/3] rounded-lg bg-gradient-to-br ${item.gradient} relative overflow-hidden`}>
                  <div className="absolute top-2 left-2 bg-black/70 rounded px-1.5 py-0.5 text-xs font-bold text-white">
                    #{index + 1}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.type === 'Movie' ? (
                      <Film className="w-8 h-8 text-white/30" />
                    ) : (
                      <Tv className="w-8 h-8 text-white/30" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-xs font-medium mt-1.5 truncate">{item.title}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>{item.type}</span>
                  <span>•</span>
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400">{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Categories */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Browse by Category</h3>
          <div className="grid grid-cols-4 gap-2">
            {quickCategories.map(cat => (
              <button
                key={cat.id}
                className="glass rounded-lg p-3 text-center hover:bg-secondary/50 transition-colors"
              >
                <p className="text-xs font-medium">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground">{cat.count} titles</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3" /> 24 Movies
            </span>
            <span className="flex items-center gap-1">
              <Tv className="w-3 h-3" /> 12 Shows
            </span>
          </div>
          <span>45 downloaded • 128GB</span>
        </div>
      </CardContent>
    </Card>
  );
}
