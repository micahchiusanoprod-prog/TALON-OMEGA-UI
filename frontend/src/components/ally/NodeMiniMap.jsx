import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle as LeafletCircle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Status color mapping for the pin
const statusColors = {
  good: '#22c55e',      // green-500
  okay: '#f59e0b',      // amber-500
  need_help: '#ef4444', // red-500
  offline: '#6b7280',   // gray-500
};

const getStatusColor = (status, userStatus) => {
  if (status === 'offline') return statusColors.offline;
  if (userStatus === 'need_help') return statusColors.need_help;
  if (userStatus === 'okay') return statusColors.okay;
  return statusColors.good;
};

// Create a custom marker icon
const createMarkerIcon = (color, isNeedHelp = false) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#fff"/>
      ${isNeedHelp ? '<circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6"><animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="1s" repeatCount="indefinite"/></circle>' : ''}
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-mini-map-marker',
    html: svg,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  });
};

export default function NodeMiniMap({ lat, lon, nodeName, nodeStatus, userStatus, accuracy, fixStatus }) {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Small delay to ensure CSS is loaded
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  if (!isReady) {
    return (
      <div className="h-40 glass flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading map...</p>
      </div>
    );
  }
  
  const color = getStatusColor(nodeStatus, userStatus);
  const isNeedHelp = userStatus === 'need_help';
  const markerIcon = createMarkerIcon(color, isNeedHelp);
  
  // Convert accuracy from meters to feet for display
  const accuracyFeet = accuracy ? Math.round(accuracy * 3.28084) : null;
  
  return (
    <div className="relative">
      <MapContainer
        center={[lat, lon]}
        zoom={15}
        className="h-40 w-full z-0"
        style={{ background: 'hsl(var(--muted))' }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={false}
        attributionControl={false}
        data-testid="node-mini-map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Accuracy circle */}
        {accuracy && (
          <LeafletCircle
            center={[lat, lon]}
            radius={accuracy}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.15,
              weight: 1,
            }}
          />
        )}
        
        {/* Node marker */}
        <Marker position={[lat, lon]} icon={markerIcon} />
      </MapContainer>
      
      {/* Node name overlay */}
      <div className="absolute top-2 left-2 z-[1000] bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md border border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold">{nodeName}</span>
        </div>
      </div>
      
      {/* Accuracy overlay */}
      {accuracyFeet && (
        <div className="absolute bottom-2 right-2 z-[1000] bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md border border-border">
          <span className="text-xs text-muted-foreground">±{accuracyFeet} ft accuracy</span>
        </div>
      )}
      
      {/* Fix status badge */}
      <div className={`absolute top-2 right-2 z-[1000] px-2 py-1 rounded-lg shadow-md border ${
        fixStatus === '3D' ? 'bg-success/20 border-success/30 text-success' : 
        fixStatus ? 'bg-warning/20 border-warning/30 text-warning' :
        'bg-destructive/20 border-destructive/30 text-destructive'
      }`}>
        <span className="text-xs font-bold">{fixStatus || 'No'} Fix</span>
      </div>
    </div>
  );
}
