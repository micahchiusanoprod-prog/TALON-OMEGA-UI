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
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import api from '../services/api';
import config from '../config';

// Help content for Environment tile
const ENVIRONMENT_HELP = {
  overview: "The Environment tile displays readings from OMEGA's onboard sensors. These help you monitor local conditions, spot changes, and make informed decisions about comfort, safety, and activities.",
  
  metrics: [
    {
      name: "Temperature",
      icon: Thermometer,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      description: "Ambient air temperature measured by the sensor module.",
      why: "Helps assess comfort, clothing needs, and equipment considerations. Important for hypothermia/heat stroke prevention.",
      ranges: [
        { range: "Below 32°F (0°C)", status: "Freezing", color: "text-cyan-400", advice: "Risk of frostbite, ice hazards" },
        { range: "32-50°F (0-10°C)", status: "Cold", color: "text-blue-400", advice: "Layer up, stay dry" },
        { range: "50-68°F (10-20°C)", status: "Cool", color: "text-emerald-400", advice: "Comfortable for activity" },
        { range: "68-77°F (20-25°C)", status: "Ideal", color: "text-success", advice: "Most comfortable range" },
        { range: "77-90°F (25-32°C)", status: "Warm", color: "text-amber-400", advice: "Stay hydrated, seek shade" },
        { range: "Above 90°F (32°C)", status: "Hot", color: "text-red-400", advice: "Heat exhaustion risk, limit exertion" },
      ],
      tip: "OMEGA may read warmer than actual if enclosed or under high CPU load. Compare with shade temperature when possible."
    },
    {
      name: "Humidity",
      icon: Droplets,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      description: "Relative humidity - the percentage of moisture in the air relative to what it can hold at current temperature.",
      why: "Affects comfort (sweating efficiency), weather prediction, and can indicate rain approaching.",
      ranges: [
        { range: "Below 20%", status: "Very Dry", color: "text-amber-400", advice: "Fire risk, static, dehydration" },
        { range: "20-30%", status: "Dry", color: "text-yellow-400", advice: "Drink more water, moisturize" },
        { range: "30-50%", status: "Comfortable", color: "text-success", advice: "Ideal indoor levels" },
        { range: "50-70%", status: "Humid", color: "text-blue-400", advice: "May feel muggy, sweat less effective" },
        { range: "Above 70%", status: "Very Humid", color: "text-purple-400", advice: "Rain likely, mold/mildew risk" },
      ],
      tip: "High humidity + falling pressure often means rain is coming soon."
    },
    {
      name: "Pressure",
      icon: Gauge,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      description: "Atmospheric (barometric) pressure in hectopascals (hPa). Standard sea level is 1013.25 hPa.",
      why: "Key weather indicator. Falling pressure = storms approaching. Rising = clearing weather.",
      ranges: [
        { range: "Below 1000 hPa", status: "Very Low", color: "text-red-400", advice: "Storm likely, seek shelter" },
        { range: "1000-1010 hPa", status: "Low", color: "text-amber-400", advice: "Unsettled, rain possible" },
        { range: "1010-1020 hPa", status: "Normal", color: "text-success", advice: "Fair weather conditions" },
        { range: "Above 1020 hPa", status: "High", color: "text-blue-400", advice: "Clear, stable weather" },
      ],
      tip: "Watch the trend, not just the number. A drop of 3+ hPa in 3 hours signals rapid weather change."
    },
    {
      name: "Air Quality (IAQ)",
      icon: Wind,
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      description: "Indoor Air Quality index from the sensor. Higher numbers = better air quality (0-500 scale).",
      why: "Detects smoke, VOCs, CO2 buildup, and poor ventilation. Not medical-grade but good for spotting changes.",
      ranges: [
        { range: "0-50", status: "Poor", color: "text-red-400", advice: "Ventilate immediately, check for sources" },
        { range: "51-100", status: "Fair", color: "text-amber-400", advice: "Improve ventilation" },
        { range: "101-150", status: "Moderate", color: "text-yellow-400", advice: "Acceptable but could be better" },
        { range: "151-200", status: "Good", color: "text-success", advice: "Normal, healthy air" },
        { range: "Above 200", status: "Excellent", color: "text-emerald-400", advice: "Very clean air" },
      ],
      tip: "Sudden drops may indicate smoke, chemical exposure, or CO2 buildup in enclosed spaces."
    }
  ],
  
  legend: [
    { color: "bg-success", label: "Optimal", description: "Within ideal range for comfort and safety" },
    { color: "bg-primary", label: "Good", description: "Acceptable conditions" },
    { color: "bg-warning", label: "Caution", description: "Pay attention, may need action" },
    { color: "bg-destructive", label: "Alert", description: "Take action to address" },
  ],
  
  tips: [
    "Check sensors after opening OMEGA's case - readings stabilize in 1-2 minutes",
    "Temperature and humidity together determine 'feels like' temperature",
    "Large, rapid pressure changes indicate fast-moving weather systems",
    "Sensors work best at moderate temperatures; extremes may affect accuracy"
  ]
};

