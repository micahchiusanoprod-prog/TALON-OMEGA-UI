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
        {/* Metrics - Vertical Stack */}
        <div className="space-y-3 mb-4">
          {/* CPU */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Cpu className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">CPU Usage</span>
                  <p className="text-xs text-muted-foreground">Processor load</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full ${
                displayMetrics.cpu > 80 ? 'bg-destructive/20' : displayMetrics.cpu > 60 ? 'bg-warning/20' : 'bg-success/20'
              }`}>
                <span className={`text-xs font-medium ${getMetricStatus('cpu', displayMetrics.cpu).color}`}>
                  {getMetricStatus('cpu', displayMetrics.cpu).label}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{displayMetrics.cpu}</span>
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  displayMetrics.cpu > 80 ? 'bg-destructive' : displayMetrics.cpu > 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${displayMetrics.cpu}%` }}
              />
            </div>
          </div>

          {/* Memory */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <MemoryStick className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Memory</span>
                  <p className="text-xs text-muted-foreground">RAM usage</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full ${
                displayMetrics.ram > 85 ? 'bg-destructive/20' : displayMetrics.ram > 70 ? 'bg-warning/20' : 'bg-success/20'
              }`}>
                <span className={`text-xs font-medium ${getMetricStatus('ram', displayMetrics.ram).color}`}>
                  {getMetricStatus('ram', displayMetrics.ram).label}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{displayMetrics.ram}</span>
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  displayMetrics.ram > 85 ? 'bg-destructive' : displayMetrics.ram > 70 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${displayMetrics.ram}%` }}
              />
            </div>
          </div>

          {/* Storage */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <HardDrive className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Storage</span>
                  <p className="text-xs text-muted-foreground">Disk space used</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full ${
                displayMetrics.disk > 85 ? 'bg-destructive/20' : displayMetrics.disk > 70 ? 'bg-warning/20' : 'bg-success/20'
              }`}>
                <span className={`text-xs font-medium ${getMetricStatus('disk', displayMetrics.disk).color}`}>
                  {getMetricStatus('disk', displayMetrics.disk).label}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{displayMetrics.disk}</span>
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  displayMetrics.disk > 85 ? 'bg-destructive' : displayMetrics.disk > 70 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${displayMetrics.disk}%` }}
              />
            </div>
          </div>

          {/* CPU Temperature */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Thermometer className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">CPU Temperature</span>
                  <p className="text-xs text-muted-foreground">Processor heat</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full ${
                displayMetrics.temp > 75 ? 'bg-destructive/20' : displayMetrics.temp > 60 ? 'bg-warning/20' : 'bg-success/20'
              }`}>
                <span className={`text-xs font-medium ${getMetricStatus('temp', displayMetrics.temp).color}`}>
                  {getMetricStatus('temp', displayMetrics.temp).label}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{displayMetrics.temp}</span>
              <span className="text-lg text-muted-foreground">°C</span>
              <span className="text-sm text-muted-foreground ml-2">({(displayMetrics.temp * 9/5 + 32).toFixed(0)}°F)</span>
            </div>
          </div>

          {/* Uptime */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-sm font-medium">Uptime</span>
                <p className="text-xs text-muted-foreground">Since last reboot</p>
              </div>
            </div>
            <div className="text-3xl font-bold">
              {formatUptime(displayMetrics.uptime)}
            </div>
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
          
          <div className="space-y-2">
            {displayHealth.services && Object.entries(displayHealth.services).map(([name, status]) => (
              <div
                key={name}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  status === 'up' || status === 'running'
                    ? 'bg-success/10'
                    : status === 'degraded'
                    ? 'bg-warning/10'
                    : 'bg-destructive/10'
                }`}
              >
                <span className="text-sm font-medium capitalize">{name}</span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    status === 'up' || status === 'running'
                      ? 'bg-success/20 text-success'
                      : status === 'degraded'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {status}
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
