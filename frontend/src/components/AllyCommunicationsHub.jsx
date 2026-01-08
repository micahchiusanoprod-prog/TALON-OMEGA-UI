import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  HelpCircle,
  CheckCircle,
  Circle,
  Pin,
  Map,
  BookOpen,
  Book,
  Wifi,
  Clock,
  Info,
  Shield,
  Zap,
  Signal,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../services/allyApi';
import NodeDetailsDrawer from './ally/NodeDetailsDrawer';
import MessagingModal from './ally/MessagingModal';
import BroadcastModal from './ally/BroadcastModal';
import AllyMapView from './ally/AllyMapView';
import NodeAvatarStrip from './ally/NodeAvatarStrip';
import { lockBodyScroll, unlockBodyScroll, captureScrollPosition } from '../utils/scrollLock';

// ============================================
// MOCK DATA FOR ALERTS LOG
// ============================================
const getMockAlerts = () => [
  { id: 1, type: 'critical', title: 'SOS Beacon Active', description: "Kids' OMEGA triggered SOS beacon", timestamp: new Date(Date.now() - 300000), node: "Kids' OMEGA" },
  { id: 2, type: 'warning', title: 'Low Battery', description: "Mom's OMEGA battery below 25%", timestamp: new Date(Date.now() - 1800000), node: "Mom's OMEGA" },
  { id: 3, type: 'info', title: 'Node Offline', description: "Backup OMEGA went offline", timestamp: new Date(Date.now() - 3600000), node: "Backup OMEGA" },
  { id: 4, type: 'warning', title: 'Weak Signal', description: "Mesh connection degraded on Dad's OMEGA", timestamp: new Date(Date.now() - 7200000), node: "Dad's OMEGA" },
];

// ============================================
// COMMUNICATION METHODS DATA
// ============================================
const COMM_METHODS = [
  {
    id: 'lan',
    name: 'LAN / Wi-Fi',
    icon: Wifi,
    status: 'available',
    description: 'Standard network connection for high-speed data transfer within local network range.',
    capabilities: ['Text messages', 'File transfer', 'Voice (future)', 'Video (future)'],
    range: '~300 ft indoors, ~1000 ft outdoors',
    requirements: 'Wi-Fi network or ethernet connection',
    howToUse: 'Automatically connects when in range of known networks. Best for base camp operations.',
    failureModes: ['Router offline', 'Out of range', 'Network congestion'],
    priority: 1,
  },
  {
    id: 'mesh',
    name: 'Mesh / LoRa',
    icon: Radio,
    status: 'degraded',
    description: 'Low-power long-range radio for text messages. Works when other methods fail.',
    capabilities: ['Text messages (short)', 'Location sharing', 'Status updates'],
    range: '1-5 miles line of sight, 0.5-1 mile in terrain',
    requirements: 'LoRa radio module, clear line of sight helps',
    howToUse: 'Keep messages under 200 characters. Higher ground = better range. Patience required.',
    failureModes: ['Antenna disconnected', 'Interference', 'Too far from other nodes'],
    priority: 2,
  },
  {
    id: 'sdr',
    name: 'Radio / SDR',
    icon: Signal,
    status: 'available',
    description: 'Software-defined radio for voice and data. Requires amateur radio license for transmit.',
    capabilities: ['Voice communication', 'Data packets', 'Weather broadcasts (receive)', 'Emergency frequencies'],
    range: 'Varies by band: 2m = 10-50 miles, HF = continental',
    requirements: 'SDR hardware, antenna, license for TX',
    howToUse: 'Tune to agreed frequency. PTT for voice. Digital modes for data. Monitor 146.52 MHz.',
    failureModes: ['Wrong frequency', 'Antenna mismatch', 'Propagation conditions'],
    priority: 3,
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    icon: MessageSquare,
    status: 'unavailable',
    description: 'Send text messages to standard cell phones via cellular network.',
    capabilities: ['SMS to any phone number', 'Receive SMS replies'],
    range: 'Anywhere with cellular coverage',
    requirements: 'Cellular modem, SIM card, cell signal',
    howToUse: 'Enter phone number with country code. Messages limited to 160 characters.',
    failureModes: ['No cellular signal', 'SIM not activated', 'Carrier outage'],
    priority: 4,
  },
  {
    id: 'hf',
    name: 'HF Radio Bridge',
    icon: Zap,
    status: 'unavailable',
    description: 'Long-distance radio for continental range. Requires license and equipment.',
    capabilities: ['Voice', 'Digital modes (JS8Call, Winlink)', 'Email via radio'],
    range: '100-3000+ miles depending on conditions',
    requirements: 'HF transceiver, tuned antenna, amateur license',
    howToUse: 'Check propagation forecasts. Use digital modes for reliability. Best at dawn/dusk.',
    failureModes: ['Poor propagation', 'Antenna issues', 'Wrong time of day'],
    priority: 5,
  },
];

