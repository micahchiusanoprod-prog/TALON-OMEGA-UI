import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Thermometer, Droplets, Gauge, Wind, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
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

  // Helper function to determine status based on thresholds
  const getStatus = (type, value) => {
    if (value === null) return { status: 'unknown', icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted' };

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
      return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Normal' };
    } else if (status === 'warning') {
      return { status: 'warning', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light', label: 'Attention' };
    } else {
      return { status: 'critical', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive-light', label: 'Critical' };
    }
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
      type: 'temperature',
    },
    {
      label: 'Humidity',
      description: 'Moisture in air',
      value: displayData.humidity,
      unit: '%',
      icon: Droplets,
      color: 'text-blue-400',
      type: 'humidity',
    },
    {
      label: 'Pressure',
      description: 'Air pressure',
      value: displayData.pressure,
      unit: 'hPa',
      icon: Gauge,
      color: 'text-purple-400',
      type: 'pressure',
    },
    {
      label: 'Air Quality',
      description: 'Indoor air health (higher is better)',
      value: displayData.iaq,
      unit: 'IAQ',
      icon: Wind,
      color: 'text-green-400',
      type: 'iaq',
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
            const status = getStatus(metric.type, metric.value);
            const StatusIcon = status.icon;
            
            return (
              <div
                key={metric.label}
                className="flex items-center justify-between p-3 glass rounded-lg hover:glass-strong transition-smooth"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 glass rounded-lg">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-foreground">
                      {metric.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">
                      {metric.value !== null ? metric.value.toFixed(1) : '—'}
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div 
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full ${status.bg} ${
                      status.status === 'critical' ? 'animate-critical-flash' : ''
                    }`} 
                    title={`Status: ${status.label}`}
                  >
                    <StatusIcon className={`w-4 h-4 ${status.color} ${
                      status.status === 'critical' ? 'animate-critical-glow' : ''
                    }`} />
                    <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Status Guide:</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Normal - Everything is fine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">Attention - Outside ideal range</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground">Critical - Needs immediate attention</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
