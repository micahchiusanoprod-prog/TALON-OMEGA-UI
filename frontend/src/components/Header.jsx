import React, { useMemo } from 'react';
import { Sun, Moon, Server } from 'lucide-react';
import config from '../config';
import { toast } from 'sonner';

export default function Header({ metrics, health, theme, onToggleTheme }) {
  // Derive device status from health
  const deviceStatus = useMemo(() => {
    if (!health) {
      return { label: 'Unknown', color: 'bg-muted text-muted-foreground', dotColor: 'status-degraded' };
    }
    
    if (health.status === 'up') {
      return { label: 'Up', color: 'bg-success-light text-success', dotColor: 'status-healthy' };
    } else if (health.status === 'degraded') {
      return { label: 'Degraded', color: 'bg-warning-light text-warning', dotColor: 'status-degraded' };
    } else {
      return { label: 'Down', color: 'bg-destructive-light text-destructive', dotColor: 'status-down' };
    }
  }, [health]);

  const openKiwix = () => {
    window.open(config.endpoints.kiwix, '_blank');
  };

  // Check if header would be too cluttered (mobile/tablet)
  const [useCompactHeader, setUseCompactHeader] = React.useState(false);

  React.useEffect(() => {
    const checkWidth = () => {
      setUseCompactHeader(window.innerWidth < 1024);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

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
              <div className={`status-dot ${deviceStatus.dotColor}`} />
            </div>
          </div>

          {/* Center: Metrics Pills (desktop only, or compact on mobile) */}
          {!useCompactHeader && (
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {/* Device Status - Priority 1 */}
              <div className={`metric-pill ${deviceStatus.color}`}>
                <span className="font-semibold">{deviceStatus.label}</span>
              </div>
              
              {/* CPU % - Priority 2 */}
              {metrics && metrics.cpu !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">CPU</span>
                  <span className="font-semibold">{metrics.cpu}%</span>
                </div>
              )}
              
              {/* CPU Temp - Priority 3 */}
              {metrics && metrics.temp !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">Temp</span>
                  <span className="font-semibold">{metrics.temp}°C</span>
                </div>
              )}
              
              {/* RAM % - Priority 4 */}
              {metrics && metrics.ram !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">RAM</span>
                  <span className="font-semibold">{metrics.ram}%</span>
                </div>
              )}
              
              {/* Disk % - Priority 5 */}
              {metrics && metrics.disk !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">Disk</span>
                  <span className="font-semibold">{metrics.disk}%</span>
                </div>
              )}
            </div>
          )}

          {/* Mobile: Show only status and temp */}
          {useCompactHeader && (
            <div className="flex md:hidden items-center gap-2">
              <div className={`metric-pill ${deviceStatus.color}`}>
                <span className="font-semibold text-xs">{deviceStatus.label}</span>
              </div>
              {metrics && metrics.temp !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground text-xs">Temp</span>
                  <span className="font-semibold text-xs">{metrics.temp}°C</span>
                </div>
              )}
            </div>
          )}

          {/* Right: Quick Actions with improved depth */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="glass px-3 py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={openKiwix}
              className="glass px-3 py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm"
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
