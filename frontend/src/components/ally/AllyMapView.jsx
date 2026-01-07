import React, { useEffect, useState, Suspense } from 'react';
import { MapPin, HelpCircle, CheckCircle, Circle, WifiOff, Loader2, AlertTriangle, Crosshair, Maximize2 } from 'lucide-react';
import GpsStatusBar from './GpsStatusBar';
import { Button } from '../ui/button';

// Status color mapping for pins
const statusColors = {
  good: '#22c55e',      // green-500
  okay: '#f59e0b',      // amber-500
  need_help: '#ef4444', // red-500
  offline: '#6b7280',   // gray-500
};

const getNodeStatusColor = (node) => {
  if (node.status === 'offline') return statusColors.offline;
  if (node.user_status === 'need_help') return statusColors.need_help;
  if (node.user_status === 'okay') return statusColors.okay;
  return statusColors.good;
};

const getStatusLabel = (node) => {
  if (node.status === 'offline') return 'OFFLINE';
  if (node.user_status === 'need_help') return 'NEED HELP';
  if (node.user_status === 'okay') return 'OKAY';
  if (node.user_status === 'good') return 'GOOD';
  return 'UNKNOWN';
};

const getStatusIcon = (node) => {
  if (node.status === 'offline') return WifiOff;
  if (node.user_status === 'need_help') return HelpCircle;
  if (node.user_status === 'okay') return AlertTriangle;
  return CheckCircle;
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

// Loading fallback
const MapLoadingFallback = () => (
  <div className="h-[320px] glass rounded-lg flex items-center justify-center" data-testid="map-loading">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  </div>
);

// No GPS panel for nodes without coordinates
const NoGpsPanel = ({ nodes }) => {
  if (nodes.length === 0) return null;
  
  return (
    <div className="mt-3 glass rounded-lg p-3" data-testid="no-gps-panel">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Nodes without GPS ({nodes.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {nodes.map(node => {
          const StatusIcon = getStatusIcon(node);
          const statusColor = getNodeStatusColor(node);
          return (
            <div 
              key={node.node_id}
              className="glass px-2 py-1 rounded text-xs flex items-center gap-1.5"
              data-testid={`no-gps-node-${node.node_id}`}
            >
              <StatusIcon className="w-3 h-3" style={{ color: statusColor }} />
              <span>{node.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Map Control Buttons
const MapControls = ({ onCenterAll, onCenterMe, nodesWithGps }) => (
  <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1" data-testid="map-controls">
    <Button
      size="sm"
      variant="secondary"
      onClick={onCenterAll}
      className="h-8 px-2 text-xs glass-strong shadow-lg"
      title="Center on all nodes"
      data-testid="center-all-btn"
      disabled={nodesWithGps.length === 0}
    >
      <Maximize2 className="w-3.5 h-3.5 mr-1" />
      All Nodes
    </Button>
    <Button
      size="sm"
      variant="secondary"
      onClick={onCenterMe}
      className="h-8 px-2 text-xs glass-strong shadow-lg"
      title="Center on my location"
      data-testid="center-me-btn"
    >
      <Crosshair className="w-3.5 h-3.5 mr-1" />
      My Location
    </Button>
  </div>
);

// Lazy loaded map component
const LazyMapContent = React.lazy(() => import('./LazyMapContent'));

export default function AllyMapView({ nodes, gpsStatus }) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  
  // Separate nodes with and without GPS
  const nodesWithGps = nodes.filter(n => n.gps && n.gps.lat && n.gps.lon);
  const nodesWithoutGps = nodes.filter(n => !n.gps || !n.gps.lat || !n.gps.lon);
  
  // Calculate center based on nodes with GPS, or use default
  const defaultCenter = React.useMemo(() => {
    if (nodesWithGps.length === 0) {
      return [37.7749, -122.4194]; // Default: San Francisco
    }
    const avgLat = nodesWithGps.reduce((sum, n) => sum + n.gps.lat, 0) / nodesWithGps.length;
    const avgLon = nodesWithGps.reduce((sum, n) => sum + n.gps.lon, 0) / nodesWithGps.length;
    return [avgLat, avgLon];
  }, [nodesWithGps]);
  
  // Calculate bounds for all nodes
  const nodeBounds = React.useMemo(() => {
    if (nodesWithGps.length === 0) return null;
    if (nodesWithGps.length === 1) {
      return [[nodesWithGps[0].gps.lat, nodesWithGps[0].gps.lon]];
    }
    return nodesWithGps.map(n => [n.gps.lat, n.gps.lon]);
  }, [nodesWithGps]);
  
  // Calculate appropriate zoom level
  const defaultZoom = nodesWithGps.length <= 1 ? 14 : 12;
  
  // Trigger map loading after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Center on all nodes
  const handleCenterAll = () => {
    if (mapRef && nodeBounds && nodeBounds.length > 0) {
      if (nodeBounds.length === 1) {
        mapRef.setView(nodeBounds[0], 14);
      } else {
        mapRef.fitBounds(nodeBounds, { padding: [50, 50] });
      }
    }
  };
  
  // Center on my location (placeholder - will use device GPS when wired to Pi)
  const handleCenterMe = () => {
    // For now, center on the first node as a placeholder
    // In production, this would use the device's own GPS coordinates
    if (mapRef && defaultCenter) {
      mapRef.setView(defaultCenter, 14);
    }
  };
  
  return (
    <div className="space-y-3" data-testid="ally-map-view">
      {/* GPS Status Bar */}
      <GpsStatusBar gpsStatus={gpsStatus} />
      
      {nodesWithGps.length === 0 ? (
        <div className="h-[320px] glass rounded-lg flex items-center justify-center" data-testid="map-no-nodes">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No nodes with GPS data</p>
            <p className="text-xs text-muted-foreground/70">
              Nodes will appear on the map once they report GPS coordinates
            </p>
          </div>
        </div>
      ) : isMapReady ? (
        <div className="relative">
          <Suspense fallback={<MapLoadingFallback />}>
            <LazyMapContent 
              nodesWithGps={nodesWithGps}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMapReady={setMapRef}
            />
          </Suspense>
          <MapControls 
            onCenterAll={handleCenterAll}
            onCenterMe={handleCenterMe}
            nodesWithGps={nodesWithGps}
          />
        </div>
      ) : (
        <MapLoadingFallback />
      )}
      
      {/* No GPS Panel */}
      <NoGpsPanel nodes={nodesWithoutGps} />
    </div>
  );
}
