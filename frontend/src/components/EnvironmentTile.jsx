import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import api from '../services/api';
import config from '../config';

// Help content for Environment tile
const ENVIRONMENT_HELP = {
  overview: "This tile shows the current environmental conditions around your OMEGA device. All readings come from onboard sensors.",
  metrics: {
    temperature: {
      title: "Temperature",
      description: "The current air temperature measured by the device's sensor.",
      why: "Knowing the temperature helps you dress appropriately, plan activities, and monitor for extreme conditions that could affect health or equipment.",
      ranges: [
        { range: "Below 60°F (15°C)", status: "Cold", advice: "Layer up, watch for hypothermia risk" },
        { range: "60-75°F (15-24°C)", status: "Comfortable", advice: "Ideal conditions for most activities" },
        { range: "Above 85°F (29°C)", status: "Hot", advice: "Stay hydrated, watch for heat exhaustion" },
      ]
    },
    humidity: {
      title: "Humidity",
      description: "The percentage of water vapor in the air relative to the maximum it can hold.",
      why: "Humidity affects comfort, health, and how your body regulates temperature. It also impacts equipment and food storage.",
      ranges: [
        { range: "Below 30%", status: "Dry", advice: "May cause skin/respiratory irritation" },
        { range: "30-50%", status: "Ideal", advice: "Comfortable for most people" },
        { range: "Above 60%", status: "Humid", advice: "Can feel muggy, promotes mold growth" },
      ]
    },
    pressure: {
      title: "Barometric Pressure",
      description: "The weight of the atmosphere pressing down, measured in hectopascals (hPa).",
      why: "Pressure changes indicate incoming weather. Falling pressure often means storms; rising pressure suggests clearing skies.",
      ranges: [
        { range: "Below 1000 hPa", status: "Low", advice: "Storm or bad weather likely" },
        { range: "1010-1020 hPa", status: "Normal", advice: "Stable conditions expected" },
        { range: "Above 1020 hPa", status: "High", advice: "Clear, fair weather likely" },
      ]
    },
    iaq: {
      title: "Indoor Air Quality (IAQ)",
      description: "A score from 0-500 indicating how clean or polluted the air is. Higher is better.",
      why: "Poor air quality can cause headaches, fatigue, and respiratory issues. Important in enclosed spaces or after events like fires.",
      ranges: [
        { range: "0-100", status: "Poor", advice: "Ventilate immediately, may cause health issues" },
        { range: "100-200", status: "Moderate", advice: "Acceptable, but could be better" },
        { range: "200+", status: "Good", advice: "Excellent air quality" },
      ]
    },
  },
  legend: [
    { icon: CheckCircle, color: "text-success", bg: "bg-success/20", label: "Normal", description: "Within safe, comfortable range" },
    { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/20", label: "Attention", description: "Outside ideal range, monitor closely" },
    { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/20", label: "Critical", description: "Action needed, may be unsafe" },
  ],
  tips: [
    "Trend arrows show if conditions are rising, falling, or stable",
    "Tap 'Help' anytime to see this guide again",
    "Simulated data appears when sensors are offline",
  ]
};

export default function EnvironmentTile() {
  const [sensors, setSensors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(null);
  const [history, setHistory] = useState({
    temperature: [22.1, 22.3, 22.5, 22.4, 22.5],
    humidity: [44.8, 45.0, 45.2, 45.1, 45.2],
    pressure: [1013.0, 1013.1, 1013.2, 1013.2, 1013.2],
    iaq: [92, 94, 95, 94, 95],
  });

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
  const displayData = sensors?.available ? sensors : {
    temperature: 22.5,
    humidity: 45.2,
    pressure: 1013.2,
    iaq: 95,
    available: false,
    offline: !sensors?.available,
  };

  // Get trend from history
  const getTrend = (values) => {
    if (!values || values.length < 2) return 'stable';
    const recent = values[values.length - 1];
    const previous = values[values.length - 2];
    if (recent > previous + 0.5) return 'up';
    if (recent < previous - 0.5) return 'down';
    return 'stable';
  };

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-warning" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-primary" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  // Get weather condition based on pressure
  const getWeatherCondition = (pressure) => {
    if (pressure > 1020) return { icon: Sun, label: 'Clear/Stable', color: 'text-yellow-400' };
    if (pressure > 1010) return { icon: Cloud, label: 'Fair', color: 'text-blue-300' };
    if (pressure > 1000) return { icon: CloudRain, label: 'Changing', color: 'text-blue-400' };
    return { icon: Snowflake, label: 'Storm Risk', color: 'text-purple-400' };
  };

  const getStatus = (type, value) => {
    if (value === null) return { status: 'unknown', icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };

    let status = 'good';
    
    switch(type) {
      case 'temperature':
        if (value < 15 || value > 28) status = 'critical';
        else if (value < 18 || value > 24) status = 'warning';
        break;
      case 'humidity':
        if (value < 20 || value > 70) status = 'critical';
        else if (value < 30 || value > 60) status = 'warning';
        break;
      case 'pressure':
        if (value < 1000 || value > 1030) status = 'critical';
        else if (value < 1010 || value > 1020) status = 'warning';
        break;
      case 'iaq':
        if (value < 100) status = 'critical';
        else if (value < 150) status = 'warning';
        break;
      default:
        break;
    }

    if (status === 'good') {
      return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success/20', label: 'Normal' };
    } else if (status === 'warning') {
      return { status: 'warning', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/20', label: 'Attention' };
    } else {
      return { status: 'critical', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/20', label: 'Critical' };
    }
  };

  // Convert to Fahrenheit for display
  const toFahrenheit = (celsius) => (celsius * 9/5 + 32).toFixed(1);

  // Get comfort level
  const getComfortLevel = (temp, humidity) => {
    const tempF = temp * 9/5 + 32;
    if (tempF >= 68 && tempF <= 76 && humidity >= 30 && humidity <= 50) {
      return { level: 'Ideal', color: 'text-success', description: 'Perfect conditions' };
    }
    if (tempF >= 65 && tempF <= 80 && humidity >= 25 && humidity <= 60) {
      return { level: 'Comfortable', color: 'text-primary', description: 'Good conditions' };
    }
    return { level: 'Uncomfortable', color: 'text-warning', description: 'Consider adjusting' };
  };

  const comfort = getComfortLevel(displayData.temperature, displayData.humidity);
  const weather = getWeatherCondition(displayData.pressure);
  const WeatherIcon = weather.icon;

  if (loading) {
    return (
      <Card className="glass-strong border-border h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="w-5 h-5 text-primary" />
            Environment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border-border h-full flex flex-col" data-testid="environment-tile">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="w-5 h-5 text-primary" />
            Environment
          </CardTitle>
          <div className="flex items-center gap-2">
            {displayData.offline && (
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
              <span className="font-semibold text-sm">Understanding Environment Data</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{ENVIRONMENT_HELP.overview}</p>
            
            {/* Metric Help - Expandable */}
            <div className="space-y-2 mb-4">
              {Object.entries(ENVIRONMENT_HELP.metrics).map(([key, metric]) => (
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
                              <span className="text-muted-foreground w-28 flex-shrink-0">{r.range}</span>
                              <span className="font-medium w-20 flex-shrink-0">{r.status}</span>
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
                {ENVIRONMENT_HELP.legend.map((item, i) => (
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
                {ENVIRONMENT_HELP.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Hero Stats - Vertical Layout */}
        <div className="space-y-3 mb-4">
          {/* Temperature - Primary */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/20">
                  <Thermometer className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Temperature</span>
                  <p className="text-xs text-muted-foreground">Current air temperature</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendIcon trend={getTrend(history.temperature)} />
                  <span className="text-xs text-muted-foreground">
                    {getTrend(history.temperature) === 'up' ? 'Rising' : getTrend(history.temperature) === 'down' ? 'Falling' : 'Stable'}
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-full ${getStatus('temperature', displayData.temperature).bg}`}>
                  <span className={`text-xs font-semibold ${getStatus('temperature', displayData.temperature).color}`}>
                    {getStatus('temperature', displayData.temperature).label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tabular-nums">{toFahrenheit(displayData.temperature)}</span>
              <span className="text-xl text-muted-foreground">°F</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {displayData.temperature.toFixed(1)}°C • Feels like {toFahrenheit(displayData.temperature - 1)}°F
            </p>
          </div>

          {/* Humidity */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20">
                  <Droplets className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Humidity</span>
                  <p className="text-xs text-muted-foreground">Water vapor in the air</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendIcon trend={getTrend(history.humidity)} />
                  <span className="text-xs text-muted-foreground">
                    {getTrend(history.humidity) === 'up' ? 'Rising' : getTrend(history.humidity) === 'down' ? 'Falling' : 'Stable'}
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-full ${getStatus('humidity', displayData.humidity).bg}`}>
                  <span className={`text-xs font-semibold ${getStatus('humidity', displayData.humidity).color}`}>
                    {getStatus('humidity', displayData.humidity).label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl xl:text-5xl font-bold">{displayData.humidity.toFixed(0)}</span>
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ideal: 30-50% • Dew point: {(displayData.temperature - (100 - displayData.humidity) / 5).toFixed(0)}°C
            </p>
          </div>

          {/* Pressure */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Gauge className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Barometric Pressure</span>
                  <p className="text-xs text-muted-foreground">Atmospheric weight - predicts weather</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <WeatherIcon className={`w-5 h-5 ${weather.color}`} />
                <span className="text-xs text-muted-foreground">{weather.label}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl xl:text-4xl font-bold">{displayData.pressure.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground">hPa</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayData.pressure > 1015 ? 'High pressure = fair weather likely' : 'Low pressure = weather change possible'}
            </p>
          </div>

          {/* Air Quality */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Wind className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="text-sm font-medium">Indoor Air Quality</span>
                  <p className="text-xs text-muted-foreground">Higher score = cleaner air</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                displayData.iaq >= 150 ? 'text-success' : displayData.iaq >= 100 ? 'text-primary' : 'text-warning'
              }`}>
                {displayData.iaq >= 150 ? 'Excellent' : displayData.iaq >= 100 ? 'Good' : 'Poor'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl xl:text-4xl font-bold">{displayData.iaq}</span>
              <span className="text-sm text-muted-foreground">IAQ</span>
            </div>
          </div>
        </div>

        {/* Comfort Index */}
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Comfort Index</span>
              <p className="text-xs text-muted-foreground">{comfort.description}</p>
            </div>
            <div className={`text-xl font-bold ${comfort.color}`}>
              {comfort.level}
            </div>
          </div>
          {/* Comfort bar */}
          <div className="mt-3 h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                comfort.level === 'Ideal' ? 'bg-success w-full' : 
                comfort.level === 'Comfortable' ? 'bg-primary w-3/4' : 'bg-warning w-1/2'
              }`} 
            />
          </div>
        </div>

        {/* Status Guide - Collapsible on mobile */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" />
              <span className="text-muted-foreground">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span className="text-muted-foreground">Attention</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-destructive" />
              <span className="text-muted-foreground">Critical</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
