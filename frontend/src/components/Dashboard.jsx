import React, { useState, useEffect } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import GPSMap from './GPSMap';
import EntertainmentSection from './EntertainmentSection';
import CommunitySection from './CommunitySection';
import QualityOfLifeSection from './QualityOfLifeSection';
import DiagnosticsPanel from './DiagnosticsPanel';
import api from '../services/api';
import config from '../config';
import { Activity } from 'lucide-react';

export default function Dashboard({ theme, onToggleTheme }) {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [gps, setGps] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState({});

  // Poll system metrics
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

  // Poll GPS
  useEffect(() => {
    const fetchGPS = async () => {
      try {
        const data = await api.getGPS();
        setGps(data);
        setDiagnosticsData(prev => ({ ...prev, gps: data }));
      } catch (error) {
        console.error('Failed to fetch GPS:', error);
      }
    };

    fetchGPS();
    const interval = setInterval(fetchGPS, config.polling.gps);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <Header metrics={metrics} health={health} theme={theme} onToggleTheme={onToggleTheme} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 space-y-8">
        {/* Quality of Life - Minimal Compact Version */}
        <div className="animate-fade-in">
          <QualityOfLifeSection compact />
        </div>

        {/* Hero Search */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <SearchBar />
        </div>

        {/* Community */}
        <div className="animate-fade-in mt-12" style={{ animationDelay: '200ms' }}>
          <CommunitySection />
        </div>

        {/* Entertainment */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <EntertainmentSection />
        </div>

        {/* GPS Map */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <GPSMap gpsData={gps} />
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
