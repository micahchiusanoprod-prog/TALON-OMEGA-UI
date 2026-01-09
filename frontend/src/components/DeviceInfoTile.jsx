import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
  ChevronUp,
  X,
  Zap
} from 'lucide-react';
import api from '../services/api';
import config from '../config';

// Comprehensive help content
const DEVICE_HELP = {
  overview: "The Device Info tile monitors your OMEGA's health and performance. Keep an eye on these metrics to ensure smooth operation and catch issues early.",
  
  metrics: [
    {
      name: "CPU Usage",
      icon: Cpu,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      description: "Percentage of processor capacity currently being used by running programs and services.",
      why: "High CPU usage slows everything down and drains battery faster. Sustained high usage may indicate a problem.",
      ranges: [
        { range: "0-30%", status: "Idle", color: "text-success", advice: "Plenty of headroom, optimal" },
        { range: "30-60%", status: "Moderate", color: "text-primary", advice: "Active but healthy" },
        { range: "60-80%", status: "High", color: "text-warning", advice: "May slow down other tasks" },
        { range: "80-100%", status: "Critical", color: "text-destructive", advice: "System may be unresponsive" },
      ]
    },
    {
      name: "Memory (RAM)",
      icon: MemoryStick,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      description: "Active working memory for running applications. Data here is lost on restart.",
      why: "When RAM fills up, the system slows dramatically and apps may crash.",
      ranges: [
        { range: "0-50%", status: "Light", color: "text-success", advice: "Room for more apps" },
        { range: "50-70%", status: "Moderate", color: "text-primary", advice: "Normal active use" },
        { range: "70-85%", status: "High", color: "text-warning", advice: "Close unused apps" },
        { range: "85-100%", status: "Critical", color: "text-destructive", advice: "May need restart" },
      ]
    },
    {
      name: "Storage",
      icon: HardDrive,
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/20",
      description: "Permanent storage for files, apps, and system data. Persists through restarts.",
      why: "Full storage prevents saving data and causes system instability. Keep 15%+ free.",
      ranges: [
        { range: "0-60%", status: "Good", color: "text-success", advice: "Plenty of space" },
        { range: "60-75%", status: "Moderate", color: "text-primary", advice: "Healthy usage" },
        { range: "75-85%", status: "High", color: "text-warning", advice: "Consider cleanup" },
        { range: "85-100%", status: "Critical", color: "text-destructive", advice: "Free space now" },
      ]
    },
    {
      name: "CPU Temperature",
      icon: Thermometer,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      description: "How hot the processor is running. Measured in Celsius.",
      why: "Excessive heat reduces performance and can damage hardware over time.",
      ranges: [
        { range: "Below 45°C", status: "Cool", color: "text-success", advice: "Optimal operation" },
        { range: "45-60°C", status: "Normal", color: "text-primary", advice: "Expected under load" },
        { range: "60-75°C", status: "Warm", color: "text-warning", advice: "Check ventilation" },
        { range: "Above 75°C", status: "Hot", color: "text-destructive", advice: "Reduce load, cool down" },
      ]
    },
    {
      name: "Uptime",
      icon: Clock,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      description: "Time since the device was last restarted.",
      why: "Occasional restarts clear memory leaks and refresh system resources.",
      ranges: [
        { range: "0-7 days", status: "Fresh", color: "text-success", advice: "Recently restarted" },
        { range: "7-14 days", status: "Normal", color: "text-primary", advice: "Typical uptime" },
        { range: "14-30 days", status: "Extended", color: "text-warning", advice: "Restart soon" },
        { range: "30+ days", status: "Long", color: "text-amber-400", advice: "Restart recommended" },
      ]
    },
    {
      name: "Services",
      icon: Server,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      description: "Background processes that power OMEGA's features.",
      why: "Services must be running for features to work. Degraded = partial function.",
      ranges: [
        { range: "All Up", status: "Healthy", color: "text-success", advice: "All features working" },
        { range: "Some Degraded", status: "Partial", color: "text-warning", advice: "Some features limited" },
        { range: "Any Down", status: "Problem", color: "text-destructive", advice: "Features unavailable" },
      ]
    }
  ],
  
  legend: [
    { icon: CheckCircle, color: "text-success", bg: "bg-success/20", label: "Good", description: "Optimal range" },
    { icon: Info, color: "text-primary", bg: "bg-primary/20", label: "Normal", description: "Acceptable" },
    { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/20", label: "High", description: "Needs attention" },
    { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/20", label: "Critical", description: "Action required" },
  ],
  
  tips: [
    "High CPU + High Temp together = reduce workload or improve cooling",
    "If services are degraded, try restarting the OMEGA device",
    "Progress bars show usage at a glance: green=good, yellow=caution, red=critical",
    "Storage issues? Delete old logs, cached files, or unused media"
  ]
};

// Help Modal Component
const DeviceHelpModal = ({ onClose }) => {
  const [expandedMetric, setExpandedMetric] = useState(null);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Device Metrics Help</h3>
              <p className="text-xs text-muted-foreground max-w-md">{DEVICE_HELP.overview}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Metrics */}
          <div className="space-y-2">
            {DEVICE_HELP.metrics.map((metric, idx) => {
              const Icon = metric.icon;
              const isExpanded = expandedMetric === idx;
              
              return (
                <div key={idx} className="glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedMetric(isExpanded ? null : idx)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                      <Icon className={`w-4 h-4 ${metric.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium text-sm">{metric.name}</span>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{metric.description}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 animate-fade-in">
                      <p className="text-xs text-muted-foreground">{metric.why}</p>
                      <div className="space-y-1">
                        {metric.ranges.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground w-24 font-mono">{r.range}</span>
                            <span className={`font-medium w-16 ${r.color}`}>{r.status}</span>
                            <span className="text-muted-foreground">{r.advice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="glass rounded-xl p-3">
            <h4 className="font-semibold text-sm mb-2">Status Legend</h4>
            <div className="grid grid-cols-2 gap-2">
              {DEVICE_HELP.legend.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`p-1 rounded ${item.bg}`}>
                      <Icon className={`w-3 h-3 ${item.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-medium">{item.label}</span>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Tips */}
          <div className="glass rounded-xl p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" /> Quick Tips
            </h4>
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
      </div>
    </div>
  );
};

export default function DeviceInfoTile() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

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
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  // Status helpers
  const getStatus = (type, value) => {
    switch(type) {
      case 'cpu':
        if (value > 80) return { color: 'text-destructive', bg: 'bg-destructive', label: 'Critical' };
        if (value > 60) return { color: 'text-warning', bg: 'bg-warning', label: 'High' };
        if (value > 30) return { color: 'text-primary', bg: 'bg-primary', label: 'Normal' };
        return { color: 'text-success', bg: 'bg-success', label: 'Low' };
      case 'ram':
        if (value > 85) return { color: 'text-destructive', bg: 'bg-destructive', label: 'Critical' };
        if (value > 70) return { color: 'text-warning', bg: 'bg-warning', label: 'High' };
        if (value > 50) return { color: 'text-primary', bg: 'bg-primary', label: 'Normal' };
        return { color: 'text-success', bg: 'bg-success', label: 'Light' };
      case 'disk':
        if (value > 85) return { color: 'text-destructive', bg: 'bg-destructive', label: 'Critical' };
        if (value > 75) return { color: 'text-warning', bg: 'bg-warning', label: 'High' };
        if (value > 60) return { color: 'text-primary', bg: 'bg-primary', label: 'Normal' };
        return { color: 'text-success', bg: 'bg-success', label: 'Good' };
      case 'temp':
        if (value > 75) return { color: 'text-destructive', bg: 'bg-destructive', label: 'Hot' };
        if (value > 60) return { color: 'text-warning', bg: 'bg-warning', label: 'Warm' };
        if (value > 45) return { color: 'text-primary', bg: 'bg-primary', label: 'Normal' };
        return { color: 'text-success', bg: 'bg-success', label: 'Cool' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  const serviceCount = displayHealth.services ? Object.keys(displayHealth.services).length : 0;
  const servicesUp = displayHealth.services ? Object.values(displayHealth.services).filter(s => s === 'up' || s === 'running').length : 0;
  const servicesDegraded = displayHealth.services ? Object.values(displayHealth.services).filter(s => s === 'degraded').length : 0;
  
  const cpuStatus = getStatus('cpu', displayMetrics.cpu);
  const ramStatus = getStatus('ram', displayMetrics.ram);
  const diskStatus = getStatus('disk', displayMetrics.disk);
  const tempStatus = getStatus('temp', displayMetrics.temp);

  if (loading) {
    return (
      <Card className="glass-strong border-border h-full">
        <CardContent className="p-4">
          <div className="skeleton h-40 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-strong border-border h-full" data-testid="device-info-tile">
        <CardHeader className="pb-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              Device Info
            </CardTitle>
            <div className="flex items-center gap-1">
              {!metrics?.available && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  Simulated
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Help & Legend"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-4 space-y-3">
          {/* Primary Metrics - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* CPU */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium">CPU</span>
                </div>
                <span className={`text-[9px] font-semibold ${cpuStatus.color}`}>{cpuStatus.label}</span>
              </div>
              <div className="text-2xl font-bold tabular-nums">{displayMetrics.cpu}%</div>
              <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${cpuStatus.bg} transition-all`} style={{ width: `${displayMetrics.cpu}%` }} />
              </div>
            </div>

            {/* RAM */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <MemoryStick className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium">RAM</span>
                </div>
                <span className={`text-[9px] font-semibold ${ramStatus.color}`}>{ramStatus.label}</span>
              </div>
              <div className="text-2xl font-bold tabular-nums">{displayMetrics.ram}%</div>
              <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${ramStatus.bg} transition-all`} style={{ width: `${displayMetrics.ram}%` }} />
              </div>
            </div>

            {/* Storage */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium">Storage</span>
                </div>
                <span className={`text-[9px] font-semibold ${diskStatus.color}`}>{diskStatus.label}</span>
              </div>
              <div className="text-2xl font-bold tabular-nums">{displayMetrics.disk}%</div>
              <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${diskStatus.bg} transition-all`} style={{ width: `${displayMetrics.disk}%` }} />
              </div>
            </div>

            {/* Temperature */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium">Temp</span>
                </div>
                <span className={`text-[9px] font-semibold ${tempStatus.color}`}>{tempStatus.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{displayMetrics.temp}</span>
                <span className="text-sm text-muted-foreground">°C</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {(displayMetrics.temp * 9/5 + 32).toFixed(0)}°F
              </p>
            </div>
          </div>

          {/* Uptime & Services Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Uptime */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium">Uptime</span>
              </div>
              <div className="text-xl font-bold tabular-nums">{formatUptime(displayMetrics.uptime)}</div>
              <p className="text-[10px] text-muted-foreground">Since last restart</p>
            </div>

            {/* Services */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium">Services</span>
                </div>
                <span className={`text-[9px] font-semibold ${servicesUp === serviceCount ? 'text-success' : servicesDegraded > 0 ? 'text-warning' : 'text-destructive'}`}>
                  {servicesUp === serviceCount ? 'All Up' : `${servicesUp}/${serviceCount}`}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {displayHealth.services && Object.entries(displayHealth.services).map(([name, status]) => (
                  <div
                    key={name}
                    className={`w-2 h-2 rounded-full ${
                      status === 'up' || status === 'running' ? 'bg-success' :
                      status === 'degraded' ? 'bg-warning' : 'bg-destructive'
                    }`}
                    title={`${name}: ${status}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {servicesDegraded > 0 ? `${servicesDegraded} degraded` : 'All services healthy'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <span>Updated: just now</span>
            <button className="flex items-center gap-1 text-primary hover:text-primary/80">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      {showHelp && <DeviceHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
