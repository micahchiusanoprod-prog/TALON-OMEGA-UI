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

export default function Dashboard() {
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
      <Header metrics={metrics} health={health} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 space-y-8">
        {/* Hero Search */}
        <div className="animate-fade-in">
          <SearchBar />
        </div>

        {/* GPS Map */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <GPSMap gpsData={gps} />
        </div>

        {/* Entertainment */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <EntertainmentSection />
        </div>

        {/* Community & Quality of Life */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CommunitySection />
          <QualityOfLifeSection />
        </div>
      </main>

      {/* Diagnostics Button (bottom right corner) */}
      {config.features.enableDiagnostics && (
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="fixed bottom-6 right-6 glass p-3 rounded-full hover:glass-strong transition-smooth glow-cyan"
          title="Diagnostics"
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
