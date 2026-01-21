// ============================================================
// API Error Handler - Clean Display for Pi API Responses
// ============================================================
// Handles specific error responses from OMEGA Pi endpoints:
// - 403 Forbidden → "Setup Required"
// - {status:"error", error:"..."} → Clean error display
// - Network errors → "Service Unavailable"
//
// Every error state has:
// 1. What's wrong in plain language
// 2. Offline-friendly next action
// 3. "Return to Dashboard" escape

import React from 'react';
import { 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw, 
  Settings, 
  HelpCircle,
  Lock,
  Satellite,
  Thermometer,
  Radio,
  Film,
  XCircle,
  Info,
  Wrench
} from 'lucide-react';

// Error type configurations based on actual Pi responses
export const ERROR_TYPES = {
  // DM endpoint returns 403 with {"ok":false,"err":"forbidden"}
  DM_FORBIDDEN: {
    code: 'DM_FORBIDDEN',
    title: 'Direct Messages - Setup Required',
    description: 'Direct messaging has not been configured on this OMEGA device.',
    icon: Lock,
    color: 'amber',
    nextActions: [
      { label: 'View Setup Guide', action: 'help', icon: HelpCircle },
      { label: 'Check System Status', action: 'status', icon: Settings },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Contact your network administrator to enable direct messaging.',
  },
  
  // Sensors endpoint returns {status:"error", error:".../dev/i2c-3..."}
  SENSORS_ERROR: {
    code: 'SENSORS_ERROR',
    title: 'Environmental Sensors - Hardware Issue',
    description: 'Unable to read from the BME680 sensor. The I2C connection may not be configured.',
    icon: Thermometer,
    color: 'orange',
    nextActions: [
      { label: 'View Hardware Guide', action: 'help', icon: HelpCircle },
      { label: 'Retry Connection', action: 'retry', icon: RefreshCw },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Check that the BME680 sensor is properly connected to the I2C bus.',
  },
  
  // GPS endpoint returns {status:"error", error:"gpspipe timeout..."}
  GPS_ERROR: {
    code: 'GPS_ERROR',
    title: 'GPS - No Signal',
    description: 'Unable to get GPS coordinates. The GPS receiver may not be connected or lacks signal.',
    icon: Satellite,
    color: 'blue',
    nextActions: [
      { label: 'Enter Location Manually', action: 'manual', icon: Settings },
      { label: 'View Saved Waypoints', action: 'waypoints', icon: HelpCircle },
      { label: 'Retry GPS', action: 'retry', icon: RefreshCw },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Move to an area with clear sky view, or manually enter your coordinates.',
  },
  
  // Mesh returns {ok:true, mesh:"ready"} but might fail
  MESH_UNAVAILABLE: {
    code: 'MESH_UNAVAILABLE',
    title: 'Mesh Network - Offline',
    description: 'The mesh radio network is not currently available.',
    icon: Radio,
    color: 'purple',
    nextActions: [
      { label: 'Check Radio Status', action: 'radio', icon: Settings },
      { label: 'View Mesh Guide', action: 'help', icon: HelpCircle },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'The mesh network uses LoRa radio. Ensure the radio module is connected.',
  },
  
  // Jellyfin not configured
  JELLYFIN_NOT_CONFIGURED: {
    code: 'JELLYFIN_NOT_CONFIGURED',
    title: 'Media Server - Not Configured',
    description: 'Jellyfin media server is not set up on this device.',
    icon: Film,
    color: 'pink',
    nextActions: [
      { label: 'Setup Jellyfin', action: 'setup', icon: Settings },
      { label: 'View Help', action: 'help', icon: HelpCircle },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Install Jellyfin on port 8096 to enable local media streaming.',
  },
  
  // Kiwix unavailable
  KIWIX_UNAVAILABLE: {
    code: 'KIWIX_UNAVAILABLE',
    title: 'Knowledge Base - Unavailable',
    description: 'Cannot connect to the Kiwix offline wiki server.',
    icon: XCircle,
    color: 'red',
    nextActions: [
      { label: 'Retry Connection', action: 'retry', icon: RefreshCw },
      { label: 'Check System Status', action: 'status', icon: Settings },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Verify that kiwix-serve is running on the Pi.',
  },
  
  // Generic API error
  API_ERROR: {
    code: 'API_ERROR',
    title: 'Service Error',
    description: 'The requested service returned an error.',
    icon: AlertTriangle,
    color: 'gray',
    nextActions: [
      { label: 'Retry', action: 'retry', icon: RefreshCw },
      { label: 'Check Status', action: 'status', icon: Settings },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Check the System Status page for more details.',
  },
  
  // Network error (can't reach Pi at all)
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Connection Failed',
    description: 'Cannot reach the OMEGA server. Check your network connection.',
    icon: XCircle,
    color: 'red',
    nextActions: [
      { label: 'Retry', action: 'retry', icon: RefreshCw },
      { label: 'Check WiFi', action: 'wifi', icon: Settings },
      { label: 'Return to Dashboard', action: 'home', icon: ArrowLeft },
    ],
    offlineTip: 'Ensure you are connected to the OMEGA hotspot or local network.',
  },
};

// Color classes for Tailwind
const colorClasses = {
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
};

// Parse API response to determine error type
export const parseApiError = (response, data, endpoint) => {
  // 403 Forbidden - usually DM endpoint
  if (response?.status === 403 || data?.err === 'forbidden') {
    return ERROR_TYPES.DM_FORBIDDEN;
  }
  
  // Check for explicit error status in response
  if (data?.status === 'error') {
    const errorMsg = (data.error || '').toLowerCase();
    
    // I2C/sensor errors
    if (errorMsg.includes('i2c') || errorMsg.includes('sensor') || errorMsg.includes('bme')) {
      return { ...ERROR_TYPES.SENSORS_ERROR, rawError: data.error };
    }
    
    // GPS errors
    if (errorMsg.includes('gps') || errorMsg.includes('gpspipe') || errorMsg.includes('timeout')) {
      return { ...ERROR_TYPES.GPS_ERROR, rawError: data.error };
    }
    
    // Generic error with the message
    return { ...ERROR_TYPES.API_ERROR, description: data.error || 'Unknown error', rawError: data.error };
  }
  
  // Network/fetch errors
  if (response === null || response === undefined) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  
  return ERROR_TYPES.API_ERROR;
};

// Main error display component
const ApiErrorDisplay = ({ 
  errorType,
  customTitle,
  customDescription,
  rawError,
  onAction,
  compact = false,
  className = ''
}) => {
  const config = typeof errorType === 'string' 
    ? ERROR_TYPES[errorType] || ERROR_TYPES.API_ERROR
    : errorType || ERROR_TYPES.API_ERROR;
    
  const Icon = config.icon;
  const colors = colorClasses[config.color] || colorClasses.gray;
  
  const handleAction = (action) => {
    if (onAction) onAction(action);
  };
  
  if (compact) {
    return (
      <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border ${className}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${colors.text}`}>
              {customTitle || config.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {config.offlineTip}
            </p>
          </div>
          <button
            onClick={() => handleAction('home')}
            className="p-1.5 rounded hover:bg-background/50"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`rounded-xl ${colors.bg} ${colors.border} border p-6 ${className}`}
      data-testid={`error-display-${config.code}`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg bg-background/50 ${colors.text}`}>
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
      </div>
      
      {/* Raw error details (collapsible) */}
      {(rawError || config.rawError) && (
        <details className="mb-4">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            <Wrench className="w-3 h-3 inline mr-1" />
            Technical Details
          </summary>
          <pre className="mt-2 p-2 text-xs bg-background/50 rounded overflow-x-auto text-muted-foreground">
            {rawError || config.rawError}
          </pre>
        </details>
      )}
      
      {/* Offline tip */}
      <div className="mb-4 p-3 rounded-lg bg-background/30 border border-border/30">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{config.offlineTip}</p>
        </div>
      </div>
      
      {/* Next actions */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          What you can do:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.nextActions.map((action, idx) => {
            const ActionIcon = action.icon;
            const isHome = action.action === 'home';
            return (
              <button
                key={idx}
                onClick={() => handleAction(action.action)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors
                  ${isHome 
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30' 
                    : 'bg-background/50 hover:bg-background/80 text-foreground border border-border/50'
                  }
                `}
                data-testid={`error-action-${action.action}`}
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

// Inline compact version for tiles
export const InlineErrorBadge = ({ errorType, message, onRetry }) => {
  const config = ERROR_TYPES[errorType] || ERROR_TYPES.API_ERROR;
  const colors = colorClasses[config.color] || colorClasses.gray;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${colors.bg} ${colors.text} text-xs`}>
      <Icon className="w-3 h-3" />
      <span>{message || config.title}</span>
      {onRetry && (
        <button onClick={onRetry} className="ml-1 hover:opacity-80">
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default ApiErrorDisplay;
