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
  Send,
  X,
  HelpCircle,
  CheckCircle,
  Circle,
  Pin
} from 'lucide-react';
import { toast } from 'sonner';
import allyApi from '../services/allyApi';
import config from '../config';
import NodeCard from './ally/NodeCard';
import NodeDetailsDrawer from './ally/NodeDetailsDrawer';
import MessagingModal from './ally/MessagingModal';
import BroadcastModal from './ally/BroadcastModal';

export default function AllyCommunicationsHub() {
  // Node state
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [dmNodeId, setDmNodeId] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  
  // Global Chat state
  const [globalMessages, setGlobalMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  
  // User Status state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentUserStatus, setCurrentUserStatus] = useState(allyApi.getCurrentUserStatus());
  const [statusNote, setStatusNote] = useState('');
  const statusDropdownRef = useRef(null);
  
  // Track chat scroll state for smart auto-scroll
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const chatContainerRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  
  // Broadcast alert tracking
  const [alertsBadgeCount, setAlertsBadgeCount] = useState(0);

  useEffect(() => {
    fetchNodes();
    fetchGlobalChat();
    
    const nodeInterval = setInterval(fetchNodes, config.polling.allyNodes);
    const chatInterval = setInterval(fetchGlobalChat, config.polling.allyChat);
    
    return () => {
      clearInterval(nodeInterval);
      clearInterval(chatInterval);
    };
  }, []);

  useEffect(() => {
    const retryInterval = setInterval(() => {
      allyApi.retryQueuedMessages();
    }, config.ally.messageRetryInterval);
    
    return () => clearInterval(retryInterval);
  }, []);

  // Smart auto-scroll: only when user sent message OR user is near bottom and new messages arrive
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    const newMessageCount = globalMessages.length;
    const hadNewMessages = newMessageCount > prevMessageCountRef.current;
    prevMessageCountRef.current = newMessageCount;
    
    // Auto-scroll if user explicitly sent a message
    if (shouldAutoScroll) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShouldAutoScroll(false);
      setHasNewMessages(false);
      return;
    }
    
    // Auto-scroll if near bottom and new messages arrived
    if (hadNewMessages && isNearBottom) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setHasNewMessages(false);
    } else if (hadNewMessages && !isNearBottom) {
      // Show "new messages" indicator
      setHasNewMessages(true);
    }
  }, [globalMessages, shouldAutoScroll, isNearBottom]);

  // Track if user is near bottom of chat
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 50); // Within 50px of bottom
    if (distanceFromBottom < 50) {
      setHasNewMessages(false);
    }
  };

  // Jump to latest messages
  const handleJumpToLatest = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setHasNewMessages(false);
      setIsNearBottom(true);
    }
  };

  // Close status dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const fetchGlobalChat = async () => {
    try {
      const data = await allyApi.getGlobalChat();
      setGlobalMessages(data);
      // Count emergency broadcasts for badge
      const emergencyCount = data.filter(m => m.priority === 'emergency' || m.broadcast_severity === 'emergency').length;
      setAlertsBadgeCount(emergencyCount);
    } catch (error) {
      console.error('Failed to fetch global chat:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchNodes();
    fetchGlobalChat();
    toast.success('Refreshed all data');
  };

  // Store scroll position before opening modals to restore it on close
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  const handleMessage = (nodeId) => {
    setSavedScrollPosition(window.scrollY);
    setDmNodeId(nodeId);
    setShowDM(true);
  };

  const handleDetails = (node) => {
    setSavedScrollPosition(window.scrollY);
    setSelectedNode(node);
    setShowDetails(true);
  };

  const handleOpenBroadcast = () => {
    setSavedScrollPosition(window.scrollY);
    setShowBroadcast(true);
  };

  const handlePing = async (nodeId) => {
    try {
      const result = await allyApi.pingNode(nodeId);
      toast.success(`Ping successful: ${result.rtt_ms}ms`);
    } catch (error) {
      toast.error('Ping failed');
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    
    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      sender: 'me',
      sender_name: 'This Device',
      sender_status: currentUserStatus.status,
      text: chatMessage,
      timestamp: new Date().toISOString(),
      priority: 'normal',
      status: 'sending',
    };
    
    // Optimistic update and trigger scroll
    setGlobalMessages(prev => [...prev, newMsg]);
    setChatMessage('');
    setShouldAutoScroll(true);
    
    try {
      const result = await allyApi.sendGlobalMessage(chatMessage);
      // Update message status
      setGlobalMessages(prev => prev.map(m => 
        m.id === tempId 
          ? { ...m, status: result.queued ? 'queued' : 'sent' }
          : m
      ));
      if (result.queued) {
        toast.info('Message queued (offline)');
      }
    } catch (error) {
      setGlobalMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'failed' } : m
      ));
      toast.error('Failed to send message');
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'need_help' && !statusNote.trim()) {
      // Show note input for need_help
      return;
    }
    const result = allyApi.setCurrentUserStatus(newStatus, statusNote);
    setCurrentUserStatus(result);
    setStatusNote('');
    setShowStatusDropdown(false);
    toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
  };

  const handleBroadcastSent = (broadcast) => {
    // Add broadcast to global chat immediately
    const broadcastMsg = {
      id: `broadcast-${Date.now()}`,
      sender: 'broadcast',
      sender_name: 'THIS DEVICE',
      text: broadcast.message,
      timestamp: new Date().toISOString(),
      priority: broadcast.severity,
      status: 'sent',
      broadcast_title: broadcast.title,
      broadcast_severity: broadcast.severity,
    };
    setGlobalMessages(prev => [...prev, broadcastMsg]);
    setAlertsBadgeCount(prev => prev + 1);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'GOOD';
      case 'okay': return 'OKAY';
      case 'need_help': return 'NEED HELP';
      default: return 'UNKNOWN';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-success bg-success-light';
      case 'okay': return 'text-warning bg-warning-light';
      case 'need_help': return 'text-destructive bg-destructive-light animate-critical-flash';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'okay': return Circle;
      case 'need_help': return HelpCircle;
      default: return Circle;
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Filter and search nodes
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.node_id.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    switch (filterStatus) {
      case 'online':
        matchesFilter = node.status === 'online';
        break;
      case 'offline':
        matchesFilter = node.status === 'offline';
        break;
      case 'alerts':
        matchesFilter = node.alerts_count > 0;
        break;
      case 'need_help':
        matchesFilter = node.user_status === 'need_help';
        break;
      default:
        matchesFilter = true;
    }
    return matchesSearch && matchesFilter;
  });

  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const totalAlerts = nodes.reduce((sum, n) => sum + (n.alerts_count || 0), 0);
  const needHelpCount = nodes.filter(n => n.user_status === 'need_help').length;

  const getConnectionMode = () => {
    const types = new Set(nodes.filter(n => n.link_type).map(n => n.link_type));
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const StatusIcon = getStatusIcon(currentUserStatus.status);

  // Separate pinned broadcasts from regular messages
  const pinnedBroadcasts = globalMessages.filter(m => m.broadcast_severity === 'emergency' || m.priority === 'emergency');
  const regularMessages = globalMessages.filter(m => m.broadcast_severity !== 'emergency' && m.priority !== 'emergency');

  if (loading) {
    return (
      <Card className="glass-strong border-border" data-testid="ally-hub-loading">
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
      <Card className="glass-strong border-border" data-testid="ally-communications-hub">
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
              
              {/* Current User Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`h-9 text-xs border-border-strong ${getStatusColor(currentUserStatus.status)}`}
                  data-testid="user-status-dropdown-btn"
                >
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {getStatusLabel(currentUserStatus.status)}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                
                {showStatusDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-56 glass-strong border border-border rounded-lg shadow-lg z-50 overflow-hidden" data-testid="user-status-dropdown">
                    <div className="p-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">Set your status</p>
                      {currentUserStatus.set_at && (
                        <p className="text-xs text-muted-foreground">
                          Set {formatTimeAgo(currentUserStatus.set_at)}
                        </p>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => handleStatusChange('good')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-secondary transition-colors text-left"
                        data-testid="status-option-good"
                      >
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>GOOD</span>
                        <span className="text-xs text-muted-foreground ml-auto">All clear</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange('okay')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-secondary transition-colors text-left"
                        data-testid="status-option-okay"
                      >
                        <Circle className="w-4 h-4 text-warning" />
                        <span>OKAY</span>
                        <span className="text-xs text-muted-foreground ml-auto">Manageable</span>
                      </button>
                      <div className="border-t border-border my-1" />
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm">NEED HELP</span>
                        </div>
                        <Input
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Add a note (optional)"
                          className="h-8 text-xs mb-2"
                          data-testid="status-note-input"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange('need_help')}
                          className="w-full h-7 text-xs bg-destructive hover:bg-destructive/90"
                          data-testid="status-need-help-btn"
                        >
                          Set NEED HELP
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
              {needHelpCount > 0 && (
                <div className="glass px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-destructive-light">
                  <HelpCircle className="w-3 h-3 text-destructive" />
                  <span className="text-destructive font-semibold">Need Help: {needHelpCount}</span>
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
                variant="outline"
                onClick={() => setShowBroadcast(true)}
                className="border-border-strong bg-secondary/50 hover:bg-secondary relative"
                data-testid="broadcast-alert-btn"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Broadcast Alert
                {alertsBadgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {alertsBadgeCount}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="border-border-strong bg-secondary/50 hover:bg-secondary"
                data-testid="refresh-btn"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Global Chat Box (Always Visible) */}
          <div className="glass rounded-lg overflow-hidden" data-testid="global-chat-box">
            <div className="glass-strong border-b border-border px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Global Chat</span>
              </div>
              <span className="text-xs text-muted-foreground">{globalMessages.length} messages</span>
            </div>
            
            {/* Pinned Emergency Broadcasts */}
            {pinnedBroadcasts.length > 0 && (
              <div className="border-b border-border p-2 space-y-2" data-testid="pinned-broadcasts">
                {pinnedBroadcasts.map((msg) => (
                  <div key={msg.id} className="bg-destructive-light border border-destructive rounded-lg p-2 animate-critical-flash">
                    <div className="flex items-start gap-2">
                      <Pin className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-destructive">{msg.broadcast_title || 'EMERGENCY'}</div>
                        <div className="text-xs text-foreground truncate">{msg.text}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="relative">
              <div 
                ref={chatContainerRef} 
                onScroll={handleChatScroll}
                className="h-40 overflow-y-auto p-3 space-y-2 scrollbar-thin" 
                data-testid="chat-messages"
              >
              {chatLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton h-10 rounded-lg" />
                  ))}
                </div>
              ) : regularMessages.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {regularMessages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    const isBroadcast = msg.sender === 'broadcast';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        data-testid={`chat-message-${msg.id}`}
                      >
                        <div className={`max-w-[80%] ${
                          isBroadcast 
                            ? 'bg-warning-light border border-warning' 
                            : isMe 
                              ? 'bg-primary text-primary-foreground' 
                              : 'glass'
                        } px-3 py-2 rounded-lg`}>
                          {!isMe && !isBroadcast && (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-semibold">{msg.sender_name}</span>
                              {msg.sender_status && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(msg.sender_status)}`}>
                                  {getStatusLabel(msg.sender_status)}
                                </span>
                              )}
                            </div>
                          )}
                          {isBroadcast && (
                            <div className="text-xs font-bold text-warning mb-0.5">{msg.broadcast_title}</div>
                          )}
                          <div className="text-sm">{msg.text}</div>
                          <div className={`text-xs mt-0.5 flex items-center gap-1.5 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            <span>{formatTime(msg.timestamp)}</span>
                            {msg.status && msg.status !== 'delivered' && (
                              <span className={`${
                                msg.status === 'failed' ? 'text-destructive' : 
                                msg.status === 'queued' ? 'text-warning' : ''
                              }`}>
                                • {msg.status}
                              </span>
                            )}
                            {msg.priority === 'urgent' && (
                              <span className="text-warning font-medium">• URGENT</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              </div>
              
              {/* Jump to Latest Button */}
              {hasNewMessages && !isNearBottom && (
                <button
                  onClick={handleJumpToLatest}
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg hover:bg-primary-hover transition-colors flex items-center gap-1 animate-fade-in"
                  data-testid="jump-to-latest-btn"
                >
                  <ChevronDown className="w-3 h-3" />
                  New messages
                </button>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-border p-2 flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                className="flex-1 h-8 text-sm"
                data-testid="chat-input"
              />
              <Button 
                size="sm" 
                onClick={handleSendChat} 
                disabled={!chatMessage.trim()}
                className="h-8 px-3"
                data-testid="chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="pl-9 h-9 text-sm"
                data-testid="node-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="clear-search-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'online', label: 'Online' },
                { key: 'offline', label: 'Offline' },
                { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
                { key: 'need_help', label: 'Need Help', icon: HelpCircle },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filterStatus === key ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(key)}
                  className={`h-9 text-xs ${filterStatus === key ? '' : 'border-border-strong bg-secondary/30'}`}
                  data-testid={`filter-${key}-btn`}
                >
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {label}
                </Button>
              ))}
              {filterStatus !== 'all' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilterStatus('all')}
                  className="h-9 text-xs text-muted-foreground"
                  data-testid="clear-filter-btn"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Node List */}
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="no-nodes-found">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No nodes found</p>
              {(searchQuery || filterStatus !== 'all') && (
                <Button
                  variant="link"
                  onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                  className="text-primary text-sm mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin" data-testid="node-list">
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
          onSent={handleBroadcastSent}
        />
      )}
    </>
  );
}
