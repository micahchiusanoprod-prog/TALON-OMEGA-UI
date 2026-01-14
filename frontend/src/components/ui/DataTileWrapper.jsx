import React, { useState, createContext, useContext } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  ExternalLink,
  Clock,
  RefreshCw,
  CheckCircle,
  WifiOff
} from 'lucide-react';
import { 
  TrustBadge, 
  ProvenanceStrip, 
  getFreshness, 
  FRESHNESS,
  TRUST_BADGES,
  STATUS_EXPLANATIONS,
  HelpTooltip 
} from './ProgressiveDisclosure';

// ============================================================
// DATA TILE WRAPPER CONTEXT
// ============================================================

const DataTileContext = createContext({
  expanded: false,
  setExpanded: () => {},
  provenance: null,
  status: 'INDEXED'
});

export const useDataTile = () => useContext(DataTileContext);

// ============================================================
// STATUS GUIDANCE CONTENT
// ============================================================

export const STATUS_GUIDANCE = {
  INDEXED: {
    title: 'Data Available',
    description: 'This data source is configured and actively providing data.',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    icon: CheckCircle,
    action: null
  },
  NOT_INDEXED: {
    title: 'Not Configured',
    description: 'This data source requires configuration before it can provide data.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Info,
    howToFix: [
      'Check Admin Console for configuration options',
      'Verify required API keys or credentials are set',
      'Ensure the service endpoint is accessible'
    ],
    whatToExpect: 'Once configured, data will appear within 30 seconds.'
  },
  PLANNED: {
    title: 'Feature Planned',
    description: 'This feature is under development and will be available in a future update.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Clock,
    howToFix: null,
    whatToExpect: 'This feature will be enabled automatically when available.'
  },
  UNAVAILABLE: {
    title: 'Service Unavailable',
    description: 'Unable to connect to the data source. The service may be offline or unreachable.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: WifiOff,
    howToFix: [
      'Check network connectivity',
      'Verify the service is running',
      'Try refreshing the connection',
      'Check system logs for errors'
    ],
    whatToExpect: 'Data will resume automatically when connection is restored.'
  },
  DEGRADED: {
    title: 'Degraded Performance',
    description: 'The service is running but with reduced functionality or delayed updates.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: AlertTriangle,
    howToFix: [
      'Check system resource usage',
      'Restart the affected service',
      'Review recent changes or updates'
    ],
    whatToExpect: 'Some features may be limited until the issue is resolved.'
  },
  UNKNOWN: {
    title: 'Status Unknown',
    description: 'Unable to determine the current status of this data source.',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    icon: HelpCircle,
    howToFix: [
      'Run a self-test from the Help Center',
      'Check system health in Device Info',
      'Review logs for any errors'
    ],
    whatToExpect: 'Status will update once the source responds.'
  },
  SIMULATED: {
    title: 'Simulated Data',
    description: 'Currently showing simulated/mock data. Real data will appear when connected to hardware.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: AlertTriangle,
    howToFix: [
      'Connect OMEGA to actual hardware/sensors',
      'Ensure services are properly configured',
      'Deploy to production environment'
    ],
    whatToExpect: 'Real sensor data will replace simulated values.'
  }
};

// ============================================================
// STATUS GUIDANCE PANEL
// ============================================================

