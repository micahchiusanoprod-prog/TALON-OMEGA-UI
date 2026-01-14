import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Battery, 
  BatteryCharging, 
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Zap,
  Sun,
  Plug,
  Car,
  Cable,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  HelpCircle,
  Gauge,
  Thermometer,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import TileHelpTabs, { QuickHelpTips, InlineLegend } from './ui/TileHelpTabs';
import { 
  DataProvenanceFooter, 
  ProgressiveDetails, 
  RawDataDisplay, 
  CalculationNotes,
  MetricRow 
} from './ui/DataTileWrapper';

// Help content for Power tile
const powerHelpContent = {
  whatItDoes: "Monitor battery status, charging sources, and power consumption in real-time. Track runtime estimates and receive low-power alerts to keep your OMEGA running.",
  quickStart: [
    "Check battery percentage at the top",
    "View active charging sources (Solar, AC, Vehicle)",
    "Monitor current draw and net power flow",
    "See estimated runtime or time to full charge",
    "Review alerts for any power issues"
  ],
  controls: [
    { 
      name: "Battery Level", 
      description: "Current charge percentage",
      states: [
        { color: "bg-success", label: "75-100%", meaning: "Healthy charge" },
        { color: "bg-warning", label: "25-74%", meaning: "Monitor usage" },
        { color: "bg-destructive", label: "0-24%", meaning: "Charge soon" },
      ]
    },
    { name: "Net Flow", description: "Positive = charging, Negative = discharging" },
    { name: "Runtime", description: "Estimated time until battery depleted at current draw" },
  ],
  bestPractices: [
    "Keep battery above 25% for reliable operation",
    "Connect to charging when below 50% if possible",
    "In SHTF, prioritize solar charging during daylight",
    "Reduce screen brightness to extend runtime"
  ]
};

const powerTroubleshootingContent = {
  issues: [
    {
      symptom: "Battery not charging",
      causes: ["Charger not connected properly", "Faulty cable or adapter", "Battery too hot/cold", "Power source insufficient"],
      fixes: ["Check all cable connections", "Try a different charging cable", "Let battery cool/warm to room temp", "Use higher-output power source"],
      fallback: "Use vehicle 12V input as backup charging method"
    },
    {
      symptom: "Rapid battery drain",
      causes: ["High CPU usage", "Screen brightness too high", "Multiple radios active", "Faulty battery cell"],
      fixes: ["Close unused apps", "Reduce screen brightness", "Disable unused radios", "Check battery health in diagnostics"],
    },
    {
      symptom: "Runtime estimate inaccurate",
      causes: ["Variable power usage", "Battery needs calibration", "Temperature affecting capacity"],
      fixes: ["Let device stabilize for accurate reading", "Fully charge then discharge to calibrate", "Keep device at moderate temperature"],
    },
    {
      symptom: "Runtime collapsing rapidly",
      causes: ["Heavy radio/CPU activity", "Cold temperature reducing capacity", "Battery cell degradation", "Parasitic drain from accessory"],
      fixes: ["Disable non-essential radios", "Keep device warm (body pocket)", "Check for rogue processes in Health tile", "Disconnect external accessories"],
      fallback: "Switch to minimum essential mode"
    },
    {
      symptom: "Solar not charging",
      causes: ["Panel not in direct sunlight", "Dirty panel surface", "Charge controller issue", "Wrong panel voltage"],
      fixes: ["Angle panel toward sun", "Clean panel with soft cloth", "Check charge controller connections", "Verify panel is 5V/12V compatible"],
    }
  ],
  safetyNotes: [
    "Do not charge in extreme temperatures",
    "Use only approved chargers and cables",
    "Battery may swell if damaged - do not use if bulging",
    "Keep ventilation clear when charging"
  ]
};

const powerLegendItems = [
  { color: "bg-success", label: "Charging", meaning: "Power input > consumption", action: "Battery filling" },
  { color: "bg-primary", label: "Full", meaning: "Battery at 100%", action: "Trickle charge" },
  { color: "bg-warning", label: "Discharging", meaning: "Using battery power", action: "Connect charger" },
  { color: "bg-destructive", label: "Critical", meaning: "Below 20%", action: "Charge immediately" },
];

