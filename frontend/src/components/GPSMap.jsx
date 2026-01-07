import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, Navigation, Satellite } from 'lucide-react';
import config from '../config';

export default function GPSMap({ gpsData }) {
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    if (gpsData) {
      setBreadcrumbs(prev => {
        const updated = [...prev, gpsData];
        // Keep only last N points
        return updated.slice(-config.gps.breadcrumbLimit);
      });
    }
  }, [gpsData]);

  const formatCoordinate = (value, isLat) => {
    const abs = Math.abs(value);
    const direction = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${abs.toFixed(6)}° ${direction}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'No fix';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Card className="glass-strong border-border overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          GPS Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coordinate Grid View (offline fallback) */}
        <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden border border-border">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Current position indicator */}
          {gpsData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse-glow" />
                <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
              </div>
            </div>
          )}

          {/* Breadcrumb trail */}
          {breadcrumbs.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={breadcrumbs
                  .map((point, i) => {
                    const x = 50 + (i - breadcrumbs.length / 2) * 5;
                    const y = 50 + Math.sin(i * 0.1) * 10;
                    return `${x}%,${y}%`;
                  })
                  .join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity="0.6"
              />
            </svg>
          )}

          {/* Offline indicator */}
          <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="text-muted-foreground">Offline Grid View</span>
          </div>
        </div>

        {/* GPS Info */}
        {gpsData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Latitude</div>
              <div className="text-sm font-mono font-semibold text-foreground">
                {formatCoordinate(gpsData.latitude, true)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Longitude</div>
              <div className="text-sm font-mono font-semibold text-foreground">
                {formatCoordinate(gpsData.longitude, false)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Accuracy
              </div>
              <div className="text-sm font-semibold text-foreground">
                ±{gpsData.accuracy}m
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Satellite className="w-3 h-3" />
                Satellites
              </div>
              <div className="text-sm font-semibold text-foreground">
                {gpsData.satellites}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for GPS fix...</p>
          </div>
        )}

        {/* Last Fix Time */}
        <div className="text-xs text-muted-foreground text-center">
          Last Fix: {formatTime(gpsData?.timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}
