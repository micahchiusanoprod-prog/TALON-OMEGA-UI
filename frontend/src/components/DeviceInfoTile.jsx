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

  // Use placeholder data if not available
  const displayMetrics = metrics?.available ? metrics : {
    cpu: 24,
    ram: 38,
    disk: 52,
    temp: 48,
    uptime: 345678,
    available: false,
  };

  const displayHealth = health?.services ? health : {
    services: {
      kiwix: 'up',
      backend: 'up',
      mesh: 'degraded',
    },
    available: false,
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const showSimulated = !metrics?.available || !health?.services;

  return (
    <Card className="glass-strong border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Device Info
          </CardTitle>
          {showSimulated && (
            <span className="text-xs px-2 py-1 rounded-full bg-warning-light text-warning">
              Simulated
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              CPU Usage
              <span className="block text-[10px] opacity-70">How hard the brain is working</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {displayMetrics.cpu}%
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              RAM Usage
              <span className="block text-[10px] opacity-70">Active memory in use</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {displayMetrics.ram}%
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              Disk Usage
              <span className="block text-[10px] opacity-70">Storage space used</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {displayMetrics.disk}%
            </div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">
              CPU Temp
              <span className="block text-[10px] opacity-70">Processor temperature</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {displayMetrics.temp}°C
            </div>
          </div>
        </div>

        {/* Uptime */}
        {displayMetrics.uptime && (
          <div className="flex items-center gap-2 p-3 glass rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">
                Uptime
                <span className="block text-[10px] opacity-70">How long the device has been running</span>
              </div>
              <div className="text-sm font-medium text-foreground">
                {formatUptime(displayMetrics.uptime)}
              </div>
            </div>
          </div>
        )}

        {/* Service Statuses */}
        {displayHealth.services && Object.keys(displayHealth.services).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Services
              <span className="block text-[10px] font-normal opacity-70 normal-case mt-0.5">Background programs running on this device</span>
            </div>
            {Object.entries(displayHealth.services).map(([name, status]) => (
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
