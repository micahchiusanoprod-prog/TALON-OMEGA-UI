import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Shield, ClipboardCheck, CheckCircle, XCircle, AlertTriangle,
  Copy, ChevronDown, ChevronUp, ExternalLink, RefreshCw, X,
  FileCode, Server, Layers, Activity, Database, Users, Radio,
  Key, Book, Wifi, MapPin, Clock, Info, Play
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useConnection, CONNECTION_STATES } from '../contexts/ConnectionContext';
import config, { getEndpointUrl } from '../config';

// ============================================================
// CAPABILITY COVERAGE / SELF-AUDIT PANEL
// Admin-only panel for development and QA
// ============================================================

// UI Inventory - All major UI areas
const UI_INVENTORY = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: 'src/components/Dashboard.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: 'N/A (aggregator)',
    owner: 'Core Team',
    description: 'Main dashboard layout and orchestration'
  },
  {
    id: 'ally-hub',
    name: 'Ally Communications Hub',
    path: 'src/components/AllyCommunicationsHub.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/api/ally/nodes, /api/ally/chat',
    owner: 'Comms Team',
    description: 'Inter-device mesh communication'
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    path: 'src/components/CommunityHub.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/community.py',
    owner: 'Community Team',
    description: 'Member roster, teams, bulletins'
  },
  {
    id: 'community-tile',
    name: 'Community Overview Tile',
    path: 'src/components/CommunityTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/community.py',
    owner: 'Community Team',
    description: 'Dashboard community summary'
  },
  {
    id: 'environment-tile',
    name: 'Environment Tile',
    path: 'src/components/EnvironmentTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/sensors.py',
    owner: 'Sensors Team',
    description: 'BME680 environmental readings'
  },
  {
    id: 'device-info',
    name: 'Device Info Tile',
    path: 'src/components/DeviceInfoTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/metrics.py',
    owner: 'Core Team',
    description: 'Pi system information'
  },
  {
    id: 'weather-tile',
    name: 'Weather Tile',
    path: 'src/components/WeatherTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/weather.py',
    owner: 'Core Team',
    description: 'Weather data and forecasts'
  },
  {
    id: 'hotspot-tile',
    name: 'Hotspot Tile',
    path: 'src/components/HotspotTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/api/hotspot/status',
    owner: 'Network Team',
    description: 'WiFi hotspot management'
  },
  {
    id: 'power-tile',
    name: 'Power Tile',
    path: 'src/components/PowerTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/power.py',
    owner: 'Hardware Team',
    description: 'Battery and power status'
  },
  {
    id: 'camera-tile',
    name: 'Camera Tile',
    path: 'src/components/CameraTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/camera.py',
    owner: 'Security Team',
    description: 'Camera feeds and controls'
  },
  {
    id: 'security-tile',
    name: 'Security Tile',
    path: 'src/components/SecurityTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/security.py',
    owner: 'Security Team',
    description: 'Security status and alerts'
  },
  {
    id: 'entertainment-tile',
    name: 'Entertainment Tile',
    path: 'src/components/EntertainmentTile.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: 'N/A (Kiwix)',
    owner: 'Content Team',
    description: 'Media and entertainment'
  },
  {
    id: 'logs-analytics',
    name: 'LOGS Analytics',
    path: 'src/components/LogsAnalytics.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/metrics.py',
    owner: 'Core Team',
    description: 'System logs and charts'
  },
  {
    id: 'admin-console',
    name: 'Admin Console',
    path: 'src/components/AdminConsole.jsx',
    dataMode: 'MOCK',
    plannedEndpoint: '/cgi-bin/admin.py',
    owner: 'Admin Team',
    description: 'Administrative controls'
  },
  {
    id: 'help-center',
    name: 'Help Center',
    path: 'src/components/HelpCenter.jsx',
    dataMode: 'STATIC',
    plannedEndpoint: 'N/A (static)',
    owner: 'Docs Team',
    description: 'User documentation'
  },
];

// Backend Endpoint Coverage
const BACKEND_ENDPOINTS = [
  { id: 'health', name: '/cgi-bin/health.py', description: 'System health check', required: true },
  { id: 'metrics', name: '/cgi-bin/metrics.py', description: 'CPU, RAM, disk metrics', required: true },
  { id: 'sensors', name: '/cgi-bin/sensors.py', description: 'BME680 sensor data', required: false },
  { id: 'backup', name: '/cgi-bin/backup.py', description: 'Backup list/verify/trigger', required: false },
  { id: 'keys', name: '/cgi-bin/keys.py', description: 'Key management', required: false },
  { id: 'keysync', name: '/cgi-bin/keysync.py', description: 'Key synchronization', required: false },
  { id: 'dm', name: '/cgi-bin/dm.py', description: 'Dead man switch', required: false },
  { id: 'gps', name: '/cgi-bin/gps.py', description: 'GPS location data', required: false },
];

