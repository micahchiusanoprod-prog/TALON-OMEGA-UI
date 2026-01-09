import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Compass,
  Sunrise,
  Sunset,
  CloudSnow,
  CloudLightning,
  HelpCircle,
  RefreshCw,
  MapPin,
  Gauge,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Radio
} from 'lucide-react';

// Help content for Weather tile
const WEATHER_HELP = {
  overview: "The Weather tile displays current conditions and forecasts. OMEGA derives weather data from its onboard sensors (temperature, humidity, pressure) combined with offline weather models.",
  
  legend: [
    { color: "bg-success", label: "Clear/Good", description: "Favorable weather conditions" },
    { color: "bg-primary", label: "Fair", description: "Normal, acceptable conditions" },
    { color: "bg-warning", label: "Changing", description: "Weather may shift soon" },
    { color: "bg-destructive", label: "Severe", description: "Take precautions" },
  ],
  
  tips: [
    "Pressure trends are more useful than absolute values for predictions",
    "Morning dew or frost suggests clear overnight skies",
    "Rapidly changing conditions indicate unstable weather",
    "In mountains, weather can change quickly - check frequently"
  ]
};

// Mock weather data
const mockWeather = {
  location: 'Base Camp Alpha',
  current: {
    temp: 68,
    feelsLike: 65,
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy',
    humidity: 45,
    windSpeed: 12,
    windDirection: 'NW',
    visibility: 10,
    uvIndex: 4,
    pressure: 30.12,
    pressureTrend: 'rising'
  },
  sun: {
    sunrise: '6:42 AM',
    sunset: '7:18 PM'
  },
  forecast: [
    { day: 'Today', high: 72, low: 58, icon: 'partly-cloudy', precip: 10 },
    { day: 'Tue', high: 68, low: 54, icon: 'cloudy', precip: 30 },
    { day: 'Wed', high: 65, low: 52, icon: 'rain', precip: 80 },
    { day: 'Thu', high: 70, low: 55, icon: 'sunny', precip: 5 },
    { day: 'Fri', high: 74, low: 58, icon: 'sunny', precip: 0 },
  ],
  alerts: [
    { type: 'warning', message: 'Rain expected Wednesday - secure outdoor gear' }
  ],
  lastUpdated: '10 min ago',
  omegaSensors: {
    available: true,
    pressure: 1013.2,
    pressureInHg: 29.92,
    pressureTrend: 'falling',
    temperature: 22.5,
    humidity: 45
  }
};

const WeatherIcon = ({ condition, className = "w-6 h-6" }) => {
  const icons = {
    'sunny': <Sun className={`${className} text-amber-400`} />,
    'partly-cloudy': <Cloud className={`${className} text-slate-300`} />,
    'cloudy': <Cloud className={`${className} text-slate-400`} />,
    'rain': <CloudRain className={`${className} text-blue-400`} />,
    'snow': <CloudSnow className={`${className} text-cyan-200`} />,
    'storm': <CloudLightning className={`${className} text-purple-400`} />,
  };
  return icons[condition] || icons['partly-cloudy'];
};

