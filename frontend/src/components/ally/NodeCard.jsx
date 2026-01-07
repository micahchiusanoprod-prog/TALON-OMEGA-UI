import React from 'react';
import { Button } from '../ui/button';
import { 
  MessageSquare, 
  Info, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Circle,
  HelpCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { captureScrollPosition } from '../../utils/scrollLock';

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

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-success bg-success-light';
      case 'okay': return 'text-warning bg-warning-light';
      case 'need_help': return 'text-destructive bg-destructive-light animate-critical-flash';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getUserStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'GOOD';
      case 'okay': return 'OKAY';
      case 'need_help': return 'NEED HELP';
      default: return null;
    }
  };

  const getUserStatusIcon = (status) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'okay': return Circle;
      case 'need_help': return HelpCircle;
      default: return null;
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatStatusTime = (timestamp) => {
    if (!timestamp) return '';
    const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getSignalStrength = (rssi) => {
    if (rssi === null || rssi === undefined) return null;
    if (rssi > -50) return { label: 'Excellent', color: 'text-success' };
    if (rssi > -60) return { label: 'Good', color: 'text-success' };
    if (rssi > -70) return { label: 'Fair', color: 'text-warning' };
    return { label: 'Weak', color: 'text-destructive' };
  };

  const StatusIcon = getStatusIcon();
  const UserStatusIcon = getUserStatusIcon(node.user_status);
  const userStatusLabel = getUserStatusLabel(node.user_status);
  const signal = getSignalStrength(node.rssi);

  return (
    <div 
      className={`glass p-4 rounded-lg hover:glass-strong transition-smooth ${
        node.user_status === 'need_help' ? 'border-l-4 border-destructive' : ''
      }`}
      data-testid={`node-card-${node.node_id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {/* Header with name and status */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusIcon className={`w-4 h-4 flex-shrink-0 ${getStatusColor()}`} />
            <h3 className="text-sm font-semibold text-foreground truncate">
              {node.name || 'Unknown Device'}
            </h3>
            
            {/* User Status Badge */}
            {userStatusLabel && (
              <span 
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getUserStatusColor(node.user_status)}`}
                data-testid={`node-status-badge-${node.node_id}`}
              >
                {UserStatusIcon && <UserStatusIcon className="w-3 h-3" />}
                {userStatusLabel}
                {node.user_status_set_at && (
                  <span className="opacity-75">• {formatStatusTime(node.user_status_set_at)}</span>
                )}
              </span>
            )}
            
            {/* Alerts Badge */}
            {node.alerts_count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-destructive-light text-destructive text-xs font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {node.alerts_count}
              </span>
            )}
          </div>
          
          {/* User Status Note */}
          {node.user_status === 'need_help' && node.user_status_note && (
            <div className="mb-2 px-2 py-1 rounded bg-destructive-light text-destructive text-xs">
              <span className="font-medium">Note:</span> {node.user_status_note}
            </div>
          )}
          
          {/* Device Info Grid */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span>ID: <span className="font-medium text-foreground">{node.node_id}</span></span>
              {node.role && <span>• {node.role}</span>}
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                {node.status === 'online' ? (
                  <Wifi className="w-3 h-3 text-success" />
                ) : (
                  <WifiOff className="w-3 h-3 text-destructive" />
                )}
                <span className={`font-medium ${getStatusColor()}`}>
                  {node.status ? node.status.charAt(0).toUpperCase() + node.status.slice(1) : 'Unknown'}
                </span>
              </span>
              <span>Last seen: <span className="font-medium">{formatLastSeen(node.last_seen)}</span></span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {node.link_type ? (
                <span>Link: <span className="font-medium">{node.link_type}</span></span>
              ) : (
                <span className="text-muted-foreground/60">No connection info</span>
              )}
              {signal && (
                <span>Signal: <span className={`font-medium ${signal.color}`}>{signal.label}</span></span>
              )}
            </div>
            
            {node.ip ? (
              <div>
                IP: {node.url ? (
                  <a 
                    href={node.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline font-medium"
                  >
                    {node.ip}
                  </a>
                ) : (
                  <span className="font-medium">{node.ip}</span>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground/60">IP: N/A</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onMouseDown={captureScrollPosition}
          onClick={(e) => {
            e.preventDefault();
            onMessage(node.node_id);
          }}
          className="flex-1 h-8 text-xs bg-primary hover:bg-primary-hover"
          data-testid={`message-btn-${node.node_id}`}
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Message
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPing(node.node_id)}
          className="flex-1 h-8 text-xs border-border-strong bg-secondary/30"
          disabled={node.status === 'offline'}
          data-testid={`ping-btn-${node.node_id}`}
        >
          <Activity className="w-3 h-3 mr-1" />
          Ping
        </Button>
        <Button
          size="sm"
          variant="outline"
          onMouseDown={captureScrollPosition}
          onClick={(e) => {
            e.preventDefault();
            onDetails(node);
          }}
          className="flex-1 h-8 text-xs border-border-strong bg-secondary/30"
          data-testid={`details-btn-${node.node_id}`}
        >
          <Info className="w-3 h-3 mr-1" />
          Details
        </Button>
      </div>
    </div>
  );
}
