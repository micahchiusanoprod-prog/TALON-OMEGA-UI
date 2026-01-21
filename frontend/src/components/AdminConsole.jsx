import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  RefreshCw, 
  Upload, 
  Clock, 
  RotateCcw, 
  FileText, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  BarChart3,
  HelpCircle,
  Shuffle,
  Users,
  Radio,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  ClipboardList,
  ClipboardCheck,
  Search,
  Database,
  Wifi,
  WifiOff,
  Activity,
  Book,
  Film,
  Terminal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import RosterSection from './RosterSection';
import { StatusGuidancePanel } from './ui/DataTileWrapper';

// Lazy load AuditPanel to avoid circular dependency
const AuditPanel = React.lazy(() => import('./AuditPanel'));

// ============================================
// MOCK DATA
// ============================================
const MOCK_NODES = [
  { id: 'omega-01', name: "Dad's OMEGA", version: '1.2.3', lastSeen: new Date(Date.now() - 60000), updateStatus: 'up-to-date' },
  { id: 'omega-02', name: "Mom's OMEGA", version: '1.2.2', lastSeen: new Date(Date.now() - 300000), updateStatus: 'update-available' },
  { id: 'omega-03', name: "Kids' OMEGA", version: '1.2.1', lastSeen: new Date(Date.now() - 120000), updateStatus: 'update-available' },
  { id: 'omega-04', name: "Backup OMEGA", version: '1.2.0', lastSeen: new Date(Date.now() - 7200000), updateStatus: 'offline' },
];

const LATEST_VERSION = '1.2.3';

