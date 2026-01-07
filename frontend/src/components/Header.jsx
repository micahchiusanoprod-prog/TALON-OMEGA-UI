import React from 'react';
import { Wifi, WifiOff, Server, Sun, Moon } from 'lucide-react';
import config from '../config';
import api from '../services/api';
import { toast } from 'sonner';

export default function Header({ metrics, health, theme, onToggleTheme }) {
  const getStatusColor = () => {
    if (!health) return 'status-degraded';
    if (health.status === 'healthy') return 'status-healthy';
    if (health.status === 'degraded') return 'status-degraded';
    return 'status-down';
  };

  const handleToggleHotspot = async () => {
    try {
      const result = await api.toggleHotspot();
      if (result.success) {
        toast.success('Hotspot toggled successfully');
      } else {
        toast.error(result.message || 'Failed to toggle hotspot');
      }
    } catch (error) {
      toast.error('Hotspot service unavailable');
    }
  };

  const openKiwix = () => {
    window.open(config.endpoints.kiwix, '_blank');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OMEGA
              </div>
              <div className={`status-dot ${getStatusColor()}`} />
            </div>
          </div>

          {/* Center: Metrics Pills */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            {metrics && (
              <>
                <div className="metric-pill">
                  <span className="text-muted-foreground">CPU</span>
                  <span className="text-foreground font-semibold">{metrics.cpu}%</span>
                </div>
                <div className="metric-pill">
                  <span className="text-muted-foreground">RAM</span>
                  <span className="text-foreground font-semibold">{metrics.ram}%</span>
                </div>
                <div className="metric-pill">
                  <span className="text-muted-foreground">Disk</span>
                  <span className="text-foreground font-semibold">{metrics.disk}%</span>
                </div>
                <div className="metric-pill">
                  <span className="text-muted-foreground">Temp</span>
                  <span className="text-foreground font-semibold">{metrics.temperature}°C</span>
                </div>
              </>
            )}
            {health && (
              <>
                <div className="metric-pill">
                  {metrics?.network?.mode === 'hotspot' ? (
                    <Wifi className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-foreground font-semibold">
                    {metrics?.network?.mode === 'hotspot' ? 'Hotspot' : 'Client'}
                  </span>
                </div>
                <div className="metric-pill">
                  <Server className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground font-semibold capitalize">
                    {health.services?.kiwix || 'Unknown'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="glass px-4 py-2 rounded-lg hover:glass-strong transition-smooth text-sm font-medium"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleToggleHotspot}
              className="glass px-4 py-2 rounded-lg hover:glass-strong transition-smooth text-sm font-medium"
              title="Toggle Hotspot"
            >
              <Wifi className="w-4 h-4" />
            </button>
            <button
              onClick={openKiwix}
              className="glass px-4 py-2 rounded-lg hover:glass-strong transition-smooth text-sm font-medium"
              title="Open Kiwix Library"
            >
              <Server className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
