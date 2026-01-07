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
  Info
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
  },
  mesh: {
    id: 'mesh',
    name: 'Mesh / LoRa',
    shortName: 'Mesh',
    icon: Radio,
    status: 'degraded',
    statusReason: 'Weak signal. 1 of 2 nodes intermittent. Try repositioning antenna.',
    lastCheck: new Date(),
    details: {
      connected: true,
      nodesReachable: 1,
      signalStrength: 'weak',
    },
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
  },
  hf: {
    id: 'hf',
    name: 'HF Radio Bridge',
    shortName: 'HF',
    icon: Antenna,
    status: 'unavailable',
    statusReason: 'HF radio module not configured. Future feature.',
    lastCheck: null,
    details: {
      configured: false,
      reason: 'Not yet implemented',
    },
  },
});

const statusConfig = {
  available: {
    color: 'text-success',
    bgColor: 'bg-success-light',
    borderColor: 'border-success/30',
    icon: CheckCircle,
    label: 'Available',
  },
  degraded: {
    color: 'text-warning',
    bgColor: 'bg-warning-light',
    borderColor: 'border-warning/30',
    icon: AlertTriangle,
    label: 'Degraded',
  },
  unavailable: {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
    icon: XCircle,
    label: 'Unavailable',
  },
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
            className={`flex-1 min-w-[100px] p-2.5 rounded-lg border transition-all ${config.borderColor} ${
              isSelected 
                ? `${config.bgColor} ring-2 ring-primary ring-offset-1 ring-offset-background` 
                : `glass hover:${config.bgColor}`
            }`}
            data-testid={`comms-card-${method.id}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <MethodIcon className={`w-4 h-4 ${isSelected ? config.color : 'text-muted-foreground'}`} />
              <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
            </div>
            <div className="text-left">
              <div className={`text-xs font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {method.shortName}
              </div>
              <div className={`text-xs ${config.color}`}>
                {config.label}
              </div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px]">
          <div className="space-y-1">
            <div className="font-semibold text-sm">{method.name}</div>
            <div className="text-xs text-muted-foreground">{method.statusReason}</div>
            {method.lastCheck && (
              <div className="text-xs text-muted-foreground/70">
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

export default function CommsAvailabilityPanel({ onMethodSelect, selectedMethod }) {
  const [commsStatus] = useState(getMockCommsStatus());
  const [expanded, setExpanded] = useState(true);
  
  const methods = Object.values(commsStatus);
  const availableCount = methods.filter(m => m.status === 'available').length;
  const degradedCount = methods.filter(m => m.status === 'degraded').length;
  
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
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-1.5 py-0.5 rounded bg-success-light text-success font-medium">
              {availableCount} up
            </span>
            {degradedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-warning-light text-warning font-medium">
                {degradedCount} degraded
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Cards */}
      {expanded && (
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
      )}
      
      {/* Selected Method Info */}
      {expanded && selectedMethod && (
        <div className="mt-2 glass rounded-lg p-2 flex items-center gap-2 text-xs animate-fade-in" data-testid="selected-comms-info">
          <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">
            Sending via <strong className="text-foreground">{commsStatus[selectedMethod]?.name}</strong>. 
            {commsStatus[selectedMethod]?.status !== 'available' && (
              <span className="text-warning"> Note: This transport is {commsStatus[selectedMethod]?.status}.</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
