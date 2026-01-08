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
import api from '../services/api';
import config from '../config';
export default function Dashboard() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="min-h-screen">
      <Header onDiagnosticsClick={() => setShowDiagnostics(true)} />
      
      <main className="container mx-auto px-4 pb-8 pt-20 max-w-7xl space-y-2">
        
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

        {/* ===== COMMUNITY SECTION (Directly under Ally Hub) ===== */}
        <section className="animate-fade-in pt-6" style={{ animationDelay: '150ms' }}>
          <CommunityTile />
        </section>

        {/* ===== SYSTEM STATUS SECTION ===== */}
        <section className="animate-fade-in pt-6" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnvironmentTile />
            <DeviceInfoTile />
            <HotspotTile />
          </div>
        </section>

        {/* ===== TOOLS SECTION ===== */}
        <section className="animate-fade-in pt-6" style={{ animationDelay: '300ms' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CameraTile />
            <SecurityTile />
            <MusicTile />
          </div>
        </section>

        {/* ===== POWER SECTION ===== */}
        <section className="animate-fade-in pt-6" style={{ animationDelay: '400ms' }}>
          <PowerTile />
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
