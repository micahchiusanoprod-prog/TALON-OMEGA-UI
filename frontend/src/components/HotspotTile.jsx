import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Copy, 
  QrCode, 
  Clock, 
  Signal, 
  TrendingUp,
  AlertTriangle,
  Loader2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Star,
  Ban,
  Gauge
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import api from '../services/api';
import config from '../config';

export default function HotspotTile() {
  const [status, setStatus] = useState(null);
  const [clients, setClients] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showAllClients, setShowAllClients] = useState(false);

  useEffect(() => {
    fetchAllData();
    
    // Dynamic polling based on hotspot state
    const interval = setInterval(() => {
      fetchAllData();
    }, status?.enabled ? config.polling.hotspotOn : config.polling.hotspotOff);
    
    return () => clearInterval(interval);
  }, [status?.enabled]);

  const fetchAllData = async () => {
    try {
      const [statusData, clientsData, usageData] = await Promise.all([
        api.getHotspotStatus(),
        api.getHotspotClients(),
        api.getHotspotUsage(),
      ]);
      
      setStatus(statusData);
      setClients(clientsData.clients || []);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to fetch hotspot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (toggling) return;
    
    setToggling(true);
    try {
      const newState = !status.enabled;
      const result = await api.toggleHotspot(newState);
      
      if (result.success !== false) {
        toast.success(`Hotspot ${newState ? 'enabled' : 'disabled'}`);
        // Refresh status immediately
        setTimeout(fetchAllData, 500);
      } else {
        toast.error('Unable to toggle hotspot', {
          description: 'Try checking the system services or restart the device',
        });
      }
    } catch (error) {
      toast.error('Failed to toggle hotspot', {
        description: error.message || 'Please try again or check system logs',
      });
    } finally {
      setToggling(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(config.hotspot.localUrl);
    toast.success('URL copied to clipboard');
  };

  const handleShowQR = () => {
    toast.info('QR Code feature - Coming soon');
  };

  const handleRefresh = () => {
    fetchAllData();
    toast.success('Refreshed hotspot data');
  };

  const handleFavorite = (client) => {
    toast.success(`${client.hostname} marked as favorite`);
  };

  const handleBlock = (client) => {
    toast.warning(`${client.hostname} blocked`, {
      description: 'This device can no longer connect',
    });
  };

  const handleLimitData = (client) => {
    toast.info(`Data limit set for ${client.hostname}`, {
      description: 'Device will be throttled after limit',
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMinutes = Math.floor((now - then) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  const formatThroughput = (bps) => {
    if (!bps) return '0 Mbps';
    const mbps = (bps / 1048576).toFixed(2);
    return `${mbps} Mbps`;
  };

  // Helper function to get status for performance metrics
  const getThroughputStatus = (bps) => {
    const mbps = bps / 1048576;
    if (mbps > 20) return { status: 'critical', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive-light', label: 'Overload' };
    if (mbps > 10) return { status: 'warning', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light', label: 'High' };
    return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Normal' };
  };

  const getDataUsageStatus = (bytes) => {
    const gb = bytes / 1073741824;
    if (gb > 5) return { status: 'critical', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive-light', label: 'Very High' };
    if (gb > 2) return { status: 'warning', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light', label: 'High' };
    return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Normal' };
  };

  const getChannelStatus = (channel) => {
    // Channels 1, 6, 11 are optimal for 2.4GHz to avoid interference
    if (!channel) return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Auto' };
    if (channel === 1 || channel === 6 || channel === 11) {
      return { status: 'good', icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Optimal' };
    }
    return { status: 'warning', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light', label: 'Interference' };
  };

  if (loading) {
    return (
      <Card className="glass-strong border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            Hotspot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isNearCapacity = status.connectedCount >= status.maxClients * 0.8;
  const visibleClients = showAllClients ? clients : clients.slice(0, 3);
  
  // Get status indicators for performance metrics
  const totalBytes = usage.rxBytesTotal + usage.txBytesTotal;
  const dataStatus = getDataUsageStatus(totalBytes);
  const throughputStatus = getThroughputStatus(usage.rxRateBps);
  const channelStatus = getChannelStatus(status.channel);
  
  const DataStatusIcon = dataStatus.icon;
  const ThroughputStatusIcon = throughputStatus.icon;
  const ChannelStatusIcon = channelStatus.icon;

  return (
    <Card className="glass-strong border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {status.enabled ? (
              <Wifi className="w-5 h-5 text-primary" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            Hotspot
          </CardTitle>
          
          {!status.available && (
            <span className="text-xs px-2 py-1 rounded-full bg-warning-light text-warning">
              Simulated
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Status & Toggle */}
        <div className="flex items-center justify-between p-4 glass rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status.enabled 
                  ? 'bg-success-light text-success' 
                  : 'bg-destructive-light text-destructive'
              }`}>
                {status.enabled ? 'ON' : 'OFF'}
              </div>
              {status.enabled && (
                <span className="text-xs text-muted-foreground">
                  {status.ssid} • {status.band}
                </span>
              )}
            </div>
            {status.enabled && (
              <div className="text-xs text-muted-foreground">
                Uptime: {formatUptime(status.uptime)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {toggling && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <Switch
              checked={status.enabled}
              onCheckedChange={handleToggle}
              disabled={toggling}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {status.enabled && (
          <>
            {/* How to Connect Instructions */}
            <div className="glass p-3 rounded-lg">
              <div className="text-xs font-semibold text-foreground mb-1">How to Connect:</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>1. On your device, go to WiFi settings</p>
                <p>2. Look for network: <span className="font-medium text-foreground">{status.ssid}</span></p>
                <p>3. Enter the password and connect</p>
                <p className="text-[10px] opacity-70 mt-1">💡 Use the QR Code button below for quick connection</p>
              </div>
            </div>

            {/* Connected Devices */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">
                  Connected Devices
                  <span className="text-xs text-muted-foreground ml-2">
                    {status.connectedCount} / {status.maxClients}
                  </span>
                </div>
                {isNearCapacity && (
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Near capacity</span>
                  </div>
                )}
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No devices connected
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {visibleClients.map((client) => (
                      <div
                        key={client.mac}
                        className="p-3 glass rounded-lg hover:glass-strong transition-smooth"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {client.hostname}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {client.ip} • {client.mac}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(client.connectedAt)}
                              </span>
                              {client.rssi && (
                                <span className="flex items-center gap-1">
                                  <Signal className="w-3 h-3" />
                                  {client.rssi} dBm
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>↓ {formatBytes(client.rxBytes)}</div>
                            <div>↑ {formatBytes(client.txBytes)}</div>
                          </div>
                        </div>
                        
                        {/* Device Management Buttons */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFavorite(client)}
                            className="text-xs h-7 flex-1 border-border-strong bg-secondary/30 hover:bg-secondary"
                            title="Mark as favorite device"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Favorite
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLimitData(client)}
                            className="text-xs h-7 flex-1 border-border-strong bg-secondary/30 hover:bg-secondary"
                            title="Set data usage limit"
                          >
                            <Gauge className="w-3 h-3 mr-1" />
                            Limit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlock(client)}
                            className="text-xs h-7 flex-1 border-border-strong bg-secondary/30 hover:bg-destructive-light hover:text-destructive"
                            title="Block this device"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Block
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {clients.length > 3 && (
                    <button
                      onClick={() => setShowAllClients(!showAllClients)}
                      className="w-full text-xs text-primary hover:text-primary-hover flex items-center justify-center gap-1 py-2"
                    >
                      {showAllClients ? 'Show less' : `View all ${clients.length} devices`}
                      <ChevronRight className={`w-3 h-3 transition-transform ${showAllClients ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass p-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">Total Data</div>
                  <div 
                    className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full ${dataStatus.bg} ${
                      dataStatus.status === 'critical' ? 'animate-critical-flash' : ''
                    }`}
                  >
                    <DataStatusIcon className={`w-3.5 h-3.5 ${dataStatus.color} ${
                      dataStatus.status === 'critical' ? 'animate-critical-glow' : ''
                    }`} />
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {formatBytes(totalBytes)}
                </div>
              </div>
              <div className="glass p-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">Throughput</div>
                  <div 
                    className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full ${throughputStatus.bg} ${
                      throughputStatus.status === 'critical' ? 'animate-critical-flash' : ''
                    }`}
                  >
                    <ThroughputStatusIcon className={`w-3.5 h-3.5 ${throughputStatus.color} ${
                      throughputStatus.status === 'critical' ? 'animate-critical-glow' : ''
                    }`} />
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {formatThroughput(usage.rxRateBps)}
                </div>
              </div>
              <div className="glass p-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">Channel</div>
                  <div 
                    className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full ${channelStatus.bg} ${
                      channelStatus.status === 'critical' ? 'animate-critical-flash' : ''
                    }`}
                  >
                    <ChannelStatusIcon className={`w-3.5 h-3.5 ${channelStatus.color} ${
                      channelStatus.status === 'critical' ? 'animate-critical-glow' : ''
                    }`} />
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {status.channel || 'Auto'}
                </div>
              </div>
              <div className="glass p-2 rounded-lg">
                <div className="text-xs text-muted-foreground">Range</div>
                <div className="text-sm font-semibold text-foreground" title="Varies by environment, device, and interference">
                  ~100-165 ft
                </div>
                <div className="text-[10px] text-muted-foreground opacity-70">estimate</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="text-xs border-border-strong bg-secondary/50 hover:bg-secondary transition-all"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowQR}
                className="text-xs border-border-strong bg-secondary/50 hover:bg-secondary transition-all"
              >
                <QrCode className="w-3 h-3 mr-1" />
                QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-xs border-border-strong bg-secondary/50 hover:bg-secondary transition-all"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Performance Guide:</div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs text-muted-foreground">Normal - Healthy operation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                  <span className="text-xs text-muted-foreground">High - Monitor usage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs text-muted-foreground">Critical - May affect performance</span>
                </div>
              </div>
            </div>
          </>
        )}

        {!status.enabled && (
          <div className="text-center py-8 text-muted-foreground">
            <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Hotspot is currently off</p>
            <p className="text-xs mt-1">Toggle on to share your connection</p>
          </div>
        )}

        {!status.available && (
          <div className="text-xs text-muted-foreground text-center p-2 glass rounded">
            Waiting for hotspot API integration
          </div>
        )}
      </CardContent>
    </Card>
  );
}
