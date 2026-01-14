import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Database, Server, Inbox, Lock, Settings, Info, AlertCircle, Wrench } from 'lucide-react';
import { useConnection, CONNECTION_STATES, ENDPOINT_STATUS } from '../contexts/ConnectionContext';
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
    [CONNECTION_STATES.FORBIDDEN]: {
      icon: Lock,
      label: 'Auth Required',
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
      borderColor: 'border-destructive/30',
      tooltip: 'Authentication required for backend access.',
    },
    [CONNECTION_STATES.NOT_CONFIGURED]: {
      icon: Settings,
      label: 'Not Configured',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted-foreground/30',
      tooltip: 'Endpoint not configured on this device.',
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

// ============================================================
// FORBIDDEN STATE - For endpoints requiring authentication
// ============================================================

export function ForbiddenState({ 
  title = 'Access Restricted',
  message = 'Admin Access Required',
  description = 'This feature requires administrator privileges.',
  showRetry = false,
  showContactAdmin = false,
  onRetry,
  className = '' 
}) {
  return (
    <div className={`p-6 rounded-xl bg-destructive/10 border border-destructive/30 text-center ${className}`} data-testid="forbidden-state">
      <div className="inline-flex p-3 rounded-full bg-destructive/20 mb-3">
        <Lock className="w-6 h-6 text-destructive" />
      </div>
      <h4 className="font-semibold text-destructive mb-1">{title}</h4>
      <p className="text-sm text-foreground mb-2">{message}</p>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      <div className="flex items-center justify-center gap-2">
        {showRetry && onRetry && (
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
        {showContactAdmin && (
          <span className="text-xs text-muted-foreground">Contact an administrator for access.</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DEGRADED STATE - For endpoints with partial failure
// ============================================================

export function DegradedState({ 
  title = 'Service Degraded',
  message = 'Partial functionality available',
  description = 'Some features may not work correctly.',
  showTroubleshooting = false,
  troubleshootSteps = [],
  onRetry,
  className = '' 
}) {
  const [showSteps, setShowSteps] = React.useState(false);
  
  return (
    <div className={`p-6 rounded-xl bg-warning/10 border border-warning/30 ${className}`} data-testid="degraded-state">
      <div className="text-center mb-4">
        <div className="inline-flex p-3 rounded-full bg-warning/20 mb-3">
          <AlertCircle className="w-6 h-6 text-warning" />
        </div>
        <h4 className="font-semibold text-warning mb-1">{title}</h4>
        <p className="text-sm text-foreground mb-1">{message}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      
      {showTroubleshooting && troubleshootSteps.length > 0 && (
        <div className="mt-4">
          <button 
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm"
          >
            <span className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-warning" />
              Troubleshooting Steps
            </span>
            <span className="text-xs text-muted-foreground">{showSteps ? '▲' : '▼'}</span>
          </button>
          
          {showSteps && (
            <div className="mt-2 p-3 rounded-lg bg-secondary/20 space-y-2 animate-fade-in">
              {troubleshootSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-warning font-mono">{i + 1}.</span>
                  <code className="flex-1 font-mono bg-secondary/50 px-2 py-1 rounded break-all">{step}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {onRetry && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="gap-2 border-warning/30 text-warning hover:bg-warning/10"
          >
            <RefreshCw className="w-4 h-4" />
            Check Again
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// NOT CONFIGURED STATE - For features not yet set up
// ============================================================

export function NotConfiguredState({ 
  title = 'Not Configured',
  message = 'Feature Not Set Up',
  description = 'This feature has not been configured on this device.',
  setupInstructions = [],
  setupLink = null,
  className = '' 
}) {
  return (
    <div className={`p-6 rounded-xl bg-secondary/30 border border-border/50 text-center ${className}`} data-testid="not-configured-state">
      <div className="inline-flex p-3 rounded-full bg-muted/50 mb-3">
        <Settings className="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-2">{message}</p>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      
      {setupInstructions.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-secondary/20 text-left">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Setup Required:
          </p>
          <ul className="space-y-1">
            {setupInstructions.map((instruction, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {setupLink && (
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="mt-4 gap-2"
        >
          <a href={setupLink} target="_blank" rel="noopener noreferrer">
            <Settings className="w-4 h-4" />
            Configure
          </a>
        </Button>
      )}
    </div>
  );
}

// ============================================================
// ENDPOINT STATUS BADGE - Shows individual endpoint state
// ============================================================

export function EndpointStatusBadge({ 
  endpointName,
  className = '' 
}) {
  const { getEndpointStatus } = useConnection();
  const endpointState = getEndpointStatus(endpointName);
  
  const statusConfig = {
    [ENDPOINT_STATUS.OK]: {
      label: 'LIVE',
      color: 'text-success',
      bgColor: 'bg-success/20',
      borderColor: 'border-success/30',
    },
    [ENDPOINT_STATUS.FORBIDDEN]: {
      label: 'LOCKED',
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
      borderColor: 'border-destructive/30',
    },
    [ENDPOINT_STATUS.DEGRADED]: {
      label: 'DEGRADED',
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning/30',
    },
    [ENDPOINT_STATUS.NOT_CONFIGURED]: {
      label: 'NOT SET UP',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted-foreground/30',
    },
    [ENDPOINT_STATUS.ERROR]: {
      label: 'ERROR',
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
      borderColor: 'border-destructive/30',
    },
    [ENDPOINT_STATUS.TIMEOUT]: {
      label: 'TIMEOUT',
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning/30',
    },
    [ENDPOINT_STATUS.UNKNOWN]: {
      label: 'UNKNOWN',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted-foreground/30',
    },
  };
  
  const config = statusConfig[endpointState.status] || statusConfig[ENDPOINT_STATUS.UNKNOWN];
  
  return (
    <span 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bgColor} ${config.color} border ${config.borderColor} ${className}`}
      title={`Endpoint: ${endpointName} - ${config.label}`}
      data-testid={`endpoint-badge-${endpointName}`}
    >
      {config.label}
    </span>
  );
}
