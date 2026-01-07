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

  if (!sensors || sensors.offline) {
    return (
      <Card className="glass-strong border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary" />
            Environment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-warning mb-3" />
            <p className="text-sm font-medium text-foreground">Sensor Offline</p>
            <p className="text-xs text-muted-foreground mt-1">
              BME680 sensor is not responding
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Temperature',
      value: sensors.temperature,
      unit: '°C',
      icon: Thermometer,
      color: 'text-red-400',
    },
    {
      label: 'Humidity',
      value: sensors.humidity,
      unit: '%',
      icon: Droplets,
      color: 'text-blue-400',
    },
    {
      label: 'Pressure',
      value: sensors.pressure,
      unit: 'hPa',
      icon: Gauge,
      color: 'text-purple-400',
    },
    {
      label: 'Air Quality',
      value: sensors.iaq || sensors.gas,
      unit: sensors.iaq ? 'IAQ' : 'Ω',
      icon: Wind,
      color: 'text-green-400',
    },
  ];

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
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="flex items-center justify-between p-3 glass rounded-lg hover:glass-strong transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 glass rounded-lg">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </span>
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