// Feature Parity Checklist
const FEATURE_CHECKLIST = [
  {
    category: 'Operations',
    icon: Activity,
    items: [
      { name: 'Services/timers status visibility', status: 'MOCKED', components: ['DeviceInfoTile'], endpoint: '/cgi-bin/services.py', priority: 'P1' },
      { name: 'Connection quality indicator', status: 'IMPLEMENTED', components: ['ConnectionStatusChip'], endpoint: 'N/A (frontend)', priority: 'P0' },
      { name: 'Ops log/audit feed', status: 'MISSING', components: [], endpoint: '/cgi-bin/audit.py', priority: 'P2' },
    ]
  },
  {
    category: 'Backups',
    icon: Database,
    items: [
      { name: 'List backups', status: 'MOCKED', components: ['AdminConsole'], endpoint: '/cgi-bin/backup.py?action=list', priority: 'P1' },
      { name: 'Verify backup (sha256)', status: 'MISSING', components: [], endpoint: '/cgi-bin/backup.py?action=verify', priority: 'P2' },
      { name: 'Trigger backup', status: 'MOCKED', components: ['AdminConsole'], endpoint: '/cgi-bin/backup.py?action=trigger', priority: 'P1' },
      { name: 'Retention view', status: 'MISSING', components: [], endpoint: '/cgi-bin/backup.py?action=retention', priority: 'P2' },
    ]
  },
  {
    category: 'Mesh',
    icon: Radio,
    items: [
      { name: 'Outbox count', status: 'MOCKED', components: ['AllyCommunicationsHub'], endpoint: '/api/ally/outbox', priority: 'P1' },
      { name: 'Last import time', status: 'MISSING', components: [], endpoint: '/api/ally/sync', priority: 'P2' },
      { name: 'Peer count', status: 'MOCKED', components: ['AllyCommunicationsHub'], endpoint: '/api/ally/nodes', priority: 'P0' },
      { name: 'Sync pipeline visualization', status: 'MISSING', components: [], endpoint: '/api/ally/pipeline', priority: 'P2' },
    ]
  },
  {
    category: 'Keys/Security',
    icon: Key,
    items: [
      { name: 'Key version/epoch', status: 'MOCKED', components: ['SecurityTile'], endpoint: '/cgi-bin/keys.py', priority: 'P1' },
      { name: 'Last rotation time', status: 'MISSING', components: [], endpoint: '/cgi-bin/keys.py', priority: 'P2' },
      { name: 'Keys sync status', status: 'MOCKED', components: ['SecurityTile'], endpoint: '/cgi-bin/keysync.py', priority: 'P1' },
      { name: 'Admin export/stage actions', status: 'MISSING', components: [], endpoint: '/cgi-bin/keys.py?action=export', priority: 'P2' },
    ]
  },
  {
    category: 'Community',
    icon: Users,
    items: [
      { name: 'Roles/skill coverage', status: 'MOCKED', components: ['CommunityHub', 'CommunityTile'], endpoint: '/cgi-bin/community.py', priority: 'P0' },
      { name: 'Team builder', status: 'IMPLEMENTED', components: ['CommunityHub'], endpoint: 'N/A (frontend)', priority: 'P0' },
      { name: 'Profile team indicators', status: 'MISSING', components: [], endpoint: '/cgi-bin/community.py', priority: 'P1' },
      { name: 'Activity tracker', status: 'MISSING', components: [], endpoint: '/cgi-bin/community.py?action=activities', priority: 'P1' },
    ]
  },
  {
    category: 'Kiwix / Library',
    icon: Book,
    items: [
      { name: 'Kiwix base URL config', status: 'IMPLEMENTED', components: ['config.js'], endpoint: 'N/A (config)', priority: 'P0' },
      { name: 'Library.xml presence', status: 'MISSING', components: [], endpoint: 'KIWIX_BASE/library.xml', priority: 'P2' },
      { name: 'Content inventory', status: 'MISSING', components: [], endpoint: 'KIWIX_BASE/catalog', priority: 'P2' },
    ]
  },
  {
    category: 'Network',
    icon: Wifi,
    items: [
      { name: 'Hotspot status', status: 'MOCKED', components: ['HotspotTile'], endpoint: '/api/hotspot/status', priority: 'P0' },
      { name: 'Connected clients', status: 'MOCKED', components: ['HotspotTile'], endpoint: '/api/hotspot/clients', priority: 'P1' },
      { name: 'LAN IP display', status: 'MOCKED', components: ['DeviceInfoTile'], endpoint: '/cgi-bin/network.py', priority: 'P1' },
    ]
  },
  {
    category: 'GPS/Location',
    icon: MapPin,
    items: [
      { name: 'Current position', status: 'MOCKED', components: ['GPSMap'], endpoint: '/cgi-bin/gps.py', priority: 'P1' },
      { name: 'Breadcrumb trail', status: 'MOCKED', components: ['GPSMap'], endpoint: '/cgi-bin/gps.py?action=trail', priority: 'P2' },
      { name: 'Geofence alerts', status: 'MISSING', components: [], endpoint: '/cgi-bin/gps.py?action=geofence', priority: 'P2' },
    ]
  },
];

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    'IMPLEMENTED': 'bg-success/20 text-success border-success/30',
    'MOCKED': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    'MISSING': 'bg-destructive/20 text-destructive border-destructive/30',
    'PARTIAL': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'STATIC': 'bg-muted/40 text-muted-foreground border-muted-foreground/30',
    'LIVE': 'bg-success/20 text-success border-success/30',
    'MOCK': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${styles[status] || styles['MISSING']}`}>
      {status}
    </span>
  );
};

// Priority badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    'P0': 'bg-destructive/20 text-destructive',
    'P1': 'bg-amber-500/20 text-amber-500',
    'P2': 'bg-muted/40 text-muted-foreground',
  };
  
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${styles[priority] || styles['P2']}`}>
      {priority}
    </span>
  );
};

