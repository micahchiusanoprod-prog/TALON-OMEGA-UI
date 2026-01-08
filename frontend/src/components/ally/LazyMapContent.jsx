import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HelpCircle, CheckCircle, Circle, WifiOff, AlertTriangle, Loader2 } from 'lucide-react';

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

// Create a custom icon using SVG
const createCustomIcon = (color, isNeedHelp = false) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="#fff" stroke-width="1"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
      ${isNeedHelp ? '<circle cx="12" cy="12" r="7" fill="none" stroke="#fff" stroke-width="1" opacity="0.5"><animate attributeName="r" values="7;10;7" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite"/></circle>' : ''}
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: svg,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

// Pre-create icons for each status
const icons = {
  good: createCustomIcon(statusColors.good, false),
  okay: createCustomIcon(statusColors.okay, false),
  need_help: createCustomIcon(statusColors.need_help, true),
  offline: createCustomIcon(statusColors.offline, false),
};

const getIconForNode = (node) => {
  if (node.status === 'offline') return icons.offline;
  if (node.user_status === 'need_help') return icons.need_help;
  if (node.user_status === 'okay') return icons.okay;
  return icons.good;
};

// Node popup content component
const NodePopupContent = ({ node }) => {
  const StatusIcon = getStatusIcon(node);
  const statusColor = getNodeStatusColor(node);
  
  return (
    <div className="min-w-[180px] p-1" data-testid={`map-popup-${node.node_id}`}>
      <div className="font-semibold text-foreground text-sm mb-1">{node.name}</div>
      <div 
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2"
        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
      >
        <StatusIcon className="w-3 h-3" />
        {getStatusLabel(node)}
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Last seen:</span>
          <span className="font-medium">{formatTimeAgo(node.last_seen)}</span>
        </div>
        {node.gps ? (
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-mono text-xs">{node.gps.lat.toFixed(4)}, {node.gps.lon.toFixed(4)}</span>
          </div>
        ) : (
          <div className="text-muted-foreground italic">No GPS data</div>
        )}
        {node.role && (
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="font-medium">{node.role}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function LazyMapContent({ nodesWithGps, defaultCenter, defaultZoom, onMapReady }) {
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef(null);
  
  useEffect(() => {
    // Small delay to ensure CSS is loaded
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Expose map reference to parent
  useEffect(() => {
    if (mapRef.current && onMapReady) {
      onMapReady(mapRef.current);
    }
  }, [isReady, onMapReady]);
  
  if (!isReady) {
    return (
      <div className="h-[320px] lg:h-[450px] glass rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Initializing map...</p>
        </div>
      </div>
    );
  }
  
  return (
    <MapContainer
      ref={mapRef}
      center={defaultCenter}
      zoom={defaultZoom}
      className="h-[320px] lg:h-[450px] w-full rounded-lg z-0"
      style={{ background: 'hsl(var(--muted))' }}
      data-testid="ally-map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {nodesWithGps.map(node => {
        const icon = getIconForNode(node);
        if (!icon || !node.gps) return null;
        
        return (
          <Marker
            key={node.node_id}
            position={[node.gps.lat, node.gps.lon]}
            icon={icon}
          >
            <Popup>
              <NodePopupContent node={node} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
