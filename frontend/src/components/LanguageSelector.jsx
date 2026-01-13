import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';

// ============================================================
// LANGUAGE SELECTOR - Global Language Switcher
// ============================================================

export default function LanguageSelector({ className = '', compact = false }) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Include "More soon" placeholder
  const displayLanguages = [
    ...LANGUAGES,
    { code: 'more', label: 'More soon...', flag: '🌐', disabled: true },
  ];

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors ${
          compact ? 'text-xs' : 'text-sm'
        }`}
        title={t('nav.language')}
        data-testid="language-selector"
      >
        <Globe className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-muted-foreground`} />
        {!compact && (
          <>
            <span className="text-muted-foreground hidden sm:inline">{t('nav.language')}:</span>
            <span className="font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
          </>
        )}
        {compact && (
          <span className="font-medium">{currentLanguage.flag}</span>
        )}
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-1 w-44 glass rounded-xl border border-border shadow-xl z-50 overflow-hidden"
          data-testid="language-dropdown"
        >
          <div className="p-1">
            {displayLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  if (!lang.disabled) {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }
                }}
                disabled={lang.disabled}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  lang.disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : language === lang.code
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-secondary text-foreground'
                }`}
                data-testid={`language-option-${lang.code}`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {language === lang.code && !lang.disabled && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
