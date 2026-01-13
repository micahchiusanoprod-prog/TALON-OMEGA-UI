import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Database, Server, Inbox } from 'lucide-react';
import { useConnection, CONNECTION_STATES } from '../contexts/ConnectionContext';
import { Button } from './ui/button';

// ============================================================
// CONNECTION STATUS CHIP - Global Header Component
// ============================================================

export function ConnectionStatusChip({ className = '' }) {
  const { status, lastPing, isBackendConnected } = useConnection();

  const statusConfig = {
    [CONNECTION_STATES.CONNECTED]: {
      icon: Wifi,
      label: 'Connected',
      color: 'text-success',
      bgColor: 'bg-success/20',
      borderColor: 'border-success/30',
      tooltip: 'Live data from OMEGA backend.',
    },
    [CONNECTION_STATES.DEGRADED]: {
      icon: AlertTriangle,
      label: 'Degraded',
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning/30',
      tooltip: 'Backend reachable but some endpoints failing.',
    },
    [CONNECTION_STATES.NOT_CONNECTED]: {
      icon: WifiOff,
      label: 'Not Connected',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted-foreground/30',
      tooltip: 'Using mock data. Backend not connected yet.',
    },
  };

  const config = statusConfig[status] || statusConfig[CONNECTION_STATES.NOT_CONNECTED];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${config.bgColor} border ${config.borderColor} cursor-help ${className}`}
      title={config.tooltip}
      data-testid="connection-status-chip"
    >
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      {lastPing && status === CONNECTION_STATES.CONNECTED && (
        <span className="text-[10px] text-muted-foreground ml-1">
          {new Date(lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

// ============================================================
// DATA SOURCE BADGE - Per-Panel Component
// ============================================================

export function DataSourceBadge({ 
  panelId, 
  forceMock = false, 
  forceLive = false,
  className = '' 
}) {
  const { getDataSourceStatus } = useConnection();
  
  // Allow forced states for specific panels or derive from connection
  const status = forceLive ? 'live' : (forceMock ? 'mock' : getDataSourceStatus(panelId));

  if (status === 'live') {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success border border-success/30 ${className}`}
        title="Real-time data from OMEGA backend"
        data-testid={`data-source-badge-${panelId || 'default'}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        LIVE
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 ${className}`}
      title="Using mock data. Backend not connected yet."
      data-testid={`data-source-badge-${panelId || 'default'}`}
    >
      <Database className="w-2.5 h-2.5" />
      MOCK DATA
    </span>
  );
}

// ============================================================
// LOADING SKELETON - Standard Loading State
// ============================================================

export function LoadingSkeleton({ 
  lines = 3, 
  showIcon = true,
  message = 'Loading...',
  className = '' 
}) {
  return (
    <div className={`p-4 rounded-xl bg-secondary/30 animate-pulse ${className}`} data-testid="loading-skeleton">
      <div className="flex items-center gap-3 mb-3">
        {showIcon && (
          <div className="p-2 rounded-lg bg-muted/50">
            <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        )}
        <div className="flex-1">
          <div className="h-4 w-1/3 bg-muted/50 rounded mb-2" />
          <div className="h-3 w-1/2 bg-muted/30 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className="h-3 bg-muted/30 rounded" 
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
      {message && (
        <p className="text-xs text-muted-foreground text-center mt-3">{message}</p>
      )}
    </div>
  );
}

// ============================================================
// ERROR STATE - Standard Error Display
// ============================================================

export function ErrorState({ 
  title = 'Error loading data',
  message = 'Something went wrong. Please try again.',
  onRetry,
  className = '' 
}) {
  return (
    <div className={`p-6 rounded-xl bg-destructive/10 border border-destructive/30 text-center ${className}`} data-testid="error-state">
      <div className="inline-flex p-3 rounded-full bg-destructive/20 mb-3">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <h4 className="font-semibold text-destructive mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

// ============================================================
// EMPTY STATE - Standard Empty Display
// ============================================================

export function EmptyState({ 
  icon: Icon = Inbox,
  title = 'No data available',
  message = 'There\'s nothing to display here yet.',
  action,
  actionLabel = 'Add item',
  className = '' 
}) {
  return (
    <div className={`p-6 rounded-xl bg-secondary/30 border border-border/50 text-center ${className}`} data-testid="empty-state">
      <div className="inline-flex p-3 rounded-full bg-muted/50 mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {action && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action}
          className="gap-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================================
// PANEL HEADER WITH DATA SOURCE - Reusable Panel Header
// ============================================================

export function PanelHeader({
  icon: Icon,
  title,
  subtitle,
  panelId,
  showDataSource = true,
  actions,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/20',
  className = '',
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{title}</h3>
            {showDataSource && <DataSourceBadge panelId={panelId} />}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ============================================================
// DATA WRAPPER - Handles loading/error/empty states
// ============================================================

export function DataWrapper({
  loading = false,
  error = null,
  data,
  isEmpty,
  loadingLines = 3,
  loadingMessage = 'Loading...',
  errorTitle,
  errorMessage,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  emptyActionLabel,
  children,
  className = '',
}) {
  if (loading) {
    return <LoadingSkeleton lines={loadingLines} message={loadingMessage} className={className} />;
  }

  if (error) {
    return (
      <ErrorState 
        title={errorTitle} 
        message={error?.message || errorMessage} 
        onRetry={onRetry}
        className={className}
      />
    );
  }

  const dataIsEmpty = isEmpty !== undefined ? isEmpty : (!data || (Array.isArray(data) && data.length === 0));
  
  if (dataIsEmpty) {
    return (
      <EmptyState 
        icon={emptyIcon}
        title={emptyTitle} 
        message={emptyMessage}
        action={emptyAction}
        actionLabel={emptyActionLabel}
        className={className}
      />
    );
  }

  return children;
}
