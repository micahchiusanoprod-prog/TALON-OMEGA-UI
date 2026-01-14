import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

// Glossary of terms used in the UI
export const GLOSSARY = {
  CPU: {
    term: 'CPU',
    fullName: 'Central Processing Unit',
    definition: 'The main processor that executes instructions.',
    units: '%',
    typicalRange: '0-100%',
    healthyRange: '< 80%'
  },
  RAM: {
    term: 'RAM',
    fullName: 'Random Access Memory',
    definition: 'Short-term memory used by running applications.',
    units: '%',
    typicalRange: '0-100%',
    healthyRange: '< 85%'
  },
  TEMP: {
    term: 'Temp',
    fullName: 'Temperature',
    definition: 'CPU core temperature.',
    units: '°C',
    typicalRange: '30-85°C',
    healthyRange: '< 70°C'
  },
  DISK: {
    term: 'Disk',
    fullName: 'Storage Usage',
    definition: 'Percentage of disk space used.',
    units: '%',
    typicalRange: '0-100%',
    healthyRange: '< 90%'
  },
  RSSI: {
    term: 'RSSI',
    fullName: 'Received Signal Strength Indicator',
    definition: 'WiFi signal strength measurement.',
    units: 'dBm',
    typicalRange: '-30 to -90 dBm',
    healthyRange: '> -70 dBm'
  },
  LATENCY: {
    term: 'Latency',
    fullName: 'Network Latency',
    definition: 'Time for data to travel to server and back.',
    units: 'ms',
    typicalRange: '1-500ms',
    healthyRange: '< 100ms'
  },
  UPTIME: {
    term: 'Uptime',
    fullName: 'System Uptime',
    definition: 'Time since last system restart.',
    units: 'days/hours',
    typicalRange: 'N/A',
    healthyRange: 'N/A'
  },
  GPS: {
    term: 'GPS',
    fullName: 'Global Positioning System',
    definition: 'Satellite-based location service.',
    units: 'coordinates',
    typicalRange: 'N/A',
    healthyRange: 'Fix acquired'
  },
  LAN: {
    term: 'LAN',
    fullName: 'Local Area Network',
    definition: 'Local network connecting nearby devices.',
    units: 'N/A',
    typicalRange: 'N/A',
    healthyRange: 'Connected'
  },
  API: {
    term: 'API',
    fullName: 'Application Programming Interface',
    definition: 'Interface for communicating with backend services.',
    units: 'N/A',
    typicalRange: 'N/A',
    healthyRange: 'Responding'
  },
  PIN: {
    term: 'PIN',
    fullName: 'Personal Identification Number',
    definition: 'A numeric code used to verify identity for admin actions.',
    units: 'N/A',
    typicalRange: '4-6 digits',
    healthyRange: 'N/A'
  },
  SSID: {
    term: 'SSID',
    fullName: 'Service Set Identifier',
    definition: 'The name of a WiFi network.',
    units: 'N/A',
    typicalRange: 'N/A',
    healthyRange: 'N/A'
  }
};

// Status explanations
export const STATUS_EXPLANATIONS = {
  OK: {
    label: 'OK',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: CheckCircle,
    description: 'Service is operating normally.',
    action: 'No action required.'
  },
  DEGRADED: {
    label: 'DEGRADED',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: AlertTriangle,
    description: 'Service is running but with reduced functionality or performance.',
    action: 'Check system resources and logs for issues.'
  },
  NOT_CONFIGURED: {
    label: 'NOT CONFIGURED',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Info,
    description: 'Service is not set up or endpoint is not reachable.',
    action: 'Configure the service in Admin Console or check network settings.'
  },
  FORBIDDEN: {
    label: 'FORBIDDEN',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle,
    description: 'Access denied. Authentication or permissions required.',
    action: 'Check credentials and permissions in Admin Console.'
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    icon: HelpCircle,
    description: 'Status cannot be determined.',
    action: 'Run self-test to check system status.'
  }
};

// Trust badge types
export const TRUST_BADGES = {
  VERIFIED: {
    label: 'VERIFIED',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Direct measurement from source'
  },
  DERIVED: {
    label: 'DERIVED',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Computed from multiple data points'
  },
  ESTIMATED: {
    label: 'ESTIMATED',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Model-based estimate'
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    description: 'Data source not verified'
  }
};

// Freshness indicators
export const FRESHNESS = {
  LIVE: { label: 'LIVE', color: 'text-green-500', maxAge: 30000 }, // < 30s
  CACHED: { label: 'CACHED', color: 'text-blue-500', maxAge: 300000 }, // < 5min
  STALE: { label: 'STALE', color: 'text-amber-500', maxAge: 3600000 }, // < 1hr
  UNKNOWN: { label: 'UNKNOWN', color: 'text-muted-foreground', maxAge: Infinity }
};

// Get freshness from timestamp
export const getFreshness = (timestamp) => {
  if (!timestamp) return FRESHNESS.UNKNOWN;
  const age = Date.now() - timestamp;
  if (age < FRESHNESS.LIVE.maxAge) return FRESHNESS.LIVE;
  if (age < FRESHNESS.CACHED.maxAge) return FRESHNESS.CACHED;
  if (age < FRESHNESS.STALE.maxAge) return FRESHNESS.STALE;
  return FRESHNESS.UNKNOWN;
};

