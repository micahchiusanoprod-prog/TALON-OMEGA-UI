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
  Server,
  RefreshCw,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../services/api';
import config from '../config';

// Help content for Device Info tile
const DEVICE_HELP = {
  overview: "This tile shows the health and performance of your OMEGA device. Monitor these metrics to ensure your device is running optimally.",
  metrics: {
    cpu: {
      title: "CPU Usage",
      description: "The percentage of your processor's capacity currently in use.",
      why: "High CPU usage can slow down your device and drain battery faster. Sustained high usage may indicate a problem or heavy workload.",
      ranges: [
        { range: "0-40%", status: "Idle", advice: "Normal operation, plenty of headroom" },
        { range: "40-70%", status: "Moderate", advice: "Active but healthy usage" },
        { range: "70-100%", status: "High", advice: "Heavy load, may cause slowdowns" },
      ]
    },
    memory: {
      title: "Memory (RAM)",
      description: "How much of your device's working memory is currently being used.",
      why: "RAM stores data for active programs. When full, performance drops significantly and apps may crash.",
      ranges: [
        { range: "0-50%", status: "Light", advice: "Plenty of room for more apps" },
        { range: "50-80%", status: "Moderate", advice: "Normal for active use" },
        { range: "80-100%", status: "High", advice: "May need to close apps or restart" },
      ]
    },
    storage: {
      title: "Storage",
      description: "The percentage of your device's disk space that contains data.",
      why: "Full storage prevents saving new data and can cause system instability. Keep at least 15% free.",
      ranges: [
        { range: "0-60%", status: "Good", advice: "Plenty of space available" },
        { range: "60-85%", status: "Moderate", advice: "Consider cleaning up old files" },
        { range: "85-100%", status: "Critical", advice: "Free up space immediately" },
      ]
    },
    temperature: {
      title: "CPU Temperature",
      description: "How hot your processor is running. Measured in degrees Celsius.",
      why: "Excessive heat reduces performance and can damage hardware. Ensure proper ventilation.",
      ranges: [
        { range: "Below 50°C", status: "Cool", advice: "Optimal operating temperature" },
        { range: "50-70°C", status: "Warm", advice: "Normal under load" },
        { range: "Above 70°C", status: "Hot", advice: "Improve cooling or reduce load" },
      ]
    },
    uptime: {
      title: "Uptime",
      description: "How long since your device was last restarted.",
      why: "Occasional restarts clear temporary files and refresh system resources. Very long uptimes may indicate you should restart.",
      ranges: [
        { range: "0-7 days", status: "Fresh", advice: "Recently restarted, good" },
        { range: "7-30 days", status: "Normal", advice: "Typical uptime" },
        { range: "30+ days", status: "Long", advice: "Consider a restart soon" },
      ]
    },
    services: {
      title: "Services",
      description: "Background programs that power your device's features.",
      why: "Services must be running for features to work. Stopped or degraded services may indicate problems.",
      ranges: [
        { range: "All 'up'", status: "Healthy", advice: "All features working" },
        { range: "Some 'degraded'", status: "Partial", advice: "Some features may be limited" },
        { range: "Any 'down'", status: "Problem", advice: "Features unavailable, check logs" },
      ]
    },
  },
  legend: [
    { icon: CheckCircle, color: "text-success", bg: "bg-success/20", label: "Good", description: "Within optimal range" },
    { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/20", label: "High", description: "Elevated but manageable" },
    { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/20", label: "Critical", description: "Needs attention" },
  ],
  tips: [
    "Progress bars show usage at a glance - green is good, yellow is caution, red is critical",
    "Tap 'Refresh' to get the latest readings",
    "If services show 'degraded', try restarting the device",
  ]
};

export default function DeviceInfoTile() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(null);

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
          <div className="flex items-center gap-2">
            {showSimulated && (
              <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
                Simulated
              </span>
            )}
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-1.5 rounded-lg transition-colors ${showHelp ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'}`}
              title="Help & Legend"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-y-auto scrollbar-thin">
        {/* Help Section */}
        {showHelp && (
          <div className="mb-4 glass rounded-xl p-4 border border-primary/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Understanding Device Metrics</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{DEVICE_HELP.overview}</p>
            
            {/* Metric Help - Expandable */}
            <div className="space-y-2 mb-4">
              {Object.entries(DEVICE_HELP.metrics).map(([key, metric]) => (
                <div key={key} className="border border-border/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedHelp(expandedHelp === key ? null : key)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
                  >
                    <span className="text-sm font-medium">{metric.title}</span>
                    {expandedHelp === key ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedHelp === key && (
                    <div className="px-3 pb-3 space-y-2 animate-fade-in">
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                      <p className="text-xs"><strong>Why it matters:</strong> {metric.why}</p>
                      <div className="mt-2">
                        <span className="text-xs font-medium">Reference Ranges:</span>
                        <div className="mt-1 space-y-1">
                          {metric.ranges.map((r, i) => (
                            <div key={i} className="text-xs flex items-start gap-2">
                              <span className="text-muted-foreground w-24 flex-shrink-0">{r.range}</span>
                              <span className="font-medium w-16 flex-shrink-0">{r.status}</span>
                              <span className="text-muted-foreground">{r.advice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Status Legend */}
            <div className="border-t border-border/50 pt-3">
              <span className="text-xs font-semibold mb-2 block">Status Indicators</span>
              <div className="space-y-2">
                {DEVICE_HELP.legend.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${item.bg}`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{item.label}</span>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="border-t border-border/50 pt-3 mt-3">
              <span className="text-xs font-semibold mb-2 block">Tips</span>
              <ul className="space-y-1">
                {DEVICE_HELP.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
                  <p className="text-xs text-muted-foreground">How hard your processor is working</p>
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
