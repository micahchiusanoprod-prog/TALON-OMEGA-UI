import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Dashboard from './components/Dashboard';
import { LanguageProvider } from './contexts/LanguageContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('dark');

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('omega-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('omega-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <LanguageProvider>
      <ConnectionProvider>
        <div className="min-h-screen bg-background">
          <Dashboard theme={theme} onToggleTheme={toggleTheme} />
          <Toaster />
        </div>
      </ConnectionProvider>
    </LanguageProvider>
  );
}

