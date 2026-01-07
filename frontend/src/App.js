import React, { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Dashboard />
      <Toaster />
    </div>
  );
}
