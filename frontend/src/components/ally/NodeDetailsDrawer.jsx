import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { X, MessageSquare, RefreshCw, Star } from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../../services/allyApi';

export default function NodeDetailsDrawer({ node, onClose, onMessage }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [node.node_id]);

  const fetchDetails = async () => {
    try {
      const data = await allyApi.getNodeStatus(node.node_id);
      setDetails(data);
    } catch (error) {
      console.error('Failed to fetch node details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await allyApi.refreshNode(node.node_id);
      toast.success('Refresh requested');
      setTimeout(fetchDetails, 2000);
    } catch (error) {
      toast.error('Refresh failed');
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-background shadow-2xl overflow-hidden flex flex-col">
        <div className="glass-strong border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{node.name}</h2>
            <p className="text-xs text-muted-foreground">Node ID: {node.node_id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))}
            </div>
          ) : details ? (
            <>
              {/* Identity */}
              <Card className="glass-strong border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Identity</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Hostname:</span> {details.identity?.hostname}</div>
                  <div><span className="text-muted-foreground">Version:</span> {details.identity?.version}</div>
                  <div><span className="text-muted-foreground">Uptime:</span> {formatUptime(details.identity?.uptime || 0)}</div>
                  <div><span className="text-muted-foreground">Last Reboot:</span> {new Date(details.identity?.last_reboot).toLocaleString()}</div>
                </div>
              </Card>

              {/* System Health */}
              <Card className="glass-strong border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">System Health</h3>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-muted-foreground">CPU:</span> {details.system?.cpu}%</div>
                  <div><span className="text-muted-foreground">RAM:</span> {details.system?.ram}%</div>
                  <div><span className="text-muted-foreground">Disk:</span> {details.system?.disk}%</div>
                  <div><span className="text-muted-foreground">Temp:</span> {details.system?.temp}°C</div>
                </div>
                {details.system?.services && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Services</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(details.system.services).map(([name, status]) => (
                        <span key={name} className={`text-xs px-2 py-0.5 rounded-full ${
                          status === 'up' ? 'bg-success-light text-success' : 'bg-destructive-light text-destructive'
                        }`}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Power */}
              {details.power && (
                <Card className="glass-strong border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Power</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Battery:</span> {details.power.battery_pct}%</div>
                    <div><span className="text-muted-foreground">Voltage:</span> {details.power.volts}V</div>
                    <div><span className="text-muted-foreground">Current:</span> {details.power.amps}A</div>
                    <div><span className="text-muted-foreground">Power:</span> {details.power.watts}W</div>
                    <div><span className="text-muted-foreground">State:</span> {details.power.charge_state}</div>
                    <div><span className="text-muted-foreground">Runtime:</span> {formatUptime(details.power.runtime_s)}</div>
                  </div>
                </Card>
              )}

              {/* GPS */}
              {details.gps && (
                <Card className="glass-strong border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">GPS</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Fix:</span> {details.gps.fix}</div>
                    <div><span className="text-muted-foreground">Satellites:</span> {details.gps.sats}</div>
                    <div><span className="text-muted-foreground">Lat:</span> {details.gps.lat?.toFixed(6)}</div>
                    <div><span className="text-muted-foreground">Lon:</span> {details.gps.lon?.toFixed(6)}</div>
                    <div><span className="text-muted-foreground">Accuracy:</span> ±{details.gps.acc}m</div>
                    <div><span className="text-muted-foreground">Speed:</span> {details.gps.speed} km/h</div>
                  </div>
                </Card>
              )}

              {/* Sensors */}
              {details.sensors && (
                <Card className="glass-strong border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Sensors</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Temperature:</span> {details.sensors.temp}°C</div>
                    <div><span className="text-muted-foreground">Humidity:</span> {details.sensors.hum}%</div>
                    <div><span className="text-muted-foreground">Pressure:</span> {details.sensors.pressure} hPa</div>
                    <div><span className="text-muted-foreground">Air Quality:</span> {details.sensors.iaq} IAQ</div>
                  </div>
                </Card>
              )}

              {/* Alerts */}
              {details.alerts && details.alerts.length > 0 && (
                <Card className="glass-strong border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Active Alerts</h3>
                  <div className="space-y-2">
                    {details.alerts.map((alert, i) => (
                      <div key={i} className={`p-2 rounded ${
                        alert.severity === 'warning' ? 'bg-warning-light' : 'bg-destructive-light'
                      }`}>
                        <div className="text-xs font-medium">{alert.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No details available</p>
            </div>
          )}
        </div>

        <div className="glass-strong border-t border-border p-4 flex gap-2">
          <Button onClick={() => onMessage(node.node_id)} className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => toast.success('Added to favorites')}>
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
