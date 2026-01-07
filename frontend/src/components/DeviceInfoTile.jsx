import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Clock, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
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

  // Helper function to determine status based on thresholds
  const getMetricStatus = (type, value) => {
    if (value === null || value === undefined) {
      return { status: 'unknown', icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }

    let status = 'good';
    
    switch(type) {
      case 'cpu':
        if (value > 80) status = 'critical';
        else if (value > 60) status = 'warning';
        break;
      case 'ram':
        if (value > 85) status = 'critical';
        else if (value > 70) status = 'warning';
        break;
      case 'disk':
        if (value > 85) status = 'critical';
        else if (value > 70) status = 'warning';
        break;
      case 'temp':
        if (value > 75) status = 'critical';
        else if (value > 60) status = 'warning';
        break;
      default:
        break;
    }

    if (status === 'good') {
      return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Good' };
    } else if (status === 'warning') {
      return { status: 'warning', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light', label: 'High' };
    } else {
      return { status: 'critical', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive-light', label: 'Critical' };
    }
  };

  const showSimulated = !metrics?.available || !health?.services;

  const metricsList = [
    { key: 'cpu', label: 'CPU Usage', description: 'How hard the brain is working', value: displayMetrics.cpu, unit: '%', type: 'cpu' },
    { key: 'ram', label: 'RAM Usage', description: 'Active memory in use', value: displayMetrics.ram, unit: '%', type: 'ram' },
    { key: 'disk', label: 'Disk Usage', description: 'Storage space used', value: displayMetrics.disk, unit: '%', type: 'disk' },
    { key: 'temp', label: 'CPU Temp', description: 'Processor temperature', value: displayMetrics.temp, unit: '°C', type: 'temp' },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metricsList.map((metric) => {
            const status = getMetricStatus(metric.type, metric.value);
            const StatusIcon = status.icon;
            
            return (
              <div key={metric.key} className="glass p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-muted-foreground">
                    {metric.label}
                    <span className="block text-[10px] opacity-70">{metric.description}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${status.bg}`} title={`Status: ${status.label}`}>
                    <StatusIcon className={`w-3 h-3 ${status.color}`} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
              </div>
            );
          })}
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