// ============================================
// FLEET UPDATES SECTION
// ============================================
const FleetUpdatesSection = () => {
  const [nodes, setNodes] = useState(MOCK_NODES);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [updateAction, setUpdateAction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'up-to-date':
        return <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Up to date</span>;
      case 'update-available':
        return <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Update available</span>;
      case 'updating':
        return <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Updating...</span>;
      case 'offline':
        return <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" />Offline</span>;
      default:
        return null;
    }
  };

  const handleCheckVersions = () => {
    toast.success('Checking node versions...');
    // Mock refresh
    setTimeout(() => toast.success('All node versions checked'), 1500);
  };

  const handlePushUpdate = (type) => {
    setUpdateAction(type);
    setShowConfirmModal(true);
  };

  const confirmUpdate = () => {
    setIsUpdating(true);
    setShowConfirmModal(false);
    
    const targetNodes = updateAction === 'all' 
      ? nodes.filter(n => n.updateStatus === 'update-available')
      : nodes.filter(n => selectedNodes.includes(n.id) && n.updateStatus === 'update-available');
    
    // Simulate update process
    targetNodes.forEach(node => {
      setNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, updateStatus: 'updating' } : n
      ));
    });

    setTimeout(() => {
      setNodes(prev => prev.map(n => 
        targetNodes.find(t => t.id === n.id) 
          ? { ...n, version: LATEST_VERSION, updateStatus: 'up-to-date' } 
          : n
      ));
      setIsUpdating(false);
      toast.success(`Successfully updated ${targetNodes.length} node(s) to v${LATEST_VERSION}`);
    }, 3000);
  };

  const handleRollback = () => {
    toast.info('Rollback initiated - reverting to previous version...');
    setTimeout(() => toast.success('Rollback completed'), 2000);
  };

  const handleDownloadLogs = (nodeId) => {
    toast.success(`Downloading debug logs from ${nodeId}...`);
  };

  const toggleNodeSelection = (nodeId) => {
    setSelectedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCheckVersions} className="btn-apple">
          <RefreshCw className="w-4 h-4 mr-2" />
          Check Node Versions
        </Button>
        <Button onClick={() => handlePushUpdate('all')} className="btn-apple-primary" disabled={isUpdating}>
          <Upload className="w-4 h-4 mr-2" />
          Push Update to All
        </Button>
        <Button 
          onClick={() => handlePushUpdate('selected')} 
          className="btn-apple" 
          disabled={selectedNodes.length === 0 || isUpdating}
        >
          <Upload className="w-4 h-4 mr-2" />
          Push to Selected ({selectedNodes.length})
        </Button>
      </div>

      {/* Node Version Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
            <Settings className="w-4 h-4 text-primary" />
            Fleet Status
            <span className="text-xs text-muted-foreground ml-2">Latest: v{LATEST_VERSION}</span>
          </h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[500px]">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedNodes.length === nodes.filter(n => n.updateStatus !== 'offline').length}
                    onChange={(e) => setSelectedNodes(
                      e.target.checked 
                        ? nodes.filter(n => n.updateStatus !== 'offline').map(n => n.id)
                        : []
                    )}
                  />
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground">Node</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground">Version</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground">Last Seen</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.id} className="border-t border-border/30 hover:bg-white/5">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <input 
                      type="checkbox"
                      className="rounded"
                      checked={selectedNodes.includes(node.id)}
                      onChange={() => toggleNodeSelection(node.id)}
                      disabled={node.updateStatus === 'offline'}
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-sm">{node.name}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm">v{node.version}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground">{formatTime(node.lastSeen)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{getStatusBadge(node.updateStatus)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 sm:h-8 px-2 text-xs"
                      onClick={() => handleDownloadLogs(node.id)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Logs
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule & Rollback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Schedule Update Window
          </h4>
          <Input 
            type="datetime-local" 
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="input-apple"
          />
          <Button className="w-full btn-apple" disabled={!scheduleTime}>
            Schedule Update
          </Button>
        </div>
        <div className="glass rounded-2xl p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-warning" />
            Rollback Last Update
          </h4>
          <p className="text-xs text-muted-foreground">Revert all nodes to the previous version (v1.2.2)</p>
          <Button onClick={handleRollback} className="w-full btn-apple text-warning">
            <RotateCcw className="w-4 h-4 mr-2" />
            Rollback to v1.2.2
          </Button>
        </div>
      </div>

      {/* Update Notes */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Update Notes / Changelog
        </h4>
        <textarea
          value={updateNotes}
          onChange={(e) => setUpdateNotes(e.target.value)}
          placeholder="Enter changelog or notes for this update..."
          className="input-apple h-24 resize-none"
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Confirm Update</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm mb-6">
              You are about to push update v{LATEST_VERSION} to{' '}
              <span className="font-bold text-primary">
                {updateAction === 'all' 
                  ? `all ${nodes.filter(n => n.updateStatus === 'update-available').length} nodes`
                  : `${selectedNodes.length} selected node(s)`}
              </span>.
              Devices will restart after the update.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowConfirmModal(false)} className="flex-1 btn-apple">
                Cancel
              </Button>
              <Button onClick={confirmUpdate} className="flex-1 btn-apple-primary">
                <Upload className="w-4 h-4 mr-2" />
                Confirm Update
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {isUpdating && (
        <div className="glass rounded-2xl p-4 border border-primary/30">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div className="flex-1">
              <p className="font-medium">Update in Progress</p>
              <p className="text-xs text-muted-foreground">Please wait while nodes are being updated...</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// BROADCAST & ASSEMBLY SECTION
// ============================================
const BroadcastAssemblySection = () => {
  const [activeTab, setActiveTab] = useState('broadcast');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('info');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [quickQuestion, setQuickQuestion] = useState('');
  const [selectedRandomNode, setSelectedRandomNode] = useState(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);

  // Mock poll results
  const [pollResults, setPollResults] = useState([
    { option: 'North Ridge', votes: 3 },
    { option: 'Valley Camp', votes: 1 },
  ]);

  const tabs = [
    { id: 'broadcast', label: 'Mass Broadcast', icon: Send },
    { id: 'poll', label: 'Mass Poll', icon: BarChart3 },
    { id: 'question', label: 'Quick Tally', icon: HelpCircle },
    { id: 'random', label: 'Random Select', icon: Shuffle },
  ];

  const handleSendBroadcast = () => {
    setShowBroadcastConfirm(true);
  };

  const confirmBroadcast = () => {
    setShowBroadcastConfirm(false);
    toast.success(`Broadcast sent to all devices (${broadcastSeverity.toUpperCase()})`);
    setBroadcastMessage('');
  };

  const handleCreatePoll = () => {
    if (!pollQuestion || pollOptions.filter(o => o.trim()).length < 2) {
      toast.error('Please enter a question and at least 2 options');
      return;
    }
    toast.success('Poll sent to all devices');
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleQuickTally = () => {
    if (!quickQuestion) {
      toast.error('Please enter a question');
      return;
    }
    toast.success('Quick tally sent - awaiting responses');
    setQuickQuestion('');
  };

  const handleRandomSelect = () => {
    if (cooldownActive) return;
    
    const onlineNodes = MOCK_NODES.filter(n => n.updateStatus !== 'offline');
    const randomNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
    setSelectedRandomNode({
      ...randomNode,
      selectedAt: new Date()
    });
    setCooldownActive(true);
    setTimeout(() => setCooldownActive(false), 10000); // 10s cooldown
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/30 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`admin-tab-${tab.id}`}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* BROADCAST TAB */}
      {activeTab === 'broadcast' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Mass Broadcast Message</h3>
              <p className="text-xs text-muted-foreground">Send a message to all OMEGA devices</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Severity</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBroadcastSeverity('info')}
                  data-testid="broadcast-severity-info"
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    broadcastSeverity === 'info' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'btn-apple'
                  }`}
                >
                  INFO
                </button>
                <button
                  onClick={() => setBroadcastSeverity('urgent')}
                  data-testid="broadcast-severity-urgent"
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    broadcastSeverity === 'urgent' 
                      ? 'bg-destructive text-white' 
                      : 'btn-apple'
                  }`}
                >
                  URGENT
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter your broadcast message..."
                className="input-apple h-32 resize-none"
              />
            </div>

            <div className="glass rounded-xl p-3 bg-primary/5">
              <p className="text-xs text-muted-foreground">
                <strong>Device Behavior:</strong> {broadcastSeverity === 'urgent' 
                  ? 'Full-screen alert with audio notification. Requires user acknowledgment.'
                  : 'Standard notification card. Dismissible by user.'}
              </p>
            </div>

            <Button 
              onClick={handleSendBroadcast} 
              className="w-full btn-apple-primary"
              disabled={!broadcastMessage.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast to All Devices
            </Button>
          </div>
        </div>
      )}

      {/* POLL TAB */}
      {activeTab === 'poll' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Mass Prompted Poll</h3>
              <p className="text-xs text-muted-foreground">Create a poll and send to all devices</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
              <Input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="What should we do next?"
                className="input-apple"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Options</label>
              <div className="space-y-2">
                {pollOptions.map((option, i) => (
                  <Input
                    key={i}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[i] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="input-apple"
                  />
                ))}
              </div>
              {pollOptions.length < 6 && (
                <button 
                  onClick={addPollOption}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>

            <Button onClick={handleCreatePoll} className="w-full btn-apple-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Create & Send Poll
            </Button>
          </div>

          {/* Live Tally View */}
          <div className="border-t border-border/50 pt-4">
            <h4 className="text-sm font-semibold mb-3">Live Results (Demo)</h4>
            <div className="space-y-2">
              {pollResults.map((result, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{result.option}</span>
                    <span className="font-semibold">{result.votes} votes</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(result.votes / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUICK TALLY TAB */}
      {activeTab === 'question' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Quick Tally / Yes-No Question</h3>
              <p className="text-xs text-muted-foreground">Get quick responses from all devices</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
              <Input
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                placeholder="Are you ready to move out?"
                className="input-apple"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Devices will show simple YES / NO buttons for quick response.
            </p>

            <Button onClick={handleQuickTally} className="w-full btn-apple-primary">
              <Send className="w-4 h-4 mr-2" />
              Send Quick Tally
            </Button>
          </div>

          {/* Results Summary Demo */}
          <div className="border-t border-border/50 pt-4">
            <h4 className="text-sm font-semibold mb-3">Results Summary (Demo)</h4>
            <div className="flex gap-4">
              <div className="flex-1 glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-success">3</div>
                <div className="text-xs text-muted-foreground">YES</div>
              </div>
              <div className="flex-1 glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-destructive">1</div>
                <div className="text-xs text-muted-foreground">NO</div>
              </div>
              <div className="flex-1 glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-muted-foreground">0</div>
                <div className="text-xs text-muted-foreground">PENDING</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RANDOM SELECT TAB */}
      {activeTab === 'random' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shuffle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Random Node Selection</h3>
              <p className="text-xs text-muted-foreground">Randomly select a device from the network</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 bg-primary/5">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Filter:</strong> Online nodes only ({MOCK_NODES.filter(n => n.updateStatus !== 'offline').length} available)
            </p>
          </div>

          <Button 
            onClick={handleRandomSelect} 
            className="w-full btn-apple-primary"
            disabled={cooldownActive}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            {cooldownActive ? 'Cooldown Active (10s)' : 'Select Random Device'}
          </Button>

          {/* Selected Node Display */}
          {selectedRandomNode && (
            <div className="glass rounded-2xl p-6 border-2 border-primary/30 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">{selectedRandomNode.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Selected at {selectedRandomNode.selectedAt.toLocaleTimeString()}
                  </div>
                </div>
                {cooldownActive && (
                  <p className="text-xs text-warning">Re-roll available in 10 seconds</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Broadcast Confirmation Modal */}
      {showBroadcastConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                broadcastSeverity === 'urgent' ? 'bg-destructive/20' : 'bg-primary/20'
              }`}>
                <Send className={`w-6 h-6 ${broadcastSeverity === 'urgent' ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Confirm Broadcast</h3>
                <p className="text-sm text-muted-foreground">
                  {broadcastSeverity === 'urgent' ? 'URGENT - Full screen alert' : 'INFO - Standard notification'}
                </p>
              </div>
            </div>
            <div className="glass rounded-xl p-3 mb-4">
              <p className="text-sm">{broadcastMessage}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowBroadcastConfirm(false)} className="flex-1 btn-apple">
                Cancel
              </Button>
              <Button onClick={confirmBroadcast} className={`flex-1 ${
                broadcastSeverity === 'urgent' ? 'bg-destructive hover:bg-destructive/90 text-white' : 'btn-apple-primary'
              }`}>
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// SEARCH HEALTH SECTION (P1.3)
// ============================================
const SearchHealthSection = () => {
  const [kiwixStatus, setKiwixStatus] = useState({ 
    available: null, 
    lastCheck: null, 
    lastQuery: null,
    latency: null,
    error: null 
  });
  const [jellyfinStatus, setJellyfinStatus] = useState({
    configured: false,
    keyPresent: false
  });
  const [searchStats, setSearchStats] = useState({
    totalSearches: 127,
    averageLatency: 45,
    errorRate: 2.3,
    lastHour: 12
  });
  const [recentErrors, setRecentErrors] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  // Kiwix endpoints - RELATIVE URLs for nginx proxy
  const KIWIX_PRIMARY = '/kiwix';
  const KIWIX_FALLBACK = '/kiwix';

  // Check Kiwix API health
  const checkKiwixHealth = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      // Try primary endpoint first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${KIWIX_PRIMARY}/catalog/v2/entries`, {
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        setKiwixStatus({
          available: true,
          endpoint: KIWIX_PRIMARY,
          lastCheck: new Date(),
          lastQuery: new Date(),
          latency,
          error: null
        });
        toast.success(`Kiwix connected (${latency}ms)`);
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      // Try fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const fallbackResponse = await fetch(`${KIWIX_FALLBACK}/catalog/v2/entries`, {
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;
        
        if (fallbackResponse.ok) {
          setKiwixStatus({
            available: true,
            endpoint: KIWIX_FALLBACK,
            lastCheck: new Date(),
            lastQuery: new Date(),
            latency,
            error: null
          });
          toast.success(`Kiwix connected via fallback (${latency}ms)`);
        } else {
          throw new Error('Fallback also failed');
        }
      } catch (fallbackError) {
        setKiwixStatus({
          available: false,
          endpoint: null,
          lastCheck: new Date(),
          lastQuery: null,
          latency: null,
          error: error.message
        });
        setRecentErrors(prev => [{
          id: Date.now(),
          source: 'Kiwix',
          message: error.message,
          timestamp: new Date()
        }, ...prev].slice(0, 5));
        toast.error('Kiwix server unavailable');
      }
    }
    
    setIsChecking(false);
  };

  // Check Jellyfin configuration
  useEffect(() => {
    const jellyfinKey = process.env.REACT_APP_JELLYFIN_API_KEY;
    setJellyfinStatus({
      configured: !!jellyfinKey,
      keyPresent: !!jellyfinKey
    });
  }, []);

  // Check Kiwix on mount
  useEffect(() => {
    checkKiwixHealth();
  }, []);

  const getStatusColor = (available) => {
    if (available === null) return 'text-muted-foreground';
    return available ? 'text-success' : 'text-destructive';
  };

  const getStatusBg = (available) => {
    if (available === null) return 'bg-muted/50';
    return available ? 'bg-success/20' : 'bg-destructive/20';
  };

  return (
    <div className="space-y-6" data-testid="search-health-section">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{searchStats.totalSearches}</p>
          <p className="text-xs text-muted-foreground">Total Searches</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{searchStats.averageLatency}<span className="text-sm font-normal">ms</span></p>
          <p className="text-xs text-muted-foreground">Avg Latency</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{searchStats.errorRate}<span className="text-sm font-normal">%</span></p>
          <p className="text-xs text-muted-foreground">Error Rate</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Search className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
          <p className="text-2xl font-bold">{searchStats.lastHour}</p>
          <p className="text-xs text-muted-foreground">Last Hour</p>
        </div>
      </div>

      {/* Source Status Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Search Sources</h3>
        
        {/* Kiwix Status */}
        <div className={`glass rounded-xl p-4 border ${kiwixStatus.available ? 'border-success/30' : kiwixStatus.available === false ? 'border-destructive/30' : 'border-border'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${getStatusBg(kiwixStatus.available)}`}>
                <Book className={`w-5 h-5 ${getStatusColor(kiwixStatus.available)}`} />
              </div>
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  Kiwix Knowledge Base
                  {kiwixStatus.available === null && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {kiwixStatus.available === true && <CheckCircle className="w-4 h-4 text-success" />}
                  {kiwixStatus.available === false && <XCircle className="w-4 h-4 text-destructive" />}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {kiwixStatus.available ? 'Connected and serving articles' : 'Unavailable - library-level only'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={checkKiwixHealth}
              disabled={isChecking}
              className="text-xs"
            >
              {isChecking ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Retry
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Primary Endpoint</p>
              <code className="text-xs bg-secondary px-2 py-1 rounded">{KIWIX_PRIMARY}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fallback Endpoint</p>
              <code className="text-xs bg-secondary px-2 py-1 rounded">{KIWIX_FALLBACK}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Check</p>
              <p className="text-sm font-medium">{kiwixStatus.lastCheck?.toLocaleTimeString() || 'Never'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Latency</p>
              <p className="text-sm font-medium">{kiwixStatus.latency ? `${kiwixStatus.latency}ms` : 'N/A'}</p>
            </div>
          </div>
          
          {kiwixStatus.available === false && (
            <div className="mt-4">
              <StatusGuidancePanel 
                status="UNAVAILABLE" 
                customMessage="Cannot connect to Kiwix server. Article-level search is disabled." 
              />
            </div>
          )}
        </div>
        
        {/* Jellyfin Status */}
        <div className={`glass rounded-xl p-4 border ${jellyfinStatus.configured ? 'border-success/30' : 'border-blue-500/30'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${jellyfinStatus.configured ? 'bg-success/20' : 'bg-blue-500/20'}`}>
                <Film className={`w-5 h-5 ${jellyfinStatus.configured ? 'text-success' : 'text-blue-500'}`} />
              </div>
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  Jellyfin Media Library
                  {jellyfinStatus.configured ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-500 rounded">NOT_INDEXED</span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {jellyfinStatus.configured ? 'Media search enabled' : 'Requires API key configuration'}
                </p>
              </div>
            </div>
          </div>
          
          {!jellyfinStatus.configured && (
            <div className="mt-4">
              <StatusGuidancePanel status="NOT_INDEXED" />
              <div className="mt-3 p-3 glass rounded-lg">
                <h5 className="text-xs font-semibold mb-2">How to Enable Jellyfin Search</h5>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                    <span>Log into your Jellyfin server and go to <strong>Dashboard → API Keys</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                    <span>Create a new API key with a descriptive name (e.g., "OMEGA Dashboard")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
                    <span>Add to your environment: <code className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">REACT_APP_JELLYFIN_API_KEY=your_key_here</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">4</span>
                    <span>Restart the OMEGA Dashboard to apply changes</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
        
        {/* Commands Status */}
        <div className="glass rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20">
              <Terminal className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                Commands & Actions
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded">PLANNED</span>
              </h4>
              <p className="text-xs text-muted-foreground">Command execution will be available in a future update</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Errors</h3>
          <div className="glass rounded-xl divide-y divide-border">
            {recentErrors.map((error) => (
              <div key={error.id} className="p-3 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{error.source}</p>
                  <p className="text-xs text-muted-foreground">{error.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {error.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Index Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Index Statistics</h3>
        <div className="glass rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                <Book className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-muted-foreground">Kiwix Libraries</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">4</p>
              <p className="text-xs text-muted-foreground">Community Members</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-cyan-500 mb-1">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">23</p>
              <p className="text-xs text-muted-foreground">Shared Files</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                <Terminal className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">8</p>
              <p className="text-xs text-muted-foreground">Commands (Stub)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DATA HEALTH DASHBOARD (P2.0)
// ============================================

// Data source configuration
const DATA_SOURCES = [
  {
    id: 'omega-api',
    name: 'OMEGA Core API',
    endpoint: '/api/cgi-bin/health',
    port: 8093,
    icon: Activity,
    description: 'Main system health and metrics endpoint',
    category: 'core'
  },
  {
    id: 'kiwix',
    name: 'Kiwix Knowledge',
    endpoint: '/kiwix',
    fallback: '/kiwix',
    icon: Book,
    description: 'Offline knowledge base and article search',
    category: 'search'
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin Media',
    endpoint: (typeof window !== 'undefined' && window.OMEGA_CONFIG?.jellyfinBase) || 
              process.env.REACT_APP_JELLYFIN_URL || 
              (typeof window !== 'undefined' ? window.location.origin.replace(/:\d+$/, ':8096') : ':8096'),
    icon: Film,
    description: 'Media library for movies, TV, and music',
    category: 'search',
    requiresKey: true,
    keyName: 'REACT_APP_JELLYFIN_API_KEY'
  },
  {
    id: 'sensors',
    name: 'BME688 Sensors',
    endpoint: '/api/cgi-bin/sensors',
    icon: Activity,
    description: 'Temperature, humidity, pressure, and air quality',
    category: 'hardware'
  },
  {
    id: 'gps',
    name: 'GPS Location',
    endpoint: '/api/cgi-bin/gps',
    icon: Activity,
    description: 'GPS coordinates and altitude data',
    category: 'hardware'
  },
  {
    id: 'mesh',
    name: 'Mesh Network',
    endpoint: '/api/cgi-bin/mesh',
    icon: Radio,
    description: 'Inter-OMEGA mesh communication and heartbeat',
    category: 'network'
  },
  {
    id: 'hotspot',
    name: 'WiFi Hotspot',
    endpoint: '/api/cgi-bin/hotspot',
    icon: Wifi,
    description: 'Local WiFi hotspot status and connected clients',
    category: 'network'
  },
  {
    id: 'backup',
    name: 'Backup Service',
    endpoint: '/api/cgi-bin/backup',
    icon: Database,
    description: 'System backup status and last successful backup',
    category: 'system'
  }
];

// Generate 24-hour uptime history (mock for now)
const generateUptimeHistory = (sourceId) => {
  const history = [];
  const now = Date.now();
  const bucketSize = 15 * 60 * 1000; // 15 min buckets
  const buckets = 96; // 24 hours
  
  for (let i = buckets - 1; i >= 0; i--) {
    const timestamp = now - (i * bucketSize);
    // Generate realistic uptime data with occasional issues
    let status = 'up';
    const rand = Math.random();
    if (sourceId === 'kiwix' || sourceId === 'jellyfin') {
      // These are often unavailable in preview
      status = rand > 0.7 ? 'up' : rand > 0.3 ? 'unknown' : 'down';
    } else if (sourceId === 'gps') {
      // GPS can be flaky indoors
      status = rand > 0.5 ? 'up' : rand > 0.2 ? 'degraded' : 'unknown';
    } else {
      // Core services mostly up
      status = rand > 0.95 ? 'degraded' : rand > 0.02 ? 'up' : 'down';
    }
    history.push({ timestamp, status });
  }
  return history;
};

const UptimeBar = ({ history }) => {
  return (
    <div className="flex gap-0.5 h-6 rounded overflow-hidden" title="24-hour uptime (15-min buckets)">
      {history.map((bucket, i) => (
        <div
          key={i}
          className={`flex-1 min-w-[2px] ${
            bucket.status === 'up' ? 'bg-success' :
            bucket.status === 'degraded' ? 'bg-amber-500' :
            bucket.status === 'down' ? 'bg-destructive' :
            'bg-muted'
          }`}
          title={`${new Date(bucket.timestamp).toLocaleTimeString()} - ${bucket.status.toUpperCase()}`}
        />
      ))}
    </div>
  );
};

const DataHealthSection = () => {
  const [sources, setSources] = useState(() => 
    DATA_SOURCES.map(src => ({
      ...src,
      status: 'unknown',
      trustType: 'UNKNOWN',
      lastCheck: null,
      lastSuccess: null,
      latency: null,
      error: null,
      uptimeHistory: generateUptimeHistory(src.id)
    }))
  );
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState(null);

  // Check individual source
  const checkSource = async (sourceId) => {
    setSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, status: 'checking' } : s
    ));

    const source = sources.find(s => s.id === sourceId);
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      let endpoint = source.endpoint;
      if (source.id === 'kiwix') {
        endpoint = `${source.endpoint}/catalog/v2/entries`;
      }
      
      const response = await fetch(endpoint, {
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        setSources(prev => prev.map(s => 
          s.id === sourceId ? {
            ...s,
            status: 'live',
            trustType: 'VERIFIED',
            lastCheck: new Date(),
            lastSuccess: new Date(),
            latency,
            error: null
          } : s
        ));
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Try fallback for Kiwix
      if (source.fallback && source.id === 'kiwix') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${source.fallback}/catalog/v2/entries`, {
            signal: controller.signal,
            mode: 'cors'
          });
          
          clearTimeout(timeoutId);
          const latency = Date.now() - startTime;
          
          if (response.ok) {
            setSources(prev => prev.map(s => 
              s.id === sourceId ? {
                ...s,
                status: 'live',
                trustType: 'VERIFIED',
                lastCheck: new Date(),
                lastSuccess: new Date(),
                latency,
                error: null,
                activeEndpoint: source.fallback
              } : s
            ));
            return true;
          }
        } catch (fallbackError) {
          // Continue to error handling
        }
      }
      
      // Check if it requires a key and doesn't have one
      if (source.requiresKey && !process.env[source.keyName]) {
        setSources(prev => prev.map(s => 
          s.id === sourceId ? {
            ...s,
            status: 'not_configured',
            trustType: 'UNKNOWN',
            lastCheck: new Date(),
            error: `Missing ${source.keyName}`
          } : s
        ));
      } else {
        setSources(prev => prev.map(s => 
          s.id === sourceId ? {
            ...s,
            status: 'unavailable',
            trustType: 'UNKNOWN',
            lastCheck: new Date(),
            error: error.message
          } : s
        ));
      }
      return false;
    }
  };

  // Check all sources
  const checkAllSources = async () => {
    setIsCheckingAll(true);
    for (const source of sources) {
      await checkSource(source.id);
      // Small delay between checks
      await new Promise(r => setTimeout(r, 200));
    }
    setLastFullCheck(new Date());
    setIsCheckingAll(false);
    toast.success('Health check complete');
  };

  // Initial check on mount
  useEffect(() => {
    checkAllSources();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />LIVE</span>;
      case 'cached':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" />CACHED</span>;
      case 'stale':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />STALE</span>;
      case 'unavailable':
        return <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" />UNAVAILABLE</span>;
      case 'not_configured':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-xs font-medium flex items-center gap-1"><HelpCircle className="w-3 h-3" />NOT_CONFIGURED</span>;
      case 'checking':
        return <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />CHECKING</span>;
      case 'planned':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" />PLANNED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1"><HelpCircle className="w-3 h-3" />UNKNOWN</span>;
    }
  };

  const getTrustBadge = (trustType) => {
    switch (trustType) {
      case 'VERIFIED':
        return <span className="px-1.5 py-0.5 rounded bg-success/20 text-success text-[10px] font-medium">VERIFIED</span>;
      case 'DERIVED':
        return <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[10px] font-medium">DERIVED</span>;
      case 'ESTIMATED':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-medium">ESTIMATED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium">UNKNOWN</span>;
    }
  };

  const getHowToFix = (source) => {
    if (source.status === 'not_configured') {
      return [
        `Set the ${source.keyName} environment variable`,
        'Restart the OMEGA Dashboard to apply changes',
        'The service will be checked automatically on next refresh'
      ];
    }
    if (source.status === 'unavailable') {
      if (source.id === 'kiwix') {
        return [
          'Verify kiwix-serve is running on the Pi',
          'Check if /kiwix/ is accessible (nginx proxy)',
          'Ensure Kiwix server is running on port 8090',
          'Restart kiwix-serve if needed: sudo systemctl restart kiwix-serve'
        ];
      }
      return [
        'Check if the service is running',
        'Verify network connectivity',
        'Check system logs for errors',
        'Restart the service if needed'
      ];
    }
    return null;
  };

  // Calculate summary stats
  const liveCount = sources.filter(s => s.status === 'live').length;
  const unavailableCount = sources.filter(s => s.status === 'unavailable' || s.status === 'not_configured').length;
  const avgLatency = sources.filter(s => s.latency).reduce((acc, s) => acc + s.latency, 0) / (sources.filter(s => s.latency).length || 1);

  // Group sources by category
  const categories = {
    core: sources.filter(s => s.category === 'core'),
    search: sources.filter(s => s.category === 'search'),
    hardware: sources.filter(s => s.category === 'hardware'),
    network: sources.filter(s => s.category === 'network'),
    system: sources.filter(s => s.category === 'system')
  };

  // Generate debug bundle data
  const getDebugData = () => {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: sources.length,
        live: liveCount,
        unavailable: unavailableCount,
        avgLatency: Math.round(avgLatency)
      },
      sources: sources.map(s => ({
        id: s.id,
        name: s.name,
        endpoint: s.endpoint,
        status: s.status,
        trustType: s.trustType,
        lastCheck: s.lastCheck?.toISOString(),
        lastSuccess: s.lastSuccess?.toISOString(),
        latency: s.latency,
        error: s.error
      }))
    };
  };

  return (
    <div className="space-y-6" data-testid="data-health-section">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Data Health Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Real-time status of all OMEGA data sources and endpoints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={checkAllSources}
            disabled={isCheckingAll}
            data-testid="check-all-btn"
          >
            {isCheckingAll ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Check All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = getDebugData();
              navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              toast.success('Health data copied to clipboard');
            }}
            data-testid="copy-health-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold">{liveCount}/{sources.length}</p>
          <p className="text-xs text-muted-foreground">Sources Live</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <XCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold">{unavailableCount}</p>
          <p className="text-xs text-muted-foreground">Unavailable</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{Math.round(avgLatency)}<span className="text-sm font-normal">ms</span></p>
          <p className="text-xs text-muted-foreground">Avg Latency</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
          <p className="text-2xl font-bold">{lastFullCheck?.toLocaleTimeString() || '--'}</p>
          <p className="text-xs text-muted-foreground">Last Check</p>
        </div>
      </div>

      {/* Source Categories */}
      {Object.entries(categories).map(([category, categorySources]) => (
        categorySources.length > 0 && (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {category === 'core' ? 'Core Services' :
               category === 'search' ? 'Search Sources' :
               category === 'hardware' ? 'Hardware Sensors' :
               category === 'network' ? 'Network Services' :
               'System Services'}
            </h4>
            
            <div className="space-y-3">
              {categorySources.map(source => {
                const Icon = source.icon;
                const howToFix = getHowToFix(source);
                
                return (
                  <div 
                    key={source.id} 
                    className={`glass rounded-xl p-4 border ${
                      source.status === 'live' ? 'border-success/30' :
                      source.status === 'unavailable' || source.status === 'not_configured' ? 'border-destructive/30' :
                      'border-border'
                    }`}
                    data-testid={`source-${source.id}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          source.status === 'live' ? 'bg-success/20' :
                          source.status === 'unavailable' ? 'bg-destructive/20' :
                          source.status === 'not_configured' ? 'bg-blue-500/20' :
                          'bg-muted'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            source.status === 'live' ? 'text-success' :
                            source.status === 'unavailable' ? 'text-destructive' :
                            source.status === 'not_configured' ? 'text-blue-500' :
                            'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <h5 className="font-semibold flex items-center gap-2">
                            {source.name}
                            {getStatusBadge(source.status)}
                          </h5>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkSource(source.id)}
                        disabled={source.status === 'checking'}
                        className="text-xs"
                      >
                        {source.status === 'checking' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Provenance Strip */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-3 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Endpoint:</span>
                        <code className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">
                          {source.activeEndpoint || source.endpoint}
                        </code>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Last Check:</span>
                        <span className="font-medium">{source.lastCheck?.toLocaleTimeString() || 'Never'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Latency:</span>
                        <span className="font-medium">{source.latency ? `${source.latency}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Trust:</span>
                        {getTrustBadge(source.trustType)}
                      </div>
                    </div>
                    
                    {/* 24-Hour Uptime Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">24-Hour Uptime</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(source.uptimeHistory.filter(b => b.status === 'up').length / source.uptimeHistory.length * 100)}%
                        </span>
                      </div>
                      <UptimeBar history={source.uptimeHistory} />
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>24h ago</span>
                        <span>Now</span>
                      </div>
                    </div>
                    
                    {/* Error Display */}
                    {source.error && (
                      <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-lg mb-3">
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {source.error}
                        </p>
                      </div>
                    )}
                    
                    {/* How to Fix */}
                    {howToFix && (
                      <div className="p-3 glass rounded-lg">
                        <h6 className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          How to fix
                        </h6>
                        <ol className="space-y-1">
                          {howToFix.map((step, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-[9px] font-bold">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      ))}

      {/* Legend */}
      <div className="glass rounded-xl p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Status Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-xs">LIVE - Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-xs">CACHED - Recent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs">STALE/DEGRADED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span className="text-xs">UNAVAILABLE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted" />
            <span className="text-xs">UNKNOWN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-xs">CHECKING</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN ADMIN CONSOLE COMPONENT
// ============================================
export default function AdminConsole({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('fleet');
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-strong rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4 animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin Console</h2>
              <p className="text-sm text-muted-foreground">Fleet management & broadcasting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 p-4 border-b border-border/50 overflow-x-auto" data-testid="admin-section-tabs">
          <button
            onClick={() => setActiveSection('fleet')}
            data-testid="admin-section-fleet"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === 'fleet' 
                ? 'bg-primary text-primary-foreground' 
                : 'btn-apple'
            }`}
          >
            <Settings className="w-4 h-4" />
            Fleet Updates
          </button>
          <button
            onClick={() => setActiveSection('roster')}
            data-testid="admin-section-roster"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === 'roster' 
                ? 'bg-primary text-primary-foreground' 
                : 'btn-apple'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Roster & Readiness
          </button>
          <button
            onClick={() => setActiveSection('broadcast')}
            data-testid="admin-section-broadcast"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === 'broadcast' 
                ? 'bg-primary text-primary-foreground' 
                : 'btn-apple'
            }`}
          >
            <Radio className="w-4 h-4" />
            Broadcast & Assembly
          </button>
          <button
            onClick={() => setActiveSection('search')}
            data-testid="admin-section-search"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === 'search' 
                ? 'bg-primary text-primary-foreground' 
                : 'btn-apple'
            }`}
          >
            <Search className="w-4 h-4" />
            Search Health
          </button>
          <button
            onClick={() => setActiveSection('datahealth')}
            data-testid="admin-section-datahealth"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === 'datahealth' 
                ? 'bg-primary text-primary-foreground' 
                : 'btn-apple'
            }`}
          >
            <Activity className="w-4 h-4" />
            Data Health
          </button>
          <button
            onClick={() => setShowAuditPanel(true)}
            data-testid="admin-section-audit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap btn-apple bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
          >
            <ClipboardCheck className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500">Audit</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] scrollbar-thin">
          {activeSection === 'fleet' && <FleetUpdatesSection />}
          {activeSection === 'roster' && <RosterSection />}
          {activeSection === 'broadcast' && <BroadcastAssemblySection />}
          {activeSection === 'search' && <SearchHealthSection />}
          {activeSection === 'datahealth' && <DataHealthSection />}
        </div>
      </div>
    </div>
    
    {/* Audit Panel - Rendered separately to stack above admin console */}
    {showAuditPanel && (
      <React.Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"><div className="text-white">Loading...</div></div>}>
        <AuditPanel 
          isOpen={showAuditPanel}
          onClose={() => setShowAuditPanel(false)}
        />
      </React.Suspense>
    )}
    </>
  );
}
