import React, { useMemo, useState } from 'react';
import { Sun, Moon, Settings, HelpCircle, BookOpen, BarChart3 } from 'lucide-react';
import config from '../config';
import { toast } from 'sonner';
import AdminConsole from './AdminConsole';
import FAQPage from './FAQPage';
import HelpCenter from './HelpCenter';
import LogsAnalytics from './LogsAnalytics';

export default function Header({ metrics, health, theme, onToggleTheme }) {
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
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
  <>
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Status */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OMEGA
              </div>
              <div className={`status-dot ${deviceStatus.dotColor}`} title={`System Status: ${deviceStatus.label}`} />
            </div>
          </div>

          {/* Center: LOGS Button + Help Center Button + Metrics Pills (desktop) */}
          {!useCompactHeader && (
            <div className="hidden md:flex items-center gap-3 flex-wrap">
              {/* LOGS Button - Premium */}
              <button
                onClick={() => setShowLogs(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-500/50 transition-all shadow-sm"
                title="Open LOGS Analytics"
                data-testid="logs-btn"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">LOGS</span>
              </button>
              
              {/* Help Center Button - Centered & Premium */}
              <button
                onClick={() => setShowHelpCenter(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:from-primary/30 hover:to-accent/30 hover:border-primary/50 transition-all shadow-sm"
                title="Open Help Center"
                data-testid="help-center-btn"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Help Center</span>
              </button>
              
              {/* CPU % - Priority 1 */}
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

          {/* Mobile: LOGS + Help Center Button + Temp */}
          {useCompactHeader && (
            <div className="flex md:hidden items-center gap-2">
              {/* LOGS Button - Mobile */}
              <button
                onClick={() => setShowLogs(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                title="Open LOGS Analytics"
                data-testid="logs-btn-mobile"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold">LOGS</span>
              </button>
              
              {/* Help Center Button - Mobile */}
              <button
                onClick={() => setShowHelpCenter(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all"
                title="Open Help Center"
                data-testid="help-center-btn-mobile"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Help</span>
              </button>
              
              {metrics && metrics.temp !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground text-xs">Temp</span>
                  <span className="font-semibold text-xs">{metrics.temp}°C</span>
                </div>
              )}
            </div>
          )}

          {/* Right: Quick Actions with improved depth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowFAQ(true)}
              className="glass px-2 sm:px-3 py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm flex items-center gap-1.5"
              title="Help & FAQ"
              data-testid="faq-btn"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">FAQ</span>
            </button>
            <button
              onClick={() => setShowAdminConsole(true)}
              className="glass px-2 sm:px-3 py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm"
              title="Admin Console"
              data-testid="admin-console-btn"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleTheme}
              className="glass px-2 sm:px-3 py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
    
    {/* Admin Console Modal - Rendered outside header to avoid stacking context issues */}
    <AdminConsole 
      isOpen={showAdminConsole} 
      onClose={() => setShowAdminConsole(false)} 
    />
    
    {/* FAQ Page */}
    {showFAQ && (
      <FAQPage onClose={() => setShowFAQ(false)} />
    )}
    
    {/* Help Center */}
    <HelpCenter
      isOpen={showHelpCenter}
      onClose={() => setShowHelpCenter(false)}
    />
  </>
  );
}
