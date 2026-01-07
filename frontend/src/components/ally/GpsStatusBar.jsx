import React, { useState } from 'react';
import { 
  Satellite, 
  SignalHigh, 
  SignalLow, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Mountain,
  Target,
  Radio
} from 'lucide-react';

// Mock GPS status - will be replaced with real data from Pi
const getMockGpsStatus = () => {
  // For testing: set to false to see "No Fix" state with Quick Help
  // In production, this will be replaced with real GPS data from Pi
  const hasFix = true; // Change to false to test "No Fix" state
  return {
    hasFix,
    lastUpdate: hasFix ? new Date() : new Date(Date.now() - 300000),
    accuracy: hasFix ? 13.8 : null, // feet (was 4.2m)
    satellites: hasFix ? 9 : 0,
    altitude: hasFix ? 171 : null, // feet (was 52m)
    hdop: hasFix ? 1.2 : null,
  };
};

// Conversion helpers
const metersToFeet = (m) => m ? Math.round(m * 3.28084) : null;
const metersToMiles = (m) => m ? (m * 0.000621371).toFixed(1) : null;

const QuickHelpTips = ({ isOpen, onToggle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="mt-2 glass rounded-lg p-3 animate-fade-in" data-testid="gps-quick-help">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-warning">Quick Fix Checklist</span>
        <button 
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
          data-testid="close-quick-help"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-1.5 text-xs">
        <li className="flex items-start gap-2">
          <span className="text-warning font-bold">1.</span>
          <span><strong>Go outside</strong> — GPS needs sky view</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-warning font-bold">2.</span>
          <span><strong>Stay still</strong> — 30-60 sec for cold start</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-warning font-bold">3.</span>
          <span><strong>Clear obstructions</strong> — away from buildings/trees</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-warning font-bold">4.</span>
          <span><strong>Check antenna</strong> — connected & unobstructed</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-warning font-bold">5.</span>
          <span><strong>Restart GPS service</strong> — if stuck &gt;5 min</span>
        </li>
      </ul>
      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
        See <strong>GPS Guide</strong> tab for detailed troubleshooting
      </p>
    </div>
  );
};

export default function GpsStatusBar({ gpsStatus: externalStatus }) {
  const [showHelp, setShowHelp] = useState(false);
  
  // Use external status if provided, otherwise use mock
  const gpsStatus = externalStatus || getMockGpsStatus();
  
  const formatTimeAgo = (date) => {
    if (!date) return '—';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  const getAccuracyLabel = (acc) => {
    if (!acc) return '—';
    if (acc <= 10) return 'Excellent';  // ≤10 ft
    if (acc <= 33) return 'Good';       // ≤33 ft (~10m)
    if (acc <= 82) return 'Fair';       // ≤82 ft (~25m)
    return 'Poor';
  };
  
  const getAccuracyColor = (acc) => {
    if (!acc) return 'text-muted-foreground';
    if (acc <= 10) return 'text-success';
    if (acc <= 33) return 'text-success';
    if (acc <= 82) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="mb-3" data-testid="gps-status-bar">
      <div className="glass rounded-lg p-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* GPS Fix Status */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              gpsStatus.hasFix 
                ? 'bg-success-light text-success' 
                : 'bg-warning-light text-warning animate-pulse'
            }`} data-testid="gps-fix-indicator">
              {gpsStatus.hasFix ? (
                <>
                  <Satellite className="w-3.5 h-3.5" />
                  <span>GPS Fix</span>
                  <CheckCircle className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Satellite className="w-3.5 h-3.5" />
                  <span>No Fix</span>
                  <AlertTriangle className="w-3 h-3" />
                </>
              )}
            </div>
            
            {/* Last Update */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Updated: <strong>{formatTimeAgo(gpsStatus.lastUpdate)}</strong></span>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs">
            {/* Accuracy */}
            <div className="flex items-center gap-1" title="Horizontal Accuracy">
              <Target className="w-3 h-3 text-muted-foreground" />
              <span className={getAccuracyColor(gpsStatus.accuracy)}>
                {gpsStatus.accuracy ? `±${gpsStatus.accuracy} ft` : '—'}
              </span>
            </div>
            
            {/* Satellites */}
            <div className="flex items-center gap-1" title="Satellites in View">
              {gpsStatus.satellites >= 6 ? (
                <SignalHigh className="w-3 h-3 text-success" />
              ) : gpsStatus.satellites >= 3 ? (
                <SignalLow className="w-3 h-3 text-warning" />
              ) : (
                <Radio className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={gpsStatus.satellites >= 4 ? 'text-foreground' : 'text-muted-foreground'}>
                {gpsStatus.satellites || '—'} sats
              </span>
            </div>
            
            {/* Altitude */}
            <div className="flex items-center gap-1" title="Altitude">
              <Mountain className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {gpsStatus.altitude !== null ? `${gpsStatus.altitude} ft` : '—'}
              </span>
            </div>
            
            {/* Help Toggle (only show if no fix) */}
            {!gpsStatus.hasFix && (
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-warning-light text-warning hover:bg-warning/20 transition-colors"
                data-testid="toggle-quick-help"
              >
                <span className="font-medium">Help</span>
                {showHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
        
        {/* Quick Help Tips (collapsible) */}
        {!gpsStatus.hasFix && (
          <QuickHelpTips isOpen={showHelp} onToggle={() => setShowHelp(false)} />
        )}
      </div>
    </div>
  );
}
