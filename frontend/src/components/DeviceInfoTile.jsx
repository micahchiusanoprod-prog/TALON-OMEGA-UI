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
  X,
  Zap
} from 'lucide-react';
import api from '../services/api';
import config from '../config';

// Help content
const DEVICE_HELP = {
  overview: "The Device Info tile monitors your OMEGA's internal health and performance. Keep an eye on these metrics to ensure smooth operation, prevent overheating, and catch issues before they become problems.",
  
  legend: [
    { color: "bg-success", label: "Good", description: "Optimal range - system healthy" },
    { color: "bg-primary", label: "Normal", description: "Acceptable - typical operation" },
    { color: "bg-warning", label: "High", description: "Elevated - monitor closely" },
    { color: "bg-destructive", label: "Critical", description: "Action required immediately" },
  ],
  
  tips: [
    "High CPU + High Temp together = reduce workload or improve cooling",
    "If RAM stays above 80%, close unused applications or restart",
    "Keep storage below 85% for optimal performance",
    "Occasional restarts (every 1-2 weeks) help clear memory leaks"
  ]
};

// Help Modal Component
const DeviceHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="glass-strong rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Device Metrics Guide</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <p className="text-sm text-muted-foreground">{DEVICE_HELP.overview}</p>
          
          {/* Legend */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Status Indicator Legend
            </h4>
            <div className="space-y-2">
              {DEVICE_HELP.legend.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">— {item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tips */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" /> Tips
            </h4>
            <ul className="space-y-1.5">
              {DEVICE_HELP.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
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

// Individual Metric Card with full details
const MetricCard = ({ 
  icon: Icon, 
  iconColor, 
  iconBg, 
  title, 
  value, 
  unit, 
  secondaryValue,
  status, 
  statusColor, 
  statusBg,
  description,
  ranges,
  currentRangeIndex,
  showProgressBar = true
}) => {
  const currentRange = ranges[currentRangeIndex];
  
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <h4 className="font-semibold text-base">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{description}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusBg} ${statusColor}`}>
          {status}
        </div>
      </div>
      
      {/* Value Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-light tabular-nums">{value}</span>
        <span className="text-lg text-muted-foreground">{unit}</span>
        {secondaryValue && (
          <span className="text-sm text-muted-foreground ml-2">({secondaryValue})</span>
        )}
      </div>
      
      {/* Progress Bar (for percentage metrics) */}
      {showProgressBar && (
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${currentRange.barColor}`}
            style={{ width: `${Math.min(parseFloat(value), 100)}%` }}
          />
        </div>
      )}
      
      {/* Range Labels */}
      <div className="space-y-1">
        {ranges.map((range, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg transition-all ${
              i === currentRangeIndex 
                ? `${range.bgColor} ${range.textColor} font-medium` 
                : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${range.barColor}`} />
              <span>{range.label}</span>
            </div>
            <span className="font-mono text-[11px]">{range.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DeviceInfoTile() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

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
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // CPU ranges
  const cpuRanges = [
    { label: 'Idle', range: '0-30%', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Moderate', range: '30-60%', barColor: 'bg-primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
    { label: 'High', range: '60-80%', barColor: 'bg-warning', bgColor: 'bg-warning/20', textColor: 'text-warning' },
    { label: 'Critical', range: '80-100%', barColor: 'bg-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive' },
  ];
  const getCpuRangeIndex = (v) => {
    if (v <= 30) return 0;
    if (v <= 60) return 1;
    if (v <= 80) return 2;
    return 3;
  };
  const cpuRangeIdx = getCpuRangeIndex(displayMetrics.cpu);

  // RAM ranges
  const ramRanges = [
    { label: 'Light', range: '0-50%', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Moderate', range: '50-70%', barColor: 'bg-primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
    { label: 'High', range: '70-85%', barColor: 'bg-warning', bgColor: 'bg-warning/20', textColor: 'text-warning' },
    { label: 'Critical', range: '85-100%', barColor: 'bg-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive' },
  ];
  const getRamRangeIndex = (v) => {
    if (v <= 50) return 0;
    if (v <= 70) return 1;
    if (v <= 85) return 2;
    return 3;
  };
  const ramRangeIdx = getRamRangeIndex(displayMetrics.ram);

  // Storage ranges
  const storageRanges = [
    { label: 'Plenty of Space', range: '0-60%', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Moderate Use', range: '60-75%', barColor: 'bg-primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
    { label: 'Getting Full', range: '75-85%', barColor: 'bg-warning', bgColor: 'bg-warning/20', textColor: 'text-warning' },
    { label: 'Nearly Full', range: '85-100%', barColor: 'bg-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive' },
  ];
  const getStorageRangeIndex = (v) => {
    if (v <= 60) return 0;
    if (v <= 75) return 1;
    if (v <= 85) return 2;
    return 3;
  };
  const storageRangeIdx = getStorageRangeIndex(displayMetrics.disk);

  // Temperature ranges
  const tempRanges = [
    { label: 'Cool', range: '< 45°C', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Normal', range: '45-60°C', barColor: 'bg-primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
    { label: 'Warm', range: '60-75°C', barColor: 'bg-warning', bgColor: 'bg-warning/20', textColor: 'text-warning' },
    { label: 'Hot', range: '> 75°C', barColor: 'bg-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive' },
  ];
  const getTempRangeIndex = (v) => {
    if (v < 45) return 0;
    if (v < 60) return 1;
    if (v < 75) return 2;
    return 3;
  };
  const tempRangeIdx = getTempRangeIndex(displayMetrics.temp);

  const serviceCount = displayHealth.services ? Object.keys(displayHealth.services).length : 0;
  const servicesUp = displayHealth.services ? Object.values(displayHealth.services).filter(s => s === 'up' || s === 'running').length : 0;
  const servicesDegraded = displayHealth.services ? Object.values(displayHealth.services).filter(s => s === 'degraded').length : 0;

  if (loading) {
    return (
      <Card className="glass-strong border-border h-full">
        <CardContent className="p-6">
          <div className="skeleton h-80 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-strong border-border h-full" data-testid="device-info-tile">
        <CardHeader className="pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-bold">Device Info</span>
                <p className="text-xs text-muted-foreground font-normal">System health & performance</p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              {!metrics?.available && (
                <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                  Simulated
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className={`h-8 px-3 text-xs ${showLegend ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
              >
                <Info className="w-3.5 h-3.5 mr-1.5" />
                Legend
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title="Help Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Inline Legend */}
          {showLegend && (
            <div className="mt-3 p-3 glass rounded-xl animate-fade-in">
              <div className="flex flex-wrap gap-4">
                {DEVICE_HELP.legend.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground"> — {item.description}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
          {/* Desktop: 2-column grid */}
          <div className="hidden lg:block space-y-4">
            {/* Row 1: CPU & RAM */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={Cpu}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/20"
                title="CPU Usage"
                value={displayMetrics.cpu}
                unit="%"
                status={cpuRanges[cpuRangeIdx].label}
                statusColor={cpuRanges[cpuRangeIdx].textColor}
                statusBg={cpuRanges[cpuRangeIdx].bgColor}
                description="Processor load. High usage = slower system."
                ranges={cpuRanges}
                currentRangeIndex={cpuRangeIdx}
              />
              
              <MetricCard
                icon={MemoryStick}
                iconColor="text-purple-400"
                iconBg="bg-purple-500/20"
                title="Memory (RAM)"
                value={displayMetrics.ram}
                unit="%"
                status={ramRanges[ramRangeIdx].label}
                statusColor={ramRanges[ramRangeIdx].textColor}
                statusBg={ramRanges[ramRangeIdx].bgColor}
                description="Working memory. When full, apps may crash."
                ranges={ramRanges}
                currentRangeIndex={ramRangeIdx}
              />
            </div>
            
            {/* Row 2: Storage & Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={HardDrive}
                iconColor="text-orange-400"
                iconBg="bg-orange-500/20"
                title="Storage"
                value={displayMetrics.disk}
                unit="%"
                status={storageRanges[storageRangeIdx].label}
                statusColor={storageRanges[storageRangeIdx].textColor}
                statusBg={storageRanges[storageRangeIdx].bgColor}
                description="Disk space. Keep 15% free for best performance."
                ranges={storageRanges}
                currentRangeIndex={storageRangeIdx}
              />
              
              <MetricCard
                icon={Thermometer}
                iconColor="text-red-400"
                iconBg="bg-red-500/20"
                title="CPU Temperature"
                value={displayMetrics.temp}
                unit="°C"
                secondaryValue={`${(displayMetrics.temp * 9/5 + 32).toFixed(0)}°F`}
                status={tempRanges[tempRangeIdx].label}
                statusColor={tempRanges[tempRangeIdx].textColor}
                statusBg={tempRanges[tempRangeIdx].bgColor}
                description="Processor heat. High temp = throttling."
                ranges={tempRanges}
                currentRangeIndex={tempRangeIdx}
                showProgressBar={false}
              />
            </div>
            
            {/* Uptime & Services Row */}
            <div className="glass rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Uptime */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20">
                      <Clock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Uptime</h4>
                      <p className="text-xs text-muted-foreground">Since last restart</p>
                    </div>
                  </div>
                  <div className="text-3xl font-light tabular-nums">{formatUptime(displayMetrics.uptime)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Restart weekly for best performance.</p>
                </div>
                
                {/* Services */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20">
                      <Server className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Services</h4>
                      <p className="text-xs text-muted-foreground">Background processes</p>
                    </div>
                  </div>
                  <div className={`text-3xl font-light ${servicesUp === serviceCount ? 'text-success' : 'text-warning'}`}>
                    {servicesUp}/{serviceCount} <span className="text-base">up</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {displayHealth.services && Object.entries(displayHealth.services).map(([name, status]) => (
                      <div
                        key={name}
                        className={`px-2 py-1 rounded text-[10px] font-medium ${
                          status === 'up' || status === 'running' 
                            ? 'bg-success/20 text-success' 
                            : status === 'degraded' 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-destructive/20 text-destructive'
                        }`}
                        title={`${name}: ${status}`}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile: Compact View */}
          <div className="lg:hidden space-y-3">
            {/* Primary Metrics - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* CPU */}
              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium">CPU</span>
                  </div>
                  <span className={`text-[9px] font-semibold ${cpuRanges[cpuRangeIdx].textColor}`}>{cpuRanges[cpuRangeIdx].label}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">{displayMetrics.cpu}%</div>
                <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${cpuRanges[cpuRangeIdx].barColor} transition-all`} style={{ width: `${displayMetrics.cpu}%` }} />
                </div>
              </div>

              {/* RAM */}
              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <MemoryStick className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium">RAM</span>
                  </div>
                  <span className={`text-[9px] font-semibold ${ramRanges[ramRangeIdx].textColor}`}>{ramRanges[ramRangeIdx].label}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">{displayMetrics.ram}%</div>
                <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${ramRanges[ramRangeIdx].barColor} transition-all`} style={{ width: `${displayMetrics.ram}%` }} />
                </div>
              </div>

              {/* Storage */}
              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium">Storage</span>
                  </div>
                  <span className={`text-[9px] font-semibold ${storageRanges[storageRangeIdx].textColor}`}>{storageRanges[storageRangeIdx].label.split(' ')[0]}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">{displayMetrics.disk}%</div>
                <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${storageRanges[storageRangeIdx].barColor} transition-all`} style={{ width: `${displayMetrics.disk}%` }} />
                </div>
              </div>

              {/* Temperature */}
              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-medium">Temp</span>
                  </div>
                  <span className={`text-[9px] font-semibold ${tempRanges[tempRangeIdx].textColor}`}>{tempRanges[tempRangeIdx].label}</span>
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
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-medium">Uptime</span>
                </div>
                <div className="text-xl font-bold tabular-nums">{formatUptime(displayMetrics.uptime)}</div>
              </div>

              <div className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium">Services</span>
                  </div>
                  <span className={`text-[9px] font-semibold ${servicesUp === serviceCount ? 'text-success' : 'text-warning'}`}>
                    {servicesUp}/{serviceCount}
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      {showHelp && <DeviceHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
