import React, { useState } from 'react';
import { 
  Wifi, 
  Radio, 
  MessageSquare, 
  Antenna,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
  Volume2,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

// Mock comms status - will be replaced with real data from Pi
const getMockCommsStatus = () => ({
  lan: {
    id: 'lan',
    name: 'LAN / Wi-Fi',
    shortName: 'LAN',
    icon: Wifi,
    status: 'available',
    statusReason: 'Connected to local network. 3 nodes reachable.',
    lastCheck: new Date(),
    details: {
      connected: true,
      nodesReachable: 3,
      latency: '12ms',
    },
    helpText: 'Standard network connection. Best for high-speed data transfer.',
  },
  mesh: {
    id: 'mesh',
    name: 'Mesh / LoRa',
    shortName: 'Mesh',
    icon: Radio,
    status: 'degraded',
    statusReason: 'Weak signal. 1 of 2 nodes intermittent.',
    lastCheck: new Date(),
    details: {
      connected: true,
      nodesReachable: 1,
      signalStrength: 'weak',
    },
    helpText: 'Low-power long-range radio. Works when other methods fail.',
  },
  sdr: {
    id: 'sdr',
    name: 'Radio / SDR',
    shortName: 'SDR',
    icon: Volume2,
    status: 'available',
    statusReason: 'SDR receiver active. Scanning 146.52 MHz.',
    lastCheck: new Date(),
    details: {
      connected: true,
      frequency: '146.52 MHz',
      mode: 'FM',
    },
    helpText: 'Software-defined radio for voice and data. Requires antenna.',
  },
  sms: {
    id: 'sms',
    name: 'SMS Gateway',
    shortName: 'SMS',
    icon: MessageSquare,
    status: 'unavailable',
    statusReason: 'No cellular signal. SMS gateway offline.',
    lastCheck: new Date(Date.now() - 300000),
    details: {
      connected: false,
      reason: 'No cellular coverage',
    },
    helpText: 'Uses cellular network to send text messages to phones.',
  },
  hf: {
    id: 'hf',
    name: 'HF Radio Bridge',
    shortName: 'HF',
    icon: Antenna,
    status: 'unavailable',
    statusReason: 'HF radio module not configured.',
    lastCheck: null,
    details: {
      configured: false,
      reason: 'Not yet implemented',
    },
    helpText: 'Long-distance radio for continental range. Requires licensing.',
  },
});

const statusConfig = {
  available: {
    color: 'text-success',
    bgColor: 'bg-success/15',
    borderColor: 'border-success/40',
    dotColor: 'bg-success',
    icon: CheckCircle,
    label: 'Available',
    shortLabel: 'UP',
    description: 'Ready to use',
  },
  degraded: {
    color: 'text-warning',
    bgColor: 'bg-warning/15',
    borderColor: 'border-warning/40',
    dotColor: 'bg-warning',
    icon: AlertTriangle,
    label: 'Degraded',
    shortLabel: 'WEAK',
    description: 'Working but limited',
  },
  unavailable: {
    color: 'text-destructive',
    bgColor: 'bg-destructive/15',
    borderColor: 'border-destructive/40',
    dotColor: 'bg-destructive',
    icon: XCircle,
    label: 'Unavailable',
    shortLabel: 'DOWN',
    description: 'Cannot connect',
  },
};

// Degraded explanation content
const degradedExplanation = {
  title: 'What "Degraded" means',
  description: 'The transport is working but experiencing issues. Messages may be delayed, partially delivered, or require retries.',
  causes: [
    'Weak signal strength or interference',
    'Some nodes unreachable',
    'High latency or packet loss',
    'Antenna positioning issues',
  ],
  fixes: [
    'Move to higher ground or clear line of sight',
    'Check antenna connections',
    'Reduce distance between nodes',
    'Try a different transport if critical',
  ],
};

// Unavailable explanation content
const unavailableExplanation = {
  title: 'Why this is unavailable',
  causes: [
    'Hardware not connected or powered',
    'Service not running or crashed',
    'No coverage in current location',
    'Configuration error',
  ],
  fixes: [
    'Check hardware connections',
    'Verify the transport is enabled in settings',
    'Move to area with better coverage',
    'Use an alternative transport method',
  ],
};

const CommsCard = ({ method, isSelected, onSelect }) => {
  const config = statusConfig[method.status];
  const StatusIcon = config.icon;
  const MethodIcon = method.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect(method.id)}
            className={`flex-1 min-w-[90px] p-2.5 rounded-xl border-2 transition-all ${
              isSelected 
                ? `${config.bgColor} ${config.borderColor} ring-2 ring-primary ring-offset-1 ring-offset-background shadow-md` 
                : `glass border-transparent hover:${config.bgColor} hover:border-border`
            }`}
            data-testid={`comms-card-${method.id}`}
          >
            {/* Status Dot - Top Right */}
            <div className="flex items-center justify-between mb-2">
              <MethodIcon className={`w-5 h-5 ${isSelected ? config.color : 'text-muted-foreground'}`} />
              <div className={`w-3 h-3 rounded-full ${config.dotColor} ${method.status === 'available' ? '' : method.status === 'degraded' ? 'animate-pulse' : ''}`} />
            </div>
            
            {/* Name & Status */}
            <div className="text-left">
              <div className={`text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {method.shortName}
              </div>
              <div className={`text-xs font-bold ${config.color}`}>
                {config.shortLabel}
              </div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[280px]">
          <div className="space-y-1.5">
            <div className="font-semibold text-sm flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${config.color}`} />
              {method.name}
            </div>
            <div className="text-xs text-muted-foreground">{method.statusReason}</div>
            <div className="text-xs text-muted-foreground/70 italic">{method.helpText}</div>
            {method.lastCheck && (
              <div className="text-xs text-muted-foreground/70 pt-1 border-t border-border/50">
                Last check: {formatTimeAgo(method.lastCheck)}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const formatTimeAgo = (date) => {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
};

// Inline explanation panel component
const ExplanationPanel = ({ type, method, onDismiss }) => {
  const explanation = type === 'degraded' ? degradedExplanation : unavailableExplanation;
  const config = statusConfig[type];
  
  return (
    <div className={`mt-3 glass rounded-xl p-4 border-2 ${config.borderColor} animate-fade-in`} data-testid={`${type}-explanation`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {type === 'degraded' ? (
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          )}
          <span className={`font-bold text-sm ${config.color}`}>{explanation.title}</span>
        </div>
      </div>
      
      {/* Specific reason for this method */}
      {method?.statusReason && (
        <p className="text-xs text-foreground mb-3 p-2 glass rounded-lg">
          <strong>Current issue:</strong> {method.statusReason}
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Likely Causes */}
        <div>
          <div className="font-semibold text-foreground mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Likely Causes
          </div>
          <ul className="space-y-1 text-muted-foreground">
            {explanation.causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className={config.color}>•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* How to Fix */}
        <div>
          <div className="font-semibold text-foreground mb-1.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-success" />
            How to Fix
          </div>
          <ol className="space-y-1 text-muted-foreground">
            {explanation.fixes.map((fix, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="w-4 h-4 rounded-full bg-success/20 text-success text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span>{fix}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default function CommsAvailabilityPanel({ onMethodSelect, selectedMethod }) {
  const [commsStatus] = useState(getMockCommsStatus());
  const [expanded, setExpanded] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  
  const methods = Object.values(commsStatus);
  const availableCount = methods.filter(m => m.status === 'available').length;
  const degradedCount = methods.filter(m => m.status === 'degraded').length;
  const unavailableCount = methods.filter(m => m.status === 'unavailable').length;
  
  const selectedMethodData = selectedMethod ? commsStatus[selectedMethod] : null;
  const selectedStatus = selectedMethodData?.status;
  
  return (
    <div className="mb-4" data-testid="comms-availability-panel">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-2 group"
        data-testid="comms-panel-toggle"
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Communications</span>
          
          {/* Status Summary Badges */}
          <div className="flex items-center gap-1.5 text-xs">
            {availableCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-success/15 text-success font-bold border border-success/30">
                {availableCount} UP
              </span>
            )}
            {degradedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning font-bold border border-warning/30">
                {degradedCount} WEAK
              </span>
            )}
            {unavailableCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-bold border border-destructive/30">
                {unavailableCount} DOWN
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Cards */}
      {expanded && (
        <>
          {/* Helper Text */}
          <p className="text-xs text-muted-foreground mb-2">
            Select a transport to send messages. <span className="text-success font-medium">Green = ready</span>, <span className="text-warning font-medium">Yellow = limited</span>, <span className="text-destructive font-medium">Red = offline</span>.
          </p>
          
          <div className="flex gap-2 flex-wrap animate-fade-in" data-testid="comms-methods">
            {methods.map((method) => (
              <CommsCard
                key={method.id}
                method={method}
                isSelected={selectedMethod === method.id}
                onSelect={onMethodSelect}
              />
            ))}
          </div>
          
          {/* Status Legend - Always visible */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                <span className="text-muted-foreground">Degraded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Unavailable</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Selected Method Info Bar - "Sending via X" */}
      {expanded && selectedMethod && (
        <div className={`mt-3 glass-strong rounded-xl p-3 flex items-center justify-between border-2 ${
          statusConfig[selectedStatus]?.borderColor || 'border-border'
        } animate-fade-in`} data-testid="selected-comms-info">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${statusConfig[selectedStatus]?.color || 'text-primary'}`} />
            <span className="text-sm font-semibold">
              Sending via <span className={statusConfig[selectedStatus]?.color}>{selectedMethodData?.name}</span>
            </span>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusConfig[selectedStatus]?.bgColor} ${statusConfig[selectedStatus]?.color}`}>
            {statusConfig[selectedStatus]?.label}
          </span>
        </div>
      )}
      
      {/* Inline Explanation for Degraded */}
      {expanded && selectedMethod && selectedStatus === 'degraded' && showExplanation && (
        <ExplanationPanel type="degraded" method={selectedMethodData} />
      )}
      
      {/* Inline Explanation for Unavailable */}
      {expanded && selectedMethod && selectedStatus === 'unavailable' && showExplanation && (
        <ExplanationPanel type="unavailable" method={selectedMethodData} />
      )}
    </div>
  );
}