const powerQuickTips = [
  "Green battery = charging, Yellow = discharging",
  "Net flow shows if you're gaining or losing power",
  "Solar works best when panel faces the sun directly"
];

// "If runtime is collapsing" emergency checklist
const runtimeCollapsingChecklist = [
  "Reduce screen brightness to minimum",
  "Disable Mesh/LoRa if not actively needed",
  "Close GPS if position isn't critical",
  "Switch to LAN-only comms if available",
  "Check for runaway CPU processes in Health",
  "Warm device if cold (below 50°F / 10°C)",
  "Connect ANY charge source immediately"
];

// Mock power data - will be replaced with real Pi data
const getMockPowerData = () => ({
  battery: {
    percentage: 72,
    voltage: 12.4,
    current: -0.85, // Negative = discharging
    temperature: 28,
    health: 'good', // good, degraded, replace
    cycleCount: 156,
  },
  charging: {
    isCharging: false,
    sources: {
      solar: { connected: true, watts: 8.2, status: 'active' },
      ac: { connected: false, watts: 0, status: 'disconnected' },
      vehicle: { connected: false, watts: 0, status: 'disconnected' },
      usb: { connected: true, watts: 2.5, status: 'active' },
    },
  },
  consumption: {
    total: 11.5, // Total watts being consumed
    breakdown: {
      cpu: 4.2,
      display: 3.5,
      radios: 2.8,
      other: 1.0,
    },
  },
  estimates: {
    runtimeMinutes: 245, // At current draw
    timeToFullMinutes: null, // null if not charging
    netFlowWatts: -0.8, // Negative = discharging, Positive = charging
  },
  alerts: [
    { type: 'warning', message: 'Battery below 75%', timestamp: new Date(Date.now() - 600000) },
  ],
});

// Battery icon based on level and charging state
const BatteryIcon = ({ percentage, isCharging }) => {
  if (isCharging) return BatteryCharging;
  if (percentage >= 90) return BatteryFull;
  if (percentage >= 50) return BatteryMedium;
  if (percentage >= 20) return BatteryLow;
  return BatteryWarning;
};

