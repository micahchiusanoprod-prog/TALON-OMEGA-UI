// ============================================================
// Quick Access Panel - SHTF First-Screen Access
// ============================================================
// Large buttons for immediate access to critical functions
// Goal: First-time user finds Kiwix, hotspot, status in <10 seconds
//
// Production Pi endpoints:
// - /api/cgi-bin/health.py → {status:"ok"}
// - /kiwix/ → HTML (Kiwix homepage)

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Wifi, 
  Activity, 
  Radio, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

// System health states (LOCAL service based, not WAN)
const SYSTEM_STATE = {
  LOCAL_OK: 'LOCAL_OK',             // All local services responding
  LOCAL_DEGRADED: 'LOCAL_DEGRADED', // Some services down
  LOCAL_DOWN: 'LOCAL_DOWN',         // All local services unreachable
  CHECKING: 'CHECKING',
  UNKNOWN: 'UNKNOWN'
};

const QuickAccessPanel = ({ 
  onOpenKiwix, 
  onOpenHotspot, 
  onOpenStatus, 
  onOpenComms,
  className = ''
}) => {
  const [systemState, setSystemState] = useState(SYSTEM_STATE.UNKNOWN);
  const [serviceStatus, setServiceStatus] = useState({ api: null, kiwix: null });
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  
  // Check local system health (WAN-independent)
  const checkLocalHealth = useCallback(async () => {
    setIsChecking(true);
    const results = { api: false, kiwix: false };
    
    // Check API health endpoint
    try {
      const apiResponse = await fetch('/api/cgi-bin/health.py', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        results.api = data.status === 'ok' || data.ok === true;
      }
    } catch (e) {
      console.log('[QuickAccess] API health check failed:', e.message);
      results.api = false;
    }
    
    // Check Kiwix availability (just needs to respond)
    try {
      const kiwixResponse = await fetch('/kiwix/', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      results.kiwix = kiwixResponse.ok || kiwixResponse.status === 200;
    } catch (e) {
      console.log('[QuickAccess] Kiwix check failed:', e.message);
      results.kiwix = false;
    }
    
    // Update global state for other components
    if (typeof window !== 'undefined') {
      window.OMEGA_SYSTEM_STATE = {
        api: results.api,
        kiwix: results.kiwix,
        lastCheck: Date.now(),
        state: results.api && results.kiwix ? 'LOCAL_OK' :
               results.api || results.kiwix ? 'LOCAL_DEGRADED' : 'LOCAL_DOWN'
      };
    }
    
    setServiceStatus(results);
    setLastCheck(new Date());
    
    // Determine overall state
    if (results.api && results.kiwix) {
      setSystemState(SYSTEM_STATE.LOCAL_OK);
    } else if (results.api || results.kiwix) {
      setSystemState(SYSTEM_STATE.LOCAL_DEGRADED);
    } else {
      setSystemState(SYSTEM_STATE.LOCAL_DOWN);
    }
    
    setIsChecking(false);
  }, []);
  
  // Check health on mount and periodically
  useEffect(() => {
    checkLocalHealth();
    const interval = setInterval(checkLocalHealth, 30000);
    return () => clearInterval(interval);
  }, [checkLocalHealth]);
  
  const getStateConfig = () => {
    if (isChecking) {
      return { icon: RefreshCw, text: 'Checking...', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    }
    switch (systemState) {
      case SYSTEM_STATE.LOCAL_OK:
        return { icon: CheckCircle, text: 'All Systems OK', color: 'text-green-400', bg: 'bg-green-500/10' };
      case SYSTEM_STATE.LOCAL_DEGRADED:
        return { icon: AlertTriangle, text: 'Partial Service', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case SYSTEM_STATE.LOCAL_DOWN:
        return { icon: XCircle, text: 'Services Down', color: 'text-red-400', bg: 'bg-red-500/10' };
      default:
        return { icon: RefreshCw, text: 'Checking...', color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };
  
  const stateConfig = getStateConfig();
  const StateIcon = stateConfig.icon;
  
  // Quick access buttons configuration - minimal design with 1-word labels
  const quickActions = [
    {
      id: 'knowledge',
      label: 'Wiki',
      icon: BookOpen,
      color: 'cyan',
      status: serviceStatus.kiwix,
      onClick: onOpenKiwix || (() => window.open('/kiwix/', '_blank')),
      testId: 'quick-access-kiwix',
      description: 'Search Wikipedia, guides, and references offline',
      ariaLabel: 'Open offline knowledge base'
    },
    {
      id: 'status',
      label: 'Status',
      icon: Activity,
      color: 'purple',
      status: serviceStatus.api,
      onClick: onOpenStatus,
      testId: 'quick-access-status',
      description: 'View CPU, memory, sensors, and service health',
      ariaLabel: 'View system status and health'
    },
    {
      id: 'hotspot',
      label: 'WiFi',
      icon: Wifi,
      color: 'green',
      status: true, // Always show as available (instructions are static)
      onClick: onOpenHotspot,
      testId: 'quick-access-hotspot',
      description: 'Instructions to connect phones and laptops',
      ariaLabel: 'WiFi hotspot connection guide'
    },
    {
      id: 'comms',
      label: 'Comms',
      icon: Radio,
      color: 'orange',
      status: serviceStatus.api,
      onClick: onOpenComms,
      testId: 'quick-access-comms',
      description: 'View network members and send messages',
      ariaLabel: 'Open communications hub'
    },
  ];
  
  const colorClasses = {
    cyan: {
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      icon: 'text-cyan-400',
      glow: 'hover:shadow-cyan-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10 hover:bg-purple-500/20',
      border: 'border-purple-500/30 hover:border-purple-500/50',
      icon: 'text-purple-400',
      glow: 'hover:shadow-purple-500/20'
    },
    green: {
      bg: 'bg-green-500/10 hover:bg-green-500/20',
      border: 'border-green-500/30 hover:border-green-500/50',
      icon: 'text-green-400',
      glow: 'hover:shadow-green-500/20'
    },
    orange: {
      bg: 'bg-orange-500/10 hover:bg-orange-500/20',
      border: 'border-orange-500/30 hover:border-orange-500/50',
      icon: 'text-orange-400',
      glow: 'hover:shadow-orange-500/20'
    },
  };
  
  return (
    <div 
      className={`rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 ${className}`}
      data-testid="quick-access-panel"
    >
      {/* Header with system state */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
        </div>
        
        <button
          onClick={checkLocalHealth}
          disabled={isChecking}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${stateConfig.bg} 
            border border-border/30 transition-all hover:border-border/50`}
          data-testid="quick-access-status-btn"
        >
          <StateIcon className={`w-4 h-4 ${stateConfig.color} ${isChecking ? 'animate-spin' : ''}`} />
          <span className={`text-sm ${stateConfig.color}`}>{stateConfig.text}</span>
        </button>
      </div>
      
      {/* Quick action grid - Large touch-friendly buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color];
          const isAvailable = action.status !== false;
          
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl border
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                hover:shadow-lg ${colors.glow}
                ${colors.bg} ${colors.border}
                ${!isAvailable ? 'opacity-60' : ''}
              `}
              data-testid={action.testId}
              title={action.description}
            >
              {/* Status indicator */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                isAvailable ? 'bg-green-400' : 'bg-red-400'
              }`} />
              
              <Icon className={`w-8 h-8 mb-2 ${colors.icon}`} />
              <span className="font-medium text-foreground text-sm text-center">{action.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{action.sublabel}</span>
              
              {/* Arrow indicator */}
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 absolute bottom-2 right-2" />
            </button>
          );
        })}
      </div>
      
      {/* Direct Kiwix link for fastest access */}
      <div className="mt-4 flex items-center justify-center">
        <a
          href="/kiwix/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 
            border border-cyan-500/30 text-cyan-400 text-sm transition-all"
          data-testid="quick-access-kiwix-direct"
        >
          <BookOpen className="w-4 h-4" />
          <span>Open Kiwix Library Directly</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      {/* System state warning banners */}
      {systemState === SYSTEM_STATE.LOCAL_DOWN && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Local Services Unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cannot reach the OMEGA API or Kiwix. Check if services are running on the Pi.
                Some features will show cached or demo data.
              </p>
              <button
                onClick={checkLocalHealth}
                className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {systemState === SYSTEM_STATE.LOCAL_DEGRADED && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Partial Service</p>
              <p className="text-xs text-muted-foreground mt-1">
                {!serviceStatus.api && 'OMEGA API is unavailable. '}
                {!serviceStatus.kiwix && 'Kiwix is unavailable. '}
                Check System Status for details.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Last check timestamp */}
      {lastCheck && (
        <p className="mt-3 text-xs text-muted-foreground/50 text-center">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default QuickAccessPanel;
