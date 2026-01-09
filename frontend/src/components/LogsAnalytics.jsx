import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  Activity,
  Cpu,
  HardDrive,
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  MapPin,
  Radio,
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Users,
  Wifi,
  WifiOff,
  Server,
  Eye,
  EyeOff,
  GitCompare,
  BarChart3,
  Zap,
  Shield,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  Settings,
  Layers,
  FileText,
  Calendar,
  RotateCcw,
  Target,
  Sliders,
  List,
  Grid,
  PieChart,
  Archive,
  History,
  Bookmark,
  Star,
  Bell,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

// ============================================================
// ACTIVE LOG CATEGORIES CONFIGURATION
// ============================================================

const LOG_CATEGORIES = [
  { id: 'system', name: 'System Metrics', icon: Cpu, description: 'CPU, RAM, Disk usage', enabled: true, color: 'text-blue-400' },
  { id: 'environment', name: 'Environment', icon: Thermometer, description: 'Temperature, Humidity, Pressure, IAQ', enabled: true, color: 'text-red-400' },
  { id: 'gps', name: 'GPS & Location', icon: MapPin, description: 'Fix status, Accuracy, Coordinates', enabled: true, color: 'text-green-400' },
  { id: 'comms', name: 'Communications', icon: Radio, description: 'LAN, Mesh, Radio status', enabled: true, color: 'text-emerald-400' },
  { id: 'backup', name: 'Backup Status', icon: Database, description: 'Backup success/fail, Last run', enabled: true, color: 'text-violet-400' },
  { id: 'health', name: 'Health Status', icon: Activity, description: 'Overall system health', enabled: true, color: 'text-primary' },
  { id: 'errors', name: 'Errors & Warnings', icon: AlertTriangle, description: 'System errors and warnings', enabled: true, color: 'text-warning' },
  { id: 'network', name: 'Network Traffic', icon: Wifi, description: 'Bandwidth, Connections', enabled: false, color: 'text-cyan-400' },
  { id: 'power', name: 'Power & Battery', icon: Zap, description: 'Power consumption, Battery level', enabled: false, color: 'text-yellow-400' },
];

// Default visible metrics for charts
const DEFAULT_VISIBLE_METRICS = {
  cpu: true,
  ram: true,
  disk: true,
  temp: true,
  humidity: true,
  pressure: false,
  iaq: false,
  gpsAccuracy: true,
  comms: true,
};

// ============================================================
// MOCK DATA GENERATION
// ============================================================

const THIS_DEVICE = {
  node_id: 'talon-omega-01',
  node_name: 'OMEGA (This Device)'
};

const FLEET_NODES = [
  { node_id: 'talon-omega-01', node_name: 'OMEGA (This Device)', isThisDevice: true },
  { node_id: 'talon-omega-02', node_name: 'OMEGA-BRAVO', isThisDevice: false },
  { node_id: 'talon-omega-03', node_name: 'OMEGA-CHARLIE', isThisDevice: false },
  { node_id: 'talon-omega-04', node_name: 'OMEGA-DELTA', isThisDevice: false },
  { node_id: 'talon-omega-05', node_name: 'OMEGA-ECHO', isThisDevice: false },
  { node_id: 'talon-omega-06', node_name: 'OMEGA-FOXTROT', isThisDevice: false },
];

// Generate realistic time series data with occasional anomalies
const generateSnapshots = (nodeId, nodeName, hours = 24, intervalMinutes = 1) => {
  const snapshots = [];
  const now = new Date();
  const dataPoints = Math.floor((hours * 60) / intervalMinutes);
  
  // Base values with some node-specific variance
  const nodeVariance = nodeId.charCodeAt(nodeId.length - 1) % 10;
  const baseCpu = 15 + nodeVariance;
  const baseRam = 35 + nodeVariance * 2;
  const baseDisk = 42 + nodeVariance;
  const baseTemp = 45 + nodeVariance;
  
  // Anomaly points (for realistic variation)
  const tempSpikeAt = Math.floor(dataPoints * 0.3);
  const commsDegradeStart = Math.floor(dataPoints * 0.6);
  const commsDegradeEnd = Math.floor(dataPoints * 0.65);
  const backupFailAt = Math.floor(dataPoints * 0.45);
  
  // For consensus event - all nodes degrade comms around same time
  const consensusEventStart = Math.floor(dataPoints * 0.75);
  const consensusEventEnd = Math.floor(dataPoints * 0.77);
  
  for (let i = 0; i < dataPoints; i++) {
    const ts = new Date(now.getTime() - (dataPoints - i) * intervalMinutes * 60 * 1000);
    
    // Add realistic variation
    const hourOfDay = ts.getHours();
    const dailyVariation = Math.sin((hourOfDay / 24) * Math.PI * 2) * 5;
    const noise = () => (Math.random() - 0.5) * 4;
    
    // CPU spikes during "work hours"
    const cpuWorkBoost = (hourOfDay >= 8 && hourOfDay <= 18) ? 10 : 0;
    
    // Temperature spike anomaly
    const tempSpike = (i >= tempSpikeAt && i <= tempSpikeAt + 5) ? 15 : 0;
    
    // Comms degradation anomaly
    let commsStatus = 'available';
    if (i >= commsDegradeStart && i <= commsDegradeEnd) {
      commsStatus = 'degraded';
    }
    
    // Consensus event - synchronized comms issue across fleet
    if (i >= consensusEventStart && i <= consensusEventEnd) {
      commsStatus = 'degraded';
    }
    
    // Backup status
    const isBackupTime = i % 60 === 0; // Every hour
    const backupOk = !(i >= backupFailAt && i <= backupFailAt + 2);
    
    // GPS accuracy variation
    const gpsIndoor = (hourOfDay >= 22 || hourOfDay <= 6) ? 50 : 0;
    const gpsAccuracy = Math.max(2, 5 + gpsIndoor + noise() * 3);
    const gpsFix = gpsAccuracy < 20 ? '3D' : gpsAccuracy < 50 ? '2D' : 'none';
    
    const snapshot = {
      node_id: nodeId,
      node_name: nodeName,
      ts: ts.toISOString(),
      ok: commsStatus !== 'unavailable' && backupOk,
      health: {
        status: commsStatus === 'available' ? 'up' : commsStatus === 'degraded' ? 'degraded' : 'down',
        uptime_hours: Math.floor((now - ts) / (1000 * 60 * 60)) + 100
      },
      metrics: {
        cpu: Math.max(5, Math.min(95, baseCpu + cpuWorkBoost + dailyVariation + noise())),
        ram: Math.max(20, Math.min(85, baseRam + dailyVariation * 0.5 + noise())),
        disk: Math.max(30, Math.min(90, baseDisk + (i / dataPoints) * 2 + noise() * 0.5))
      },
      sensors: {
        temperature: Math.max(30, Math.min(80, baseTemp + tempSpike + dailyVariation + noise())),
        humidity: Math.max(20, Math.min(80, 45 + dailyVariation * 2 + noise())),
        pressure: Math.max(990, Math.min(1030, 1013 + noise() * 2)),
        iaq: Math.max(0, Math.min(500, 75 + dailyVariation * 5 + noise() * 10))
      },
      gps: {
        accuracy: gpsAccuracy,
        fix: gpsFix,
        satellites: gpsFix === '3D' ? 8 + Math.floor(Math.random() * 4) : gpsFix === '2D' ? 4 + Math.floor(Math.random() * 2) : 0,
        lat: 34.0522 + (Math.random() - 0.5) * 0.001,
        lon: -118.2437 + (Math.random() - 0.5) * 0.001
      },
      comms: {
        lan: commsStatus,
        mesh: commsStatus === 'available' ? 'available' : 'degraded',
        radio: 'available',
        sms: 'unavailable',
        hf: 'unavailable'
      },
      backup: {
        last_run: isBackupTime ? ts.toISOString() : null,
        status: backupOk ? 'success' : 'failed',
        next_scheduled: new Date(ts.getTime() + 60 * 60 * 1000).toISOString()
      }
    };
    
    snapshots.push(snapshot);
  }
  
  return snapshots;
};

