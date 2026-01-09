import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  ArrowUp,
  Printer,
  BookOpen,
  Zap,
  Wifi,
  WifiOff,
  MapPin,
  Radio,
  Server,
  HardDrive,
  Battery,
  Thermometer,
  MessageSquare,
  Film,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
  List,
  Terminal,
  Clock,
  Users,
  Compass,
  Monitor,
  Database,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

// ============================================================
// HELP CENTER CONTENT - FROM OMEGA FIELD MANUAL
// ============================================================

const CATEGORIES = [
  { 
    id: 'getting-started', 
    title: 'Getting Started', 
    icon: Zap, 
    description: 'Quick start guide (60 seconds)',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20'
  },
  { 
    id: 'cheat-sheet', 
    title: 'Cheat Sheet', 
    icon: FileText, 
    description: 'URLs, ports, services, data paths',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20'
  },
  { 
    id: 'installed-optional', 
    title: 'Installed vs Optional', 
    icon: List, 
    description: 'What\'s present vs what needs hardware',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20'
  },
  { 
    id: 'how-omega-works', 
    title: 'How OMEGA Works', 
    icon: Server, 
    description: 'Simple architecture overview',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20'
  },
  { 
    id: 'status-errors', 
    title: 'Status & Error Messages', 
    icon: AlertTriangle, 
    description: 'Understanding system states',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  { 
    id: 'kiwix', 
    title: 'Offline Library (Kiwix)', 
    icon: BookOpen, 
    description: 'What\'s installed in offline knowledge',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  { 
    id: 'communications', 
    title: 'Communications Hub', 
    icon: Radio, 
    description: 'LAN, Mesh, Radio, SMS explained',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  { 
    id: 'maps-gps', 
    title: 'Maps & GPS', 
    icon: MapPin, 
    description: 'Fix states and troubleshooting',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  { 
    id: 'sensors', 
    title: 'Sensors & Environment', 
    icon: Thermometer, 
    description: 'BME680 and analog expansion',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  },
  { 
    id: 'media', 
    title: 'Media (OMEGA Netflix)', 
    icon: Film, 
    description: 'Jellyfin and streaming',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  { 
    id: 'admin', 
    title: 'Admin Console (Operator)', 
    icon: Shield, 
    description: 'Administrative capabilities',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  { 
    id: 'power', 
    title: 'Power & Runtime', 
    icon: Battery, 
    description: 'Honest math and scenarios',
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/20'
  },
  { 
    id: 'troubleshooting', 
    title: 'Troubleshooting Textbook', 
    icon: RefreshCw, 
    description: 'Quick fix index',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20'
  },
  { 
    id: 'glossary', 
    title: 'Glossary', 
    icon: HelpCircle, 
    description: 'Plain English definitions',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20'
  },
  { 
    id: 'appendix', 
    title: 'Appendix', 
    icon: Database, 
    description: 'What\'s estimated vs exact',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20'
  },
];

// Quick Fix entries for the "Need help fast?" panel
const QUICK_FIXES = [
  { id: 'cant-connect', label: "I can't connect", target: 'troubleshooting', symptom: 'wifi' },
  { id: 'wont-load', label: "Dashboard won't load", target: 'troubleshooting', symptom: 'dashboard' },
  { id: 'degraded', label: "Something says Degraded/Unavailable", target: 'installed-optional', symptom: 'degraded' },
];

// Troubleshooting entries
const TROUBLESHOOTING_ENTRIES = [
  {
    id: 'wifi',
    title: "A) Can't connect to OMEGA Wi-Fi",
    symptom: "You can't see the network or it won't join.",
    causes: ["Hotspot off", "Wrong password", "Too far away", "Device stuck on another network"],
    basicFix: [
      "Move closer to the case",
      "Forget the network on your phone/laptop, re-join",
      "Check if you see the OMEGA SSID in available networks"
    ],
    operatorFix: "Toggle hotspot ON and verify SSID is broadcasting",
    verify: "Dashboard opens in browser"
  },
  {
    id: 'dashboard',
    title: "B) Dashboard won't load",
    symptom: '"Site can\'t be reached" or blank page.',
    causes: ["Not connected to OMEGA network", "Wrong address", "Web root issue"],
    basicFix: [
      "Confirm you're on OMEGA Wi-Fi/LAN",
      "Use gateway IP fallback (from Wi-Fi details)",
      "Try: http://talon.local/"
    ],
    operatorFix: "curl http://127.0.0.1:8093/cgi-bin/health.py",
    verify: "HTML loads and health JSON returns"
  },
  {
    id: 'health-red',
    title: "C) Health is RED / Backend down",
    symptom: "Tiles error, health endpoint fails.",
    causes: ["omega-community stopped", "Storage full", "CGI error"],
    basicFix: [
      "Wait 30 seconds and refresh",
      "Check if other devices can access dashboard"
    ],
    operatorFix: "systemctl status omega-community --no-pager -l\nIf inactive: sudo systemctl restart omega-community\nCheck disk: df -h",
    verify: "curl http://127.0.0.1:8093/cgi-bin/health.py returns OK"
  },
  {
    id: 'kiwix-down',
    title: "D) Kiwix library won't open",
    symptom: "Library page won't load or returns errors.",
    causes: ["Kiwix down", "Missing ZIM files", "Library registry mismatch"],
    basicFix: [
      "Try http://talon.local:8090/ directly",
      "Wait 1 minute and retry"
    ],
    operatorFix: "curl -I http://127.0.0.1:8090/ | head\nConfirm ZIMs exist: ls /srv/kiwix/data/\nConfirm registry: cat /srv/kiwix/library/library.xml",
    verify: "Kiwix homepage loads and a known title opens"
  },
  {
    id: 'gps',
    title: "E) GPS No Fix / Stale",
    symptom: "No fix, old coordinates, accuracy never improves.",
    causes: ["Indoors", "GPS unplugged", "Endpoint failure"],
    basicFix: [
      "Move outdoors for 2–3 min",
      "Move near a window with clear sky view",
      "Re-seat GPS dongle"
    ],
    operatorFix: "Check gps.py endpoint output:\ncurl http://127.0.0.1:8093/cgi-bin/gps.py",
    verify: "GPS timestamp updates and accuracy becomes reasonable"
  },
  {
    id: 'sensors',
    title: "F) Sensors missing",
    symptom: "Sensor tile empty or error.",
    causes: ["I2C wiring", "Bus config", "Permission issues", "Endpoint failure"],
    basicFix: [
      "Check if sensor hardware is connected",
      "Verify wiring (3.3V/GND/SDA/SCL)"
    ],
    operatorFix: "Check sensors.py output:\ncurl http://127.0.0.1:8093/cgi-bin/sensors.py\ni2cdetect -y 1",
    verify: "Sensor values update"
  },
  {
    id: 'mesh',
    title: "G) Mesh/LoRa degraded",
    symptom: "Mesh shows degraded/unavailable.",
    causes: ["Radio unplugged", "USB serial instability", "Device wedged"],
    basicFix: [
      "Replug the Meshtastic node",
      "Wait 30 seconds for reconnection"
    ],
    operatorFix: "Confirm device node exists:\nls /dev/ttyACM*\nCheck USB autosuspend, cables, power stability",
    verify: "Mesh returns Available and endpoint responds"
  },
  {
    id: 'slow',
    title: "H) System slow",
    symptom: "Lag, timeouts, UI unresponsive.",
    causes: ["Disk nearly full", "Heavy streaming", "Runaway logs", "High CPU"],
    basicFix: [
      "Close streaming (Jellyfin) temporarily",
      "Reduce number of connected devices"
    ],
    operatorFix: "df -h\ntop\nIdentify large directories under /srv and clean safely",
    verify: "Health stabilizes and UI is responsive"
  },
  {
    id: 'backup',
    title: "I) Backups failing",
    symptom: "Health says backup not OK.",
    causes: ["No space", "Destination not writable", "Permissions"],
    basicFix: [
      "Check if backup destination is connected",
      "Free up space if possible"
    ],
    operatorFix: "Read backup logs:\njournalctl -u omega-backup --no-pager -l\nEnsure backup destination mounted + has free space",
    verify: "Health shows backup OK and timestamp recent"
  },
];

// Glossary terms
const GLOSSARY = [
  { term: 'Dashboard', definition: 'The local website you use to operate OMEGA.' },
  { term: 'Backend / API', definition: 'Local server on port 8093 that provides JSON endpoints (chat, gps, sensors, etc.).' },
  { term: 'Kiwix', definition: 'Offline library server that serves ZIM files.' },
  { term: 'ZIM', definition: 'Offline archive format used by Kiwix.' },
  { term: 'Hotspot', definition: 'Wi-Fi network hosted by OMEGA.' },
  { term: 'Available/Degraded/Unavailable', definition: 'Green/Yellow/Red states indicating capability.' },
  { term: 'GPS Fix', definition: 'A valid satellite location solution (No Fix / 2D / 3D).' },
  { term: 'IAQ', definition: 'Indoor Air Quality estimate (trend indicator, not medical-grade).' },
  { term: 'Mesh/LoRa', definition: 'Long-range, low-bandwidth radio network with relays.' },
  { term: 'SDR', definition: 'Software-defined radio monitoring.' },
];

// Communication methods
const COMMS_METHODS = [
  {
    id: 'lan',
    name: 'LAN / Wi-Fi',
    whatItIs: 'Normal local connection to OMEGA (like home Wi-Fi).',
    howItWorks: 'Your phone/laptop connects to OMEGA hotspot/LAN.',
    analogy: '"Same building internet."',
    useWhen: 'You are near OMEGA and want speed (library, files, streaming).',
    statusColors: { available: 'Green', degraded: 'Yellow', unavailable: 'Red' }
  },
  {
    id: 'mesh',
    name: 'Mesh / LoRa',
    whatItIs: 'Long-range, low-bandwidth radio messaging that can hop between nodes.',
    howItWorks: 'Each node relays messages so the network covers more area.',
    analogy: '"Walkie-talkies that can repeat each other."',
    useWhen: 'The group is spread out; you need check-ins, short messages, and GPS pings.',
    statusColors: { available: 'Green', degraded: 'Yellow', unavailable: 'Red' }
  },
  {
    id: 'radio',
    name: 'Radio / SDR',
    whatItIs: 'Radio monitoring/receive tools (situational awareness).',
    howItWorks: 'A radio front-end digitizes signals; software decodes/monitors.',
    analogy: '"A universal scanner + decoder."',
    useWhen: 'Monitoring signals, not normal group chat.',
    statusColors: { available: 'Green', degraded: 'Yellow', unavailable: 'Red' }
  },
  {
    id: 'sms',
    name: 'SMS Gateway (optional)',
    whatItIs: 'Bridge from OMEGA messages to cellular SMS (needs modem + service).',
    howItWorks: 'OMEGA sends messages through a cellular modem when available.',
    analogy: '"OMEGA texting the outside world."',
    useWhen: 'Cell service exists and you must reach non-OMEGA people.',
    statusColors: { available: 'Green', degraded: 'Yellow', unavailable: 'Red' },
    optional: true
  },
  {
    id: 'hf',
    name: 'HF Radio Bridge (optional/advanced)',
    whatItIs: 'Very long-range radio messaging using HF equipment.',
    howItWorks: 'Uses ionospheric propagation for global reach.',
    analogy: '"Global-range radio mail—slow but far."',
    useWhen: 'Everything else is down and you need long-distance comms.',
    statusColors: { available: 'Green', degraded: 'Yellow', unavailable: 'Red' },
    optional: true,
    advanced: true
  },
];

// Kiwix library content
const KIWIX_CONTENT = {
  coreReference: [
    { name: 'Wikipedia (EN, full)', desc: 'General encyclopedia' },
    { name: 'Wikipedia Simple (EN)', desc: 'Simpler reading level' },
    { name: 'Wiktionary (EN, nopic)', desc: 'Dictionary/definitions' },
    { name: 'Wikiquote (EN, full)', desc: 'Quotations/cultural refs' },
    { name: 'Wikinews (EN, full)', desc: 'Archived news reference' },
  ],
  medical: [
    { name: 'Wikipedia Medicine (EN)', desc: 'Medical subset optimized for health topics' },
    { name: 'WikEM (EN, nopic)', desc: 'Emergency medicine reference' },
  ],
  education: [
    { name: 'Khan Academy (EN)', desc: 'Structured lessons' },
    { name: 'PhET (EN)', desc: 'Interactive science simulations' },
    { name: 'Wikibooks (EN, full)', desc: 'Textbook-style manuals' },
    { name: 'Wikiversity (EN, full)', desc: 'Courses/learning projects' },
    { name: 'Appropedia (EN)', desc: 'Practical DIY + sustainability' },
  ],
  repair: [
    { name: 'iFixit', desc: 'Repair guides/teardowns' },
    { name: 'ArchWiki (EN)', desc: 'Linux/systems reference' },
    { name: 'DevDocs (offline)', desc: 'Developer docs' },
  ],
  travel: [
    { name: 'Wikivoyage (EN)', desc: 'Travel/geography reference' },
    { name: 'OpenStreetMap Wiki (EN)', desc: 'Mapping documentation' },
  ],
  books: [
    { name: 'Wikisource (EN, full)', desc: 'Primary/public-domain texts' },
    { name: 'Project Gutenberg (EN)', desc: 'Public domain books' },
    { name: 'TED (multi-language)', desc: 'Talks/learning/morale' },
  ],
};

// ============================================================
// COMPONENTS
// ============================================================

// Operator Only Callout
const OperatorOnly = ({ children }) => (
  <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
    <div className="flex items-center gap-2 mb-2">
      <Terminal className="w-4 h-4 text-amber-400" />
      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Operator Only</span>
    </div>
    <pre className="text-xs text-amber-200/90 whitespace-pre-wrap font-mono bg-black/30 p-2 rounded overflow-x-auto">
      {children}
    </pre>
  </div>
);

// Accordion Item
const AccordionItem = ({ title, children, defaultOpen = false, id }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="glass rounded-xl overflow-hidden" id={id}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-sm">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// Category Card
const CategoryCard = ({ category, onClick }) => {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-4 text-left hover:bg-white/10 transition-all group"
      data-testid={`category-${category.id}`}
    >
      <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${category.color}`} />
      </div>
      <h3 className="font-bold text-sm mb-1">{category.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
    </button>
  );
};

// Troubleshooting Entry
const TroubleshootingEntry = ({ entry }) => (
  <AccordionItem title={entry.title} id={`trouble-${entry.id}`}>
    <div className="space-y-3">
      {/* Symptom */}
      <div>
        <span className="text-xs font-bold text-red-400 uppercase">Symptom</span>
        <p className="text-sm mt-1">{entry.symptom}</p>
      </div>
      
      {/* Likely Causes */}
      <div>
        <span className="text-xs font-bold text-amber-400 uppercase">Likely Causes</span>
        <ul className="text-sm mt-1 space-y-1">
          {entry.causes.map((cause, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              {cause}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Try This First */}
      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase">Try This First</span>
        <ol className="text-sm mt-1 space-y-1">
          {entry.basicFix.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      
      {/* Operator Only */}
      {entry.operatorFix && (
        <OperatorOnly>{entry.operatorFix}</OperatorOnly>
      )}
      
      {/* Verify */}
      <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/10">
        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs font-bold text-primary uppercase">Verify</span>
          <p className="text-sm">{entry.verify}</p>
        </div>
      </div>
    </div>
  </AccordionItem>
);

// Communication Method Card
const CommsCard = ({ method }) => (
  <div className="glass rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-bold text-sm">{method.name}</h4>
      <div className="flex gap-1">
        {method.optional && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Optional</span>
        )}
        {method.advanced && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Advanced</span>
        )}
      </div>
    </div>
    
    <div className="grid grid-cols-1 gap-2 text-xs">
      <div>
        <span className="text-muted-foreground">What it is:</span>
        <p className="text-foreground">{method.whatItIs}</p>
      </div>
      <div>
        <span className="text-muted-foreground">How it works:</span>
        <p className="text-foreground">{method.howItWorks}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Analogy:</span>
        <p className="text-foreground italic">{method.analogy}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Use when:</span>
        <p className="text-foreground">{method.useWhen}</p>
      </div>
    </div>
    
    {/* Status Colors */}
    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-success" />
        <span className="text-[10px] text-muted-foreground">Available</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-warning" />
        <span className="text-[10px] text-muted-foreground">Degraded</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-destructive" />
        <span className="text-[10px] text-muted-foreground">Unavailable</span>
      </div>
    </div>
  </div>
);

// Copy button
const CopyButton = ({ text }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  return (
    <button 
      onClick={handleCopy}
      className="p-1 hover:bg-white/10 rounded transition-colors"
      title="Copy"
    >
      <Copy className="w-3 h-3 text-muted-foreground" />
    </button>
  );
};

// ============================================================
// MAIN HELP CENTER COMPONENT
// ============================================================

export default function HelpCenter({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);
  
  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowBackToTop(contentRef.current.scrollTop > 400);
      }
    };
    
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);
  
  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(`help-${sectionId}`);
    if (element && contentRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Scroll to top
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    const results = {
      categories: CATEGORIES.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query)
      ),
      troubleshooting: TROUBLESHOOTING_ENTRIES.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.symptom.toLowerCase().includes(query) ||
        t.causes.some(c => c.toLowerCase().includes(query))
      ),
      glossary: GLOSSARY.filter(g =>
        g.term.toLowerCase().includes(query) ||
        g.definition.toLowerCase().includes(query)
      ),
      comms: COMMS_METHODS.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.whatItIs.toLowerCase().includes(query)
      )
    };
    
    const totalCount = results.categories.length + results.troubleshooting.length + 
                       results.glossary.length + results.comms.length;
    
    return { ...results, totalCount };
  }, [searchQuery]);
  
  // Print handler
  const handlePrint = () => {
    window.print();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background" data-testid="help-center">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Help Center</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">OMEGA Field Manual</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="hidden sm:flex gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="gap-2"
                data-testid="help-center-close"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the manual... (wifi, gps, mesh, backup, kiwix, sensors)"
              className="pl-10 h-11 bg-secondary/50"
              data-testid="help-search"
            />
            {searchResults && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {searchResults.totalCount} results
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div 
        ref={contentRef}
        className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin"
      >
        <div className="container mx-auto px-4 py-6 space-y-8">
          
          {/* Search Results */}
          {searchResults ? (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Search Results for "{searchQuery}"</h2>
              
              {searchResults.totalCount === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-2">No results found</p>
                  <p className="text-sm text-muted-foreground">Try searching for: wifi, gps, backup, kiwix, or sensors</p>
                </div>
              ) : (
                <>
                  {searchResults.categories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Categories</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {searchResults.categories.map(cat => (
                          <CategoryCard key={cat.id} category={cat} onClick={() => {
                            setSearchQuery('');
                            setTimeout(() => scrollToSection(cat.id), 100);
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.troubleshooting.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Troubleshooting</h3>
                      <div className="space-y-2">
                        {searchResults.troubleshooting.map(entry => (
                          <TroubleshootingEntry key={entry.id} entry={entry} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.glossary.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Glossary</h3>
                      <div className="glass rounded-xl divide-y divide-border/50">
                        {searchResults.glossary.map(term => (
                          <div key={term.term} className="p-3">
                            <span className="font-semibold text-sm">{term.term}</span>
                            <p className="text-xs text-muted-foreground mt-1">{term.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.comms.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Communications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.comms.map(method => (
                          <CommsCard key={method.id} method={method} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <Button variant="outline" onClick={() => setSearchQuery('')} className="w-full">
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Need Help Fast? Panel */}
              <div className="glass-strong rounded-2xl p-4 border-2 border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="font-bold">Need help fast?</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {QUICK_FIXES.map(fix => (
                    <button
                      key={fix.id}
                      onClick={() => scrollToSection(fix.target)}
                      className="glass rounded-xl p-3 text-left hover:bg-primary/20 transition-colors group"
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {fix.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground inline ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Category Cards */}
              <div>
                <h2 className="text-lg font-bold mb-4">Browse by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CATEGORIES.map(category => (
                    <CategoryCard 
                      key={category.id} 
                      category={category} 
                      onClick={() => scrollToSection(category.id)}
                    />
                  ))}
                </div>
              </div>
              
              {/* ============================================================ */}
              {/* SECTIONS */}
              {/* ============================================================ */}
              
              {/* 1. Getting Started */}
              <section id="help-getting-started" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Getting Started (60 seconds)
                </h2>
                <div className="glass rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">1</span>
                        <div>
                          <h4 className="font-semibold">Power On</h4>
                          <p className="text-sm text-muted-foreground">Power the OMEGA unit. Wait 30–60 seconds for services to come up.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">2</span>
                        <div>
                          <h4 className="font-semibold">Connect Your Device</h4>
                          <p className="text-sm text-muted-foreground">Join the OMEGA Wi-Fi hotspot (or LAN/Ethernet). Open a browser.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">3</span>
                        <div>
                          <h4 className="font-semibold">Open the Dashboard</h4>
                          <p className="text-sm text-muted-foreground">Go to: <code className="text-primary">http://talon.local/</code></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">4</span>
                        <div>
                          <h4 className="font-semibold">Confirm Health</h4>
                          <p className="text-sm text-muted-foreground">Check: <code className="text-primary">http://talon.local:8093/cgi-bin/health.py</code></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* 2. Cheat Sheet */}
              <section id="help-cheat-sheet" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Cheat Sheet
                </h2>
                <div className="space-y-4">
                  {/* Primary URLs */}
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 text-cyan-400">Primary URLs</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Dashboard UI:</span>
                          <span className="ml-2 text-primary">http://talon.local/</span>
                        </div>
                        <CopyButton text="http://talon.local/" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Offline Library:</span>
                          <span className="ml-2 text-primary">http://talon.local:8090/</span>
                        </div>
                        <CopyButton text="http://talon.local:8090/" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Community API:</span>
                          <span className="ml-2 text-primary">http://talon.local:8093/</span>
                        </div>
                        <CopyButton text="http://talon.local:8093/" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Health Check:</span>
                          <span className="ml-2 text-primary">http://talon.local:8093/cgi-bin/health.py</span>
                        </div>
                        <CopyButton text="http://talon.local:8093/cgi-bin/health.py" />
                      </div>
                    </div>
                  </div>
                  
                  {/* On-Device Data Locations */}
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 text-cyan-400">On-Device Data Locations</h3>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Community data:</span>
                          <span className="ml-2">/srv/omega/community/data</span>
                        </div>
                        <CopyButton text="/srv/omega/community/data" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">CGI endpoints:</span>
                          <span className="ml-2">/srv/omega/community/cgi-bin</span>
                        </div>
                        <CopyButton text="/srv/omega/community/cgi-bin" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Mesh outbox:</span>
                          <span className="ml-2">/srv/omega/mesh/outbox</span>
                        </div>
                        <CopyButton text="/srv/omega/mesh/outbox" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Kiwix ZIM data:</span>
                          <span className="ml-2">/srv/kiwix/data/</span>
                        </div>
                        <CopyButton text="/srv/kiwix/data/" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <div>
                          <span className="text-muted-foreground">Kiwix registry:</span>
                          <span className="ml-2">/srv/kiwix/library/library.xml</span>
                        </div>
                        <CopyButton text="/srv/kiwix/library/library.xml" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Core Services */}
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 text-cyan-400">Core Services (systemd)</h3>
                    <div className="flex flex-wrap gap-2">
                      {['omega-community', 'omega-backup', 'omega-mesh-import', 'omega-backup-sync', 'omega-keys-rotate', 'omega-health-watch'].map(service => (
                        <span key={service} className="px-2 py-1 rounded bg-black/30 font-mono text-xs">{service}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Fast Operator Checks */}
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <h3 className="font-semibold text-amber-400">Fast Operator Checks</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Operator Only</span>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <code>systemctl status omega-community --no-pager -l</code>
                        <CopyButton text="systemctl status omega-community --no-pager -l" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <code>curl -fsS http://127.0.0.1:8093/cgi-bin/health.py | head</code>
                        <CopyButton text="curl -fsS http://127.0.0.1:8093/cgi-bin/health.py | head" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <code>curl -I http://127.0.0.1:8090/ | head</code>
                        <CopyButton text="curl -I http://127.0.0.1:8090/ | head" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                        <code>df -h</code>
                        <CopyButton text="df -h" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* 3. Installed vs Optional */}
              <section id="help-installed-optional" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <List className="w-5 h-5 text-amber-400" />
                  Installed vs Optional
                </h2>
                <div className="glass rounded-xl p-4 mb-4 bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm">
                    <strong>Important:</strong> A tile can be visible even if its required hardware isn't installed yet. That's not "broken"—it's "not present." If something shows "Unavailable," first check whether the required hardware exists before troubleshooting software.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Installed and Verified
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      {[
                        'Dashboard UI (local web UI)',
                        'OMEGA Community backend on port 8093',
                        'Health + Metrics endpoints',
                        'GPS endpoint',
                        'Sensors endpoint (BME680 pipeline)',
                        'Backups system + retention',
                        'Mesh tooling (outbox/import pipeline)',
                        'Samba "media" share (LAN file sharing)',
                        'Kiwix server on port 8090 with ZIM library'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-success">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Optional / Depends on Build
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      {[
                        'Jellyfin "OMEGA Netflix" (media server)',
                        'SDR tooling / radio monitoring workflows',
                        'SMS gateway bridging (needs modem + service)',
                        'HF radio bridge (advanced gear + protocols)',
                        'Fleet update system (admin-managed updates)'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning">○</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* 4. How OMEGA Works */}
              <section id="help-how-omega-works" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-violet-400" />
                  How OMEGA Works
                </h2>
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-4">OMEGA is a local server you carry.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-violet-500/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        The UI (Dashboard)
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• A local website served from the Pi</li>
                        <li>• Polls local endpoints (JSON) for live status</li>
                        <li>• Shows sensors, GPS, comms, etc.</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-violet-500/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        The Backend (Community API)
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Runs on port 8093 via omega-community</li>
                        <li>• Provides JSON endpoints: health.py, metrics.py, gps.py, sensors.py</li>
                        <li>• Includes: chat, polls, files, keys, mesh, backup</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-violet-500/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Offline Library (Kiwix)
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Runs on port 8090</li>
                        <li>• Serves ZIM files from /srv/kiwix/data/</li>
                        <li>• Registered in library.xml</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-violet-500/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        Media (OMEGA Netflix)
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• If enabled: Jellyfin (local streaming)</li>
                        <li>• In emergencies: deprioritize streaming</li>
                        <li>• Preserves bandwidth + power</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* 5. Status & Error Messages */}
              <section id="help-status-errors" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Status & Error Messages
                </h2>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Status Colors</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success" />
                        <span className="text-sm"><strong>Available</strong> = Working normally</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-warning" />
                        <span className="text-sm"><strong>Degraded</strong> = Partially working</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-destructive" />
                        <span className="text-sm"><strong>Unavailable</strong> = Not working or not installed</span>
                      </div>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">What Good Error Messages Include</h3>
                    <ul className="text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        What failed (plain English)
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        Most likely cause(s) (ranked)
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        Exactly what to do next (action steps)
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        Last-known-good value + timestamp
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* 6. Offline Library (Kiwix) */}
              <section id="help-kiwix" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Offline Library (Kiwix)
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Access at: <code className="text-primary">http://talon.local:8090/</code></p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-2 text-blue-400">Core Reference</h3>
                    <ul className="space-y-1 text-sm">
                      {KIWIX_CONTENT.coreReference.map((item, i) => (
                        <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-2 text-red-400">Medical & Emergency</h3>
                    <ul className="space-y-1 text-sm">
                      {KIWIX_CONTENT.medical.map((item, i) => (
                        <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-2 text-emerald-400">Education & Learning</h3>
                    <ul className="space-y-1 text-sm">
                      {KIWIX_CONTENT.education.map((item, i) => (
                        <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-2 text-amber-400">Repair & Technical</h3>
                    <ul className="space-y-1 text-sm">
                      {KIWIX_CONTENT.repair.map((item, i) => (
                        <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-2 text-cyan-400">Travel & Mapping</h3>
                    <ul className="space-y-1 text-sm">
                      {KIWIX_CONTENT.travel.map((item, i) => (
                        <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-2 text-purple-400">Books & Talks</h3>
                    <ul className="space-y-1 text-sm">
                      {KIWIX_CONTENT.books.map((item, i) => (
                        <li key={i}><strong>{item.name}</strong> — {item.desc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* 7. Communications Hub */}
              <section id="help-communications" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-green-400" />
                  Communications Hub
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Choose the simplest method that works.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMMS_METHODS.map(method => (
                    <CommsCard key={method.id} method={method} />
                  ))}
                </div>
              </section>
              
              {/* 8. Maps & GPS */}
              <section id="help-maps-gps" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  Maps & GPS
                </h2>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Fix States</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <span className="font-semibold">No Fix</span>
                        <p className="text-xs text-muted-foreground mt-1">No satellite lock yet (common indoors)</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg">
                        <span className="font-semibold">2D Fix</span>
                        <p className="text-xs text-muted-foreground mt-1">Lat/lon good, altitude weak</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <span className="font-semibold">3D Fix</span>
                        <p className="text-xs text-muted-foreground mt-1">Best fix quality</p>
                      </div>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">If GPS is stale or missing</h3>
                    <ol className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        Move outdoors / near a window for 2–3 minutes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        Verify GPS endpoint exists
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        Re-seat the GPS dongle and try again
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        If still dead: operator checks USB device detection and logs
                      </li>
                    </ol>
                  </div>
                </div>
              </section>
              
              {/* 9. Sensors & Environment */}
              <section id="help-sensors" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-pink-400" />
                  Sensors & Environment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">BME680 (Environment)</h3>
                    <ul className="text-sm space-y-2">
                      <li><strong>Temperature</strong> — device/case thermal awareness</li>
                      <li><strong>Humidity</strong> — condensation risk / ventilation need</li>
                      <li><strong>Pressure</strong> — approximate weather change signal</li>
                      <li><strong>IAQ</strong> — trend indicator (not medical-grade)</li>
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">ADS1115 (Analog Expansion)</h3>
                    <ul className="text-sm space-y-2">
                      <li>Used for future sensors (gas, light, etc.)</li>
                      <li className="text-muted-foreground">Key concerns:</li>
                      <li>• Correct I2C bus configuration</li>
                      <li>• Clean grounding</li>
                      <li>• Minimize noise / long wire runs</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* 10. Media */}
              <section id="help-media" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-400" />
                  Media (OMEGA Netflix)
                </h2>
                <div className="glass rounded-xl p-4">
                  <ul className="text-sm space-y-2">
                    <li>• If Jellyfin is enabled: offline entertainment/education on local network</li>
                    <li>• Streaming increases power and can congest Wi-Fi</li>
                    <li className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <strong>Field rule:</strong> During emergencies, prioritize comms + knowledge access over streaming.
                    </li>
                  </ul>
                </div>
              </section>
              
              {/* 11. Admin Console */}
              <section id="help-admin" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Admin Console (Operator)
                </h2>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Core Admin Features</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      {['Ops overview', 'Roster', 'Broadcasts', 'Mass polls', 'Random selection', 'Backups', 'Fleet management', 'Audit logs'].map((feature, i) => (
                        <div key={i} className="p-2 bg-yellow-500/10 rounded">{feature}</div>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4 bg-violet-500/10 border border-violet-500/30">
                    <h3 className="font-semibold mb-2">Privacy Note</h3>
                    <p className="text-sm text-muted-foreground">
                      DMs are private by default. Any "break-glass access" must be explicit, logged, limited to emergencies, and visible to users afterward.
                    </p>
                  </div>
                </div>
              </section>
              
              {/* 12. Power & Runtime */}
              <section id="help-power" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Battery className="w-5 h-5 text-lime-400" />
                  Power & Runtime
                </h2>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Why Power Varies</h3>
                    <p className="text-sm text-muted-foreground">CPU load, NVMe activity, Wi-Fi client count, radios transmitting, screen brightness, camera use, and DC-DC efficiency.</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Simple Runtime Model</h3>
                    <div className="font-mono text-sm space-y-1 bg-black/30 p-3 rounded">
                      <div>Nominal energy: 12.8V × 100Ah ≈ <strong>1280Wh</strong></div>
                      <div>DC-DC efficiency: 0.90</div>
                      <div>Usable energy fraction: 0.85</div>
                      <div>Effective Wh ≈ 1280 × 0.90 × 0.85 ≈ <strong>~980Wh</strong></div>
                      <div className="text-primary mt-2">Runtime (hours) ≈ Effective Wh ÷ Average Watts</div>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4 overflow-x-auto">
                    <h3 className="font-semibold mb-3">Scenario Estimates</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="pb-2">Scenario</th>
                          <th className="pb-2">What's Running</th>
                          <th className="pb-2">Avg Load</th>
                          <th className="pb-2">Est. Runtime</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr><td className="py-1.5">Idle / Standby</td><td>UI + backend + minimal activity</td><td>8–12W</td><td>~80–120h</td></tr>
                        <tr><td className="py-1.5">Knowledge browsing</td><td>Kiwix + light usage</td><td>12–18W</td><td>~55–80h</td></tr>
                        <tr><td className="py-1.5">Comms + GPS active</td><td>Normal ops + frequent updates</td><td>15–25W</td><td>~40–65h</td></tr>
                        <tr><td className="py-1.5">Streaming (1–3 devices)</td><td>Jellyfin + network load</td><td>20–35W</td><td>~28–50h</td></tr>
                        <tr><td className="py-1.5">Heavy compute</td><td>CPU + NVMe + camera</td><td>25–45W</td><td>~20–40h</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              
              {/* 13. Troubleshooting Textbook */}
              <section id="help-troubleshooting" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-rose-400" />
                  Troubleshooting Textbook
                </h2>
                <div className="glass rounded-xl p-4 mb-4 bg-rose-500/10 border border-rose-500/30">
                  <h3 className="font-semibold mb-2">Troubleshooting Pattern (use every time)</h3>
                  <p className="text-sm font-mono">Symptom → Likely cause → Exact fix → Verify</p>
                </div>
                <div className="space-y-3">
                  {TROUBLESHOOTING_ENTRIES.map(entry => (
                    <TroubleshootingEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
              
              {/* 14. Glossary */}
              <section id="help-glossary" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-400" />
                  Glossary
                </h2>
                <div className="glass rounded-xl divide-y divide-border/50">
                  {GLOSSARY.map((item, i) => (
                    <div key={i} className="p-3">
                      <span className="font-semibold text-teal-400">{item.term}</span>
                      <p className="text-sm text-muted-foreground mt-1">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* 15. Appendix */}
              <section id="help-appendix" className="scroll-mt-40">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-400" />
                  Appendix (What's Estimated vs Exact)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Exact (Current Build Truth)
                    </h3>
                    <ul className="text-sm space-y-1.5">
                      <li><strong>Ports:</strong> 8093 (Community API), 8090 (Kiwix)</li>
                      <li><strong>Directories:</strong> /srv/omega/community/*, /srv/kiwix/*</li>
                      <li><strong>Core services:</strong> omega-community + timers and backup system</li>
                      <li><strong>Installed library:</strong> See Kiwix section above</li>
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Estimated Until Measured
                    </h3>
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      <li>Per-component watts and runtime values</li>
                      <li className="mt-3 text-foreground">
                        <strong>Action:</strong> Measure at 12V rail + Pi USB-C input and update scenario table with real averages.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* Footer */}
              <div className="glass rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  OMEGA Field Manual • v2026-01-08 (Manual Rev3)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This manual is designed to be the only reference a family member needs during a SHTF scenario.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Back to Top Button */}
      {showBackToTop && !searchResults && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all animate-fade-in"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
