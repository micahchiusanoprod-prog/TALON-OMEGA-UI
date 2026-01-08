import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Leaf
} from 'lucide-react';
import api from '../services/api';
import config from '../config';

export default function EnvironmentTile() {
  const [sensors, setSensors] = useState(null);
  const [loading, setLoading] = useState(true);

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
    iaq: 95,
    available: false,
  };

  const toFahrenheit = (celsius) => (celsius * 9/5 + 32).toFixed(0);

  const getComfortLevel = (temp, humidity) => {
    const tempF = temp * 9/5 + 32;
    if (tempF >= 68 && tempF <= 76 && humidity >= 30 && humidity <= 50) {
      return { level: 'Ideal', color: 'text-success', bg: 'bg-success/20' };
    }
    if (tempF >= 65 && tempF <= 80 && humidity >= 25 && humidity <= 60) {
      return { level: 'Good', color: 'text-primary', bg: 'bg-primary/20' };
    }
    return { level: 'Fair', color: 'text-warning', bg: 'bg-warning/20' };
  };

  const comfort = getComfortLevel(data.temperature, data.humidity);

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
    <Card className="glass-strong border-border h-full" data-testid="environment-tile">
      <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            Environment
          </CardTitle>
          <div className="flex items-center gap-2">
            {!data.available && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                Simulated
              </span>
            )}
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${comfort.bg} ${comfort.color}`}>
              {comfort.level}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Hero Temperature */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-light tracking-tight">{toFahrenheit(data.temperature)}</span>
              <span className="text-lg sm:text-xl text-muted-foreground">°F</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.temperature.toFixed(1)}°C
            </p>
          </div>
          <div className="text-right">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <Thermometer className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Humidity */}
          <div className="glass rounded-xl p-2.5 sm:p-3 text-center">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-lg sm:text-xl font-semibold">{data.humidity.toFixed(0)}%</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Humidity</div>
          </div>

          {/* Pressure */}
          <div className="glass rounded-xl p-2.5 sm:p-3 text-center">
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-purple-400" />
            <div className="text-lg sm:text-xl font-semibold">{data.pressure.toFixed(0)}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">hPa</div>
          </div>

          {/* Air Quality */}
          <div className="glass rounded-xl p-2.5 sm:p-3 text-center">
            <Wind className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-green-400" />
            <div className="text-lg sm:text-xl font-semibold">{data.iaq}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">AQI</div>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${data.iaq >= 100 ? 'bg-success' : 'bg-warning'}`} />
            Air: {data.iaq >= 150 ? 'Excellent' : data.iaq >= 100 ? 'Good' : 'Fair'}
          </span>
          <span>
            {data.pressure > 1015 ? '☀️ Clear' : data.pressure > 1005 ? '⛅ Fair' : '🌧️ Changing'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