// Generate outlier node data
const generateOutlierNode = () => {
  const snapshots = generateSnapshots('talon-omega-04', 'OMEGA-DELTA', 24, 1);
  // Make it an outlier with higher temps and more issues
  return snapshots.map(s => ({
    ...s,
    metrics: {
      ...s.metrics,
      cpu: Math.min(95, s.metrics.cpu + 25),
      disk: Math.min(92, s.metrics.disk + 15)
    },
    sensors: {
      ...s.sensors,
      temperature: Math.min(85, s.sensors.temperature + 12)
    },
    health: {
      ...s.health,
      status: Math.random() > 0.7 ? 'degraded' : s.health.status
    }
  }));
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const calculateHealthIndex = (snapshot) => {
  if (!snapshot) return 0;
  
  let score = 100;
  
  // OK status (-20 if not ok)
  if (!snapshot.ok) score -= 20;
  
  // CPU penalty (>80% = -15, >60% = -5)
  if (snapshot.metrics?.cpu > 80) score -= 15;
  else if (snapshot.metrics?.cpu > 60) score -= 5;
  
  // RAM penalty
  if (snapshot.metrics?.ram > 85) score -= 10;
  else if (snapshot.metrics?.ram > 70) score -= 3;
  
  // Disk penalty
  if (snapshot.metrics?.disk > 90) score -= 20;
  else if (snapshot.metrics?.disk > 80) score -= 10;
  else if (snapshot.metrics?.disk > 70) score -= 5;
  
  // Temperature penalty
  if (snapshot.sensors?.temperature > 75) score -= 15;
  else if (snapshot.sensors?.temperature > 65) score -= 5;
  
  // Comms penalty
  if (snapshot.comms?.lan === 'unavailable') score -= 15;
  else if (snapshot.comms?.lan === 'degraded') score -= 5;
  
  // GPS penalty
  if (snapshot.gps?.fix === 'none') score -= 5;
  
  // Backup penalty
  if (snapshot.backup?.status === 'failed') score -= 10;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const getHealthColor = (score) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

const getHealthBg = (score) => {
  if (score >= 80) return 'bg-success/20';
  if (score >= 60) return 'bg-warning/20';
  return 'bg-destructive/20';
};

const getStatusColor = (status) => {
  if (status === 'available' || status === 'success' || status === 'up' || status === '3D') return 'text-success';
  if (status === 'degraded' || status === '2D') return 'text-warning';
  return 'text-destructive';
};

const getStatusBg = (status) => {
  if (status === 'available' || status === 'success' || status === 'up' || status === '3D') return 'bg-success';
  if (status === 'degraded' || status === '2D') return 'bg-warning';
  return 'bg-destructive';
};

const formatTimeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

const detectAnomalies = (snapshots) => {
  if (snapshots.length < 10) return [];
  
  const anomalies = [];
  const recent = snapshots.slice(-100);
  
  // Calculate averages
  const avgTemp = recent.reduce((a, s) => a + s.sensors.temperature, 0) / recent.length;
  const avgCpu = recent.reduce((a, s) => a + s.metrics.cpu, 0) / recent.length;
  
  // Find anomalies
  for (let i = 1; i < recent.length; i++) {
    const curr = recent[i];
    const prev = recent[i - 1];
    
    // Temperature spike
    if (curr.sensors.temperature > avgTemp + 10) {
      anomalies.push({
        id: `temp-${i}`,
        ts: curr.ts,
        type: 'temperature_spike',
        severity: curr.sensors.temperature > avgTemp + 15 ? 'high' : 'medium',
        message: `Temperature spike detected: ${curr.sensors.temperature.toFixed(1)}°C`,
        explanation: 'Temperature is significantly above the recent average.',
        likelyCause: 'High CPU load, poor ventilation, or external heat source.',
        value: curr.sensors.temperature,
        threshold: avgTemp + 10
      });
    }
    
    // Comms degradation
    if (prev.comms.lan === 'available' && curr.comms.lan === 'degraded') {
      anomalies.push({
        id: `comms-${i}`,
        ts: curr.ts,
        type: 'comms_degraded',
        severity: 'medium',
        message: 'Communications degraded',
        explanation: 'LAN/Wi-Fi connection quality dropped.',
        likelyCause: 'Network congestion, interference, or distance from access point.'
      });
    }
    
    // Backup failure
    if (curr.backup.status === 'failed' && prev.backup.status !== 'failed') {
      anomalies.push({
        id: `backup-${i}`,
        ts: curr.ts,
        type: 'backup_failed',
        severity: 'high',
        message: 'Backup failed',
        explanation: 'Scheduled backup did not complete successfully.',
        likelyCause: 'Storage full, destination unreachable, or permission issues.'
      });
    }
    
    // CPU spike
    if (curr.metrics.cpu > avgCpu + 30) {
      anomalies.push({
        id: `cpu-${i}`,
        ts: curr.ts,
        type: 'cpu_spike',
        severity: 'low',
        message: `CPU spike: ${curr.metrics.cpu.toFixed(1)}%`,
        explanation: 'CPU usage significantly higher than normal.',
        likelyCause: 'Heavy processing task, streaming, or runaway process.'
      });
    }
  }
  
  // Return most recent anomalies first, limited
  return anomalies.slice(-20).reverse();
};

const compareWindows = (snapshots, windowHours = 12) => {
  const now = Date.now();
  const windowMs = windowHours * 60 * 60 * 1000;
  
  const currentWindow = snapshots.filter(s => 
    now - new Date(s.ts).getTime() < windowMs
  );
  const previousWindow = snapshots.filter(s => {
    const diff = now - new Date(s.ts).getTime();
    return diff >= windowMs && diff < windowMs * 2;
  });
  
  if (currentWindow.length === 0 || previousWindow.length === 0) {
    return { changes: [], currentAvg: {}, previousAvg: {} };
  }
  
  const avg = (arr, key) => arr.reduce((a, s) => {
    const val = key.split('.').reduce((o, k) => o?.[k], s);
    return a + (val || 0);
  }, 0) / arr.length;
  
  const metrics = ['metrics.cpu', 'metrics.ram', 'metrics.disk', 'sensors.temperature', 'sensors.humidity'];
  const changes = [];
  
  metrics.forEach(metric => {
    const currAvg = avg(currentWindow, metric);
    const prevAvg = avg(previousWindow, metric);
    const delta = currAvg - prevAvg;
    const percentChange = prevAvg !== 0 ? ((delta / prevAvg) * 100) : 0;
    
    if (Math.abs(percentChange) > 5) {
      changes.push({
        metric: metric.split('.').pop(),
        current: currAvg,
        previous: prevAvg,
        delta,
        percentChange,
        direction: delta > 0 ? 'up' : 'down'
      });
    }
  });
  
  return { 
    changes: changes.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)),
    currentAvg: { cpu: avg(currentWindow, 'metrics.cpu'), temp: avg(currentWindow, 'sensors.temperature') },
    previousAvg: { cpu: avg(previousWindow, 'metrics.cpu'), temp: avg(previousWindow, 'sensors.temperature') }
  };
};