// Source card component
const SourceCard = ({ name, icon: Icon, data, color }) => {
  const isActive = data.status === 'active';
  
  return (
    <div 
      className={`glass rounded-xl p-3 border-2 transition-all ${
        isActive 
          ? `border-${color}/40 bg-${color}/10` 
          : 'border-transparent opacity-60'
      }`}
      data-testid={`source-${name.toLowerCase()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${isActive ? `text-${color}` : 'text-muted-foreground'}`} />
        {isActive && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${color}/20 text-${color}`}>
            ACTIVE
          </span>
        )}
      </div>
      <div className="text-sm font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">
        {isActive ? `${data.watts.toFixed(1)}W` : 'Not connected'}
      </div>
    </div>
  );
};

// Consumption breakdown bar
const ConsumptionBar = ({ breakdown, total }) => {
  const items = [
    { key: 'cpu', label: 'CPU', color: 'bg-primary', value: breakdown.cpu },
    { key: 'display', label: 'Display', color: 'bg-warning', value: breakdown.display },
    { key: 'radios', label: 'Radios', color: 'bg-success', value: breakdown.radios },
    { key: 'other', label: 'Other', color: 'bg-muted-foreground', value: breakdown.other },
  ];
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Power Consumption</span>
        <span className="text-muted-foreground">{total.toFixed(1)}W total</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
        {items.map(item => (
          <div 
            key={item.key}
            className={`${item.color} h-full`}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: ${item.value.toFixed(1)}W`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Format minutes to hours/minutes
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export default function PowerTile() {
  const [powerData, setPowerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  useEffect(() => {
    // Simulate loading power data
    const loadData = () => {
      setPowerData(getMockPowerData());
      setLastUpdate(new Date());
      setLoading(false);
    };
    
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPowerData(getMockPowerData());
      setLastUpdate(new Date());
      setLoading(false);
    }, 500);
  };
  
  // Help view
  if (showHelp) {
    return (
      <Card className="glass-strong border-border-strong" data-testid="power-tile">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-primary" />
              Power Help
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
              ← Back
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TileHelpTabs
            helpContent={powerHelpContent}
            troubleshootingContent={powerTroubleshootingContent}
            legendItems={powerLegendItems}
          />
        </CardContent>
      </Card>
    );
  }
  
  if (loading || !powerData) {
    return (
      <Card className="glass-strong border-border-strong" data-testid="power-tile">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Battery className="w-5 h-5 text-primary" />
            Power
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="skeleton h-24 rounded-lg" />
            <div className="skeleton h-16 rounded-lg" />
            <div className="skeleton h-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { battery, charging, consumption, estimates, alerts } = powerData;
  const isCharging = estimates.netFlowWatts > 0;
  const BattIcon = BatteryIcon({ percentage: battery.percentage, isCharging });
  
  // Determine battery color
  const getBatteryColor = () => {
    if (isCharging) return 'text-success';
    if (battery.percentage >= 75) return 'text-success';
    if (battery.percentage >= 25) return 'text-warning';
    return 'text-destructive';
  };
  
  // Get the top active charge source
  const getTopChargeSource = () => {
    const sources = [
      { name: 'Solar', watts: charging.sources.solar.watts, status: charging.sources.solar.status },
      { name: 'AC', watts: charging.sources.ac.watts, status: charging.sources.ac.status },
      { name: 'Vehicle', watts: charging.sources.vehicle.watts, status: charging.sources.vehicle.status },
      { name: 'USB-C', watts: charging.sources.usb.watts, status: charging.sources.usb.status },
    ];
    return sources.filter(s => s.status === 'active').sort((a, b) => b.watts - a.watts)[0] || null;
  };
  
  // Check if runtime is critically low
  const isRuntimeCritical = !isCharging && estimates.runtimeMinutes < 60;
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="power-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            Power
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Help & Troubleshooting"
              data-testid="power-help-btn"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Tips */}
        <QuickHelpTips tips={powerQuickTips} />
        
        {/* FIELD-USE SUMMARY ROW - Most critical info at a glance */}
        <div className="glass-strong rounded-xl p-3 border-2 border-primary/30" data-testid="field-summary">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Battery className={`w-4 h-4 ${getBatteryColor()}`} />
                <span className={`font-bold ${getBatteryColor()}`}>{battery.percentage}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{formatDuration(estimates.runtimeMinutes)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isCharging ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-warning" />
                )}
                <span className={`font-semibold ${isCharging ? 'text-success' : 'text-warning'}`}>
                  {estimates.netFlowWatts > 0 ? '+' : ''}{estimates.netFlowWatts.toFixed(1)}W
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{consumption.total.toFixed(1)}W</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Top:</span>
              <span className={`font-bold ${getTopChargeSource()?.watts > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                {getTopChargeSource()?.name || 'None'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Main Battery Display */}
        <div className="glass rounded-xl p-4" data-testid="battery-main">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl glass flex items-center justify-center ${isCharging ? 'bg-success/20' : ''}`}>
                <BattIcon className={`w-8 h-8 ${getBatteryColor()}`} />
              </div>
              <div>
                <div className={`text-3xl font-bold ${getBatteryColor()}`}>
                  {battery.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {isCharging ? 'Charging' : 'Discharging'}
                </div>
              </div>
            </div>
            
            {/* Runtime/Time to Full */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {isCharging 
                  ? formatDuration(estimates.timeToFullMinutes) 
                  : formatDuration(estimates.runtimeMinutes)
                }
              </div>
              <div className="text-xs text-muted-foreground">
                {isCharging ? 'to full' : 'runtime'}
              </div>
            </div>
          </div>
          
          {/* Battery Bar */}
          <div className="h-4 rounded-full bg-secondary overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isCharging ? 'bg-success' : battery.percentage < 25 ? 'bg-destructive' : 'bg-warning'
              }`}
              style={{ width: `${battery.percentage}%` }}
            />
          </div>
          
          {/* Battery Stats - US units (Fahrenheit) */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{battery.voltage.toFixed(1)}V</span>
            <span>{Math.abs(battery.current).toFixed(2)}A {battery.current < 0 ? 'draw' : 'charge'}</span>
            <span>{Math.round(battery.temperature * 9/5 + 32)}°F</span>
            <span className={`font-medium ${battery.health === 'good' ? 'text-success' : 'text-warning'}`}>
              {battery.health.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Net Flow Indicator */}
        <div className={`glass rounded-xl p-3 border-2 ${
          isCharging ? 'border-success/30 bg-success/10' : 'border-warning/30 bg-warning/10'
        }`} data-testid="net-flow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCharging ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-warning" />
              )}
              <span className="text-sm font-semibold">Net Power Flow</span>
            </div>
            <span className={`text-lg font-bold ${isCharging ? 'text-success' : 'text-warning'}`}>
              {estimates.netFlowWatts > 0 ? '+' : ''}{estimates.netFlowWatts.toFixed(1)}W
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isCharging 
              ? 'Gaining power faster than consuming' 
              : 'Consuming more power than input sources provide'
            }
          </p>
        </div>
        
        {/* Charge Sources */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">CHARGE SOURCES</h4>
          <div className="grid grid-cols-2 gap-2">
            <SourceCard 
              name="Solar" 
              icon={Sun} 
              data={charging.sources.solar}
              color="warning"
            />
            <SourceCard 
              name="AC Power" 
              icon={Plug} 
              data={charging.sources.ac}
              color="primary"
            />
            <SourceCard 
              name="Vehicle 12V" 
              icon={Car} 
              data={charging.sources.vehicle}
              color="success"
            />
            <SourceCard 
              name="USB-C" 
              icon={Cable} 
              data={charging.sources.usb}
              color="cyan"
            />
          </div>
        </div>
        
        {/* Consumption Breakdown */}
        <ConsumptionBar breakdown={consumption.breakdown} total={consumption.total} />
        
        {/* RUNTIME COLLAPSING CHECKLIST - Shows when runtime is critical */}
        {isRuntimeCritical && (
          <div className="glass rounded-xl p-4 border-2 border-destructive/50 bg-destructive/10 animate-pulse-slow" data-testid="runtime-critical">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-destructive" />
              <span className="text-sm font-bold text-destructive">⚠️ Runtime Critical - Act Now!</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {runtimeCollapsingChecklist.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">ALERTS</h4>
            {alerts.map((alert, i) => (
              <div 
                key={i} 
                className={`glass rounded-lg p-3 flex items-start gap-2 ${
                  alert.type === 'critical' 
                    ? 'bg-destructive/10 border border-destructive/30' 
                    : 'bg-warning/10 border border-warning/30'
                }`}
                data-testid={`power-alert-${i}`}
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  alert.type === 'critical' ? 'text-destructive' : 'text-warning'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Progressive Details Section */}
        <ProgressiveDetails 
          title="Power System Details"
          helpText="Raw data and calculation info"
        >
          <div className="space-y-3">
            {/* Battery Details */}
            <div className="glass rounded-lg p-3">
              <h5 className="text-xs font-semibold text-muted-foreground mb-2">Battery Metrics</h5>
              <div className="grid grid-cols-2 gap-2">
                <MetricRow label="Voltage" value={battery.voltage.toFixed(2)} unit="V" trustType="VERIFIED" />
                <MetricRow label="Current" value={Math.abs(battery.current).toFixed(2)} unit="A" trustType="VERIFIED" />
                <MetricRow label="Temperature" value={battery.temperature} unit="°C" trustType="VERIFIED" helpTerm="TEMP" />
                <MetricRow label="Cycle Count" value={battery.cycleCount} trustType="DERIVED" />
                <MetricRow label="Health Status" value={battery.health.toUpperCase()} trustType="ESTIMATED" />
                <MetricRow label="Net Flow" value={estimates.netFlowWatts.toFixed(2)} unit="W" trustType="DERIVED" />
              </div>
            </div>
            
            {/* Calculation Notes */}
            <CalculationNotes notes={[
              'Net Flow = Total Input (Solar + AC + USB) - Total Consumption',
              'Runtime estimate based on current draw rate and battery capacity',
              'Battery health derived from voltage curve and cycle count',
              'Power readings averaged over 10-second window'
            ]} />
            
            {/* Raw JSON */}
            <RawDataDisplay data={powerData} title="Power System JSON" />
          </div>
        </ProgressiveDetails>
        
        {/* Provenance Footer */}
        <DataProvenanceFooter
          source="OMEGA Power Management"
          endpoint="/api/cgi-bin/power"
          lastUpdated={lastUpdate?.getTime()}
          trustType="VERIFIED"
          status="SIMULATED"
          refreshInterval="5 seconds"
          onRefresh={handleRefresh}
        />
      </CardContent>
    </Card>
  );
}
