import React, { useState, useRef, useEffect } from 'react';
import { Search, Book, FileText, Users, Terminal, Command } from 'lucide-react';
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
          className={`rounded-2xl transition-all duration-300 ${
            isFocused 
              ? 'ring-2 ring-primary shadow-lg shadow-primary/20' 
              : 'shadow-md'
          }`}
          style={{
            background: 'rgba(30, 35, 45, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: isFocused ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search Kiwix, files, or commands..."
              className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground/70"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
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
          className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-50 animate-fade-in"
          style={{
            background: 'rgba(25, 30, 40, 0.95)',
            backdropFilter: 'blur(24px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="p-2">
            {SEARCH_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(6, 182, 212, 0.1)' }}
                  >
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {category.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
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
