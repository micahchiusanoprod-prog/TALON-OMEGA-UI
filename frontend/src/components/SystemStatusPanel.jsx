import React, { useState, useCallback } from 'react';
import {
  Settings, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle,
  Server, Database, Clock, Copy, Play, RefreshCw, X, ExternalLink,
  Info, ChevronDown, ChevronUp, Zap, ClipboardCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useConnection, CONNECTION_STATES } from '../contexts/ConnectionContext';
import config from '../config';
import AuditPanel from './AuditPanel';

// ============================================================
// SYSTEM STATUS PANEL
// For install verification and debugging
// ============================================================

export default function SystemStatusPanel({ isOpen, onClose }) {
  const {
    status,
    lastPing,
    lastPingTime,
    dataMode,
    endpoints,
    error,
    healthData,
    performHealthCheck,
    runSelfTest,
    getDebugInfo,
    config: connConfig,
  } = useConnection();
  
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  // Status configurations
  const statusConfig = {
    [CONNECTION_STATES.CONNECTED]: {
      icon: Wifi,
      label: 'Connected',
      color: 'text-success',
      bgColor: 'bg-success/20',
      borderColor: 'border-success/30',
    },
    [CONNECTION_STATES.DEGRADED]: {
      icon: AlertTriangle,
      label: 'Degraded',
      color: 'text-warning',
      bgColor: 'bg-warning/20',
      borderColor: 'border-warning/30',
    },
    [CONNECTION_STATES.NOT_CONNECTED]: {
      icon: WifiOff,
      label: 'Not Connected',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted-foreground/30',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig[CONNECTION_STATES.NOT_CONNECTED];
  const StatusIcon = currentStatus.icon;

  // Run self test
  const handleRunSelfTest = useCallback(async () => {
    setIsRunningTest(true);
    setTestResults(null);
    
    try {
      const results = await runSelfTest();
      setTestResults(results);
      
      const passCount = Object.values(results).filter(r => r.status === 'ok').length;
      const totalCount = Object.keys(results).length;
      
      if (passCount === totalCount) {
        toast.success(`Self Test Complete: ${passCount}/${totalCount} PASS`);
      } else {
        toast.warning(`Self Test Complete: ${passCount}/${totalCount} PASS`);
      }
    } catch (err) {
      toast.error('Self test failed: ' + err.message);
    } finally {
      setIsRunningTest(false);
    }
  }, [runSelfTest]);

  // Copy debug info
  const handleCopyDebugInfo = useCallback(() => {
    const debugInfo = getDebugInfo();
    const text = `OMEGA Dashboard Debug Info
============================
Build Version: ${debugInfo.buildVersion}
Build Timestamp: ${debugInfo.buildTimestamp}
API Base URL: ${debugInfo.apiBase}
Kiwix Base URL: ${debugInfo.kiwixBase}
Use Mock Data: ${debugInfo.useMockData}
Connection Status: ${debugInfo.connectionStatus}
Data Mode: ${debugInfo.dataMode}
Last Ping: ${debugInfo.lastPing || 'Never'}
Last Ping Time: ${debugInfo.lastPingTime ? debugInfo.lastPingTime + 'ms' : 'N/A'}
Error: ${debugInfo.error || 'None'}

Endpoints:
${Object.entries(debugInfo.endpoints).map(([k, v]) => `  ${k}: ${v.status} (${v.responseTime ? v.responseTime + 'ms' : 'N/A'})`).join('\n')}

User Agent: ${debugInfo.userAgent}
Captured: ${debugInfo.timestamp}`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Debug info copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy debug info');
    });
  }, [getDebugInfo]);

  // Manual health check
  const handleManualHealthCheck = useCallback(async () => {
    toast.info('Running health check...');
    await performHealthCheck();
    toast.success('Health check complete');
  }, [performHealthCheck]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="w-full max-w-lg glass rounded-2xl border border-border shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">System Status</h2>
                <p className="text-xs text-muted-foreground">Install verification & diagnostics</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Build Info */}
          <div className="p-3 rounded-xl bg-secondary/30">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              BUILD INFO
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-2 font-mono font-semibold">{config.build.version}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Environment:</span>
                <span className="ml-2 font-mono">{config.build.environment}</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground font-mono">
              Built: {new Date(config.build.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Connection Status */}
          <div className={`p-3 rounded-xl ${currentStatus.bgColor} border ${currentStatus.borderColor}`}>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Server className="w-3 h-3" />
              CONNECTION STATUS
            </h3>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentStatus.bgColor}`}>
                <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${currentStatus.color}`}>{currentStatus.label}</p>
                <p className="text-xs text-muted-foreground">
                  {lastPing 
                    ? `Last ping: ${new Date(lastPing).toLocaleTimeString()}${lastPingTime ? ` (${lastPingTime}ms)` : ''}`
                    : 'No successful connection yet'
                  }
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleManualHealthCheck}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {error && (
              <div className="mt-2 p-2 rounded bg-destructive/10 text-xs text-destructive">
                Error: {error}
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="p-3 rounded-xl bg-secondary/30">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Database className="w-3 h-3" />
              CONFIGURATION
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Base:</span>
                <code className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">{connConfig.apiBase}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kiwix Base:</span>
                <code className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">{connConfig.kiwixBase}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data Source:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  dataMode === 'live' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {dataMode === 'live' ? 'LIVE' : 'MOCK DATA'}
                </span>
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div className="p-3 rounded-xl bg-secondary/30">
            <button 
              className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground"
              onClick={() => setShowEndpoints(!showEndpoints)}
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3" />
                ENDPOINT STATUS
              </span>
              {showEndpoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showEndpoints && (
              <div className="mt-3 space-y-2">
                {Object.entries(endpoints).map(([name, data]) => {
                  const isOk = data.status === 'ok';
                  const isError = data.status === 'error' || data.status === 'timeout';
                  return (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="font-mono">{name}</span>
                      <div className="flex items-center gap-2">
                        {data.responseTime && (
                          <span className="text-xs text-muted-foreground">{data.responseTime}ms</span>
                        )}
                        {isOk ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : isError ? (
                          <XCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <Info className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Self Test Results */}
          {testResults && (
            <div className="p-3 rounded-xl bg-secondary/30">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">SELF TEST RESULTS</h3>
              <div className="space-y-1">
                {Object.entries(testResults).map(([name, result]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{name}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                      result.status === 'ok' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {result.status === 'ok' ? (
                        <><CheckCircle className="w-3 h-3" /> PASS</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> FAIL</>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-secondary/20 flex gap-2">
          <Button 
            onClick={handleRunSelfTest}
            disabled={isRunningTest}
            className="flex-1 gap-2"
          >
            {isRunningTest ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Testing...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Self Test</>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={handleCopyDebugInfo}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Debug Info
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact button to open System Status
export function SystemStatusButton({ onClick }) {
  const { status } = useConnection();
  
  const statusColors = {
    [CONNECTION_STATES.CONNECTED]: 'bg-success/20 text-success border-success/30',
    [CONNECTION_STATES.DEGRADED]: 'bg-warning/20 text-warning border-warning/30',
    [CONNECTION_STATES.NOT_CONNECTED]: 'bg-muted/20 text-muted-foreground border-muted-foreground/30',
  };
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors hover:opacity-80 ${statusColors[status]}`}
      title="Open System Status"
      data-testid="system-status-btn"
    >
      <Settings className="w-3.5 h-3.5" />
      <span className="text-xs font-medium hidden sm:inline">Status</span>
    </button>
  );
}
