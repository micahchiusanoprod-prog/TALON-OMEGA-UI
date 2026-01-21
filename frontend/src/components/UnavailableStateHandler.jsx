// ============================================================
// Unavailable State Handler - Eliminates Dead Ends
// ============================================================
// Shows actionable next steps when a feature is unavailable
// Every state has a path forward - no dead ends

import React from 'react';
import { 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw, 
  BookOpen, 
  Wifi, 
  HelpCircle,
  Radio,
  MapPin,
  Play,
  Settings
} from 'lucide-react';

// Dead end types and their solutions
const UNAVAILABLE_STATES = {
  KIWIX_DOWN: {
    title: 'Knowledge Base Unavailable',
    description: 'Cannot connect to the offline wiki server.',
    icon: BookOpen,
    color: 'cyan',
    nextActions: [
      { label: 'Retry Connection', action: 'retry', icon: RefreshCw },
      { label: 'Check System Status', action: 'status', icon: Settings },
      { label: 'View Help Center', action: 'help', icon: HelpCircle },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'While Kiwix is down, you can still browse cached pages or use the built-in guides.',
  },
  JELLYFIN_NOT_CONFIGURED: {
    title: 'Media Server Not Configured',
    description: 'Jellyfin is not set up on this device.',
    icon: Play,
    color: 'purple',
    nextActions: [
      { label: 'Setup Guide', action: 'setup', icon: Settings },
      { label: 'Check System Status', action: 'status', icon: Settings },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'To enable media streaming, install Jellyfin on port 8096 and restart OMEGA.',
  },
  SOS_NETWORK_DOWN: {
    title: 'SOS Beacon - Network Down',
    description: 'Cannot transmit distress signal over network.',
    icon: Radio,
    color: 'red',
    nextActions: [
      { label: 'Try Local Alert', action: 'local-alert', icon: Radio },
      { label: 'View Radio Frequencies', action: 'radio-info', icon: Radio },
      { label: 'Check Mesh Status', action: 'mesh', icon: Wifi },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'If network SOS fails, use audio/visual beacon or switch to radio communication.',
    urgent: true,
  },
  GPS_UNAVAILABLE: {
    title: 'GPS Not Available',
    description: 'Location services are not configured.',
    icon: MapPin,
    color: 'orange',
    nextActions: [
      { label: 'Enter Location Manually', action: 'manual-location', icon: MapPin },
      { label: 'View Saved Waypoints', action: 'waypoints', icon: MapPin },
      { label: 'Check System Status', action: 'status', icon: Settings },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'GPS hardware may not be installed. You can manually enter coordinates or use saved waypoints.',
  },
  SEARCH_NO_RESULTS: {
    title: 'No Results Found',
    description: 'Your search did not match any entries.',
    icon: BookOpen,
    color: 'gray',
    nextActions: [
      { label: 'Try Different Keywords', action: 'retry', icon: RefreshCw },
      { label: 'Browse Categories', action: 'browse', icon: BookOpen },
      { label: 'View Help Center', action: 'help', icon: HelpCircle },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Try broader search terms or check if the ZIM files contain your topic.',
  },
};

const colorClasses = {
  cyan: 'border-cyan-500/50 bg-cyan-500/10',
  purple: 'border-purple-500/50 bg-purple-500/10',
  red: 'border-red-500/50 bg-red-500/10',
  orange: 'border-orange-500/50 bg-orange-500/10',
  gray: 'border-gray-500/50 bg-gray-500/10',
};

const iconColorClasses = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
  orange: 'text-orange-400',
  gray: 'text-gray-400',
};

const UnavailableStateHandler = ({ 
  type, 
  onAction,
  customTitle,
  customDescription,
  showReturnButton = true,
}) => {
  const config = UNAVAILABLE_STATES[type] || UNAVAILABLE_STATES.SEARCH_NO_RESULTS;
  const Icon = config.icon;
  
  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
  };
  
  return (
    <div 
      className={`rounded-xl border p-6 ${colorClasses[config.color]}`}
      data-testid={`unavailable-state-${type}`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg bg-background/50 ${iconColorClasses[config.color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {customTitle || config.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {customDescription || config.description}
          </p>
        </div>
        {config.urgent && (
          <span className="px-2 py-1 text-xs font-medium rounded bg-red-500 text-white animate-pulse">
            URGENT
          </span>
        )}
      </div>
      
      {/* Offline tip */}
      <div className="mb-4 p-3 rounded-lg bg-background/30 border border-border/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{config.offlineTip}</p>
        </div>
      </div>
      
      {/* Next actions */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
          What you can do:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.nextActions.map((action, index) => {
            const ActionIcon = action.icon;
            const isHome = action.action === 'home';
            return (
              <button
                key={index}
                onClick={() => handleAction(action.action)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${isHome 
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30' 
                    : 'bg-background/50 hover:bg-background/80 text-foreground border border-border/50'
                  }
                `}
                data-testid={`unavailable-action-${action.action}`}
              >
                <ActionIcon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Compact inline version for use in dropdowns/modals
export const UnavailableInline = ({ type, onRetry, onGoHome }) => {
  const config = UNAVAILABLE_STATES[type] || UNAVAILABLE_STATES.SEARCH_NO_RESULTS;
  const Icon = config.icon;
  
  return (
    <div className="p-4 text-center">
      <Icon className={`w-12 h-12 mx-auto mb-3 ${iconColorClasses[config.color]}`} />
      <h4 className="font-medium text-foreground mb-1">{config.title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{config.offlineTip}</p>
      <div className="flex gap-2 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-sm rounded-lg bg-primary/20 hover:bg-primary/30 text-primary"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" />
            Retry
          </button>
        )}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 text-foreground"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default UnavailableStateHandler;