export const StatusGuidancePanel = ({ status = 'UNKNOWN', customMessage = null }) => {
  const guidance = STATUS_GUIDANCE[status] || STATUS_GUIDANCE.UNKNOWN;
  const Icon = guidance.icon;
  
  return (
    <div 
      className={`rounded-xl p-4 ${guidance.bgColor} border ${guidance.borderColor}`}
      data-testid={`status-guidance-${status?.toLowerCase()}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${guidance.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${guidance.color}`}>{guidance.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {customMessage || guidance.description}
          </p>
          
          {guidance.howToFix && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-foreground mb-1">How to fix:</p>
              <ul className="space-y-1">
                {guidance.howToFix.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className={`w-4 h-4 rounded-full ${guidance.bgColor} ${guidance.color} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {guidance.whatToExpect && (
            <div className="mt-3 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">What to expect: </span>
                {guidance.whatToExpect}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DATA PROVENANCE FOOTER
// ============================================================

export const DataProvenanceFooter = ({
  source = 'Unknown',
  endpoint = null,
  lastUpdated = null,
  trustType = 'UNKNOWN',
  status = 'INDEXED',
  refreshInterval = null,
  onRefresh = null,
  className = ''
}) => {
  const freshness = getFreshness(lastUpdated);
  const formattedTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString()
    : 'Never';
  
  return (
    <div 
      className={`border-t border-border/50 pt-3 mt-3 ${className}`}
      data-testid="data-provenance-footer"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {/* Source */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Source:</span>
          <span className="font-medium text-foreground">{source}</span>
        </div>
        
        {/* Endpoint (if provided) */}
        {endpoint && (
          <>
            <span className="text-border hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Endpoint:</span>
              <code className="text-[10px] px-1.5 py-0.5 bg-secondary rounded font-mono">{endpoint}</code>
            </div>
          </>
        )}
        
        {/* Last Updated */}
        <span className="text-border hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Updated:</span>
          <span className={`font-medium ${freshness.color}`}>{formattedTime}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            freshness === FRESHNESS.LIVE ? 'bg-success/20 text-success' :
            freshness === FRESHNESS.CACHED ? 'bg-blue-500/20 text-blue-500' :
            freshness === FRESHNESS.STALE ? 'bg-amber-500/20 text-amber-500' :
            'bg-muted/50 text-muted-foreground'
          }`}>
            {freshness.label}
          </span>
        </div>
        
        {/* Refresh interval */}
        {refreshInterval && (
          <>
            <span className="text-border hidden sm:inline">|</span>
            <span className="text-muted-foreground text-[10px]">
              Refreshes every {refreshInterval}
            </span>
          </>
        )}
        
        {/* Trust Badge */}
        <div className="ml-auto flex items-center gap-2">
          <TrustBadge type={trustType} showLabel={true} />
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      
      {/* Status indicator if not INDEXED */}
      {status && status !== 'INDEXED' && (
        <div className="mt-2">
          <StatusGuidancePanel status={status} />
        </div>
      )}
    </div>
  );
};

// ============================================================
// PROGRESSIVE DETAILS SECTION
// ============================================================

export const ProgressiveDetails = ({
  title = 'Technical Details',
  children,
  defaultExpanded = false,
  helpText = null
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border-t border-border/50 mt-3 pt-3" data-testid="progressive-details">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        data-testid="progressive-details-toggle"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
          {title && <span className="text-xs text-muted-foreground">({title})</span>}
        </div>
        {helpText && (
          <span className="text-xs text-muted-foreground">{helpText}</span>
        )}
      </button>
      
      {expanded && (
        <div className="animate-fade-in pt-2 space-y-3" data-testid="progressive-details-content">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================
// RAW DATA DISPLAY
// ============================================================

export const RawDataDisplay = ({ data, title = 'Raw Data' }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="glass rounded-lg p-3" data-testid="raw-data-display">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-semibold text-muted-foreground">{title}</h5>
        <button
          onClick={handleCopy}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {copied ? <CheckCircle className="w-3 h-3" /> : null}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      <pre className="text-[10px] bg-secondary/50 p-2 rounded overflow-x-auto max-h-40 scrollbar-thin">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

// ============================================================
// CALCULATION NOTES
// ============================================================

export const CalculationNotes = ({ notes = [], title = 'How This Value is Calculated' }) => {
  if (!notes.length) return null;
  
  return (
    <div className="glass rounded-lg p-3" data-testid="calculation-notes">
      <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
        <Info className="w-3 h-3" />
        {title}
      </h5>
      <ul className="space-y-1">
        {notes.map((note, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="text-primary">•</span>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============================================================
// METRIC ROW COMPONENT
// ============================================================

export const MetricRow = ({
  label,
  value,
  unit = '',
  trustType = 'VERIFIED',
  helpTerm = null,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        {helpTerm ? (
          <HelpTooltip term={helpTerm}>
            <span className="text-xs text-muted-foreground">{label}</span>
          </HelpTooltip>
        ) : (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground">
          {value}{unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
        </span>
        <TrustBadge type={trustType} showLabel={false} />
      </div>
    </div>
  );
};

// ============================================================
// DATA TILE WRAPPER
// ============================================================

export const DataTileWrapper = ({
  children,
  provenance = {},
  status = 'INDEXED',
  showProvenance = true,
  showStatusGuidance = true,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <DataTileContext.Provider value={{ expanded, setExpanded, provenance, status }}>
      <div className={className}>
        {children}
        
        {/* Provenance Footer */}
        {showProvenance && (
          <DataProvenanceFooter
            source={provenance.source}
            endpoint={provenance.endpoint}
            lastUpdated={provenance.lastUpdated}
            trustType={provenance.trustType}
            status={showStatusGuidance ? status : null}
            refreshInterval={provenance.refreshInterval}
            onRefresh={provenance.onRefresh}
          />
        )}
      </div>
    </DataTileContext.Provider>
  );
};

export default {
  DataTileWrapper,
  DataProvenanceFooter,
  StatusGuidancePanel,
  ProgressiveDetails,
  RawDataDisplay,
  CalculationNotes,
  MetricRow,
  STATUS_GUIDANCE,
  useDataTile
};
