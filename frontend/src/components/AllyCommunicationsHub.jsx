import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw, 
  Search,
  Radio,
  Wifi,
  Activity,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../services/allyApi';
import config from '../config';
import NodeCard from './ally/NodeCard';
import NodeDetailsDrawer from './ally/NodeDetailsDrawer';
import MessagingModal from './ally/MessagingModal';
import BroadcastModal from './ally/BroadcastModal';

export default function AllyCommunicationsHub() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [dmNodeId, setDmNodeId] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    fetchNodes();
    
    const interval = setInterval(fetchNodes, config.polling.allyNodes);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Retry queued messages periodically
    const retryInterval = setInterval(() => {
      allyApi.retryQueuedMessages();
    }, config.ally.messageRetryInterval);
    
    return () => clearInterval(retryInterval);
  }, []);

  const fetchNodes = async () => {
    try {
      const data = await allyApi.getNodes();
      setNodes(data);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchNodes();
    toast.success('Refreshed node status');
  };

  const handleMessage = (nodeId) => {
    setDmNodeId(nodeId);
    setShowDM(true);
  };

  const handleDetails = (node) => {
    setSelectedNode(node);
    setShowDetails(true);
  };

  const handlePing = async (nodeId) => {
    try {
      const result = await allyApi.pingNode(nodeId);
      toast.success(`Ping successful: ${result.rtt_ms}ms`);
    } catch (error) {
      toast.error('Ping failed');
    }
  };

  // Filter and search nodes
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.node_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'online' && node.status === 'online') ||
                         (filterStatus === 'offline' && node.status === 'offline') ||
                         (filterStatus === 'alerts' && node.alerts_count > 0);
    return matchesSearch && matchesFilter;
  });

  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const totalAlerts = nodes.reduce((sum, n) => sum + (n.alerts_count || 0), 0);

  const getConnectionMode = () => {
    const types = new Set(nodes.map(n => n.link_type));
    if (types.size === 0) return 'Unknown';
    if (types.size === 1) return Array.from(types)[0];
    return 'Mixed';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    const seconds = Math.floor((new Date() - lastSync) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  if (loading) {
    return (
      <Card className="glass-strong border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Ally Communications Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-strong border-border">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Ally Communications Hub
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Family device status + messages
                </p>
              </div>
            </div>

            {/* Status Summary Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="glass px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                <Activity className="w-3 h-3 text-success" />
                <span className="text-muted-foreground">Online:</span>
                <span className="font-semibold">{onlineCount} / {nodes.length}</span>
              </div>
              {totalAlerts > 0 && (
                <div className="glass px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-destructive-light animate-critical-flash">
                  <AlertTriangle className="w-3 h-3 text-destructive animate-critical-glow" />
                  <span className="text-destructive font-semibold">Alerts: {totalAlerts}</span>
                </div>
              )}
              <div className="glass px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Synced:</span>
                <span className="font-semibold">{formatLastSync()}</span>
              </div>
              <div className="glass px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                <Radio className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-semibold">{getConnectionMode()}</span>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowGroupChat(true)}
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Group Chat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBroadcast(true)}
                className="border-border-strong bg-secondary/50 hover:bg-secondary"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Broadcast Alert
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="border-border-strong bg-secondary/50 hover:bg-secondary"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="h-9 text-xs"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'online' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('online')}
                className="h-9 text-xs"
              >
                Online
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'offline' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('offline')}
                className="h-9 text-xs"
              >
                Offline
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'alerts' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('alerts')}
                className="h-9 text-xs"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alerts
              </Button>
            </div>
          </div>

          {/* Node List */}
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No nodes found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
              {filteredNodes.map((node) => (
                <NodeCard
                  key={node.node_id}
                  node={node}
                  onMessage={handleMessage}
                  onDetails={handleDetails}
                  onPing={handlePing}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showDetails && selectedNode && (
        <NodeDetailsDrawer
          node={selectedNode}
          onClose={() => setShowDetails(false)}
          onMessage={handleMessage}
        />
      )}

      {showGroupChat && (
        <MessagingModal
          type="group"
          onClose={() => setShowGroupChat(false)}
        />
      )}

      {showDM && dmNodeId && (
        <MessagingModal
          type="dm"
          nodeId={dmNodeId}
          nodeName={nodes.find(n => n.node_id === dmNodeId)?.name}
          onClose={() => setShowDM(false)}
        />
      )}

      {showBroadcast && (
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
        />
      )}
    </>
  );
}
