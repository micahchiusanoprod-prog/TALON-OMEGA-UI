import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Settings, BookOpen, BarChart3, Users, HelpCircle, Shield, Sparkles, MoreHorizontal, X } from 'lucide-react';
import config from '../config';
import { toast } from 'sonner';
import AdminConsole from './AdminConsole';
import HelpCenter from './HelpCenter';
import LogsAnalytics from './LogsAnalytics';
import CommunityHub from './CommunityHub';
import LanguageSelector from './LanguageSelector';
import { ConnectionStatusChip } from './DataStateIndicators';
import SystemStatusPanel, { SystemStatusButton } from './SystemStatusPanel';
import { useLanguage } from '../contexts/LanguageContext';

export default function Header({ metrics, health, theme, onToggleTheme }) {
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive device status from health
  const deviceStatus = useMemo(() => {
    if (!health) {
      return { label: t('status.unknown'), color: 'bg-muted text-muted-foreground', dotColor: 'status-degraded' };
    }
    
    if (health.status === 'up') {
      return { label: t('status.up'), color: 'bg-success-light text-success', dotColor: 'status-healthy' };
    } else if (health.status === 'degraded') {
      return { label: 'Degraded', color: 'bg-warning-light text-warning', dotColor: 'status-degraded' };
    } else {
      return { label: t('status.down'), color: 'bg-destructive-light text-destructive', dotColor: 'status-down' };
    }
  }, [health, t]);

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
          {/* Left: Logo, Subtitle & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  OMEGA
                </div>
                <div className={`status-dot ${deviceStatus.dotColor}`} title={`System Status: ${deviceStatus.label}`} />
              </div>
              {/* OMEGA Acronym Subtitle */}
              <span className="text-[9px] sm:text-[10px] text-muted-foreground tracking-wider uppercase leading-none hidden sm:block">
                {t('header.subtitle')}
              </span>
            </div>
            {/* Connection Status Chip - Desktop */}
            {!useCompactHeader && (
              <ConnectionStatusChip className="hidden lg:flex" />
            )}
          </div>

          {/* Center: LOGS Button + Community Button + Help Center Button + Metrics Pills (desktop) */}
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
                <span className="text-sm font-semibold">{t('nav.logs')}</span>
              </button>
              
              {/* Community Button - Premium */}
              <button
                onClick={() => setShowCommunity(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 hover:from-violet-500/30 hover:to-fuchsia-500/30 hover:border-violet-500/50 transition-all shadow-sm"
                title="Open Community Hub"
                data-testid="community-btn"
              >
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold">{t('nav.community')}</span>
              </button>
              
              {/* Help Center Button - Centered & Premium */}
              <button
                onClick={() => setShowHelpCenter(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:from-primary/30 hover:to-accent/30 hover:border-primary/50 transition-all shadow-sm"
                title="Open Help Center"
                data-testid="help-center-btn"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{t('nav.helpCenter')}</span>
              </button>
              
              {/* CPU % - Priority 1 */}
              {metrics && metrics.cpu !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">{t('metrics.cpu')}</span>
                  <span className="font-semibold">{metrics.cpu}%</span>
                </div>
              )}
              
              {/* CPU Temp - Priority 3 */}
              {metrics && metrics.temp !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">{t('metrics.temp')}</span>
                  <span className="font-semibold">{metrics.temp}°C</span>
                </div>
              )}
              
              {/* RAM % - Priority 4 */}
              {metrics && metrics.ram !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">{t('metrics.ram')}</span>
                  <span className="font-semibold">{metrics.ram}%</span>
                </div>
              )}
              
              {/* Disk % - Priority 5 */}
              {metrics && metrics.disk !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground">{t('metrics.disk')}</span>
                  <span className="font-semibold">{metrics.disk}%</span>
                </div>
              )}
            </div>
          )}

          {/* Mobile: LOGS + Community + Help Center Button + Temp */}
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
                <span className="text-xs font-semibold">{t('nav.logs')}</span>
              </button>
              
              {/* Community Button - Mobile */}
              <button
                onClick={() => setShowCommunity(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 hover:border-violet-500/50 transition-all"
                title="Open Community Hub"
                data-testid="community-btn-mobile"
              >
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold">{t('nav.community')}</span>
              </button>
              
              {/* Help Center Button - Mobile */}
              <button
                onClick={() => setShowHelpCenter(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all"
                title="Open Help Center"
                data-testid="help-center-btn-mobile"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">{t('nav.help')}</span>
              </button>
              
              {metrics && metrics.temp !== null && (
                <div className="metric-pill hover:bg-secondary">
                  <span className="text-muted-foreground text-xs">{t('metrics.temp')}</span>
                  <span className="font-semibold text-xs">{metrics.temp}°C</span>
                </div>
              )}
            </div>
          )}

          {/* Right: Language + Connection + System Status + Admin + Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector */}
            <LanguageSelector compact={useCompactHeader} />
            
            {/* Connection Status - Mobile */}
            {useCompactHeader && (
              <ConnectionStatusChip className="hidden xs:flex" />
            )}
            
            {/* System Status Button */}
            <SystemStatusButton onClick={() => setShowSystemStatus(true)} />
            
            {/* Admin Console Button - Clear text label */}
            <button
              onClick={() => setShowAdminConsole(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-500/50 transition-all shadow-sm"
              title="Open Admin Console - Manage fleet, broadcasts, and system settings"
              data-testid="admin-console-btn"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-semibold">{t('nav.adminConsole')}</span>
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="glass px-2.5 sm:px-3 py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm flex items-center gap-1.5"
              title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{t('theme.light')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{t('theme.dark')}</span>
                </>
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
    
    {/* Help Center */}
    <HelpCenter
      isOpen={showHelpCenter}
      onClose={() => setShowHelpCenter(false)}
    />
    
    {/* LOGS Analytics */}
    <LogsAnalytics
      isOpen={showLogs}
      onClose={() => setShowLogs(false)}
    />
    
    {/* Community Hub */}
    <CommunityHub
      isOpen={showCommunity}
      onClose={() => setShowCommunity(false)}
    />
    
    {/* System Status Panel */}
    <SystemStatusPanel
      isOpen={showSystemStatus}
      onClose={() => setShowSystemStatus(false)}
    />
  </>
  );
}
