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
  MapPin
} from 'lucide-react';

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
    pressure: 30.12
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
  lastUpdated: '10 min ago'
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

export default function WeatherTile() {
  const [showHelp, setShowHelp] = useState(false);
  const weather = mockWeather;
  
  return (
    <Card className="glass-strong border-border-strong h-full" data-testid="weather-tile">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            Weather
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">Simulated</span>
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
              onClick={() => setShowHelp(!showHelp)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
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
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1 text-emerald-400" />
            <p className="text-xs sm:text-sm font-semibold">{weather.current.visibility}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">mi vis</p>
          </div>
        </div>
        
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
              <div key={i} className={`text-center p-2 rounded-lg ${i === 0 ? 'bg-primary/10' : 'glass'}`}>
                <p className="text-[10px] font-medium text-muted-foreground">{day.day}</p>
                <WeatherIcon condition={day.icon} className="w-5 h-5 mx-auto my-1" />
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
              <CloudRain className="w-3 h-3" />
              {weather.alerts[0].message}
            </p>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-[10px] text-muted-foreground text-center">
          Last updated: {weather.lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
}
