import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Cpu,
  HardDrive,
  Thermometer,
  MemoryStick,
  Wifi,
  Server,
  Zap,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import config from '../config';

// Circular Progress Component
const CircularProgress = ({ value, size = 80, strokeWidth = 8, color, label, icon: Icon }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground mb-0.5" />}
        <span className="text-lg font-bold">{value}%</span>
      </div>
    </div>
  );
};

export default function DeviceInfoTile() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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
    load: [0.45, 0.52, 0.38],
    available: false,
  };

  const displayHealth = health?.services ? health : {
    services: {
      kiwix: 'up',
      backend: 'up',
      mesh: 'degraded',
      gps: 'up',
      sensors: 'up',
    },
    available: false,
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getMetricColor = (value, thresholds) => {
    if (value > thresholds.critical) return 'hsl(var(--destructive))';
    if (value > thresholds.warning) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getMetricStatus = (type, value) => {
    if (value === null || value === undefined) {
      return { status: 'unknown', label: 'Unknown', color: 'text-muted-foreground' };
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
      return { status: 'good', label: 'Good', color: 'text-success' };
    } else if (status === 'warning') {
      return { status: 'warning', label: 'High', color: 'text-warning' };
    } else {
      return { status: 'critical', label: 'Critical', color: 'text-destructive' };
    }
  };

  const serviceCount = displayHealth.services ? Object.keys(displayHealth.services).length : 0;
  const servicesUp = displayHealth.services ? Object.values(displayHealth.services).filter(s => s === 'up' || s === 'running').length : 0;
  const showSimulated = !metrics?.available || !health?.services;

  if (loading) {
    return (
      <Card className="glass-strong border-border h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-primary" />
            Device Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border-border h-full flex flex-col" data-testid="device-info-tile">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-primary" />
            Device Info
          </CardTitle>
          {showSimulated && (
            <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
              Simulated
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Circular Progress Gauges */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          {/* CPU */}
          <div className="flex flex-col items-center glass rounded-xl p-3">
            <CircularProgress 
              value={displayMetrics.cpu} 
              color={getMetricColor(displayMetrics.cpu, { warning: 60, critical: 80 })}
              icon={Cpu}
            />
            <span className="text-sm font-medium mt-2">CPU</span>
            <span className={`text-xs ${getMetricStatus('cpu', displayMetrics.cpu).color}`}>
              {getMetricStatus('cpu', displayMetrics.cpu).label}
            </span>
          </div>

          {/* RAM */}
          <div className="flex flex-col items-center glass rounded-xl p-3">
            <CircularProgress 
              value={displayMetrics.ram} 
              color={getMetricColor(displayMetrics.ram, { warning: 70, critical: 85 })}
              icon={MemoryStick}
            />
            <span className="text-sm font-medium mt-2">Memory</span>
            <span className={`text-xs ${getMetricStatus('ram', displayMetrics.ram).color}`}>
              {getMetricStatus('ram', displayMetrics.ram).label}
            </span>
          </div>

          {/* Disk */}
          <div className="flex flex-col items-center glass rounded-xl p-3">
            <CircularProgress 
              value={displayMetrics.disk} 
              color={getMetricColor(displayMetrics.disk, { warning: 70, critical: 85 })}
              icon={HardDrive}
            />
            <span className="text-sm font-medium mt-2">Storage</span>
            <span className={`text-xs ${getMetricStatus('disk', displayMetrics.disk).color}`}>
              {getMetricStatus('disk', displayMetrics.disk).label}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex flex-col items-center glass rounded-xl p-3">
            <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
              <div className={`text-center ${getMetricStatus('temp', displayMetrics.temp).color}`}>
                <Thermometer className="w-6 h-6 mx-auto mb-1" />
                <span className="text-2xl font-bold">{displayMetrics.temp}</span>
                <span className="text-xs">°C</span>
              </div>
            </div>
            <span className="text-sm font-medium mt-2">CPU Temp</span>
            <span className={`text-xs ${getMetricStatus('temp', displayMetrics.temp).color}`}>
              {getMetricStatus('temp', displayMetrics.temp).label}
            </span>
          </div>
        </div>

        {/* Uptime & System Load */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Uptime */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <div className="text-2xl xl:text-3xl font-bold">
              {formatUptime(displayMetrics.uptime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Since last reboot
            </p>
          </div>

          {/* System Load */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Load Average</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl xl:text-3xl font-bold">
                {(displayMetrics.load?.[0] || 0.45).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1m: {(displayMetrics.load?.[0] || 0.45).toFixed(2)} • 
              5m: {(displayMetrics.load?.[1] || 0.52).toFixed(2)} • 
              15m: {(displayMetrics.load?.[2] || 0.38).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Services Status */}
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Services</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${servicesUp === serviceCount ? 'text-success' : 'text-warning'}`}>
                {servicesUp}/{serviceCount}
              </span>
              <span className="text-xs text-muted-foreground">running</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            {displayHealth.services && Object.entries(displayHealth.services).map(([name, status]) => (
              <div
                key={name}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  status === 'up' || status === 'running'
                    ? 'bg-success/10'
                    : status === 'degraded'
                    ? 'bg-warning/10'
                    : 'bg-destructive/10'
                }`}
              >
                <span className="text-sm capitalize">{name}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    status === 'up' || status === 'running'
                      ? 'bg-success/20 text-success'
                      : status === 'degraded'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {status === 'up' || status === 'running' ? '●' : status === 'degraded' ? '◐' : '○'} {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last updated: just now</span>
            <button className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
