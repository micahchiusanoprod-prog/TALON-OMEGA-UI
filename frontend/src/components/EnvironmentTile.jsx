import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Thermometer, Droplets, Gauge, Wind, AlertTriangle } from 'lucide-react';
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

  // Use placeholder data if sensors are offline or unavailable
  const displayData = sensors?.available ? sensors : {
    temperature: 22.5,
    humidity: 45.2,
    pressure: 1013.2,
    iaq: 95,
    available: false,
    offline: !sensors?.available,
  };

  if (loading) {
    return (
      <Card className="glass-strong border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary" />
            Environment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Temperature',
      description: 'Room temperature',
      value: displayData.temperature,
      unit: '°C',
      icon: Thermometer,
      color: 'text-red-400',
    },
    {
      label: 'Humidity',
      description: 'Moisture in air',
      value: displayData.humidity,
      unit: '%',
      icon: Droplets,
      color: 'text-blue-400',
    },
    {
      label: 'Pressure',
      description: 'Air pressure',
      value: displayData.pressure,
      unit: 'hPa',
      icon: Gauge,
      color: 'text-purple-400',
    },
    {
      label: 'Air Quality',
      description: 'Indoor air health (higher is better)',
      value: displayData.iaq,
      unit: 'IAQ',
      icon: Wind,
      color: 'text-green-400',
    },
  ];

  return (
    <Card className="glass-strong border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary" />
            Environment
          </CardTitle>
          {displayData.offline && (
            <span className="text-xs px-2 py-1 rounded-full bg-warning-light text-warning">
              Simulated
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="flex items-center justify-between p-3 glass rounded-lg hover:glass-strong transition-smooth"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 glass rounded-lg">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {metric.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground">
                    {metric.value !== null ? metric.value.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
