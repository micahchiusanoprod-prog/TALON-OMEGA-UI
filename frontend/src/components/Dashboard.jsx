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
import { Activity, Radio, Shield, Zap, Users } from 'lucide-react';

// Section Header Component
const SectionHeader = ({ icon: Icon, label, color = 'text-primary' }) => (
  <div className="section-header">
    <div className="section-label flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span>{label}</span>
    </div>
    <div className="section-line" />
  </div>
);

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
        <section className="section-divider animate-fade-in" style={{ animationDelay: '100ms' }}>
          <SectionHeader icon={Radio} label="Communications" />
          <AllyCommunicationsHub />
        </section>

        {/* ===== COMMUNITY SECTION (Directly under Ally Hub) ===== */}
        <section className="section-divider-subtle animate-fade-in" style={{ animationDelay: '150ms' }}>
          <SectionHeader icon={Users} label="Community" />
          <CommunityTile />
        </section>

        {/* ===== SYSTEM STATUS SECTION ===== */}
        <section className="section-divider-subtle animate-fade-in" style={{ animationDelay: '200ms' }}>
          <SectionHeader icon={Activity} label="System Status" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EnvironmentTile />
            <DeviceInfoTile />
            <HotspotTile />
          </div>
        </section>

        {/* ===== TOOLS SECTION ===== */}
        <section className="section-divider-subtle animate-fade-in" style={{ animationDelay: '300ms' }}>
          <SectionHeader icon={Shield} label="Tools & Media" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CameraTile />
            <SecurityTile />
            <MusicTile />
          </div>
        </section>

        {/* ===== POWER SECTION ===== */}
        <section className="section-divider-subtle animate-fade-in" style={{ animationDelay: '400ms' }}>
          <SectionHeader icon={Zap} label="Power Management" />
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
