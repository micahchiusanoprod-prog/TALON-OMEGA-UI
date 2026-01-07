import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  X, 
  MessageSquare, 
  RefreshCw, 
  Star,
  Cpu,
  HardDrive,
  Thermometer,
  Battery,
  MapPin,
  Wifi,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Wind,
  Droplets,
  Gauge,
  Radio,
  Globe,
  HelpCircle,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';

export default function NodeDetailsDrawer({ node, onClose, onMessage }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lock body scroll when drawer opens
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [node.node_id]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await allyApi.getNodeStatus(node.node_id);
      setDetails(data);
    } catch (err) {
      console.error('Failed to fetch node details:', err);
      setError('Failed to load node details. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await allyApi.refreshNode(node.node_id);
      toast.success('Refresh requested');
      setTimeout(fetchDetails, 2000);
    } catch (err) {
      toast.error('Refresh failed');
    }
  };

  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = () => {
    if (node.status === 'online') return 'text-success';
    if (node.status === 'degraded') return 'text-warning';
    return 'text-destructive';
  };

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-success bg-success-light';
      case 'okay': return 'text-warning bg-warning-light';
      case 'need_help': return 'text-destructive bg-destructive-light';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getUserStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'GOOD';
      case 'okay': return 'OKAY';
      case 'need_help': return 'NEED HELP';
      default: return 'Unknown';
    }
  };

  const getMetricStatus = (value, thresholds) => {
    if (value === null || value === undefined) return null;
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'good';
  };

  const getMetricColor = (status) => {
    switch (status) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'good': return 'text-success';
      default: return 'text-foreground';
    }
  };

  // Helper to safely display values
  const safeDisplay = (value, suffix = '', fallback = 'N/A') => {
    if (value === null || value === undefined || value === '') return fallback;
    return `${value}${suffix}`;
  };

  // Count services up/down
  const getServiceCounts = () => {
    if (!details?.system?.services) return { up: 0, down: 0 };
    const services = Object.values(details.system.services);
    return {
      up: services.filter(s => s === 'up').length,
      down: services.filter(s => s !== 'up').length,
    };
  };

  const serviceCounts = getServiceCounts();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="node-details-drawer"
    >
      <div className="w-full max-w-2xl h-full bg-background shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground truncate">{node.name || 'Unknown Device'}</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor()} bg-secondary`}>
                {node.status ? node.status.toUpperCase() : 'UNKNOWN'}
              </span>
              {node.user_status && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getUserStatusColor(node.user_status)}`}>
                  {getUserStatusLabel(node.user_status)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Node ID: {node.node_id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-drawer-btn">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Error State */}
          {error && (
            <div className="bg-warning-light border border-warning rounded-lg p-3 text-sm text-warning-foreground">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Connection Info */}
              <Card className="glass-strong border-border p-4" data-testid="connection-info-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  Connection
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-2 font-medium ${getStatusColor()}`}>
                      {node.status ? node.status.charAt(0).toUpperCase() + node.status.slice(1) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Seen:</span>
                    <span className="ml-2 font-medium">{formatDate(node.last_seen)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Connection Type:</span>
                    <span className="ml-2 font-medium">{safeDisplay(node.link_type)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Signal (RSSI):</span>
                    <span className="ml-2 font-medium">{safeDisplay(node.rssi, ' dBm')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="ml-2 font-medium">{safeDisplay(node.ip)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">URL:</span>
                    {node.url ? (
                      <a href={node.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">
                        Open Dashboard
                      </a>
                    ) : (
                      <span className="ml-2 font-medium">N/A</span>
                    )}
                  </div>
                </div>
              </Card>

              {/* Identity */}
              <Card className="glass-strong border-border p-4" data-testid="identity-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  Identity
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Hostname:</span>
                    <span className="ml-2 font-medium">{safeDisplay(details?.identity?.hostname)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <span className="ml-2 font-medium">{safeDisplay(details?.identity?.version)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="ml-2 font-medium">{formatUptime(details?.identity?.uptime)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Reboot:</span>
                    <span className="ml-2 font-medium">{formatDate(details?.identity?.last_reboot)}</span>
                  </div>
                </div>
              </Card>

              {/* System Health (CPU/RAM/Disk/Temp) */}
              <Card className="glass-strong border-border p-4" data-testid="system-health-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  System Health
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">CPU:</span>
                    <span className={`font-medium ${getMetricColor(getMetricStatus(details?.system?.cpu, { warning: 70, critical: 90 }))}`}>
                      {safeDisplay(details?.system?.cpu, '%')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">RAM:</span>
                    <span className={`font-medium ${getMetricColor(getMetricStatus(details?.system?.ram, { warning: 75, critical: 90 }))}`}>
                      {safeDisplay(details?.system?.ram, '%')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Disk:</span>
                    <span className={`font-medium ${getMetricColor(getMetricStatus(details?.system?.disk, { warning: 80, critical: 95 }))}`}>
                      {safeDisplay(details?.system?.disk, '%')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Temp:</span>
                    <span className={`font-medium ${getMetricColor(getMetricStatus(details?.system?.temp, { warning: 60, critical: 75 }))}`}>
                      {safeDisplay(details?.system?.temp, '°C')}
                    </span>
                  </div>
                </div>
                
                {/* Services */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Services</span>
                    <span className="text-xs">
                      <span className="text-success font-medium">{serviceCounts.up} OK</span>
                      {serviceCounts.down > 0 && (
                        <span className="text-destructive font-medium ml-2">{serviceCounts.down} Down</span>
                      )}
                    </span>
                  </div>
                  {details?.system?.services ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(details.system.services).map(([name, status]) => (
                        <span 
                          key={name} 
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                            status === 'up' ? 'bg-success-light text-success' : 'bg-destructive-light text-destructive'
                          }`}
                        >
                          {status === 'up' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No service data available</p>
                  )}
                </div>
              </Card>

              {/* Power / Battery */}
              <Card className="glass-strong border-border p-4" data-testid="power-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-primary" />
                  Power
                </h3>
                {details?.power ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Battery className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Battery:</span>
                      <span className={`font-medium ${
                        (details.power.battery_pct || 0) < 20 ? 'text-destructive' : 
                        (details.power.battery_pct || 0) < 50 ? 'text-warning' : 'text-success'
                      }`}>
                        {safeDisplay(details.power.battery_pct, '%')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Voltage:</span>
                      <span className="ml-2 font-medium">{safeDisplay(details.power.volts, 'V')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="ml-2 font-medium">{safeDisplay(details.power.amps, 'A')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Power:</span>
                      <span className="ml-2 font-medium">{safeDisplay(details.power.watts, 'W')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">State:</span>
                      <span className="ml-2 font-medium capitalize">{safeDisplay(details.power.charge_state)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="ml-2 font-medium">{formatUptime(details.power.runtime_s)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No power data available</p>
                )}
              </Card>

              {/* GPS Summary */}
              <Card className="glass-strong border-border p-4" data-testid="gps-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  GPS
                </h3>
                {details?.gps ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Fix:</span>
                      <span className={`ml-2 font-medium ${details.gps.fix === '3D' ? 'text-success' : details.gps.fix ? 'text-warning' : 'text-destructive'}`}>
                        {safeDisplay(details.gps.fix, '', 'No Fix')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satellites:</span>
                      <span className="ml-2 font-medium">{safeDisplay(details.gps.sats)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Latitude:</span>
                      <span className="ml-2 font-medium">{details.gps.lat?.toFixed(6) ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Longitude:</span>
                      <span className="ml-2 font-medium">{details.gps.lon?.toFixed(6) ?? 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="ml-2 font-medium">{details.gps.acc ? `±${details.gps.acc}m` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="ml-2 font-medium">{safeDisplay(details.gps.speed, ' km/h')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No GPS data available</p>
                )}
              </Card>

              {/* Sensors Summary */}
              <Card className="glass-strong border-border p-4" data-testid="sensors-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-primary" />
                  Environment Sensors
                </h3>
                {details?.sensors ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="font-medium">{safeDisplay(details.sensors.temp, '°C')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Humidity:</span>
                      <span className="font-medium">{safeDisplay(details.sensors.hum, '%')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Pressure:</span>
                      <span className="font-medium">{safeDisplay(details.sensors.pressure, ' hPa')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Air Quality:</span>
                      <span className={`font-medium ${
                        (details.sensors.iaq || 0) > 100 ? 'text-warning' : 'text-success'
                      }`}>
                        {safeDisplay(details.sensors.iaq, ' IAQ')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No sensor data available</p>
                )}
              </Card>

              {/* Active Alerts */}
              <Card className="glass-strong border-border p-4" data-testid="alerts-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Active Alerts
                  {details?.alerts?.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-destructive-light text-destructive text-xs font-medium">
                      {details.alerts.length}
                    </span>
                  )}
                </h3>
                {details?.alerts && details.alerts.length > 0 ? (
                  <div className="space-y-2">
                    {details.alerts.map((alert, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg ${
                          alert.severity === 'critical' || alert.severity === 'emergency' 
                            ? 'bg-destructive-light border border-destructive animate-critical-flash' 
                            : 'bg-warning-light border border-warning'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            alert.severity === 'critical' || alert.severity === 'emergency' ? 'text-destructive' : 'text-warning'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground">{alert.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(alert.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="glass-strong border-t border-border p-4 flex gap-2">
          <Button 
            onClick={() => onMessage(node.node_id)} 
            className="flex-1"
            data-testid="drawer-message-btn"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="flex-1"
            data-testid="drawer-refresh-btn"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.success('Added to favorites')}
            data-testid="drawer-favorite-btn"
          >
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
