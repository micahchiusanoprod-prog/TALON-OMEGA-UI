import React, { useState, useRef, useEffect } from 'react';
import { Search, Book, FileText, Users, Terminal } from 'lucide-react';
import { Card } from './ui/card';
import config from '../config';

const SEARCH_CATEGORIES = [
  { id: 'kiwix', label: 'Offline Knowledge (Kiwix)', icon: Book },
  { id: 'files', label: 'Files / Assets', icon: FileText },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'commands', label: 'Commands / Tools', icon: Terminal },
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
    <div className="relative max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`glass-strong rounded-2xl p-2 transition-smooth ${
            isFocused ? 'ring-2 ring-primary glow-cyan' : ''
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <Search className="w-6 h-6 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search for files, commands, or help... (Press / to focus)"
              className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground glass rounded">
              /
            </kbd>
          </div>
        </div>
      </form>

      {/* Autosuggest Dropdown */}
      {(isFocused || showResults) && query.length > 0 && (
        <Card className="absolute top-full mt-2 w-full glass-strong border-border overflow-hidden z-50">
          <div className="p-2">
            {SEARCH_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-smooth text-left"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{category.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Search for "{query}" in {category.label.toLowerCase()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Search Tips */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs opacity-70">
            Quick tips: Type "kiwix: topic" to search offline knowledge, or "open: kiwix" to browse the library
          </p>
        </div>
      </div>
    </div>
  );
}