// ============================================================
// COMPONENTS
// ============================================================

// Sparkline component
const Sparkline = ({ data, dataKey, color = '#3b82f6', height = 40 }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={`url(#gradient-${dataKey})`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Health Index Display
const HealthIndexDisplay = ({ score, trend, sparklineData }) => {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground';
  
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Health Index</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-4xl font-bold ${getHealthColor(score)}`}>{score}</span>
            <span className="text-lg text-muted-foreground">/100</span>
            <TrendIcon className={`w-5 h-5 ${trendColor}`} />
          </div>
        </div>
        <div className={`w-16 h-16 rounded-full ${getHealthBg(score)} flex items-center justify-center`}>
          <Activity className={`w-8 h-8 ${getHealthColor(score)}`} />
        </div>
      </div>
      <div className="h-10">
        <Sparkline data={sparklineData} dataKey="health" color={score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {score >= 80 ? 'System healthy. All components operating normally.' :
         score >= 60 ? 'Some issues detected. Review warnings below.' :
         'Critical issues require attention. Check troubleshooting guide.'}
      </p>
    </div>
  );
};

// Metric Card
const MetricCard = ({ icon: Icon, label, value, unit, trend, status, color = 'text-primary' }) => (
  <div className="glass rounded-lg p-3">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {status && (
        <div className={`w-2 h-2 rounded-full ${getStatusBg(status)}`} />
      )}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-bold">{typeof value === 'number' ? value.toFixed(1) : value}</span>
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      {trend !== undefined && (
        <span className={`text-xs ml-auto ${trend > 0 ? 'text-destructive' : trend < 0 ? 'text-success' : 'text-muted-foreground'}`}>
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
        </span>
      )}
    </div>
  </div>
);

// Anomaly Card
const AnomalyCard = ({ anomaly }) => {
  const [expanded, setExpanded] = useState(false);
  const severityColor = anomaly.severity === 'high' ? 'text-destructive' : anomaly.severity === 'medium' ? 'text-warning' : 'text-blue-400';
  const severityBg = anomaly.severity === 'high' ? 'bg-destructive/20' : anomaly.severity === 'medium' ? 'bg-warning/20' : 'bg-blue-500/20';
  
  return (
    <div className={`glass rounded-lg p-3 ${severityBg} border border-${anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'warning' : 'blue-500'}/30`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className={`w-4 h-4 ${severityColor} mt-0.5 flex-shrink-0`} />
          <div>
            <p className="text-sm font-medium">{anomaly.message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(anomaly.ts)}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-white/10 rounded">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">What this means:</span>
            <p className="text-xs">{anomaly.explanation}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Likely cause:</span>
            <p className="text-xs">{anomaly.likelyCause}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Node Card for Fleet View
const NodeCard = ({ node, snapshots, onClick, selected }) => {
  const latestSnapshot = snapshots[snapshots.length - 1];
  const healthIndex = calculateHealthIndex(latestSnapshot);
  const lastSeen = latestSnapshot?.ts;
  
  return (
    <button
      onClick={onClick}
      className={`glass rounded-xl p-4 text-left w-full transition-all hover:bg-white/10 ${selected ? 'ring-2 ring-primary' : ''}`}
      data-testid={`node-card-${node.node_id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusBg(latestSnapshot?.comms?.lan || 'unavailable')}`} />
          <span className="font-semibold text-sm">{node.node_name}</span>
          {node.isThisDevice && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">THIS</span>
          )}
        </div>
        <span className={`text-lg font-bold ${getHealthColor(healthIndex)}`}>{healthIndex}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">CPU</span>
          <p className="font-medium">{latestSnapshot?.metrics?.cpu?.toFixed(0) || '--'}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Temp</span>
          <p className="font-medium">{latestSnapshot?.sensors?.temperature?.toFixed(0) || '--'}°C</p>
        </div>
        <div>
          <span className="text-muted-foreground">Disk</span>
          <p className="font-medium">{latestSnapshot?.metrics?.disk?.toFixed(0) || '--'}%</p>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
        <span>Last seen: {lastSeen ? formatTimeAgo(lastSeen) : 'Never'}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
};

// Diff Badge Component (moved outside)
const DiffBadge = ({ value }) => {
  if (value === null) return null;
  const color = value > 0 ? 'text-red-400' : value < 0 ? 'text-green-400' : 'text-muted-foreground';
  return (
    <span className={`text-xs ${color} ml-2`}>
      {value > 0 ? '+' : ''}{value.toFixed(1)}
    </span>
  );
};

// Snapshot Detail Drawer
const SnapshotDrawer = ({ snapshot, previousSnapshot, onClose }) => {
  const [viewMode, setViewMode] = useState('formatted');
  
  if (!snapshot) return null;
  
  const getDiff = (key) => {
    if (!previousSnapshot) return null;
    const curr = key.split('.').reduce((o, k) => o?.[k], snapshot);
    const prev = key.split('.').reduce((o, k) => o?.[k], previousSnapshot);
    if (typeof curr !== 'number' || typeof prev !== 'number') return null;
    return curr - prev;
  };
  
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l border-border z-50 overflow-y-auto">
      <div className="sticky top-0 glass p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Snapshot Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{new Date(snapshot.ts).toLocaleString()}</p>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === 'formatted' ? 'bg-primary text-white' : 'glass'}`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === 'json' ? 'bg-primary text-white' : 'glass'}`}
          >
            JSON
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {viewMode === 'formatted' ? (
          <>
            <div className="glass rounded-lg p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">STATUS</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${snapshot.ok ? 'bg-success' : 'bg-destructive'}`} />
                <span className="font-medium">{snapshot.ok ? 'OK' : 'Issues Detected'}</span>
              </div>
            </div>
            
            <div className="glass rounded-lg p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">METRICS</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CPU</span>
                  <span>{snapshot.metrics.cpu.toFixed(1)}%<DiffBadge value={getDiff('metrics.cpu')} /></span>
                </div>
                <div className="flex justify-between">
                  <span>RAM</span>
                  <span>{snapshot.metrics.ram.toFixed(1)}%<DiffBadge value={getDiff('metrics.ram')} /></span>
                </div>
                <div className="flex justify-between">
                  <span>Disk</span>
                  <span>{snapshot.metrics.disk.toFixed(1)}%<DiffBadge value={getDiff('metrics.disk')} /></span>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-lg p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">SENSORS</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature</span>
                  <span>{snapshot.sensors.temperature.toFixed(1)}°C<DiffBadge value={getDiff('sensors.temperature')} /></span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span>{snapshot.sensors.humidity.toFixed(1)}%<DiffBadge value={getDiff('sensors.humidity')} /></span>
                </div>
                <div className="flex justify-between">
                  <span>Pressure</span>
                  <span>{snapshot.sensors.pressure.toFixed(0)} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span>IAQ</span>
                  <span>{snapshot.sensors.iaq.toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-lg p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">GPS</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fix</span>
                  <span className={getStatusColor(snapshot.gps.fix)}>{snapshot.gps.fix}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy</span>
                  <span>{snapshot.gps.accuracy.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Satellites</span>
                  <span>{snapshot.gps.satellites}</span>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-lg p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">COMMS</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(snapshot.comms).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}</span>
                    <span className={getStatusColor(value)}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <pre className="text-xs font-mono bg-black/30 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAIN TABS
// ============================================================

// Active Logs Panel Component
const ActiveLogsPanel = ({ logCategories, setLogCategories }) => {
  const toggleCategory = (id) => {
    setLogCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };
  
  const enabledCount = logCategories.filter(c => c.enabled).length;
  
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Archive className="w-4 h-4 text-primary" />
          Active Log Categories
        </h3>
        <span className="text-xs text-muted-foreground">{enabledCount}/{logCategories.length} active</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Select which data categories to track and archive. Disabled categories will not be captured in new snapshots.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {logCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                cat.enabled 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'glass border border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${cat.enabled ? 'bg-primary/20' : 'bg-secondary'}`}>
                <Icon className={`w-4 h-4 ${cat.enabled ? cat.color : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{cat.name}</span>
                  {cat.enabled && <CheckCircle className="w-3 h-3 text-success" />}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{cat.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Statistics Summary Component
const StatisticsSummary = ({ snapshots, timeRange }) => {
  const stats = useMemo(() => {
    if (snapshots.length === 0) return null;
    
    const calc = (arr, key) => {
      const values = arr.map(s => key.split('.').reduce((o, k) => o?.[k], s)).filter(v => typeof v === 'number');
      if (values.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        current: values[values.length - 1]
      };
    };
    
    return {
      cpu: calc(snapshots, 'metrics.cpu'),
      ram: calc(snapshots, 'metrics.ram'),
      disk: calc(snapshots, 'metrics.disk'),
      temp: calc(snapshots, 'sensors.temperature'),
      humidity: calc(snapshots, 'sensors.humidity'),
      pressure: calc(snapshots, 'sensors.pressure'),
      iaq: calc(snapshots, 'sensors.iaq'),
      gpsAccuracy: calc(snapshots, 'gps.accuracy'),
      uptimeOk: snapshots.filter(s => s.ok).length,
      uptimeTotal: snapshots.length,
      commsAvailable: snapshots.filter(s => s.comms?.lan === 'available').length,
      backupSuccess: snapshots.filter(s => s.backup?.status === 'success').length,
    };
  }, [snapshots]);
  
  if (!stats) return null;
  
  const StatRow = ({ label, data, unit = '', precision = 1 }) => (
    <div className="grid grid-cols-5 gap-2 text-xs py-1.5 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-center font-mono">{data.current.toFixed(precision)}{unit}</span>
      <span className="text-center font-mono text-green-400">{data.min.toFixed(precision)}{unit}</span>
      <span className="text-center font-mono text-red-400">{data.max.toFixed(precision)}{unit}</span>
      <span className="text-center font-mono text-primary">{data.avg.toFixed(precision)}{unit}</span>
    </div>
  );
  
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Statistical Summary ({timeRange})
        </h3>
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-xs py-2 border-b border-border font-semibold">
        <span>Metric</span>
        <span className="text-center">Current</span>
        <span className="text-center text-green-400">Min</span>
        <span className="text-center text-red-400">Max</span>
        <span className="text-center text-primary">Avg</span>
      </div>
      
      <StatRow label="CPU" data={stats.cpu} unit="%" />
      <StatRow label="RAM" data={stats.ram} unit="%" />
      <StatRow label="Disk" data={stats.disk} unit="%" />
      <StatRow label="Temp" data={stats.temp} unit="°C" />
      <StatRow label="Humidity" data={stats.humidity} unit="%" />
      <StatRow label="Pressure" data={stats.pressure} unit=" hPa" precision={0} />
      <StatRow label="IAQ" data={stats.iaq} unit="" precision={0} />
      <StatRow label="GPS Acc" data={stats.gpsAccuracy} unit="m" />
      
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-success">{((stats.uptimeOk / stats.uptimeTotal) * 100).toFixed(1)}%</div>
          <p className="text-[10px] text-muted-foreground">Uptime OK Rate</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{((stats.commsAvailable / stats.uptimeTotal) * 100).toFixed(1)}%</div>
          <p className="text-[10px] text-muted-foreground">Comms Available</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-violet-400">{((stats.backupSuccess / stats.uptimeTotal) * 100).toFixed(1)}%</div>
          <p className="text-[10px] text-muted-foreground">Backup Success</p>
        </div>
      </div>
    </div>
  );
};

// Metric Visibility Toggle Component
const MetricVisibilityPanel = ({ visibleMetrics, setVisibleMetrics }) => {
  const metrics = [
    { id: 'cpu', label: 'CPU %', color: 'bg-blue-500' },
    { id: 'ram', label: 'RAM %', color: 'bg-purple-500' },
    { id: 'disk', label: 'Disk %', color: 'bg-amber-500' },
    { id: 'temp', label: 'Temperature', color: 'bg-red-500' },
    { id: 'humidity', label: 'Humidity', color: 'bg-cyan-500' },
    { id: 'pressure', label: 'Pressure', color: 'bg-pink-500' },
    { id: 'iaq', label: 'IAQ', color: 'bg-orange-500' },
    { id: 'gpsAccuracy', label: 'GPS Accuracy', color: 'bg-green-500' },
    { id: 'comms', label: 'Comms Status', color: 'bg-emerald-500' },
  ];
  
  const toggle = (id) => {
    setVisibleMetrics(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map(m => (
        <button
          key={m.id}
          onClick={() => toggle(m.id)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
            visibleMetrics[m.id] 
              ? 'bg-secondary border border-primary/50' 
              : 'bg-secondary/50 opacity-50 hover:opacity-100'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${m.color}`} />
          {m.label}
          {visibleMetrics[m.id] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
      ))}
    </div>
  );
};

// Last Snapshot Info Component
const LastSnapshotInfo = ({ snapshot, capturing }) => {
  if (!snapshot) return null;
  
  const ts = new Date(snapshot.ts);
  const timeSince = Date.now() - ts.getTime();
  const secondsAgo = Math.floor(timeSince / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Last Snapshot
        </h3>
        <div className="flex items-center gap-2">
          {capturing ? (
            <span className="flex items-center gap-1.5 text-xs text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Capturing
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-warning">
              <Pause className="w-3 h-3" />
              Paused
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-lg p-2">
          <span className="text-[10px] text-muted-foreground block">Timestamp</span>
          <p className="text-sm font-mono">{ts.toLocaleTimeString()}</p>
          <p className="text-[10px] text-muted-foreground">{ts.toLocaleDateString()}</p>
        </div>
        <div className="glass rounded-lg p-2">
          <span className="text-[10px] text-muted-foreground block">Time Since</span>
          <p className="text-sm font-mono">
            {minutesAgo > 0 ? `${minutesAgo}m ${secondsAgo % 60}s` : `${secondsAgo}s`}
          </p>
          <p className="text-[10px] text-muted-foreground">ago</p>
        </div>
        <div className="glass rounded-lg p-2">
          <span className="text-[10px] text-muted-foreground block">Status</span>
          <p className={`text-sm font-semibold ${snapshot.ok ? 'text-success' : 'text-destructive'}`}>
            {snapshot.ok ? 'OK' : 'Issues'}
          </p>
          <p className="text-[10px] text-muted-foreground">{snapshot.health?.status || 'unknown'}</p>
        </div>
        <div className="glass rounded-lg p-2">
          <span className="text-[10px] text-muted-foreground block">Health</span>
          <p className={`text-sm font-bold ${getHealthColor(calculateHealthIndex(snapshot))}`}>
            {calculateHealthIndex(snapshot)}/100
          </p>
          <p className="text-[10px] text-muted-foreground">index score</p>
        </div>
      </div>
    </div>
  );
};

// This Device Tab
const ThisDeviceTab = ({ snapshots, capturing, setCapturing, interval, setInterval, retention, setRetention, logCategories, setLogCategories }) => {
  const [timeRange, setTimeRange] = useState('12h');
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showActiveLogs, setShowActiveLogs] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState(DEFAULT_VISIBLE_METRICS);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareWindow, setCompareWindow] = useState('12h');
  const [now] = useState(() => Date.now()); // Stable timestamp for filtering
  
  // Filter snapshots by time range
  const filteredSnapshots = useMemo(() => {
    const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
    const cutoff = now - hours * 60 * 60 * 1000;
    return snapshots.filter(s => new Date(s.ts).getTime() > cutoff);
  }, [snapshots, timeRange, now]);
  
  // Calculate stats
  const latestSnapshot = snapshots[snapshots.length - 1];
  const healthIndex = calculateHealthIndex(latestSnapshot);
  const healthHistory = filteredSnapshots.map(s => ({
    ts: new Date(s.ts).toLocaleTimeString(),
    health: calculateHealthIndex(s)
  }));
  
  // Calculate trend
  const recentHealth = healthHistory.slice(-10);
  const olderHealth = healthHistory.slice(-20, -10);
  const trend = recentHealth.length > 0 && olderHealth.length > 0 
    ? (recentHealth.reduce((a, h) => a + h.health, 0) / recentHealth.length) - 
      (olderHealth.reduce((a, h) => a + h.health, 0) / olderHealth.length)
    : 0;
  
  // Anomalies
  const anomalies = useMemo(() => detectAnomalies(snapshots), [snapshots]);
  
  // Window comparison
  const comparison = useMemo(() => compareWindows(snapshots, 12), [snapshots]);
  
  // Chart data
  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(filteredSnapshots.length / 100));
    return filteredSnapshots.filter((_, i) => i % step === 0).map(s => ({
      ts: new Date(s.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      cpu: s.metrics.cpu,
      ram: s.metrics.ram,
      disk: s.metrics.disk,
      temp: s.sensors.temperature,
      humidity: s.sensors.humidity,
      gpsAccuracy: s.gps.accuracy,
      gpsFix: s.gps.fix === '3D' ? 3 : s.gps.fix === '2D' ? 2 : 0,
      comms: s.comms.lan === 'available' ? 3 : s.comms.lan === 'degraded' ? 2 : 1
    }));
  }, [filteredSnapshots]);
  
  // Export handler
  const handleExport = () => {
    const data = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omega-snapshots-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Snapshots exported');
  };
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all snapshot history? This cannot be undone.')) {
      toast.success('History cleared');
    }
  };
  
  // Compare window hours
  const compareHours = compareWindow === '6h' ? 6 : compareWindow === '12h' ? 12 : compareWindow === '24h' ? 24 : 12;
  const comparisonData = useMemo(() => compareWindows(snapshots, compareHours), [snapshots, compareHours]);
  
  // Filtered table snapshots based on search
  const filteredTableSnapshots = useMemo(() => {
    if (!searchQuery.trim()) return filteredSnapshots;
    const query = searchQuery.toLowerCase();
    return filteredSnapshots.filter(s => 
      s.ts.toLowerCase().includes(query) ||
      s.comms.lan.toLowerCase().includes(query) ||
      s.gps.fix.toLowerCase().includes(query) ||
      s.backup.status.toLowerCase().includes(query)
    );
  }, [filteredSnapshots, searchQuery]);
  
  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={showSettings ? 'default' : 'outline'}
          onClick={() => setShowSettings(!showSettings)}
          className="h-8 gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </Button>
        <Button
          size="sm"
          variant={showActiveLogs ? 'default' : 'outline'}
          onClick={() => setShowActiveLogs(!showActiveLogs)}
          className="h-8 gap-1.5"
        >
          <Archive className="w-3.5 h-3.5" />
          Active Logs
        </Button>
        <Button
          size="sm"
          variant={showStats ? 'default' : 'outline'}
          onClick={() => setShowStats(!showStats)}
          className="h-8 gap-1.5"
        >
          <PieChart className="w-3.5 h-3.5" />
          Statistics
        </Button>
        <Button
          size="sm"
          variant={showTable ? 'default' : 'outline'}
          onClick={() => setShowTable(!showTable)}
          className="h-8 gap-1.5"
        >
          <List className="w-3.5 h-3.5" />
          Raw Data
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={handleExport} className="h-8 gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>
      
      {/* Last Snapshot Info */}
      <LastSnapshotInfo snapshot={latestSnapshot} capturing={capturing} />
      
      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Capture Settings
            </h3>
            <span className="text-xs text-muted-foreground">{snapshots.length} snapshots stored</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* Capturing Toggle */}
            <div className="glass rounded-lg p-3">
              <span className="text-xs text-muted-foreground block mb-2">Capturing</span>
              <button
                onClick={() => setCapturing(!capturing)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full justify-center ${capturing ? 'bg-success text-white' : 'bg-secondary'}`}
              >
                {capturing ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {capturing ? 'ON' : 'OFF'}
              </button>
            </div>
            
            {/* Interval */}
            <div className="glass rounded-lg p-3">
              <span className="text-xs text-muted-foreground block mb-2">Interval</span>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
              >
                <option value="15s">15 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="60s">60 seconds</option>
                <option value="5m">5 minutes</option>
                <option value="15m">15 minutes</option>
              </select>
            </div>
            
            {/* Retention */}
            <div className="glass rounded-lg p-3">
              <span className="text-xs text-muted-foreground block mb-2">Retention</span>
              <select
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
                className="w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
              >
                <option value="6h">6 hours</option>
                <option value="12h">12 hours</option>
                <option value="24h">24 hours</option>
                <option value="3d">3 days</option>
                <option value="7d">7 days</option>
              </select>
            </div>
            
            {/* Actions */}
            <div className="glass rounded-lg p-3">
              <span className="text-xs text-muted-foreground block mb-2">Danger Zone</span>
              <Button size="sm" variant="outline" onClick={handleClearHistory} className="w-full h-8 text-destructive border-destructive/50">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            <Info className="w-3 h-3 inline mr-1" />
            Snapshots are stored locally. Export regularly for backup. Older data is automatically pruned based on retention setting.
          </p>
        </div>
      )}
      
      {/* Active Logs Panel (Collapsible) */}
      {showActiveLogs && (
        <ActiveLogsPanel logCategories={logCategories} setLogCategories={setLogCategories} />
      )}
      
      {/* Statistics Panel (Collapsible) */}
      {showStats && (
        <StatisticsSummary snapshots={filteredSnapshots} timeRange={timeRange} />
      )}
            <span className="text-xs text-muted-foreground block mb-2">Interval</span>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
            >
              <option value="15s">15s</option>
              <option value="30s">30s</option>
              <option value="60s">60s</option>
              <option value="5m">5m</option>
            </select>
          </div>
          
          {/* Retention */}
          <div className="glass rounded-lg p-3">
            <span className="text-xs text-muted-foreground block mb-2">Retention</span>
            <select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="w-full bg-secondary rounded-lg px-2 py-1.5 text-sm"
            >
              <option value="12h">12 hours</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
            </select>
          </div>
          
          {/* Actions */}
          <div className="glass rounded-lg p-3">
            <span className="text-xs text-muted-foreground block mb-2">Actions</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExport} className="h-8">
                <Download className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearHistory} className="h-8 text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Health Index + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HealthIndexDisplay score={healthIndex} trend={trend} sparklineData={healthHistory.slice(-50)} />
        
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={Cpu} label="CPU" value={latestSnapshot?.metrics?.cpu} unit="%" color="text-blue-400" />
          <MetricCard icon={HardDrive} label="RAM" value={latestSnapshot?.metrics?.ram} unit="%" color="text-purple-400" />
          <MetricCard icon={Database} label="Disk" value={latestSnapshot?.metrics?.disk} unit="%" color="text-amber-400" />
          <MetricCard icon={Thermometer} label="Temp" value={latestSnapshot?.sensors?.temperature} unit="°C" color="text-red-400" />
          <MetricCard icon={Droplets} label="Humidity" value={latestSnapshot?.sensors?.humidity} unit="%" color="text-cyan-400" />
          <MetricCard icon={MapPin} label="GPS" value={latestSnapshot?.gps?.fix} status={latestSnapshot?.gps?.fix} color="text-green-400" />
          <MetricCard icon={Radio} label="Comms" value={latestSnapshot?.comms?.lan} status={latestSnapshot?.comms?.lan} color="text-emerald-400" />
          <MetricCard icon={Database} label="Backup" value={latestSnapshot?.backup?.status} status={latestSnapshot?.backup?.status} color="text-violet-400" />
        </div>
      </div>
      
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Time range:</span>
        {['1h', '6h', '12h', '24h', '7d'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timeRange === range ? 'bg-primary text-white' : 'glass hover:bg-secondary'}`}
          >
            {range}
          </button>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU/RAM/Disk Chart */}
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            System Resources
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#666" />
                <YAxis tick={{ fontSize: 10 }} stroke="#666" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} name="CPU %" />
                <Line type="monotone" dataKey="ram" stroke="#a855f7" strokeWidth={2} dot={false} name="RAM %" />
                <Line type="monotone" dataKey="disk" stroke="#f59e0b" strokeWidth={2} dot={false} name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Temperature Chart */}
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-400" />
            Environment
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#666" />
                <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="temp" stroke="#ef4444" fill="#ef444420" strokeWidth={2} name="Temp °C" />
                <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fill="#06b6d420" strokeWidth={2} name="Humidity %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* GPS Chart */}
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            GPS Status
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#666" />
                <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="gpsAccuracy" stroke="#22c55e" fill="#22c55e20" strokeWidth={2} name="Accuracy (m)" />
                <ReferenceLine y={10} stroke="#666" strokeDasharray="3 3" label={{ value: 'Good', fontSize: 10, fill: '#666' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Comms Status Timeline */}
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Communications Status
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#666" />
                <YAxis tick={{ fontSize: 10 }} stroke="#666" domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(v) => v === 3 ? 'OK' : v === 2 ? 'Deg' : 'Down'} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} formatter={(v) => v === 3 ? 'Available' : v === 2 ? 'Degraded' : 'Unavailable'} />
                <Area type="stepAfter" dataKey="comms" stroke="#10b981" fill="#10b98120" strokeWidth={2} name="Status" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Window Comparison + Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Window Comparison */}
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-primary" />
            Window Comparison (Last 12h vs Previous 12h)
          </h4>
          {comparison.changes.length > 0 ? (
            <div className="space-y-2">
              {comparison.changes.slice(0, 5).map(change => (
                <div key={change.metric} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                  <span className="text-sm capitalize">{change.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{change.previous.toFixed(1)} → {change.current.toFixed(1)}</span>
                    <span className={`text-xs font-medium ${change.direction === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                      {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.percentChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No significant changes detected.</p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            <Info className="w-3 h-3 inline mr-1" />
            Shows metrics that changed more than 5% between time windows.
          </p>
        </div>
        
        {/* Anomaly Feed */}
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Anomaly Feed
          </h4>
          {anomalies.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {anomalies.slice(0, 5).map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success/50" />
              <p className="text-sm text-muted-foreground">No anomalies detected</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Raw Snapshots Table */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Raw Snapshots
          </h4>
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showTable ? 'Hide' : 'Show'} Table
            {showTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        
        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">OK</th>
                  <th className="pb-2 pr-4">CPU</th>
                  <th className="pb-2 pr-4">RAM</th>
                  <th className="pb-2 pr-4">Disk</th>
                  <th className="pb-2 pr-4">Temp</th>
                  <th className="pb-2 pr-4">GPS</th>
                  <th className="pb-2 pr-4">Comms</th>
                  <th className="pb-2">Backup</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnapshots.slice(-20).reverse().map((snapshot, idx) => (
                  <tr 
                    key={snapshot.ts} 
                    className="border-b border-border/50 hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelectedSnapshot({ snapshot, previous: filteredSnapshots[filteredSnapshots.length - 2 - idx] })}
                  >
                    <td className="py-2 pr-4">{new Date(snapshot.ts).toLocaleTimeString()}</td>
                    <td className="py-2 pr-4">
                      <div className={`w-2 h-2 rounded-full ${snapshot.ok ? 'bg-success' : 'bg-destructive'}`} />
                    </td>
                    <td className="py-2 pr-4">{snapshot.metrics.cpu.toFixed(0)}%</td>
                    <td className="py-2 pr-4">{snapshot.metrics.ram.toFixed(0)}%</td>
                    <td className="py-2 pr-4">{snapshot.metrics.disk.toFixed(0)}%</td>
                    <td className="py-2 pr-4">{snapshot.sensors.temperature.toFixed(0)}°C</td>
                    <td className="py-2 pr-4 capitalize">{snapshot.gps.fix}</td>
                    <td className="py-2 pr-4 capitalize">{snapshot.comms.lan}</td>
                    <td className="py-2 capitalize">{snapshot.backup.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-3">
          Click any row to view full snapshot details and compare with previous.
        </p>
      </div>
      
      {/* Snapshot Drawer */}
      {selectedSnapshot && (
        <SnapshotDrawer
          snapshot={selectedSnapshot.snapshot}
          previousSnapshot={selectedSnapshot.previous}
          onClose={() => setSelectedSnapshot(null)}
        />
      )}
    </div>
  );
};

// All Nodes Tab
const AllNodesTab = ({ nodesData }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('health');
  const [selectedNode, setSelectedNode] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareNodes, setCompareNodes] = useState({ a: null, b: null });
  
  // Process nodes data
  const processedNodes = useMemo(() => {
    return Object.entries(nodesData).map(([nodeId, snapshots]) => {
      const node = FLEET_NODES.find(n => n.node_id === nodeId) || { node_id: nodeId, node_name: nodeId };
      const latest = snapshots[snapshots.length - 1];
      const healthIndex = calculateHealthIndex(latest);
      
      return {
        ...node,
        snapshots,
        latest,
        healthIndex,
        commsStatus: latest?.comms?.lan || 'unavailable',
        lastSeen: latest?.ts
      };
    });
  }, [nodesData]);
  
  // Filter and sort
  const filteredNodes = useMemo(() => {
    let filtered = processedNodes;
    
    if (filter === 'degraded') {
      filtered = filtered.filter(n => n.healthIndex < 80 || n.commsStatus !== 'available');
    } else if (filter === 'unavailable') {
      filtered = filtered.filter(n => n.commsStatus === 'unavailable');
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'health') return a.healthIndex - b.healthIndex;
      if (sortBy === 'health-desc') return b.healthIndex - a.healthIndex;
      if (sortBy === 'last-seen') return new Date(b.lastSeen) - new Date(a.lastSeen);
      if (sortBy === 'storage') return b.latest?.metrics?.disk - a.latest?.metrics?.disk;
      return 0;
    });
  }, [processedNodes, filter, sortBy]);
  
  // Fleet Summary Calculations
  const fleetSummary = useMemo(() => {
    const healthScores = processedNodes.map(n => n.healthIndex);
    const avgHealth = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    const worstHealth = Math.min(...healthScores);
    const penalty = worstHealth < 50 ? 10 : worstHealth < 70 ? 5 : 0;
    const fleetReadiness = Math.max(0, Math.round(avgHealth - penalty));
    
    // Outlier detection (deviation > 15 from median)
    const median = healthScores.sort((a, b) => a - b)[Math.floor(healthScores.length / 2)];
    const outliers = processedNodes.filter(n => Math.abs(n.healthIndex - median) > 15);
    
    // Consensus events (look for synchronized status changes)
    const consensusEvents = [];
    const degradedNodes = processedNodes.filter(n => n.commsStatus === 'degraded');
    if (degradedNodes.length >= 2) {
      consensusEvents.push({
        type: 'comms_degraded',
        count: degradedNodes.length,
        total: processedNodes.length,
        message: `Comms degraded across ${degradedNodes.length}/${processedNodes.length} nodes`,
        severity: degradedNodes.length >= 4 ? 'high' : 'medium'
      });
    }
    
    // Capability coverage
    const capabilities = {
      gps: processedNodes.filter(n => n.latest?.gps?.fix !== 'none').length,
      sensors: processedNodes.filter(n => n.latest?.sensors?.temperature).length,
      comms: processedNodes.filter(n => n.commsStatus === 'available').length,
      backup: processedNodes.filter(n => n.latest?.backup?.status === 'success').length
    };
    
    return { fleetReadiness, avgHealth, worstHealth, outliers, consensusEvents, capabilities, total: processedNodes.length };
  }, [processedNodes]);
  
  // Compare data
  const comparisonData = useMemo(() => {
    if (!compareNodes.a || !compareNodes.b) return null;
    
    const nodeA = processedNodes.find(n => n.node_id === compareNodes.a);
    const nodeB = processedNodes.find(n => n.node_id === compareNodes.b);
    
    if (!nodeA || !nodeB) return null;
    
    // Merge snapshots for overlay chart
    const chartData = [];
    const step = Math.max(1, Math.floor(Math.max(nodeA.snapshots.length, nodeB.snapshots.length) / 50));
    
    for (let i = 0; i < Math.max(nodeA.snapshots.length, nodeB.snapshots.length); i += step) {
      const snapA = nodeA.snapshots[i];
      const snapB = nodeB.snapshots[i];
      chartData.push({
        ts: snapA ? new Date(snapA.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        healthA: snapA ? calculateHealthIndex(snapA) : null,
        healthB: snapB ? calculateHealthIndex(snapB) : null,
        tempA: snapA?.sensors?.temperature,
        tempB: snapB?.sensors?.temperature,
        cpuA: snapA?.metrics?.cpu,
        cpuB: snapB?.metrics?.cpu
      });
    }
    
    // Count anomalies for each
    const anomaliesA = detectAnomalies(nodeA.snapshots);
    const anomaliesB = detectAnomalies(nodeB.snapshots);
    
    return { nodeA, nodeB, chartData, anomaliesA, anomaliesB };
  }, [compareNodes, processedNodes]);
  
  return (
    <div className="space-y-6">
      {/* Fleet Summary */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Fleet Summary
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {/* Fleet Readiness Score */}
          <div className="glass rounded-lg p-3 text-center">
            <div className={`text-3xl font-bold ${getHealthColor(fleetSummary.fleetReadiness)}`}>
              {fleetSummary.fleetReadiness}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fleet Readiness</p>
            <p className="text-[10px] text-muted-foreground">Avg health with worst-node penalty</p>
          </div>
          
          {/* Active Nodes */}
          <div className="glass rounded-lg p-3 text-center">
            <div className="text-3xl font-bold text-primary">{fleetSummary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Nodes</p>
          </div>
          
          {/* Outliers */}
          <div className="glass rounded-lg p-3 text-center">
            <div className={`text-3xl font-bold ${fleetSummary.outliers.length > 0 ? 'text-warning' : 'text-success'}`}>
              {fleetSummary.outliers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outlier Nodes</p>
            <p className="text-[10px] text-muted-foreground">Deviating &gt;15 from median</p>
          </div>
          
          {/* Worst Health */}
          <div className="glass rounded-lg p-3 text-center">
            <div className={`text-3xl font-bold ${getHealthColor(fleetSummary.worstHealth)}`}>
              {fleetSummary.worstHealth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Worst Node</p>
          </div>
        </div>
        
        {/* Consensus Events */}
        {fleetSummary.consensusEvents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Consensus Events
            </h4>
            <div className="space-y-2">
              {fleetSummary.consensusEvents.map((event, i) => (
                <div key={i} className={`p-3 rounded-lg ${event.severity === 'high' ? 'bg-destructive/20' : 'bg-warning/20'}`}>
                  <p className="text-sm">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Synchronized status change detected across multiple nodes—may indicate external factor (network, power, environment).
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Capability Coverage */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Capability Coverage</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(fleetSummary.capabilities).map(([cap, count]) => (
              <div key={cap} className="glass rounded-lg p-2 text-center">
                <div className="text-lg font-bold">
                  {count}/{fleetSummary.total}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{cap} OK</p>
                {count < fleetSummary.total && (
                  <p className="text-[10px] text-warning mt-1">
                    {fleetSummary.total - count} node(s) missing
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Outlier Nodes */}
      {fleetSummary.outliers.length > 0 && (
        <div className="glass rounded-xl p-4 bg-warning/10 border border-warning/30">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Outlier Nodes
          </h4>
          <div className="space-y-2">
            {fleetSummary.outliers.map(node => (
              <div key={node.node_id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusBg(node.commsStatus)}`} />
                  <span className="text-sm font-medium">{node.node_name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span>Health: <strong className={getHealthColor(node.healthIndex)}>{node.healthIndex}</strong></span>
                  <span>Temp: {node.latest?.sensors?.temperature?.toFixed(0)}°C</span>
                  <span>CPU: {node.latest?.metrics?.cpu?.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <Info className="w-3 h-3 inline mr-1" />
            These nodes have health scores significantly different from the fleet median. Investigate for hardware or configuration issues.
          </p>
        </div>
      )}
      
      {/* Filters and Node Roster */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            Node Roster
          </h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-secondary rounded-lg px-3 py-1.5 text-xs"
            >
              <option value="all">All Nodes</option>
              <option value="degraded">Degraded Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-secondary rounded-lg px-3 py-1.5 text-xs"
            >
              <option value="health">Health ↑</option>
              <option value="health-desc">Health ↓</option>
              <option value="last-seen">Last Seen</option>
              <option value="storage">Storage Used</option>
            </select>
            
            {/* Compare Mode Toggle */}
            <Button
              size="sm"
              variant={compareMode ? 'default' : 'outline'}
              onClick={() => {
                setCompareMode(!compareMode);
                setCompareNodes({ a: null, b: null });
              }}
              className="h-7 text-xs"
            >
              <GitCompare className="w-3 h-3 mr-1" />
              Compare
            </Button>
          </div>
        </div>
        
        {compareMode && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Select two nodes to compare:</p>
            <div className="flex flex-wrap gap-2">
              {processedNodes.map(node => (
                <button
                  key={node.node_id}
                  onClick={() => {
                    if (compareNodes.a === node.node_id) {
                      setCompareNodes({ ...compareNodes, a: null });
                    } else if (compareNodes.b === node.node_id) {
                      setCompareNodes({ ...compareNodes, b: null });
                    } else if (!compareNodes.a) {
                      setCompareNodes({ ...compareNodes, a: node.node_id });
                    } else if (!compareNodes.b) {
                      setCompareNodes({ ...compareNodes, b: node.node_id });
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    compareNodes.a === node.node_id ? 'bg-blue-500 text-white' :
                    compareNodes.b === node.node_id ? 'bg-purple-500 text-white' :
                    'glass hover:bg-secondary'
                  }`}
                >
                  {node.node_name}
                  {compareNodes.a === node.node_id && ' (A)'}
                  {compareNodes.b === node.node_id && ' (B)'}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Node Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNodes.map(node => (
            <NodeCard
              key={node.node_id}
              node={node}
              snapshots={node.snapshots}
              onClick={() => setSelectedNode(node)}
              selected={selectedNode?.node_id === node.node_id}
            />
          ))}
        </div>
        
        {filteredNodes.length === 0 && (
          <div className="text-center py-8">
            <Server className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No nodes match the current filter</p>
          </div>
        )}
      </div>
      
      {/* Comparison View */}
      {compareMode && comparisonData && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-primary" />
            Comparing: <span className="text-blue-400">{comparisonData.nodeA.node_name}</span> vs <span className="text-purple-400">{comparisonData.nodeB.node_name}</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Health Trend Overlay */}
            <div className="glass rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2">Health Index Trend</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#666" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#666" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="healthA" stroke="#3b82f6" strokeWidth={2} dot={false} name={comparisonData.nodeA.node_name} />
                    <Line type="monotone" dataKey="healthB" stroke="#a855f7" strokeWidth={2} dot={false} name={comparisonData.nodeB.node_name} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Temperature Trend Overlay */}
            <div className="glass rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2">Temperature Trend</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#666" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="tempA" stroke="#3b82f6" strokeWidth={2} dot={false} name={`${comparisonData.nodeA.node_name} °C`} />
                    <Line type="monotone" dataKey="tempB" stroke="#a855f7" strokeWidth={2} dot={false} name={`${comparisonData.nodeB.node_name} °C`} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Anomaly Differences */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-blue-400">{comparisonData.nodeA.node_name}</h4>
              <p className="text-xs text-muted-foreground">{comparisonData.anomaliesA.length} anomalies detected</p>
              {comparisonData.anomaliesA.slice(0, 3).map(a => (
                <div key={a.id} className="text-xs mt-1 p-1 bg-black/20 rounded">{a.message}</div>
              ))}
            </div>
            <div className="glass rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-purple-400">{comparisonData.nodeB.node_name}</h4>
              <p className="text-xs text-muted-foreground">{comparisonData.anomaliesB.length} anomalies detected</p>
              {comparisonData.anomaliesB.slice(0, 3).map(a => (
                <div key={a.id} className="text-xs mt-1 p-1 bg-black/20 rounded">{a.message}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN LOGS ANALYTICS COMPONENT
// ============================================================

export default function LogsAnalytics({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('this-device');
  const [capturing, setCapturing] = useState(true);
  const [interval, setInterval] = useState('60s');
  const [retention, setRetention] = useState('24h');
  
  // Generate mock data
  const [thisDeviceSnapshots] = useState(() => generateSnapshots(THIS_DEVICE.node_id, THIS_DEVICE.node_name, 24, 1));
  
  const [nodesData] = useState(() => {
    const data = {};
    FLEET_NODES.forEach(node => {
      if (node.node_id === 'talon-omega-04') {
        // Make this an outlier node
        data[node.node_id] = generateOutlierNode();
      } else {
        data[node.node_id] = generateSnapshots(node.node_id, node.node_name, 24, 1);
      }
    });
    return data;
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto" data-testid="logs-analytics">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">LOGS Analytics</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">System monitoring and fleet intelligence</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-2"
              data-testid="logs-close"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('this-device')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'this-device' ? 'bg-primary text-white' : 'glass hover:bg-secondary'}`}
              data-testid="tab-this-device"
            >
              This Device
            </button>
            <button
              onClick={() => setActiveTab('all-nodes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all-nodes' ? 'bg-primary text-white' : 'glass hover:bg-secondary'}`}
              data-testid="tab-all-nodes"
            >
              All Nodes ({FLEET_NODES.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'this-device' ? (
          <ThisDeviceTab
            snapshots={thisDeviceSnapshots}
            capturing={capturing}
            setCapturing={setCapturing}
            interval={interval}
            setInterval={setInterval}
            retention={retention}
            setRetention={setRetention}
          />
        ) : (
          <AllNodesTab nodesData={nodesData} />
        )}
      </div>
    </div>
  );
}