// Help Modal Component
const EnvironmentHelpModal = ({ onClose }) => {
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
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Environment Sensors Help</h3>
              <p className="text-xs text-muted-foreground max-w-md">{ENVIRONMENT_HELP.overview}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Metrics */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Understanding Each Metric
            </h4>
            
            {ENVIRONMENT_HELP.metrics.map((metric, idx) => {
              const Icon = metric.icon;
              const isExpanded = expandedMetric === idx;
              
              return (
                <div key={idx} className="glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedMetric(isExpanded ? null : idx)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                      <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-sm">{metric.name}</span>
                      <p className="text-xs text-muted-foreground line-clamp-1">{metric.description}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in">
                      <div className="glass rounded-lg p-3">
                        <span className="text-xs font-semibold text-primary">Why It Matters</span>
                        <p className="text-xs text-muted-foreground mt-1">{metric.why}</p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-semibold">Reference Ranges</span>
                        <div className="mt-2 space-y-1.5">
                          {metric.ranges.map((r, i) => (
                            <div key={i} className="glass rounded-lg p-2 flex items-start gap-2">
                              <span className={`text-xs font-mono font-medium w-32 flex-shrink-0 ${r.color}`}>{r.range}</span>
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-semibold ${r.color}`}>{r.status}</span>
                                <p className="text-xs text-muted-foreground">{r.advice}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Pro Tip
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{metric.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-3">Status Indicator Legend</h4>
            <div className="grid grid-cols-2 gap-2">
              {ENVIRONMENT_HELP.legend.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div>
                    <span className="text-xs font-medium">{item.label}</span>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tips */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Tips & Best Practices
            </h4>
            <ul className="space-y-1.5">
              {ENVIRONMENT_HELP.tips.map((tip, i) => (
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

export default function EnvironmentTile() {
  const [sensors, setSensors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

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

  // Get status for each metric
  const getTempStatus = (tempF) => {
    if (tempF < 32) return { status: 'Freezing', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (tempF < 50) return { status: 'Cold', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (tempF < 68) return { status: 'Cool', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (tempF < 77) return { status: 'Ideal', color: 'text-success', bg: 'bg-success/20' };
    if (tempF < 90) return { status: 'Warm', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { status: 'Hot', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getHumidityStatus = (h) => {
    if (h < 20) return { status: 'Very Dry', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (h < 30) return { status: 'Dry', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (h < 50) return { status: 'Comfortable', color: 'text-success', bg: 'bg-success/20' };
    if (h < 70) return { status: 'Humid', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { status: 'Very Humid', color: 'text-purple-400', bg: 'bg-purple-500/20' };
  };

  const getPressureStatus = (p) => {
    if (p < 1000) return { status: 'Very Low', color: 'text-red-400', bg: 'bg-red-500/20', weather: 'Storms likely' };
    if (p < 1010) return { status: 'Low', color: 'text-amber-400', bg: 'bg-amber-500/20', weather: 'Unsettled' };
    if (p < 1020) return { status: 'Normal', color: 'text-success', bg: 'bg-success/20', weather: 'Fair' };
    return { status: 'High', color: 'text-blue-400', bg: 'bg-blue-500/20', weather: 'Clear' };
  };

  const getAQIStatus = (iaq) => {
    if (iaq < 50) return { status: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (iaq < 100) return { status: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (iaq < 150) return { status: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (iaq < 200) return { status: 'Good', color: 'text-success', bg: 'bg-success/20' };
    return { status: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  };

  const tempStatus = getTempStatus(tempF);
  const humidityStatus = getHumidityStatus(data.humidity);
  const pressureStatus = getPressureStatus(data.pressure);
  const aqiStatus = getAQIStatus(data.iaq);

  if (loading) {
    return (
      <Card className="glass-strong border-border h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="skeleton h-40 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-strong border-border h-full" data-testid="environment-tile">
        <CardHeader className="pb-2 px-4 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              Environment
            </CardTitle>
            <div className="flex items-center gap-1">
              {!data.available && (
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
          {/* Temperature - Hero Metric */}
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Thermometer className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Temperature</span>
                  <p className="text-[10px] text-muted-foreground">Ambient air temp</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-semibold ${tempStatus.bg} ${tempStatus.color}`}>
                {tempStatus.status}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-light tabular-nums">{toFahrenheit(data.temperature)}</span>
              <span className="text-lg text-muted-foreground">°F</span>
              <span className="text-xs text-muted-foreground ml-2">({data.temperature.toFixed(1)}°C)</span>
            </div>
          </div>

          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Humidity */}
            <div className="glass rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className={`text-[9px] font-semibold ${humidityStatus.color}`}>{humidityStatus.status}</span>
              </div>
              <div className="text-xl font-semibold tabular-nums">{data.humidity.toFixed(0)}%</div>
              <div className="text-[10px] text-muted-foreground">Humidity</div>
            </div>

            {/* Pressure */}
            <div className="glass rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className={`text-[9px] font-semibold ${pressureStatus.color}`}>{pressureStatus.status}</span>
              </div>
              <div className="text-xl font-semibold tabular-nums">{data.pressure.toFixed(0)}</div>
              <div className="text-[10px] text-muted-foreground">hPa</div>
            </div>

            {/* Air Quality */}
            <div className="glass rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <Wind className="w-4 h-4 text-green-400" />
                <span className={`text-[9px] font-semibold ${aqiStatus.color}`}>{aqiStatus.status}</span>
              </div>
              <div className="text-xl font-semibold tabular-nums">{data.iaq}</div>
              <div className="text-[10px] text-muted-foreground">IAQ</div>
            </div>
          </div>

          {/* Quick Status Summary */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${pressureStatus.color === 'text-success' ? 'bg-success' : pressureStatus.color === 'text-amber-400' ? 'bg-warning' : 'bg-muted-foreground'}`} />
              Weather: {pressureStatus.weather}
            </span>
            <span>
              {data.iaq >= 150 ? 'Air: Clean' : data.iaq >= 100 ? 'Air: OK' : 'Air: Check'}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      {showHelp && <EnvironmentHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
