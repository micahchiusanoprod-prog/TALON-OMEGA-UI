import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Clock } from 'lucide-react';
import api from '../services/api';
import config from '../config';

export default function DeviceInfoTile() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, healthData] = await Promise.all([
          api.getMetrics(),
          api.getHealth(),
        ]);
        setMetrics(metricsData);
        setHealth(healthData);
      } catch (error) {
        console.error('Failed to fetch device info:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, config.polling.metrics);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <Card className="glass-strong border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Device Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">CPU Usage</div>
            <div className="text-2xl font-bold text-foreground">
              {metrics && metrics.cpu !== null ? `${metrics.cpu}%` : '—'}
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">RAM Usage</div>
            <div className="text-2xl font-bold text-foreground">
              {metrics && metrics.ram !== null ? `${metrics.ram}%` : '—'}
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Disk Usage</div>
            <div className="text-2xl font-bold text-foreground">
              {metrics && metrics.disk !== null ? `${metrics.disk}%` : '—'}
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">CPU Temp</div>
            <div className="text-2xl font-bold text-foreground">
              {metrics && metrics.temp !== null ? `${metrics.temp}°C` : '—'}
            </div>
          </div>
        </div>

        {/* Uptime */}
        {metrics && metrics.uptime && (
          <div className="flex items-center gap-2 p-3 glass rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Uptime</div>
              <div className="text-sm font-medium text-foreground">
                {formatUptime(metrics.uptime)}
              </div>
            </div>
          </div>
        )}

        {/* Service Statuses */}
        {health && health.services && Object.keys(health.services).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Services
            </div>
            {Object.entries(health.services).map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2 glass rounded-lg"
              >
                <span className="text-sm text-foreground capitalize">{name}</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    status === 'up' || status === 'running'
                      ? 'bg-success-light text-success'
                      : status === 'degraded'
                      ? 'bg-warning-light text-warning'
                      : 'bg-destructive-light text-destructive'
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
