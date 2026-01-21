// ============================================================
// Quick Access Panel - SHTF First-Screen Access
// ============================================================
// Large buttons for immediate access to critical functions
// Goal: First-time user finds Kiwix, hotspot, status in <10 seconds

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Wifi, 
  Activity, 
  Radio, 
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// System state checking (WAN-independent)
const SYSTEM_STATE = {
  LOCAL_OK: 'LOCAL_OK',
  LOCAL_DEGRADED: 'LOCAL_DEGRADED', 
  LOCAL_DOWN: 'LOCAL_DOWN',
  CHECKING: 'CHECKING',
  UNKNOWN: 'UNKNOWN'
};

const QuickAccessPanel = ({ 
  onOpenKiwix, 
  onOpenHotspot, 
  onOpenStatus, 
  onOpenComms,
  systemState = SYSTEM_STATE.UNKNOWN 
}) => {
  const [localState, setLocalState] = useState(SYSTEM_STATE.UNKNOWN);
  const [isChecking, setIsChecking] = useState(false);
  
  // Check local system health on mount
  useEffect(() => {
    checkLocalHealth();
    // Re-check every 30 seconds
    const interval = setInterval(checkLocalHealth, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const checkLocalHealth = async () => {
    setIsChecking(true);
    const results = { api: false, kiwix: false };
    
    try {
      // Check API health
      const apiResponse = await fetch('/api/cgi-bin/health.py', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      results.api = apiResponse.ok;
    } catch {
      results.api = false;
    }
    
    try {
      // Check Kiwix health
      const kiwixResponse = await fetch('/kiwix/', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      results.kiwix = kiwixResponse.ok;
    } catch {
      results.kiwix = false;
    }
    
    // Update global state
    if (typeof window !== 'undefined') {
      window.OMEGA_SYSTEM_STATE = {
        api: results.api,
        kiwix: results.kiwix,
        lastCheck: Date.now(),
        state: results.api && results.kiwix ? 'LOCAL_OK' :
               results.api || results.kiwix ? 'LOCAL_DEGRADED' : 'LOCAL_DOWN'
      };
    }
    
    // Determine state
    if (results.api && results.kiwix) {
      setLocalState(SYSTEM_STATE.LOCAL_OK);
    } else if (results.api || results.kiwix) {
      setLocalState(SYSTEM_STATE.LOCAL_DEGRADED);
    } else {
      setLocalState(SYSTEM_STATE.LOCAL_DOWN);
    }
    
    setIsChecking(false);
  };
  
  const getStateIcon = () => {
    if (isChecking) return <Clock className="w-4 h-4 animate-spin text-yellow-400" />;
    switch (localState) {
      case SYSTEM_STATE.LOCAL_OK:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case SYSTEM_STATE.LOCAL_DEGRADED:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case SYSTEM_STATE.LOCAL_DOWN:
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getStateText = () => {
    if (isChecking) return 'Checking...';
    switch (localState) {
      case SYSTEM_STATE.LOCAL_OK:
        return 'All Systems OK';
      case SYSTEM_STATE.LOCAL_DEGRADED:
        return 'Some Services Down';
      case SYSTEM_STATE.LOCAL_DOWN:
        return 'Services Unavailable';
      default:
        return 'Checking Status...';
    }
  };
  
  const quickActions = [
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      sublabel: 'Search offline wiki',
      icon: BookOpen,
      color: 'cyan',
      onClick: onOpenKiwix,
      testId: 'quick-access-kiwix',
    },
    {
      id: 'hotspot',
      label: 'WiFi Hotspot',
      sublabel: 'Connect devices',
      icon: Wifi,
      color: 'green',
      onClick: onOpenHotspot,
      testId: 'quick-access-hotspot',
    },
    {
      id: 'status',
      label: 'System Status',
      sublabel: 'Health & diagnostics',
      icon: Activity,
      color: 'purple',
      onClick: onOpenStatus,
      testId: 'quick-access-status',
    },
    {
      id: 'comms',
      label: 'Communications',
      sublabel: 'Mesh & radio',
      icon: Radio,
      color: 'orange',
      onClick: onOpenComms,
      testId: 'quick-access-comms',
    },
  ];
  
  const colorClasses = {
    cyan: 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50 text-cyan-400',
    green: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50 text-green-400',
    purple: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50 text-purple-400',
    orange: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-orange-400',
  };
  
  return (
    <div 
      className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 mb-6"
      data-testid="quick-access-panel"
    >
      {/* Header with system state */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-cyan-400">⚡</span>
          Quick Access
        </h2>
        <button
          onClick={checkLocalHealth}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
          data-testid="quick-access-refresh"
        >
          {getStateIcon()}
          <span className="text-muted-foreground">{getStateText()}</span>
        </button>
      </div>
      
      {/* Quick action grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl border
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                ${colorClasses[action.color]}
              `}
              data-testid={action.testId}
            >
              <Icon className="w-8 h-8 mb-2" />
              <span className="font-medium text-foreground text-sm">{action.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{action.sublabel}</span>
            </button>
          );
        })}
      </div>
      
      {/* System state warning banner */}
      {localState === SYSTEM_STATE.LOCAL_DOWN && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Local Services Unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cannot reach API or Kiwix. This may be normal if you're not connected to the OMEGA network.
              Some features will work with cached/mock data.
            </p>
          </div>
        </div>
      )}
      
      {localState === SYSTEM_STATE.LOCAL_DEGRADED && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Partial Service</p>
            <p className="text-xs text-muted-foreground mt-1">
              Some services are unavailable. Check System Status for details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAccessPanel;