// Help Tooltip Component
export const HelpTooltip = ({ term, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const glossaryEntry = GLOSSARY[term?.toUpperCase()];

  if (!glossaryEntry) {
    return <span className={className}>{children || term}</span>;
  }

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      {children || term}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-muted-foreground hover:text-primary transition-colors"
        data-testid={`help-tooltip-${term?.toLowerCase()}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg text-sm animate-fade-in">
          <div className="font-semibold text-foreground mb-1">{glossaryEntry.fullName}</div>
          <div className="text-muted-foreground mb-2">{glossaryEntry.definition}</div>
          {glossaryEntry.units !== 'N/A' && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Units:</span> {glossaryEntry.units}
            </div>
          )}
          {glossaryEntry.typicalRange !== 'N/A' && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Typical:</span> {glossaryEntry.typicalRange}
            </div>
          )}
          {glossaryEntry.healthyRange !== 'N/A' && (
            <div className="text-xs text-green-500">
              <span className="font-medium">Healthy:</span> {glossaryEntry.healthyRange}
            </div>
          )}
        </div>
      )}
    </span>
  );
};

// Trust Badge Component
export const TrustBadge = ({ type = 'UNKNOWN', showLabel = true, className = '' }) => {
  const badge = TRUST_BADGES[type] || TRUST_BADGES.UNKNOWN;
  
  return (
    <span 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${badge.bgColor} ${badge.color} ${className}`}
      title={badge.description}
      data-testid={`trust-badge-${type?.toLowerCase()}`}
    >
      {showLabel && badge.label}
    </span>
  );
};

// Provenance Strip Component
export const ProvenanceStrip = ({ 
  source = 'UNKNOWN', 
  lastUpdated = null, 
  window = null,
  trustType = 'UNKNOWN',
  className = '' 
}) => {
  const freshness = getFreshness(lastUpdated);
  const formattedTime = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString()
    : 'Never';

  return (
    <div 
      className={`flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2 ${className}`}
      data-testid="provenance-strip"
    >
      <span className="flex items-center gap-1">
        <span className="font-medium">Source:</span>
        <span className="text-foreground">{source}</span>
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1">
        <span className="font-medium">Updated:</span>
        <span className="text-foreground">{formattedTime}</span>
      </span>
      <span className="text-border">|</span>
      <span className={`font-medium ${freshness.color}`}>
        {freshness.label}
      </span>
      {window && (
        <>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="font-medium">Window:</span>
            <span className="text-foreground">{window}</span>
          </span>
        </>
      )}
      <TrustBadge type={trustType} className="ml-auto" />
    </div>
  );
};

// Panel Help Icon Component
export const PanelHelpIcon = ({ 
  title,
  description,
  states = [],
  nextSteps = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-secondary transition-colors"
        data-testid="panel-help-icon"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 p-4 bg-popover border border-border rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          {states.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-foreground mb-2">Possible States:</div>
              <div className="space-y-1">
                {states.map((state, i) => {
                  const statusInfo = STATUS_EXPLANATIONS[state] || STATUS_EXPLANATIONS.UNKNOWN;
                  const Icon = statusInfo.icon;
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs ${statusInfo.color}`}>
                      <Icon className="w-3 h-3" />
                      <span className="font-medium">{statusInfo.label}:</span>
                      <span className="text-muted-foreground">{statusInfo.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {nextSteps.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-foreground mb-2">What to do:</div>
              <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                {nextSteps.slice(0, 3).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Progressive Disclosure Panel Wrapper
export const ProgressivePanel = ({
  title,
  summary,
  lastUpdated,
  recommendedAction,
  onActionClick,
  actionLabel = 'Take Action',
  helpProps,
  provenanceProps,
  children,
  defaultExpanded = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`} data-testid="progressive-panel">
      {/* Summary View (Always Visible) */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {helpProps && <PanelHelpIcon {...helpProps} />}
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{summary}</p>
        
        <div className="flex items-center gap-2">
          {recommendedAction && (
            <button
              onClick={onActionClick}
              className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="panel-action-btn"
            >
              {actionLabel}
            </button>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="panel-expand-btn"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Details View (Expanded) */}
      {expanded && (
        <div className="border-t border-border bg-secondary/20 p-4 animate-fade-in" data-testid="panel-details">
          {children}
          {provenanceProps && <ProvenanceStrip {...provenanceProps} />}
        </div>
      )}
    </div>
  );
};

// View Evidence Modal/Panel
export const ViewEvidencePanel = ({ 
  clientEvidence = [], 
  systemEvidenceStatus = 'PLANNED',
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('client');

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-4" data-testid="evidence-panel">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">View Evidence</h4>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border">
        <button
          onClick={() => setActiveTab('client')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'client' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          data-testid="evidence-tab-client"
        >
          Client Evidence
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'system' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          data-testid="evidence-tab-system"
        >
          System Evidence
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-500 rounded">PLANNED</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'client' && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {clientEvidence.length === 0 ? (
            <p className="text-sm text-muted-foreground">No client requests logged yet.</p>
          ) : (
            clientEvidence.map((req, i) => (
              <div key={i} className="text-xs p-2 bg-secondary/50 rounded">
                <div className="flex items-center justify-between">
                  <span className={req.success ? 'text-green-500' : 'text-red-500'}>
                    {req.method} {req.status}
                  </span>
                  <span className="text-muted-foreground">{req.latency}ms</span>
                </div>
                <div className="text-muted-foreground truncate">{req.url}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'system' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-amber-500">PLANNED</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            System evidence from backend event logs will be available when the API is implemented.
          </p>
          <div className="text-xs text-muted-foreground">
            <div className="font-medium mb-1">Intended Schema:</div>
            <pre className="bg-secondary/50 p-2 rounded overflow-x-auto">
{`{
  "events": [...],
  "source": "backend_event_log",
  "timestamp": "ISO8601"
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  GLOSSARY,
  STATUS_EXPLANATIONS,
  TRUST_BADGES,
  FRESHNESS,
  getFreshness,
  HelpTooltip,
  TrustBadge,
  ProvenanceStrip,
  PanelHelpIcon,
  ProgressivePanel,
  ViewEvidencePanel
};
