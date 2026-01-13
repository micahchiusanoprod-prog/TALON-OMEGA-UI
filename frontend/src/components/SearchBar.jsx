import React, { useState, useRef, useEffect } from 'react';
import { Search, Book, FileText, Users, Terminal, Command, Info } from 'lucide-react';
import { Card } from './ui/card';
import config from '../config';

const SEARCH_CATEGORIES = [
  { id: 'kiwix', label: 'Offline Knowledge (Kiwix)', icon: Book, hint: 'Search Wikipedia, medical guides, how-to articles' },
  { id: 'files', label: 'Files & Documents', icon: FileText, hint: 'Find shared files, maps, and documents' },
  { id: 'community', label: 'People & Teams', icon: Users, hint: 'Find community members by name or skill' },
  { id: 'commands', label: 'Commands & Tools', icon: Terminal, hint: 'Run system commands and quick actions' },
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '/' && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowResults(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFocused]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check for special commands
    if (query.toLowerCase().startsWith('kiwix:')) {
      const searchTerm = query.slice(6).trim();
      window.open(`${config.endpoints.kiwix}/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
      return;
    }

    if (query.toLowerCase().startsWith('open:')) {
      const target = query.slice(5).trim();
      if (target === 'kiwix') {
        window.open(config.endpoints.kiwix, '_blank');
        return;
      }
    }

    // Otherwise, show results panel
    setShowResults(true);
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'kiwix') {
      window.open(`${config.endpoints.kiwix}/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    setShowResults(false);
  };

  return (
    <div className="relative max-w-3xl mx-auto px-1 sm:px-0">
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`rounded-xl sm:rounded-2xl transition-all duration-300 search-bar-container ${
            isFocused 
              ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
              : 'shadow-md'
          } ${isFocused ? 'search-bar-focused' : ''}`}
        >
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4">
            <Search className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search Kiwix, files, or commands..."
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 min-w-0"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground rounded-lg flex-shrink-0 search-kbd"
            >
              <Command className="w-3 h-3" />
              /
            </kbd>
          </div>
        </div>
      </form>

      {/* Autosuggest Dropdown */}
      {(isFocused || showResults) && query.length > 0 && (
        <div 
          className="absolute top-full mt-2 w-full rounded-xl sm:rounded-2xl overflow-hidden z-50 animate-fade-in search-dropdown"
        >
          <div className="p-1.5 sm:p-2">
            {SEARCH_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-white/5 dark:hover:bg-white/5 transition-all text-left group search-result-item"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 search-icon-bg"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {category.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      Search for &ldquo;{query}&rdquo;
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
