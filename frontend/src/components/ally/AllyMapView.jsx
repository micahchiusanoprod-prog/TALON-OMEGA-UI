import React, { useEffect, useRef, Suspense } from 'react';
import { MapPin, AlertTriangle, HelpCircle, CheckCircle, Circle, WifiOff, Loader2 } from 'lucide-react';

// Lazy load Leaflet to avoid loading it until Map tab is opened
const MapContainer = React.lazy(() => import('react-leaflet').then(m => ({ default: m.MapContainer })));
const TileLayer = React.lazy(() => import('react-leaflet').then(m => ({ default: m.TileLayer })));
const Marker = React.lazy(() => import('react-leaflet').then(m => ({ default: m.Marker })));
const Popup = React.lazy(() => import('react-leaflet').then(m => ({ default: m.Popup })));

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
  // We need to dynamically import L to create the icon
  const L = window.L;
  if (!L) return null;
  
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

// Loading fallback
const MapLoadingFallback = () => (
  <div className="h-[350px] glass rounded-lg flex items-center justify-center" data-testid="map-loading">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  </div>
);

// Main Map Component
const MapContent = ({ nodesWithGps, defaultCenter, defaultZoom }) => {
  const mapRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = React.useState(false);
  const [icons, setIcons] = React.useState({});
  
  // Load Leaflet CSS and create icons once L is available
  useEffect(() => {
    // Import Leaflet CSS
    import('leaflet/dist/leaflet.css').then(() => {
      // Small delay to ensure L is available
      setTimeout(() => {
        if (window.L) {
          // Create icons for each status color
          const newIcons = {};
          Object.entries(statusColors).forEach(([status, color]) => {
            newIcons[status] = createCustomIcon(color, status === 'need_help');
          });
          setIcons(newIcons);
          setLeafletLoaded(true);
        }
      }, 100);
    });
  }, []);
  
  const getIconForNode = (node) => {
    if (!leafletLoaded) return null;
    if (node.status === 'offline') return icons.offline;
    if (node.user_status === 'need_help') return icons.need_help;
    if (node.user_status === 'okay') return icons.okay;
    return icons.good;
  };
  
  if (!leafletLoaded) {
    return <MapLoadingFallback />;
  }
  
  return (
    <MapContainer
      ref={mapRef}
      center={defaultCenter}
      zoom={defaultZoom}
      className="h-[350px] w-full rounded-lg z-0"
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
};

export default function AllyMapView({ nodes }) {
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
  
  // Calculate appropriate zoom level
  const defaultZoom = nodesWithGps.length <= 1 ? 13 : 11;
  
  return (
    <div className="space-y-3" data-testid="ally-map-view">
      {nodesWithGps.length === 0 ? (
        <div className="h-[350px] glass rounded-lg flex items-center justify-center" data-testid="map-no-nodes">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No nodes with GPS data</p>
            <p className="text-xs text-muted-foreground/70">
              Nodes will appear on the map once they report GPS coordinates
            </p>
          </div>
        </div>
      ) : (
        <Suspense fallback={<MapLoadingFallback />}>
          <MapContent 
            nodesWithGps={nodesWithGps}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
          />
        </Suspense>
      )}
      
      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Okay</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Need Help</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">Offline</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {nodesWithGps.length} of {nodes.length} nodes on map
        </div>
      </div>
      
      {/* No GPS Panel */}
      <NoGpsPanel nodes={nodesWithoutGps} />
    </div>
  );
}