// Endpoint test result component
const EndpointResult = ({ endpoint, result }) => {
  const isOk = result?.status === 'ok';
  const isError = result?.status === 'error' || result?.status === 'timeout';
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono">{endpoint.name}</code>
          {endpoint.required && (
            <span className="text-[10px] text-destructive font-semibold">REQUIRED</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{endpoint.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {result?.responseTime && (
          <span className="text-xs text-muted-foreground">{result.responseTime}ms</span>
        )}
        {result ? (
          isOk ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <XCircle className="w-4 h-4 text-destructive" />
          )
        ) : (
          <Info className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default function AuditPanel({ isOpen, onClose }) {
  const connection = useConnection();
  const { checkEndpoint, config: connConfig = {} } = connection || {};
  const [expandedSections, setExpandedSections] = useState(['ui', 'endpoints', 'features']);
  const [endpointResults, setEndpointResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastTestTime, setLastTestTime] = useState(null);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Run endpoint tests
  const runEndpointTests = useCallback(async () => {
    setIsRunningTests(true);
    const results = {};
    
    for (const endpoint of BACKEND_ENDPOINTS) {
      try {
        const result = await checkEndpoint(endpoint.id);
        results[endpoint.id] = result;
      } catch (err) {
        results[endpoint.id] = { status: 'error', error: err.message };
      }
    }
    
    setEndpointResults(results);
    setLastTestTime(new Date().toISOString());
    setIsRunningTests(false);
    
    const passCount = Object.values(results).filter(r => r.status === 'ok').length;
    toast.success(`Endpoint test complete: ${passCount}/${BACKEND_ENDPOINTS.length} passed`);
  }, [checkEndpoint]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const implemented = FEATURE_CHECKLIST.flatMap(c => c.items).filter(i => i.status === 'IMPLEMENTED').length;
    const mocked = FEATURE_CHECKLIST.flatMap(c => c.items).filter(i => i.status === 'MOCKED').length;
    const missing = FEATURE_CHECKLIST.flatMap(c => c.items).filter(i => i.status === 'MISSING').length;
    const total = implemented + mocked + missing;
    
    return { implemented, mocked, missing, total };
  }, []);

  // Generate audit report JSON
  const generateAuditReport = useCallback(() => {
    const report = {
      meta: {
        generatedAt: new Date().toISOString(),
        buildVersion: config.build.version,
        buildTimestamp: config.build.timestamp,
      },
      runtime: {
        apiBase: connConfig.apiBase,
        kiwixBase: connConfig.kiwixBase,
        useMockData: connConfig.useMockData,
        environment: config.build.environment,
      },
      uiInventory: UI_INVENTORY.map(ui => ({
        id: ui.id,
        name: ui.name,
        path: ui.path,
        dataMode: ui.dataMode,
        plannedEndpoint: ui.plannedEndpoint,
      })),
      endpointTests: {
        lastRun: lastTestTime,
        results: Object.fromEntries(
          BACKEND_ENDPOINTS.map(ep => [
            ep.name,
            {
              status: endpointResults[ep.id]?.status || 'not_tested',
              responseTime: endpointResults[ep.id]?.responseTime,
              error: endpointResults[ep.id]?.error,
            }
          ])
        ),
      },
      featureParity: FEATURE_CHECKLIST.map(category => ({
        category: category.category,
        items: category.items.map(item => ({
          name: item.name,
          status: item.status,
          priority: item.priority,
          endpoint: item.endpoint,
          components: item.components,
        })),
      })),
      summary: stats,
    };
    
    return report;
  }, [connConfig, endpointResults, lastTestTime, stats]);

  // Copy audit report to clipboard
  const handleCopyReport = useCallback(() => {
    const report = generateAuditReport();
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() => toast.success('Audit report copied to clipboard'))
      .catch(() => toast.error('Failed to copy report'));
  }, [generateAuditReport]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <ClipboardCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Capability Coverage Audit</h2>
                <p className="text-sm text-muted-foreground">UI vs Backend Parity Report</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyReport} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Report
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
              <div className="text-2xl font-bold text-success">{stats.implemented}</div>
              <div className="text-xs text-muted-foreground">Implemented</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-2xl font-bold text-amber-500">{stats.mocked}</div>
              <div className="text-xs text-muted-foreground">Mocked</div>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
              <div className="text-2xl font-bold text-destructive">{stats.missing}</div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <div className="text-2xl font-bold text-primary">{Math.round((stats.implemented / stats.total) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Coverage</div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Section A: UI Inventory */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => toggleSection('ui')}
              className="w-full p-4 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-primary" />
                <span className="font-semibold">A) UI Inventory</span>
                <span className="text-xs text-muted-foreground">({UI_INVENTORY.length} components)</span>
              </div>
              {expandedSections.includes('ui') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.includes('ui') && (
              <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b border-border">
                  <div className="col-span-3">Page/Section</div>
                  <div className="col-span-4">Component Path</div>
                  <div className="col-span-2">Data Mode</div>
                  <div className="col-span-3">Planned Endpoint</div>
                </div>
                {UI_INVENTORY.map(ui => (
                  <div key={ui.id} className="grid grid-cols-12 gap-2 items-center py-2 text-sm border-b border-border/30 last:border-0">
                    <div className="col-span-3 font-medium">{ui.name}</div>
                    <div className="col-span-4">
                      <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{ui.path}</code>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={ui.dataMode} />
                    </div>
                    <div className="col-span-3 text-xs text-muted-foreground truncate" title={ui.plannedEndpoint}>
                      {ui.plannedEndpoint}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Backend Endpoint Coverage */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => toggleSection('endpoints')}
              className="w-full p-4 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-primary" />
                <span className="font-semibold">B) Backend Endpoint Coverage</span>
                <span className="text-xs text-muted-foreground">({BACKEND_ENDPOINTS.length} endpoints)</span>
              </div>
              {expandedSections.includes('endpoints') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.includes('endpoints') && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-muted-foreground">
                    {lastTestTime ? `Last tested: ${new Date(lastTestTime).toLocaleTimeString()}` : 'Not tested yet'}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={runEndpointTests} 
                    disabled={isRunningTests}
                    className="gap-2"
                  >
                    {isRunningTests ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Testing...</>
                    ) : (
                      <><Play className="w-4 h-4" /> Run Tests</>
                    )}
                  </Button>
                </div>
                <div className="space-y-1">
                  {BACKEND_ENDPOINTS.map(endpoint => (
                    <EndpointResult 
                      key={endpoint.id} 
                      endpoint={endpoint} 
                      result={endpointResults[endpoint.id]} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section C: Feature Parity Checklist */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => toggleSection('features')}
              className="w-full p-4 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-primary" />
                <span className="font-semibold">C) Feature Parity Checklist</span>
                <span className="text-xs text-muted-foreground">({stats.total} features)</span>
              </div>
              {expandedSections.includes('features') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.includes('features') && (
              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {FEATURE_CHECKLIST.map(category => {
                  const CategoryIcon = category.icon;
                  return (
                    <div key={category.category} className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        {category.category}
                      </h4>
                      <div className="ml-6 space-y-1">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm">{item.name}</span>
                                <StatusBadge status={item.status} />
                                <PriorityBadge priority={item.priority} />
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {item.components.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FileCode className="w-3 h-3" />
                                    {item.components.join(', ')}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  {item.endpoint}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Build: {config.build.version} • {new Date(config.build.timestamp).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Admin Only</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini button to link from System Status
export function AuditLinkButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
      data-testid="audit-link-btn"
    >
      <ClipboardCheck className="w-3.5 h-3.5" />
      View Audit Report
    </button>
  );
}
