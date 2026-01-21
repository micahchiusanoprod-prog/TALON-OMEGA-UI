import React, { useState, useEffect } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import AllyCommunicationsHub from './AllyCommunicationsHub';
import EnvironmentTile from './EnvironmentTile';
import DeviceInfoTile from './DeviceInfoTile';
import WeatherTile from './WeatherTile';
import HotspotTile from './HotspotTile';
import DiagnosticsPanel from './DiagnosticsPanel';
import CameraTile from './CameraTile';
import SecurityTile from './SecurityTile';
import PowerTile from './PowerTile';
import CommunityTile from './CommunityTile';
import QuickToolsBar from './QuickToolsBar';
import QuickAccessPanel from './QuickAccessPanel';
import EntertainmentTile from './EntertainmentTile';
import api from '../services/api';
import config from '../config';
export default function Dashboard({ theme, onToggleTheme }) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);

  // Quick Access handlers
  const handleOpenKiwix = () => {
    window.open('/kiwix/', '_blank');
  };
  
  const handleOpenHotspot = () => {
    // Scroll to hotspot tile or open help
    const hotspotTile = document.getElementById('hotspot-tile');
    if (hotspotTile) {
      hotspotTile.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleOpenStatus = () => {
    setShowDiagnostics(true);
  };
  
  const handleOpenComms = () => {
    // Scroll to communications hub
    const commsHub = document.getElementById('ally-communications-hub');
    if (commsHub) {
      commsHub.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header theme={theme} onToggleTheme={onToggleTheme} onDiagnosticsClick={() => setShowDiagnostics(true)} />
      
      <main className="container mx-auto px-4 pb-8 pt-20 max-w-[1600px] space-y-2">
        
        {/* ===== SHTF QUICK ACCESS PANEL (FIRST SCREEN) ===== */}
        <section className="animate-fade-in relative z-30 mb-4">
          <div className="max-w-4xl mx-auto">
            <QuickAccessPanel 
              onOpenKiwix={handleOpenKiwix}
              onOpenHotspot={handleOpenHotspot}
              onOpenStatus={handleOpenStatus}
              onOpenComms={handleOpenComms}
            />
          </div>
        </section>
        
        {/* ===== QUICK TOOLS & SEARCH (CENTERED TOGETHER) ===== */}
        <section className="animate-fade-in relative z-20">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Quick Tools - Above Search */}
            <div className="flex justify-center relative z-20">
              <QuickToolsBar />
            </div>
            
            {/* Search Bar */}
            <SearchBar />
          </div>
        </section>

        {/* ===== COMMUNICATIONS SECTION ===== */}
        <section className="animate-fade-in pt-6" style={{ animationDelay: '100ms' }}>
          <AllyCommunicationsHub />
        </section>

        {/* ===== COMMUNITY SECTION (Under Ally Hub - Full Width) ===== */}
        <section className="animate-fade-in pt-6" style={{ animationDelay: '150ms' }}>
          <CommunityTile />
        </section>

        {/* ===== SYSTEM STATUS SECTION ===== */}
        <section className="animate-fade-in pt-6 space-y-4" style={{ animationDelay: '200ms' }}>
          {/* Environment, Device Info & Weather - Stacked full width */}
          <div className="space-y-4">
            <EnvironmentTile />
            <DeviceInfoTile />
            <WeatherTile />
          </div>
          {/* Hotspot & Power side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HotspotTile />
            <PowerTile />
          </div>
        </section>

        {/* ===== SECURITY SECTION ===== */}
        <section className="animate-fade-in pt-6 space-y-4" style={{ animationDelay: '300ms' }}>
          {/* Camera & Security side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CameraTile />
            <SecurityTile />
          </div>
        </section>

        {/* ===== ENTERTAINMENT SECTION ===== */}
        <section className="animate-fade-in pt-10" style={{ animationDelay: '350ms' }}>
          {/* Section Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="text-lg font-bold text-muted-foreground flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              Entertainment
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <EntertainmentTile />
        </section>

      </main>

      {/* Diagnostics Panel Modal */}
      {showDiagnostics && (
        <DiagnosticsPanel
          onClose={() => setShowDiagnostics(false)}
        />
      )}
    </div>
  );
}
