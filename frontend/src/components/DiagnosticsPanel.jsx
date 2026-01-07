import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Activity } from 'lucide-react';
import { Button } from './ui/button';

export default function DiagnosticsPanel({ data, onClose }) {
  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const getLastRefresh = (category) => {
    if (!data[category]?.timestamp) return 'N/A';
    return new Date(data[category].timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <Card className="glass-strong border-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Diagnostics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Health Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Health Status</h3>
              <span className="text-xs text-muted-foreground">Last: {getLastRefresh('health')}</span>
            </div>
            <pre className="glass p-4 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
              {data.health ? formatJSON(data.health) : 'No data available'}
            </pre>
          </div>

          {/* Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">System Metrics</h3>
              <span className="text-xs text-muted-foreground">Last: {getLastRefresh('metrics')}</span>
            </div>
            <pre className="glass p-4 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
              {data.metrics ? formatJSON(data.metrics) : 'No data available'}
            </pre>
          </div>

          {/* GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">GPS Data</h3>
              <span className="text-xs text-muted-foreground">Last: {getLastRefresh('gps')}</span>
            </div>
            <pre className="glass p-4 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
              {data.gps ? formatJSON(data.gps) : 'No data available'}
            </pre>
          </div>

          {/* Configuration Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Configuration</h3>
            <div className="glass p-4 rounded-lg space-y-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Kiwix:</span>{' '}
                <span className="font-mono text-foreground">http://127.0.0.1:8090</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Backend:</span>{' '}
                <span className="font-mono text-foreground">http://127.0.0.1:8093</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Polling Interval:</span>{' '}
                <span className="font-mono text-foreground">5s (metrics), 3s (gps)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
