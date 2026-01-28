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
  // Use 1200px breakpoint to accommodate longer translated text
  const [useCompactHeader, setUseCompactHeader] = React.useState(false);

  React.useEffect(() => {
    const checkWidth = () => {
      setUseCompactHeader(window.innerWidth < 1200);
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

          {/* Center: Primary Nav Buttons (desktop - only show above 1200px) */}
          {!useCompactHeader && (
            <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2 flex-1 justify-center min-w-0">
              {/* LOGS Button */}
              <button
                onClick={() => setShowLogs(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-500/50 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
                title="Open LOGS Analytics"
                data-testid="logs-btn"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs 2xl:text-sm font-semibold">{t('nav.logs')}</span>
              </button>
              
              {/* Community Button */}
              <button
                onClick={() => setShowCommunity(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 hover:from-violet-500/30 hover:to-fuchsia-500/30 hover:border-violet-500/50 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
                title="Open Community Hub"
                data-testid="community-btn"
              >
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-xs 2xl:text-sm font-semibold">{t('nav.community')}</span>
              </button>
              
              {/* Help Center Button */}
              <button
                onClick={() => setShowHelpCenter(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:from-primary/30 hover:to-accent/30 hover:border-primary/50 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
                title="Open Help Center"
                data-testid="help-center-btn"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs 2xl:text-sm font-semibold">{t('nav.helpCenter')}</span>
              </button>
              
              {/* Entertainment Button */}
              <button
                onClick={() => navigate('/entertainment')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 hover:from-pink-500/30 hover:to-orange-500/30 hover:border-pink-500/50 transition-all shadow-sm whitespace-nowrap flex-shrink-0 ${
                  location.pathname === '/entertainment' ? 'ring-2 ring-pink-500/50' : ''
                }`}
                title="Entertainment Hub"
                data-testid="entertainment-btn"
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-xs 2xl:text-sm font-semibold">Entertainment</span>
              </button>
              
              {/* Metrics Pills - Lower priority, hide on medium screens */}
              <div className="hidden 2xl:flex items-center gap-1.5 flex-shrink-0">
                {metrics && metrics.cpu !== null && (
                  <div className="metric-pill hover:bg-secondary whitespace-nowrap">
                    <span className="text-muted-foreground">{t('metrics.cpu')}</span>
                    <span className="font-semibold">{metrics.cpu}%</span>
                  </div>
                )}
                
                {metrics && metrics.temp !== null && (
                  <div className="metric-pill hover:bg-secondary whitespace-nowrap">
                    <span className="text-muted-foreground">{t('metrics.temp')}</span>
                    <span className="font-semibold">{metrics.temp}°C</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile: Primary Nav with Overflow Menu */}
          {useCompactHeader && (
            <div className="flex md:hidden items-center gap-1.5 relative">
              {/* Primary buttons - always visible */}
              <button
                onClick={() => setShowLogs(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 transition-all"
                title="Open LOGS Analytics"
                data-testid="logs-btn-mobile"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold">{t('nav.logs')}</span>
              </button>
              
              <button
                onClick={() => setShowCommunity(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 transition-all"
                title="Open Community Hub"
                data-testid="community-btn-mobile"
              >
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] font-semibold hidden xs:inline">{t('nav.community')}</span>
              </button>
              
              {/* Entertainment - visible on slightly larger mobile */}
              <button
                onClick={() => navigate('/entertainment')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 transition-all ${
                  location.pathname === '/entertainment' ? 'ring-2 ring-pink-500/50' : ''
                }`}
                title="Entertainment"
                data-testid="entertainment-btn-mobile"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[11px] font-semibold hidden xs:inline">Fun</span>
              </button>
              
              {/* Overflow Menu Button */}
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-all"
                title="More options"
                data-testid="overflow-menu-btn"
              >
                {showOverflowMenu ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
              </button>
              
              {/* Overflow Dropdown Menu */}
              {showOverflowMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in" data-testid="overflow-menu-dropdown">
                  <div className="p-1">
                    <button
                      onClick={() => { setShowHelpCenter(true); setShowOverflowMenu(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                      data-testid="overflow-help-center"
                    >
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{t('nav.helpCenter')}</span>
                    </button>
                    <button
                      onClick={() => { setShowAdminConsole(true); setShowOverflowMenu(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                      data-testid="overflow-admin-console"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium">{t('nav.adminConsole')}</span>
                    </button>
                    <div className="h-px bg-border my-1" />
                    {metrics && (
                      <div className="px-3 py-2 text-xs text-muted-foreground" data-testid="overflow-metrics">
                        <div className="flex justify-between mb-1">
                          <span>CPU</span>
                          <span className="font-medium text-foreground">{metrics.cpu}%</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Temp</span>
                          <span className="font-medium text-foreground">{metrics.temp}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RAM</span>
                          <span className="font-medium text-foreground">{metrics.ram}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right: Language + Connection + System Status + Admin + Theme */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
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
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-500/50 transition-all shadow-sm whitespace-nowrap flex-shrink-0"
              title="Open Admin Console - Manage fleet, broadcasts, and system settings"
              data-testid="admin-console-btn"
            >
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-semibold hidden sm:inline">{t('nav.adminConsole')}</span>
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="glass px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg hover:bg-secondary-hover transition-smooth text-sm font-medium shadow-sm flex items-center gap-1 whitespace-nowrap flex-shrink-0"
              title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
              data-testid="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">{t('theme.light')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">{t('theme.dark')}</span>
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
