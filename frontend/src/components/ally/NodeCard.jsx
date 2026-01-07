import React from 'react';
import { Button } from '../ui/button';
import { 
  MessageSquare, 
  Info, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Battery,
  Thermometer,
  MapPin,
  Server
} from 'lucide-react';

export default function NodeCard({ node, onMessage, onDetails, onPing }) {
  const getStatusColor = () => {
    if (node.status === 'online') return 'text-success';
    if (node.status === 'degraded') return 'text-warning';
    return 'text-destructive';
  };

  const getStatusIcon = () => {
    if (node.status === 'online') return CheckCircle;
    if (node.status === 'degraded') return AlertTriangle;
    return XCircle;
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getSignalStrength = (rssi) => {
    if (!rssi) return 'Unknown';
    if (rssi > -50) return 'Excellent';
    if (rssi > -60) return 'Good';
    if (rssi > -70) return 'Fair';
    return 'Weak';
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="glass p-4 rounded-lg hover:glass-strong transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
            <h3 className="text-sm font-semibold text-foreground truncate">
              {node.name}
            </h3>
            {node.alerts_count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-destructive-light text-destructive text-xs font-medium">
                {node.alerts_count}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div>ID: {node.node_id} {node.role && `• ${node.role}`}</div>
            <div className="flex items-center gap-3">
              <span>Status: <span className={`font-medium ${getStatusColor()}`}>{node.status}</span></span>
              <span>Last seen: {formatLastSeen(node.last_seen)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Link: {node.link_type}</span>
              {node.rssi && <span>Signal: {getSignalStrength(node.rssi)}</span>}
            </div>
            {node.ip && (
              <div>
                IP: <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{node.ip}</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onMessage(node.node_id)}
          className="flex-1 h-8 text-xs bg-primary hover:bg-primary-hover"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Message
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPing(node.node_id)}
          className="flex-1 h-8 text-xs border-border-strong bg-secondary/30"
        >
          <Activity className="w-3 h-3 mr-1" />
          Ping
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDetails(node)}
          className="flex-1 h-8 text-xs border-border-strong bg-secondary/30"
        >
          <Info className="w-3 h-3 mr-1" />
          Details
        </Button>
      </div>
    </div>
  );
}
