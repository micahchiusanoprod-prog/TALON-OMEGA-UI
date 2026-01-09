import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Leaf,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import api from '../services/api';
import config from '../config';

// Comprehensive help content
const ENVIRONMENT_HELP = {
  overview: "The Environment tile displays readings from OMEGA's onboard sensors. These help you monitor local conditions, spot changes, and make informed decisions about comfort, safety, and activities.",
  
  legend: [
    { color: "bg-success", label: "Optimal", description: "Ideal conditions - no action needed" },
    { color: "bg-primary", label: "Good", description: "Acceptable range - normal operation" },
    { color: "bg-warning", label: "Caution", description: "Pay attention - may need action soon" },
    { color: "bg-destructive", label: "Alert", description: "Take action - outside safe range" },
  ],
  
  tips: [
    "Readings stabilize 1-2 minutes after opening OMEGA's case",
    "Temperature + humidity together determine 'feels like' temperature",
    "Rapid pressure changes (3+ hPa in 3 hours) indicate fast-moving weather",
    "Sensors work best at moderate temperatures; extremes may affect accuracy"
  ]
};

// Help Modal Component
const EnvironmentHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="glass-strong rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Environment Sensors Guide</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <p className="text-sm text-muted-foreground">{ENVIRONMENT_HELP.overview}</p>
          
          {/* Legend */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Status Indicator Legend
            </h4>
            <div className="space-y-2">
              {ENVIRONMENT_HELP.legend.map((item, i) => (
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
              {ENVIRONMENT_HELP.tips.map((tip, i) => (
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
  currentRangeIndex
}) => {
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
      
      {/* Range Indicator Bar */}
      <div className="space-y-2">
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
          {ranges.map((range, i) => (
            <div 
              key={i} 
              className={`flex-1 ${range.barColor} ${i === currentRangeIndex ? 'ring-2 ring-white ring-offset-1 ring-offset-background' : 'opacity-40'}`}
            />
          ))}
        </div>
        
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
    </div>
  );
};

export default function EnvironmentTile() {
  const [sensors, setSensors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await api.getSensors();
        setSensors(data);
      } catch (error) {
        console.error('Failed to fetch sensors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
    const interval = setInterval(fetchSensors, config.polling.sensors);
    return () => clearInterval(interval);
  }, []);

  // Use placeholder data if sensors are offline
  const data = sensors?.available ? sensors : {
    temperature: 22.5,
    humidity: 45.2,
    pressure: 1013.2,
    iaq: 165,
    available: false,
  };

  const toFahrenheit = (celsius) => (celsius * 9/5 + 32).toFixed(0);
  const tempF = parseFloat(toFahrenheit(data.temperature));

  // Temperature ranges and status
  const tempRanges = [
    { label: 'Freezing', range: '< 32°F', barColor: 'bg-cyan-500', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400' },
    { label: 'Cold', range: '32-50°F', barColor: 'bg-blue-500', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    { label: 'Cool', range: '50-68°F', barColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    { label: 'Ideal', range: '68-77°F', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Warm', range: '77-90°F', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
    { label: 'Hot', range: '> 90°F', barColor: 'bg-red-500', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
  ];
  
  const getTempRangeIndex = (t) => {
    if (t < 32) return 0;
    if (t < 50) return 1;
    if (t < 68) return 2;
    if (t < 77) return 3;
    if (t < 90) return 4;
    return 5;
  };
  const tempRangeIdx = getTempRangeIndex(tempF);
  const tempStatus = tempRanges[tempRangeIdx];

  // Humidity ranges
  const humidityRanges = [
    { label: 'Very Dry', range: '< 20%', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
    { label: 'Dry', range: '20-30%', barColor: 'bg-yellow-500', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
    { label: 'Comfortable', range: '30-50%', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Humid', range: '50-70%', barColor: 'bg-blue-500', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    { label: 'Very Humid', range: '> 70%', barColor: 'bg-purple-500', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
  ];
  
  const getHumidityRangeIndex = (h) => {
    if (h < 20) return 0;
    if (h < 30) return 1;
    if (h < 50) return 2;
    if (h < 70) return 3;
    return 4;
  };
  const humidityRangeIdx = getHumidityRangeIndex(data.humidity);
  const humidityStatus = humidityRanges[humidityRangeIdx];

  // Pressure ranges
  const pressureRanges = [
    { label: 'Very Low (Storms)', range: '< 1000 hPa', barColor: 'bg-red-500', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
    { label: 'Low (Unsettled)', range: '1000-1010 hPa', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
    { label: 'Normal (Fair)', range: '1010-1020 hPa', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'High (Clear)', range: '> 1020 hPa', barColor: 'bg-blue-500', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
  ];
  
  const getPressureRangeIndex = (p) => {
    if (p < 1000) return 0;
    if (p < 1010) return 1;
    if (p < 1020) return 2;
    return 3;
  };
  const pressureRangeIdx = getPressureRangeIndex(data.pressure);
  const pressureStatus = pressureRanges[pressureRangeIdx];

  // Air Quality ranges
  const aqiRanges = [
    { label: 'Poor', range: '0-50', barColor: 'bg-red-500', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
    { label: 'Fair', range: '51-100', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
    { label: 'Moderate', range: '101-150', barColor: 'bg-yellow-500', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
    { label: 'Good', range: '151-200', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Excellent', range: '> 200', barColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
  ];
  
  const getAQIRangeIndex = (iaq) => {
    if (iaq < 51) return 0;
    if (iaq < 101) return 1;
    if (iaq < 151) return 2;
    if (iaq < 201) return 3;
    return 4;
  };
  const aqiRangeIdx = getAQIRangeIndex(data.iaq);
  const aqiStatus = aqiRanges[aqiRangeIdx];

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
      <Card className="glass-strong border-border h-full" data-testid="environment-tile">
        <CardHeader className="pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-bold">Environment</span>
                <p className="text-xs text-muted-foreground font-normal">OMEGA sensor readings</p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              {!data.available && (
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
                {ENVIRONMENT_HELP.legend.map((item, i) => (
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
          {/* Desktop: Vertical stack, Mobile: Compact grid */}
          <div className="hidden lg:block space-y-4">
            {/* Temperature */}
            <MetricCard
              icon={Thermometer}
              iconColor="text-red-400"
              iconBg="bg-red-500/20"
              title="Temperature"
              value={toFahrenheit(data.temperature)}
              unit="°F"
              secondaryValue={`${data.temperature.toFixed(1)}°C`}
              status={tempStatus.label}
              statusColor={tempStatus.textColor}
              statusBg={tempStatus.bgColor}
              description="Ambient air temperature measured by the sensor. Important for comfort assessment, clothing decisions, and safety planning."
              ranges={tempRanges}
              currentRangeIndex={tempRangeIdx}
            />
            
            {/* Humidity */}
            <MetricCard
              icon={Droplets}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/20"
              title="Humidity"
              value={data.humidity.toFixed(0)}
              unit="%"
              status={humidityStatus.label}
              statusColor={humidityStatus.textColor}
              statusBg={humidityStatus.bgColor}
              description="Relative humidity - the percentage of moisture in the air. Affects comfort, sweat efficiency, and can indicate approaching weather changes."
              ranges={humidityRanges}
              currentRangeIndex={humidityRangeIdx}
            />
            
            {/* Pressure */}
            <MetricCard
              icon={Gauge}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/20"
              title="Barometric Pressure"
              value={data.pressure.toFixed(0)}
              unit="hPa"
              status={pressureStatus.label}
              statusColor={pressureStatus.textColor}
              statusBg={pressureStatus.bgColor}
              description="Atmospheric pressure is the key weather predictor. Falling pressure indicates storms approaching; rising pressure means clearing weather."
              ranges={pressureRanges}
              currentRangeIndex={pressureRangeIdx}
            />
            
            {/* Air Quality */}
            <MetricCard
              icon={Wind}
              iconColor="text-green-400"
              iconBg="bg-green-500/20"
              title="Air Quality (IAQ)"
              value={data.iaq}
              unit="index"
              status={aqiStatus.label}
              statusColor={aqiStatus.textColor}
              statusBg={aqiStatus.bgColor}
              description="Indoor Air Quality index from the sensor. Detects smoke, VOCs, CO2 buildup, and ventilation issues. Higher numbers = better air."
              ranges={aqiRanges}
              currentRangeIndex={aqiRangeIdx}
            />
          </div>
          
          {/* Mobile: Compact View */}
          <div className="lg:hidden space-y-3">
            {/* Temperature - Hero */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Thermometer className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${tempStatus.bgColor} ${tempStatus.textColor}`}>
                  {tempStatus.label}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light tabular-nums">{toFahrenheit(data.temperature)}</span>
                <span className="text-lg text-muted-foreground">°F</span>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="glass rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className={`text-[9px] font-semibold ${humidityStatus.textColor}`}>{humidityStatus.label}</span>
                </div>
                <div className="text-xl font-semibold tabular-nums">{data.humidity.toFixed(0)}%</div>
                <div className="text-[10px] text-muted-foreground">Humidity</div>
              </div>

              <div className="glass rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <span className={`text-[9px] font-semibold ${pressureStatus.textColor}`}>{pressureStatus.label.split(' ')[0]}</span>
                </div>
                <div className="text-xl font-semibold tabular-nums">{data.pressure.toFixed(0)}</div>
                <div className="text-[10px] text-muted-foreground">hPa</div>
              </div>

              <div className="glass rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <Wind className="w-4 h-4 text-green-400" />
                  <span className={`text-[9px] font-semibold ${aqiStatus.textColor}`}>{aqiStatus.label}</span>
                </div>
                <div className="text-xl font-semibold tabular-nums">{data.iaq}</div>
                <div className="text-[10px] text-muted-foreground">IAQ</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      {showHelp && <EnvironmentHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
