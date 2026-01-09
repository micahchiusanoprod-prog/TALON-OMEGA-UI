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
  overview: "The Weather tile displays current conditions and forecasts. OMEGA can derive weather data from its onboard sensors (temperature, humidity, pressure) combined with offline weather models.",
  
  omegaSensors: {
    title: "OMEGA Sensor Weather Data",
    description: "Your OMEGA device has onboard sensors that can help predict local weather conditions:",
    sensors: [
      {
        name: "Barometric Pressure",
        icon: Gauge,
        description: "Measures atmospheric pressure in hPa (hectopascals) or inHg (inches of mercury).",
        weatherUse: "Falling pressure often indicates approaching storms or rain. Rising pressure suggests clearing weather.",
        ranges: [
          { range: "> 1020 hPa (30.12 inHg)", meaning: "High pressure - typically clear, stable weather" },
          { range: "1010-1020 hPa", meaning: "Normal pressure - fair conditions" },
          { range: "< 1010 hPa (29.83 inHg)", meaning: "Low pressure - unsettled, potential precipitation" },
        ],
        tip: "Watch for rapid drops (>3 hPa in 3 hours) - storms may be approaching."
      },
      {
        name: "Temperature",
        icon: Thermometer,
        description: "Ambient temperature from the OMEGA's sensor module.",
        weatherUse: "Useful for tracking temperature trends, frost warnings, and heat advisories.",
        ranges: [
          { range: "Below 32°F (0°C)", meaning: "Freezing - frost/ice risk" },
          { range: "32-50°F (0-10°C)", meaning: "Cold - wear layers" },
          { range: "50-75°F (10-24°C)", meaning: "Comfortable range" },
          { range: "Above 85°F (29°C)", meaning: "Hot - hydration important" },
        ],
        tip: "The sensor may read higher than actual ambient temp if OMEGA is enclosed or under load."
      },
      {
        name: "Humidity",
        icon: Droplets,
        description: "Relative humidity percentage in the air.",
        weatherUse: "High humidity + falling pressure often precedes rain. Low humidity increases fire risk.",
        ranges: [
          { range: "Below 30%", meaning: "Dry - fire risk, static electricity" },
          { range: "30-50%", meaning: "Comfortable indoor levels" },
          { range: "50-70%", meaning: "Moderate - may feel humid" },
          { range: "Above 70%", meaning: "High - precipitation likely nearby" },
        ],
        tip: "Dew point (derived from temp + humidity) better indicates how 'muggy' it feels."
      }
    ]
  },
  
  forecast: {
    title: "Understanding the Forecast",
    items: [
      { term: "High/Low", meaning: "Expected maximum and minimum temperatures for the day" },
      { term: "Precipitation %", meaning: "Probability of rain/snow at your location" },
      { term: "UV Index", meaning: "Sun intensity: 0-2 Low, 3-5 Moderate, 6-7 High, 8+ Very High" },
      { term: "Visibility", meaning: "How far you can see clearly (in miles)" },
      { term: "Wind", meaning: "Speed (mph) and direction (N, NE, etc.)" },
    ]
  },
  
  icons: {
    title: "Weather Icon Legend",
    items: [
      { icon: Sun, label: "Sunny/Clear", description: "Little to no cloud cover" },
      { icon: Cloud, label: "Cloudy/Partly Cloudy", description: "Significant cloud cover" },
      { icon: CloudRain, label: "Rain", description: "Precipitation expected" },
      { icon: CloudSnow, label: "Snow", description: "Frozen precipitation" },
      { icon: CloudLightning, label: "Storm", description: "Thunderstorms possible" },
    ]
  },
  
  tips: [
    "Pressure trends are more useful than absolute values for predicting weather changes",
    "Morning dew or frost suggests clear overnight skies",
    "Rapidly changing conditions indicate unstable weather patterns",
    "In mountains, weather can change quickly - check forecasts frequently",
    "OMEGA's sensors give hyperlocal data; forecasts may differ from nearby areas"
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
    pressureTrend: 'rising' // 'rising', 'falling', 'steady'
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
  // OMEGA sensor data
  omegaSensors: {
    available: true,
    pressure: 1013.2, // hPa
    pressureInHg: 29.92,
    pressureTrend: 'falling',
    temperature: 22.5, // Celsius
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
  const [activeTab, setActiveTab] = useState('sensors');
  const [expandedSensor, setExpandedSensor] = useState(null);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="glass-strong rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20">
              <HelpCircle className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Weather Help</h3>
              <p className="text-xs text-muted-foreground">{WEATHER_HELP.overview}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-border/50">
          {[
            { id: 'sensors', label: 'OMEGA Sensors', icon: Radio },
            { id: 'forecast', label: 'Forecast', icon: Cloud },
            { id: 'icons', label: 'Icons', icon: Sun },
            { id: 'tips', label: 'Tips', icon: Zap },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* OMEGA Sensors Tab */}
          {activeTab === 'sensors' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{WEATHER_HELP.omegaSensors.description}</p>
              
              {WEATHER_HELP.omegaSensors.sensors.map((sensor, idx) => {
                const Icon = sensor.icon;
                const isExpanded = expandedSensor === idx;
                
                return (
                  <div key={idx} className="glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSensor(isExpanded ? null : idx)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-sm">{sensor.name}</span>
                        <p className="text-xs text-muted-foreground">{sensor.description}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 animate-fade-in">
                        <div className="glass rounded-lg p-3">
                          <span className="text-xs font-semibold text-primary">Weather Use</span>
                          <p className="text-xs text-muted-foreground mt-1">{sensor.weatherUse}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-semibold">Reference Ranges</span>
                          <div className="mt-2 space-y-1">
                            {sensor.ranges.map((r, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <span className="text-muted-foreground w-40 flex-shrink-0 font-mono">{r.range}</span>
                                <span>{r.meaning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                          <span className="text-xs font-semibold text-warning flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Pro Tip
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">{sensor.tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">{WEATHER_HELP.forecast.title}</h4>
              <div className="space-y-2">
                {WEATHER_HELP.forecast.items.map((item, idx) => (
                  <div key={idx} className="glass rounded-lg p-3 flex items-start gap-3">
                    <span className="text-sm font-semibold text-primary w-28 flex-shrink-0">{item.term}</span>
                    <span className="text-sm text-muted-foreground">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Icons Tab */}
          {activeTab === 'icons' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">{WEATHER_HELP.icons.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WEATHER_HELP.icons.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="glass rounded-lg p-3 flex items-center gap-3">
                      <Icon className="w-8 h-8 text-sky-400" />
                      <div>
                        <span className="text-sm font-semibold">{item.label}</span>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Weather Tips</h4>
              <div className="space-y-2">
                {WEATHER_HELP.tips.map((tip, idx) => (
                  <div key={idx} className="glass rounded-lg p-3 flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WeatherTile() {
  const [showHelp, setShowHelp] = useState(false);
  const weather = mockWeather;
  
  // Pressure trend indicator
  const getPressureTrendIcon = (trend) => {
    if (trend === 'rising') return '↑';
    if (trend === 'falling') return '↓';
    return '→';
  };
  
  const getPressureTrendColor = (trend) => {
    if (trend === 'rising') return 'text-success';
    if (trend === 'falling') return 'text-warning';
    return 'text-muted-foreground';
  };
  
  return (
    <>
      <Card className="glass-strong border-border-strong h-full" data-testid="weather-tile">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/20">
                <Cloud className="w-4 h-4 text-sky-400" />
              </div>
              Weather
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">Simulated</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
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
                title="Help"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{weather.location}</span>
          </div>
          
          {/* Current Weather - Hero */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-4xl sm:text-5xl font-light">{weather.current.temp}</span>
                <span className="text-xl sm:text-2xl text-muted-foreground mb-1 sm:mb-2">°F</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Feels like {weather.current.feelsLike}°F</p>
              <p className="text-xs sm:text-sm font-medium mt-1">{weather.current.condition}</p>
            </div>
            <div className="text-right">
              <WeatherIcon condition={weather.current.icon} className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="glass rounded-lg p-1.5 sm:p-2 text-center">
              <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-blue-400" />
              <p className="text-xs sm:text-sm font-semibold">{weather.current.humidity}%</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Humidity</p>
            </div>
            <div className="glass rounded-lg p-1.5 sm:p-2 text-center">
              <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-slate-400" />
              <p className="text-xs sm:text-sm font-semibold">{weather.current.windSpeed}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">mph {weather.current.windDirection}</p>
            </div>
            <div className="glass rounded-lg p-1.5 sm:p-2 text-center">
              <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-purple-400" />
              <p className="text-xs sm:text-sm font-semibold flex items-center justify-center gap-0.5">
                {weather.current.pressure}
                <span className={`text-[10px] ${getPressureTrendColor(weather.omegaSensors.pressureTrend)}`}>
                  {getPressureTrendIcon(weather.omegaSensors.pressureTrend)}
                </span>
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">inHg</p>
            </div>
          </div>
          
          {/* OMEGA Sensor Status */}
          {weather.omegaSensors.available && (
            <div className="glass rounded-lg p-2 border border-primary/20">
              <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium mb-1">
                <Radio className="w-3 h-3" />
                OMEGA SENSORS
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pressure trend:</span>
                <span className={`font-medium ${getPressureTrendColor(weather.omegaSensors.pressureTrend)}`}>
                  {weather.omegaSensors.pressureTrend === 'falling' ? 'Falling - weather may change' : 
                   weather.omegaSensors.pressureTrend === 'rising' ? 'Rising - clearing likely' : 'Steady'}
                </span>
              </div>
            </div>
          )}
          
          {/* Sun Times */}
          <div className="flex justify-between items-center glass rounded-lg p-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sunrise className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Sunrise</p>
                <p className="text-xs sm:text-sm font-medium">{weather.sun.sunrise}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sunset className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Sunset</p>
                <p className="text-xs sm:text-sm font-medium">{weather.sun.sunset}</p>
              </div>
            </div>
          </div>
          
          {/* 5-Day Forecast */}
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-2">5-DAY FORECAST</p>
            <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
              {weather.forecast.map((day, i) => (
                <div key={i} className={`text-center p-1.5 sm:p-2 rounded-lg ${i === 0 ? 'bg-primary/10' : 'glass'}`}>
                  <p className="text-[10px] font-medium text-muted-foreground">{day.day}</p>
                  <WeatherIcon condition={day.icon} className="w-4 h-4 sm:w-5 sm:h-5 mx-auto my-1" />
                  <p className="text-xs font-semibold">{day.high}°</p>
                  <p className="text-[10px] text-muted-foreground">{day.low}°</p>
                  {day.precip > 0 && (
                    <p className="text-[9px] text-blue-400">{day.precip}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Alerts */}
          {weather.alerts.length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-2">
              <p className="text-xs text-warning font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {weather.alerts[0].message}
              </p>
            </div>
          )}
          
          {/* Footer */}
          <div className="text-[10px] text-muted-foreground text-center pt-1">
            Last updated: {weather.lastUpdated}
          </div>
        </CardContent>
      </Card>
      
      {/* Help Modal */}
      {showHelp && <WeatherHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
