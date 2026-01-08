import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Play,
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
  Download
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

// Featured hero content
const featuredContent = {
  title: 'Survival Protocol',
  type: 'Series',
  year: '2024',
  rating: 8.9,
  description: 'In a world where communication has collapsed, a group of preppers must navigate survival.',
  gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  progress: 65
};

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
  // Music
  { id: 'a1', title: 'Road Warriors', type: 'album', artist: 'Dust Storm', tracks: 12, gradient: 'from-pink-500 to-rose-500' },
  { id: 'a2', title: 'Silent Frequencies', type: 'album', artist: 'Radio Ghost', tracks: 10, gradient: 'from-cyan-500 to-blue-500' },
  { id: 'a3', title: 'Campfire Sessions', type: 'album', artist: 'Acoustic Drift', tracks: 8, gradient: 'from-orange-500 to-amber-500' },
  { id: 'a4', title: 'Digital Decay', type: 'album', artist: 'Neon Collapse', tracks: 14, gradient: 'from-purple-500 to-pink-500' },
];

const ContentCard = ({ item, size = 'normal' }) => {
  const isGame = item.type === 'game';
  const isAlbum = item.type === 'album';
  const isShow = item.type === 'show';
  
  const TypeIcon = isGame ? Gamepad2 : isAlbum ? Music : isShow ? Tv : Film;
  
  return (
    <div className="group cursor-pointer">
      <div className={`${size === 'small' ? 'aspect-square' : isShow ? 'aspect-video' : 'aspect-[2/3]'} rounded-xl bg-gradient-to-br ${item.gradient} relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.02]`}>
        <TypeIcon className="absolute inset-0 m-auto w-8 h-8 text-white/20" />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
            <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-white flex items-center justify-center shadow-xl">
              <Play className="w-5 h-5 text-gray-900 ml-0.5" />
            </div>
          </div>
        </div>
        
        {/* Progress bar for shows */}
        {isShow && item.progress > 0 && item.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-white" style={{ width: `${item.progress}%` }} />
          </div>
        )}
        
        {/* Downloaded badge */}
        {item.downloaded && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 rounded-full p-1.5 shadow-md">
            <Download className="w-3 h-3 text-emerald-500" />
          </div>
        )}
        
        {/* Type badge */}
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

export default function EntertainmentTile() {
  const [activeSection, setActiveSection] = useState('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" data-testid="entertainment-tile">
      {/* Vibrant Header */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 to-emerald-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTItMi00LTItNC0yczItMiAyLTRjMC0yLTItNC0yLTRzMi0yIDQtMmMyLTIgNC0yIDQtMnMtMiAyLTIgNGMwIDIgMiA0IDIgNHMtMiAyLTQgMmMtMiAyLTQgMi00IDJzMi0yIDItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Entertainment</h2>
                <p className="text-white/80 text-sm">Movies • Shows • Games • Music</p>
              </div>
            </div>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm gap-2">
              <Shuffle className="w-4 h-4" />
              Surprise Me
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Film, label: 'Movies', count: 24, color: 'bg-red-500/30' },
              { icon: Tv, label: 'Shows', count: 12, color: 'bg-violet-500/30' },
              { icon: Gamepad2, label: 'Games', count: 6, color: 'bg-green-500/30' },
              { icon: Music, label: 'Albums', count: 18, color: 'bg-cyan-500/30' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} backdrop-blur-sm rounded-xl p-3 text-center`}>
                <stat.icon className="w-5 h-5 mx-auto mb-1 text-white" />
                <p className="text-lg font-bold text-white">{stat.count}</p>
                <p className="text-[10px] text-white/70 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search entertainment..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-slate-100 dark:bg-slate-800/50 border-0 rounded-xl"
            />
          </div>
        </div>
        
        {/* Section Tabs - Vibrant Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredContent.slice(0, 8).map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
        
        {/* See All Button */}
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-full px-6 gap-2 border-2">
            View All {activeSection === 'all' ? 'Content' : sections.find(s => s.id === activeSection)?.label}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
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
