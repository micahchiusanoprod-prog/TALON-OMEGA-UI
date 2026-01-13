import React, { useState } from 'react';
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
  ClipboardCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import RosterSection from './RosterSection';

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
        <div className="flex gap-2 p-4 border-b border-border/50 overflow-x-auto">
          <button
            onClick={() => setActiveSection('fleet')}
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
            onClick={() => setShowAuditPanel(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap btn-apple bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
            data-testid="audit-tab-btn"
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
