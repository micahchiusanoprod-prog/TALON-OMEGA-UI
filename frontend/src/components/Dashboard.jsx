import React, { useState, useEffect } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import AllyCommunicationsHub from './AllyCommunicationsHub';
import EnvironmentTile from './EnvironmentTile';
import DeviceInfoTile from './DeviceInfoTile';
import HotspotTile from './HotspotTile';
import EntertainmentSection from './EntertainmentSection';
import CommunitySection from './CommunitySection';
import QualityOfLifeSection from './QualityOfLifeSection';
import DiagnosticsPanel from './DiagnosticsPanel';
import CameraTile from './CameraTile';
import SecurityTile from './SecurityTile';
import MusicTile from './MusicTile';
import HotkeysBar from './HotkeysBar';
import api from '../services/api';
import config from '../config';
import { Activity } from 'lucide-react';

export default function Dashboard({ theme, onToggleTheme }) {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState({});

  // Poll system metrics (real-time feel)
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
        setDiagnosticsData(prev => ({ ...prev, metrics: data }));
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, config.polling.metrics);
    return () => clearInterval(interval);
  }, []);

  // Poll health status
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setDiagnosticsData(prev => ({ ...prev, health: data }));
      } catch (error) {
        console.error('Failed to fetch health:', error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, config.polling.health);
    return () => clearInterval(interval);
  }, []);

  // Handle hotkey clicks
  const handleHotkeyClick = (hotkeyId) => {
    // For now, log the click - will wire to actual navigation/actions later
    console.log('Hotkey clicked:', hotkeyId);
    // Could scroll to sections, open modals, etc.
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <Header metrics={metrics} health={health} theme={theme} onToggleTheme={onToggleTheme} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 space-y-8">
        {/* Hotkeys Bar - QoL Quick Access */}
        <div className="animate-fade-in">
          <HotkeysBar onHotkeyClick={handleHotkeyClick} />
        </div>

        {/* Hero Search */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <SearchBar />
        </div>

        {/* Community */}
        <div className="animate-fade-in mt-12" style={{ animationDelay: '200ms' }}>
          <CommunitySection />
        </div>

        {/* Ally Communications Hub - Under Community */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <AllyCommunicationsHub />
        </div>

        {/* New Tiles Row: Camera, Security, Music */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <CameraTile />
          <SecurityTile />
          <MusicTile />
        </div>

        {/* Entertainment */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <EntertainmentSection />
        </div>

        {/* Environment, Device Info & Hotspot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <EnvironmentTile />
          <DeviceInfoTile />
          <HotspotTile />
        </div>
      </main>

      {/* Diagnostics Button (bottom right corner) */}
      {config.features.enableDiagnostics && (
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="fixed bottom-6 right-6 glass p-3 rounded-full hover:glass-strong transition-smooth glow-cyan z-[100]"
          title="Diagnostics"
          style={{ pointerEvents: 'auto' }}
        >
          <Activity className="w-5 h-5 text-primary" />
        </button>
      )}

      {/* Diagnostics Panel */}
      {showDiagnostics && (
        <DiagnosticsPanel
          data={diagnosticsData}
          onClose={() => setShowDiagnostics(false)}
        />
      )}
    </div>
  );
}