// Help Modal Component
const WeatherHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="glass-strong rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20">
              <Cloud className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Weather Guide</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <p className="text-sm text-muted-foreground">{WEATHER_HELP.overview}</p>
          
          {/* Legend */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Status Legend
            </h4>
            <div className="space-y-2">
              {WEATHER_HELP.legend.map((item, i) => (
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
          
          {/* Weather Icons */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-3">Weather Icons</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Sun, label: "Sunny/Clear", color: "text-amber-400" },
                { icon: Cloud, label: "Cloudy", color: "text-slate-400" },
                { icon: CloudRain, label: "Rain", color: "text-blue-400" },
                { icon: CloudSnow, label: "Snow", color: "text-cyan-300" },
                { icon: CloudLightning, label: "Storm", color: "text-purple-400" },
                { icon: Wind, label: "Windy", color: "text-slate-300" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Tips */}
          <div className="glass rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" /> Tips
            </h4>
            <ul className="space-y-1.5">
              {WEATHER_HELP.tips.map((tip, i) => (
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

// Individual Metric Card
const WeatherMetricCard = ({ 
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
        {status && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusBg} ${statusColor}`}>
            {status}
          </div>
        )}
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
      {ranges && (
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
      )}
    </div>
  );
};

export default function WeatherTile() {
  const [showHelp, setShowHelp] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const weather = mockWeather;
  
  // Temperature ranges
  const tempRanges = [
    { label: 'Freezing', range: '< 32°F', barColor: 'bg-cyan-500', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400' },
    { label: 'Cold', range: '32-50°F', barColor: 'bg-blue-500', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    { label: 'Cool', range: '50-65°F', barColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
    { label: 'Comfortable', range: '65-80°F', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Hot', range: '> 80°F', barColor: 'bg-red-500', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
  ];
  const getTempRangeIndex = (t) => {
    if (t < 32) return 0;
    if (t < 50) return 1;
    if (t < 65) return 2;
    if (t < 80) return 3;
    return 4;
  };
  const tempRangeIdx = getTempRangeIndex(weather.current.temp);

  // Humidity ranges
  const humidityRanges = [
    { label: 'Very Dry (Fire Risk)', range: '< 30%', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
    { label: 'Comfortable', range: '30-50%', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Humid', range: '50-70%', barColor: 'bg-blue-500', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
    { label: 'Very Humid (Rain Likely)', range: '> 70%', barColor: 'bg-purple-500', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
  ];
  const getHumidityRangeIndex = (h) => {
    if (h < 30) return 0;
    if (h < 50) return 1;
    if (h < 70) return 2;
    return 3;
  };
  const humidityRangeIdx = getHumidityRangeIndex(weather.current.humidity);

  // Wind speed ranges
  const windRanges = [
    { label: 'Calm', range: '0-5 mph', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Light Breeze', range: '5-15 mph', barColor: 'bg-primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
    { label: 'Moderate Wind', range: '15-25 mph', barColor: 'bg-warning', bgColor: 'bg-warning/20', textColor: 'text-warning' },
    { label: 'Strong Wind', range: '> 25 mph', barColor: 'bg-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive' },
  ];
  const getWindRangeIndex = (w) => {
    if (w < 5) return 0;
    if (w < 15) return 1;
    if (w < 25) return 2;
    return 3;
  };
  const windRangeIdx = getWindRangeIndex(weather.current.windSpeed);

  // UV Index ranges
  const uvRanges = [
    { label: 'Low', range: '0-2', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success' },
    { label: 'Moderate', range: '3-5', barColor: 'bg-yellow-500', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
    { label: 'High', range: '6-7', barColor: 'bg-orange-500', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' },
    { label: 'Very High', range: '8-10', barColor: 'bg-red-500', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
    { label: 'Extreme', range: '11+', barColor: 'bg-purple-500', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
  ];
  const getUVRangeIndex = (uv) => {
    if (uv <= 2) return 0;
    if (uv <= 5) return 1;
    if (uv <= 7) return 2;
    if (uv <= 10) return 3;
    return 4;
  };
  const uvRangeIdx = getUVRangeIndex(weather.current.uvIndex);

  // Pressure trend indicator
  const getPressureTrendIcon = (trend) => {
    if (trend === 'rising') return '↑';
    if (trend === 'falling') return '↓';
    return '→';
  };
  
  const getPressureTrendStatus = (trend) => {
    if (trend === 'rising') return { label: 'Rising - Clearing', color: 'text-success', bg: 'bg-success/20' };
    if (trend === 'falling') return { label: 'Falling - Storms', color: 'text-warning', bg: 'bg-warning/20' };
    return { label: 'Steady', color: 'text-muted-foreground', bg: 'bg-secondary' };
  };
  const pressureTrendStatus = getPressureTrendStatus(weather.omegaSensors.pressureTrend);
  
  return (
    <>
      <Card className="glass-strong border-border-strong h-full" data-testid="weather-tile">
        <CardHeader className="pb-3 px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20">
                <Cloud className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <span className="text-lg font-bold">Weather</span>
                <p className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {weather.location}
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-sky-500/20 text-sky-400 font-medium">
                Simulated
              </span>
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
                {WEATHER_HELP.legend.map((item, i) => (
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
          {/* Desktop: 2-column grid layout for metrics */}
          <div className="hidden lg:block space-y-4">
            {/* Row 1: Temperature & Humidity */}
            <div className="grid grid-cols-2 gap-4">
              <WeatherMetricCard
                icon={Thermometer}
                iconColor="text-red-400"
                iconBg="bg-red-500/20"
                title="Current Temperature"
                value={weather.current.temp}
                unit="°F"
                secondaryValue={`Feels like ${weather.current.feelsLike}°F`}
                status={tempRanges[tempRangeIdx].label}
                statusColor={tempRanges[tempRangeIdx].textColor}
                statusBg={tempRanges[tempRangeIdx].bgColor}
                description="'Feels like' accounts for wind chill and humidity."
                ranges={tempRanges}
                currentRangeIndex={tempRangeIdx}
              />
              
              <WeatherMetricCard
                icon={Droplets}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/20"
                title="Humidity"
                value={weather.current.humidity}
                unit="%"
                status={humidityRanges[humidityRangeIdx].label}
                statusColor={humidityRanges[humidityRangeIdx].textColor}
                statusBg={humidityRanges[humidityRangeIdx].bgColor}
                description="High humidity + falling pressure = rain likely."
                ranges={humidityRanges}
                currentRangeIndex={humidityRangeIdx}
              />
            </div>
            
            {/* Row 2: Wind & UV Index */}
            <div className="grid grid-cols-2 gap-4">
              <WeatherMetricCard
                icon={Wind}
                iconColor="text-slate-400"
                iconBg="bg-slate-500/20"
                title="Wind Speed"
                value={weather.current.windSpeed}
                unit="mph"
                secondaryValue={`From ${weather.current.windDirection}`}
                status={windRanges[windRangeIdx].label}
                statusColor={windRanges[windRangeIdx].textColor}
                statusBg={windRanges[windRangeIdx].bgColor}
                description="Affects outdoor activities and wind chill."
                ranges={windRanges}
                currentRangeIndex={windRangeIdx}
              />
              
              <WeatherMetricCard
                icon={Sun}
                iconColor="text-amber-400"
                iconBg="bg-amber-500/20"
                title="UV Index"
                value={weather.current.uvIndex}
                unit="index"
                status={uvRanges[uvRangeIdx].label}
                statusColor={uvRanges[uvRangeIdx].textColor}
                statusBg={uvRanges[uvRangeIdx].bgColor}
                description="Use sunscreen when Moderate or higher."
                ranges={uvRanges}
                currentRangeIndex={uvRangeIdx}
              />
            </div>
            
            {/* OMEGA Sensor Pressure */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20">
                    <Gauge className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      Barometric Pressure
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        OMEGA Sensor
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      Atmospheric pressure is the key weather predictor. Watch the trend: falling pressure indicates approaching storms, rising pressure means clearing weather.
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${pressureTrendStatus.bg} ${pressureTrendStatus.color}`}>
                  {pressureTrendStatus.label}
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light tabular-nums">{weather.omegaSensors.pressure.toFixed(1)}</span>
                <span className="text-lg text-muted-foreground">hPa</span>
                <span className={`text-2xl ml-2 ${pressureTrendStatus.color}`}>
                  {getPressureTrendIcon(weather.omegaSensors.pressureTrend)}
                </span>
                <span className="text-sm text-muted-foreground ml-2">({weather.omegaSensors.pressureInHg} inHg)</span>
              </div>
              
              {/* Pressure range indicators */}
              <div className="space-y-1">
                {[
                  { label: 'High (Clear, Stable)', range: '> 1020 hPa', barColor: 'bg-success', bgColor: 'bg-success/20', textColor: 'text-success', min: 1020, max: 9999 },
                  { label: 'Normal (Fair)', range: '1010-1020 hPa', barColor: 'bg-primary', bgColor: 'bg-primary/20', textColor: 'text-primary', min: 1010, max: 1020 },
                  { label: 'Low (Unsettled)', range: '1000-1010 hPa', barColor: 'bg-warning', bgColor: 'bg-warning/20', textColor: 'text-warning', min: 1000, max: 1010 },
                  { label: 'Very Low (Storms)', range: '< 1000 hPa', barColor: 'bg-destructive', bgColor: 'bg-destructive/20', textColor: 'text-destructive', min: 0, max: 1000 },
                ].map((range, i) => {
                  const isActive = weather.omegaSensors.pressure >= range.min && weather.omegaSensors.pressure < range.max;
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg transition-all ${
                        isActive 
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
                  );
                })}
              </div>
            </div>
            
            {/* Sun Times & Visibility */}
            <div className="glass rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Sunrise */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Sunrise className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Sunrise</h4>
                      <p className="text-[10px] text-muted-foreground">First light</p>
                    </div>
                  </div>
                  <div className="text-2xl font-light">{weather.sun.sunrise}</div>
                </div>
                
                {/* Sunset */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Sunset className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Sunset</h4>
                      <p className="text-[10px] text-muted-foreground">Last light</p>
                    </div>
                  </div>
                  <div className="text-2xl font-light">{weather.sun.sunset}</div>
                </div>
                
                {/* Visibility */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-slate-500/20">
                      <Eye className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Visibility</h4>
                      <p className="text-[10px] text-muted-foreground">Clear distance</p>
                    </div>
                  </div>
                  <div className="text-2xl font-light">{weather.current.visibility} <span className="text-sm text-muted-foreground">miles</span></div>
                </div>
              </div>
            </div>
            
            {/* 5-Day Forecast */}
            <div className="glass rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-3">5-Day Forecast</h4>
              <p className="text-xs text-muted-foreground mb-3">Extended outlook showing high/low temperatures and precipitation probability.</p>
              <div className="grid grid-cols-5 gap-2">
                {weather.forecast.map((day, i) => (
                  <div key={i} className={`text-center p-3 rounded-xl ${i === 0 ? 'bg-primary/10 ring-1 ring-primary/30' : 'glass'}`}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{day.day}</p>
                    <WeatherIcon condition={day.icon} className="w-8 h-8 mx-auto my-2" />
                    <p className="text-lg font-semibold">{day.high}°</p>
                    <p className="text-sm text-muted-foreground">{day.low}°</p>
                    {day.precip > 0 && (
                      <p className="text-xs text-blue-400 mt-1 flex items-center justify-center gap-0.5">
                        <Droplets className="w-3 h-3" />
                        {day.precip}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Alerts */}
            {weather.alerts.length > 0 && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-warning">Weather Alert</h4>
                    <p className="text-sm text-muted-foreground mt-1">{weather.alerts[0].message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile: Compact View */}
          <div className="lg:hidden space-y-3">
            {/* Current Weather Hero */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-light">{weather.current.temp}</span>
                    <span className="text-xl text-muted-foreground mb-1">°F</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Feels like {weather.current.feelsLike}°F</p>
                  <p className="text-sm font-medium mt-1">{weather.current.condition}</p>
                </div>
                <WeatherIcon condition={weather.current.icon} className="w-16 h-16" />
              </div>
            </div>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="glass rounded-lg p-2 text-center">
                <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <p className="text-sm font-semibold">{weather.current.humidity}%</p>
                <p className="text-[9px] text-muted-foreground">Humidity</p>
              </div>
              <div className="glass rounded-lg p-2 text-center">
                <Wind className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                <p className="text-sm font-semibold">{weather.current.windSpeed}</p>
                <p className="text-[9px] text-muted-foreground">mph {weather.current.windDirection}</p>
              </div>
              <div className="glass rounded-lg p-2 text-center">
                <Gauge className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <p className="text-sm font-semibold">{weather.current.pressure}</p>
                <p className="text-[9px] text-muted-foreground">inHg</p>
              </div>
            </div>
            
            {/* Sun Times */}
            <div className="flex justify-between items-center glass rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-amber-400" />
                <span className="text-xs">{weather.sun.sunrise}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-orange-400" />
                <span className="text-xs">{weather.sun.sunset}</span>
              </div>
            </div>
            
            {/* 5-Day Forecast Mini */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">5-DAY FORECAST</p>
              <div className="grid grid-cols-5 gap-1">
                {weather.forecast.map((day, i) => (
                  <div key={i} className={`text-center p-2 rounded-lg ${i === 0 ? 'bg-primary/10' : 'glass'}`}>
                    <p className="text-[10px] font-medium text-muted-foreground">{day.day}</p>
                    <WeatherIcon condition={day.icon} className="w-5 h-5 mx-auto my-1" />
                    <p className="text-xs font-semibold">{day.high}°</p>
                    <p className="text-[10px] text-muted-foreground">{day.low}°</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Alert */}
            {weather.alerts.length > 0 && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-2">
                <p className="text-xs text-warning font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {weather.alerts[0].message}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-[10px] text-muted-foreground text-center pt-3 mt-3 border-t border-border/50">
            Last updated: {weather.lastUpdated}
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      {showHelp && <WeatherHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