// ============================================
// STATUS CONFIG
// ============================================
const STATUS_CONFIG = {
  available: { color: 'text-success', bg: 'bg-success/15', border: 'border-success/30', label: 'Available', dot: 'bg-success' },
  degraded: { color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30', label: 'Degraded', dot: 'bg-warning animate-pulse' },
  unavailable: { color: 'text-destructive', bg: 'bg-destructive/15', border: 'border-destructive/30', label: 'Unavailable', dot: 'bg-destructive' },
};

// ============================================
// COMMUNICATION METHOD CARD COMPONENT
// ============================================
const CommMethodCard = ({ method, isSelected, onSelect, isExpanded, onToggleExpand }) => {
  const Icon = method.icon;
  const config = STATUS_CONFIG[method.status];
  
  return (
    <div 
      className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected ? `ring-2 ring-primary ${config.bg}` : ''
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => onSelect(method.id)}
        className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-white/5`}
        data-testid={`comm-method-${method.id}`}
      >
        {/* Icon with status indicator */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${config.dot} border-2 border-background`} />
        </div>
        
        {/* Name and Status */}
        <div className="flex-1 text-left">
          <div className="font-semibold text-foreground">{method.name}</div>
          <div className={`text-xs font-medium ${config.color}`}>{config.label}</div>
        </div>
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            ACTIVE
          </div>
        )}
        
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(method.id); }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </button>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4 animate-fade-in">
          {/* Description */}
          <p className="text-sm text-muted-foreground">{method.description}</p>
          
          {/* Capabilities */}
          <div>
            <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" />
              CAPABILITIES
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {method.capabilities.map((cap, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-success/10 text-success text-xs font-medium">
                  {cap}
                </span>
              ))}
            </div>
          </div>
          
          {/* Range */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Range:</span>
              <p className="font-medium text-foreground mt-0.5">{method.range}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Requires:</span>
              <p className="font-medium text-foreground mt-0.5">{method.requirements}</p>
            </div>
          </div>
          
          {/* How to Use */}
          <div className="glass rounded-xl p-3">
            <h5 className="text-xs font-bold text-primary mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              HOW TO USE
            </h5>
            <p className="text-xs text-muted-foreground">{method.howToUse}</p>
          </div>
          
          {/* Failure Modes */}
          {method.status !== 'available' && (
            <div className="glass rounded-xl p-3 bg-warning/5 border border-warning/20">
              <h5 className="text-xs font-bold text-warning mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                COMMON ISSUES
              </h5>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {method.failureModes.map((mode, i) => (
                  <li key={i}>• {mode}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// ALERTS LOG COMPONENT
// ============================================
const AlertsLog = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };
  
  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical': return 'bg-destructive/10 border-destructive/30';
      case 'warning': return 'bg-warning/10 border-warning/30';
      default: return 'bg-primary/10 border-primary/30';
    }
  };
  
  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="glass rounded-2xl overflow-hidden" data-testid="alerts-log">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Alert Log</div>
            <div className="text-xs text-muted-foreground">{alerts.length} alerts</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alerts.filter(a => a.type === 'critical').length > 0 && (
            <span className="px-2 py-1 rounded-full bg-destructive text-white text-xs font-bold animate-pulse">
              {alerts.filter(a => a.type === 'critical').length} Critical
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      
      {/* Alert List */}
      {isExpanded && (
        <div className="border-t border-border/50 max-h-64 overflow-y-auto scrollbar-thin">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 border-b border-border/30 last:border-b-0 ${getAlertStyle(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{alert.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                    <span className="text-xs text-primary">{alert.node}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// CONSOLIDATED HELP SECTION COMPONENT
// ============================================
const HelpSection = ({ isExpanded, onToggle }) => {
  const [activeHelpTab, setActiveHelpTab] = useState('quick');
  
  const helpTabs = [
    { id: 'quick', label: 'Quick Start', icon: Zap },
    { id: 'legend', label: 'Status Legend', icon: Circle },
    { id: 'troubleshoot', label: 'Troubleshooting', icon: HelpCircle },
  ];
  
  return (
    <div className="glass rounded-2xl overflow-hidden" data-testid="help-section">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Help & Guides</div>
            <div className="text-xs text-muted-foreground">Quick start, legends, troubleshooting</div>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {/* Help Content */}
      {isExpanded && (
        <div className="border-t border-border/50 p-4 space-y-4 animate-fade-in">
          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/30">
            {helpTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveHelpTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeHelpTab === tab.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Quick Start */}
          {activeHelpTab === 'quick' && (
            <div className="space-y-3">
              <div className="glass rounded-xl p-3">
                <h5 className="font-semibold text-sm mb-2">Getting Started</h5>
                <ol className="text-xs text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <span>Check which communication methods are <span className="text-success font-medium">Available</span> (green)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <span>Select a method to use for sending messages</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <span>Click on a node avatar to see details or send a direct message</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <span>Use <span className="text-destructive font-medium">Broadcast</span> for urgent messages to all nodes</span>
                  </li>
                </ol>
              </div>
              <div className="glass rounded-xl p-3 bg-warning/5 border border-warning/20">
                <h5 className="font-semibold text-sm mb-1 text-warning flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Pro Tips
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Keep messages short on Mesh (&lt;200 chars)</li>
                  <li>• LAN is fastest but shortest range</li>
                  <li>• Mesh works best with line of sight</li>
                  <li>• Check Alert Log regularly for issues</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Status Legend */}
          {activeHelpTab === 'legend' && (
            <div className="space-y-3">
              <div className="glass rounded-xl p-3">
                <h5 className="font-semibold text-sm mb-3">Communication Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="font-medium text-success">Available</span>
                    <span className="text-xs text-muted-foreground">– Ready to use, working normally</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                    <span className="font-medium text-warning">Degraded</span>
                    <span className="text-xs text-muted-foreground">– Working but limited performance</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="font-medium text-destructive">Unavailable</span>
                    <span className="text-xs text-muted-foreground">– Cannot connect, check hardware</span>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-3">
                <h5 className="font-semibold text-sm mb-3">Node Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="font-medium">Good</span>
                    <span className="text-xs text-muted-foreground">– Online, no issues</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="font-medium">Okay</span>
                    <span className="text-xs text-muted-foreground">– Online, minor issues</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="font-medium">Need Help</span>
                    <span className="text-xs text-muted-foreground">– Requesting assistance</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="font-medium">Offline</span>
                    <span className="text-xs text-muted-foreground">– Not reachable</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Troubleshooting */}
          {activeHelpTab === 'troubleshoot' && (
            <div className="space-y-3">
              <div className="glass rounded-xl p-3">
                <h5 className="font-semibold text-sm mb-2">Common Issues</h5>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-medium text-foreground">Messages not sending?</p>
                    <p className="text-muted-foreground">Check selected comm method is Available. Try a different method.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Node showing offline?</p>
                    <p className="text-muted-foreground">May be out of range or powered off. Check last seen time.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Mesh degraded?</p>
                    <p className="text-muted-foreground">Move to higher ground, check antenna connection, reduce distance.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">GPS not working?</p>
                    <p className="text-muted-foreground">Need clear sky view. Go outdoors, wait 1-2 minutes for fix.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function AllyCommunicationsHub() {
  // State
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [dmNodeId, setDmNodeId] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [selectedCommMethod, setSelectedCommMethod] = useState('lan');
  const [expandedCommMethod, setExpandedCommMethod] = useState(null);
  const [alerts, setAlerts] = useState(getMockAlerts());
  const [showHelp, setShowHelp] = useState(false);
  const [activeView, setActiveView] = useState('comms'); // 'comms' | 'map' | 'chat'
  const [globalMessages, setGlobalMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const nodesData = await allyApi.getNodes();
        setNodes(nodesData);
        const messagesData = await allyApi.getGlobalChat();
        setGlobalMessages(messagesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  // Handlers
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setShowDetails(true);
    lockBodyScroll();
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedNode(null);
    unlockBodyScroll();
  };
  
  const handleOpenDM = (nodeId) => {
    setDmNodeId(nodeId);
    setShowDM(true);
    lockBodyScroll();
  };
  
  const handleCloseDM = () => {
    setShowDM(false);
    setDmNodeId(null);
    unlockBodyScroll();
  };
  
  const handleOpenBroadcast = () => {
    setShowBroadcast(true);
    lockBodyScroll();
  };
  
  const handleCloseBroadcast = () => {
    setShowBroadcast(false);
    unlockBodyScroll();
  };
  
  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    try {
      const newMessage = await allyApi.sendGlobalChat(chatMessage);
      setGlobalMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };
  
  const toggleCommMethodExpand = (methodId) => {
    setExpandedCommMethod(expandedCommMethod === methodId ? null : methodId);
  };
  
  // Stats
  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const needHelpCount = nodes.filter(n => n.user_status === 'need_help').length;
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
  
  if (loading) {
    return (
      <Card className="glass-strong border-border-strong">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading communications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="glass-strong border-border-strong" data-testid="ally-communications-hub">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-bold">Ally Communications Hub</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-success font-medium">{onlineCount} online</span>
                  {needHelpCount > 0 && (
                    <span className="text-xs text-destructive font-medium">{needHelpCount} need help</span>
                  )}
                </div>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleOpenBroadcast}
                className="btn-apple-primary relative"
                data-testid="broadcast-btn"
              >
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Broadcast
                {criticalAlerts > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {criticalAlerts}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* View Toggle - TALLER for glove-friendly tapping */}
          <div className="flex gap-1 p-1.5 rounded-2xl bg-secondary/30">
            {[
              { id: 'comms', label: 'Communications', icon: Radio },
              { id: 'map', label: 'Map', icon: Map },
              { id: 'chat', label: 'Chat', icon: MessageSquare, badge: globalMessages.length },
            ].map(view => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-medium transition-all ${
                    activeView === view.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                  data-testid={`view-${view.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                  {view.badge > 0 && (
                    <span className={`text-xs px-1.5 rounded-full font-bold ${
                      activeView === view.id ? 'bg-white/20' : 'bg-primary/20 text-primary'
                    }`}>
                      {view.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* COMMUNICATIONS VIEW */}
          {activeView === 'comms' && (
            <div className="space-y-4">
              {/* Communication Methods Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Signal className="w-4 h-4" />
                  Select Communication Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMM_METHODS.map(method => (
                    <CommMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedCommMethod === method.id}
                      onSelect={setSelectedCommMethod}
                      isExpanded={expandedCommMethod === method.id}
                      onToggleExpand={toggleCommMethodExpand}
                    />
                  ))}
                </div>
              </div>
              
              {/* Active Method Status */}
              {selectedCommMethod && (
                <div className={`glass rounded-xl p-3 ${STATUS_CONFIG[COMM_METHODS.find(m => m.id === selectedCommMethod)?.status || 'available'].bg} border ${STATUS_CONFIG[COMM_METHODS.find(m => m.id === selectedCommMethod)?.status || 'available'].border}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <span className="text-muted-foreground">Sending via:</span>{' '}
                      <span className="font-bold">{COMM_METHODS.find(m => m.id === selectedCommMethod)?.name}</span>
                    </span>
                    <span className={`text-xs font-bold ${STATUS_CONFIG[COMM_METHODS.find(m => m.id === selectedCommMethod)?.status || 'available'].color}`}>
                      {STATUS_CONFIG[COMM_METHODS.find(m => m.id === selectedCommMethod)?.status || 'available'].label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* MAP VIEW */}
          {activeView === 'map' && (
            <AllyMapView nodes={nodes} />
          )}
          
          {/* CHAT VIEW */}
          {activeView === 'chat' && (
            <div className="space-y-3">
              {/* Messages */}
              <div className="glass rounded-xl h-64 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                {globalMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No messages yet
                  </div>
                ) : (
                  globalMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.sender === 'self' ? 'justify-end' : ''}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                        msg.sender === 'self' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'glass'
                      }`}>
                        {msg.sender !== 'self' && (
                          <div className="text-xs font-semibold mb-0.5">{msg.sender_name}</div>
                        )}
                        <p className="text-sm">{msg.text}</p>
                        <div className="text-xs opacity-60 mt-0.5">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <Button onClick={handleSendChat} className="btn-apple-primary">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* NODE NETWORK (Always visible) */}
          <div className="pt-2 border-t border-border/50">
            <NodeAvatarStrip
              nodes={nodes}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.node_id}
            />
          </div>
          
          {/* BOTTOM SECTION: Alerts + Help */}
          <div className="pt-4 border-t border-border/50 space-y-3">
            <AlertsLog alerts={alerts} />
            <HelpSection isExpanded={showHelp} onToggle={() => setShowHelp(!showHelp)} />
          </div>
        </CardContent>
      </Card>
      
      {/* Modals */}
      {showDetails && selectedNode && (
        <NodeDetailsDrawer
          node={selectedNode}
          onClose={handleCloseDetails}
          onMessage={(nodeId) => {
            handleCloseDetails();
            handleOpenDM(nodeId);
          }}
        />
      )}
      
      {showDM && dmNodeId && (
        <MessagingModal
          nodeId={dmNodeId}
          nodeName={nodes.find(n => n.node_id === dmNodeId)?.name || 'Node'}
          onClose={handleCloseDM}
        />
      )}
      
      {showBroadcast && (
        <BroadcastModal
          onClose={handleCloseBroadcast}
          onSend={() => {
            setAlerts(prev => [{
              id: Date.now(),
              type: 'critical',
              title: 'Broadcast Sent',
              description: 'Your broadcast was sent to all nodes',
              timestamp: new Date(),
              node: 'You'
            }, ...prev]);
            handleCloseBroadcast();
          }}
        />
      )}
    </>
  );
}
