import React, { useState, useEffect } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import AllyCommunicationsHub from './AllyCommunicationsHub';
import EnvironmentTile from './EnvironmentTile';
import DeviceInfoTile from './DeviceInfoTile';
import HotspotTile from './HotspotTile';
import DiagnosticsPanel from './DiagnosticsPanel';
import CameraTile from './CameraTile';
import SecurityTile from './SecurityTile';
import MusicTile from './MusicTile';
import PowerTile from './PowerTile';
import CommunityTile from './CommunityTile';
import QuickToolsBar from './QuickToolsBar';
import OmegaNetflixTile from './OmegaNetflixTile';
import MoviesTile from './MoviesTile';
import ShowsTile from './ShowsTile';
import GamesTile from './GamesTile';
import { Film, Tv, Gamepad2, Music } from 'lucide-react';
import api from '../services/api';
import config from '../config';
export default function Dashboard() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="min-h-screen">
      <Header onDiagnosticsClick={() => setShowDiagnostics(true)} />
      
      <main className="container mx-auto px-4 pb-8 pt-20 max-w-[1600px] space-y-2">
        
        {/* ===== QUICK TOOLS (ALWAYS VISIBLE AT TOP) ===== */}
        <section className="animate-fade-in">
          <QuickToolsBar />
        </section>

        {/* ===== SEARCH BAR ===== */}
        <section className="animate-fade-in pt-2" style={{ animationDelay: '50ms' }}>
          <SearchBar />
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
          {/* Environment & Device Info side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EnvironmentTile />
            <DeviceInfoTile />
          </div>
          {/* Hotspot & Power side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HotspotTile />
            <PowerTile />
          </div>
        </section>

        {/* ===== TOOLS & MEDIA SECTION ===== */}
        <section className="animate-fade-in pt-6 space-y-4" style={{ animationDelay: '300ms' }}>
          {/* Camera & Security side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CameraTile />
            <SecurityTile />
          </div>
          <MusicTile />
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
