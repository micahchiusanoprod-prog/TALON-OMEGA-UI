import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { 
  Settings,
  X,
  GripVertical,
  Check,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Users,
  Map,
  Flashlight,
  Radio,
  FileText,
  Wifi,
  FolderOpen,
  Battery,
  Compass,
  Cloud,
  Clock,
  CheckSquare,
  Contact,
  Megaphone,
  Book,
  MessageSquare,
  Activity,
  Database,
  HardDrive,
  Network,
  Calculator,
  RefreshCw,
  QrCode,
  Timer,
  BookOpen,
  Music,
  Library,
  Tv,
  AlertTriangle,
  Zap
} from 'lucide-react';

// All available hotkeys
const allHotkeys = [
  // Default Pinned (first 6 shown by default)
  { id: 'comms', name: 'Comms Hub', icon: Users, category: 'default', description: 'Ally Communications Hub' },
  { id: 'map', name: 'Map', icon: Map, category: 'default', description: 'GPS / location / node map' },
  { id: 'flashlight', name: 'Flashlight', icon: Flashlight, category: 'default', description: 'Screen white-out + strobe' },
  { id: 'sos', name: 'SOS Beacon', icon: AlertTriangle, category: 'default', description: 'Emergency beacon', color: 'text-destructive' },
  { id: 'notes', name: 'Field Notes', icon: FileText, category: 'default', description: 'Quick field log + timestamps' },
  { id: 'battery', name: 'Power', icon: Battery, category: 'default', description: 'Battery & charging status' },
  { id: 'scanner', name: 'Scanner', icon: Radio, category: 'default', description: 'RF/Signal scan summary' },
  { id: 'files', name: 'Files', icon: FolderOpen, category: 'default', description: 'Quick file share access' },
  
  // Navigation & Situational
  { id: 'compass', name: 'Compass', icon: Compass, category: 'navigation', description: 'Digital compass' },
  { id: 'weather', name: 'Weather', icon: Cloud, category: 'navigation', description: 'Local weather conditions' },
  { id: 'time', name: 'Time / Zulu', icon: Clock, category: 'navigation', description: 'Local + Zulu time toggle' },
  { id: 'checklist', name: 'Go-Bag', icon: CheckSquare, category: 'navigation', description: 'Saved checklist UI' },
  { id: 'contacts', name: 'Quick Contacts', icon: Contact, category: 'navigation', description: 'Favorite nodes/people' },
  
  // Comms Utilities
  { id: 'broadcast', name: 'Broadcast', icon: Megaphone, category: 'comms', description: 'Jump to broadcast modal' },
  { id: 'codebook', name: 'Codebook', icon: Book, category: 'comms', description: 'Codes tab shortcut' },
  { id: 'templates', name: 'Templates', icon: MessageSquare, category: 'comms', description: 'Prewritten messages' },
  
  // System & Ops
  { id: 'health', name: 'Health', icon: Activity, category: 'system', description: 'System health, last sync' },
  { id: 'backups', name: 'Backups', icon: Database, category: 'system', description: 'Backup status' },
  { id: 'keysync', name: 'KeySync', icon: Zap, category: 'system', description: 'Key synchronization' },
  { id: 'storage', name: 'Storage', icon: HardDrive, category: 'system', description: 'Disk usage summary' },
  { id: 'network', name: 'Network', icon: Network, category: 'system', description: 'LAN/Wi-Fi/hotspot status' },
  
  // Tools
  { id: 'calculator', name: 'Calculator', icon: Calculator, category: 'tools', description: 'Basic calculator' },
  { id: 'converter', name: 'Unit Convert', icon: RefreshCw, category: 'tools', description: 'mi↔ft, °F↔°C, etc.' },
  { id: 'qr', name: 'QR Generator', icon: QrCode, category: 'tools', description: 'Share Wi-Fi/node info as QR' },
  { id: 'timer', name: 'Timer', icon: Timer, category: 'tools', description: 'Timer / Stopwatch' },
  { id: 'reference', name: 'Ref Cards', icon: BookOpen, category: 'tools', description: 'Survival/medical quick refs' },
  
  // Entertainment
  { id: 'music', name: 'Music', icon: Music, category: 'entertainment', description: 'Music player' },
  { id: 'library', name: 'Library', icon: Library, category: 'entertainment', description: 'Kiwix offline library' },
  { id: 'video', name: 'Video', icon: Tv, category: 'entertainment', description: 'Jellyfin video player' },
];

const defaultPinned = ['comms', 'map', 'flashlight', 'sos', 'notes', 'battery'];
const VISIBLE_COUNT = 6; // Show 6 by default, rest in "More"

const categoryNames = {
  default: 'Default',
  navigation: 'Navigation & Situational',
  comms: 'Comms Utilities',
  system: 'System & Ops',
  tools: 'Tools',
  entertainment: 'Entertainment',
};

const STORAGE_KEY = 'omega_hotkeys_pinned';

export function useHotkeys() {
  const [pinnedIds, setPinnedIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultPinned;
  });
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);
  
  const pinned = pinnedIds.map(id => allHotkeys.find(h => h.id === id)).filter(Boolean);
  
  const addHotkey = (id) => {
    if (!pinnedIds.includes(id)) {
      setPinnedIds([...pinnedIds, id]);
    }
  };
  
  const removeHotkey = (id) => {
    setPinnedIds(pinnedIds.filter(hid => hid !== id));
  };
  
  const moveHotkey = (id, direction) => {
    const index = pinnedIds.indexOf(id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pinnedIds.length) return;
    
    const newPinned = [...pinnedIds];
    [newPinned[index], newPinned[newIndex]] = [newPinned[newIndex], newPinned[index]];
    setPinnedIds(newPinned);
  };
  
  const resetToDefault = () => {
    setPinnedIds(defaultPinned);
  };
  
  return { pinned, pinnedIds, addHotkey, removeHotkey, moveHotkey, resetToDefault };
}

// Clean, minimal tap-friendly hotkey button - optimized for glove use
function HotkeyButton({ hotkey, onClick }) {
  const Icon = hotkey.icon;
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl glass-strong hover:bg-primary/10 active:bg-primary/20 transition-all min-w-fit group"
      title={hotkey.description}
      data-testid={`hotkey-${hotkey.id}`}
    >
      <div className={`w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors`}>
        <Icon className={`w-6 h-6 ${hotkey.color || 'text-primary'}`} />
      </div>
      <span className="text-sm font-semibold whitespace-nowrap">{hotkey.name}</span>
    </button>
  );
}

// "More" dropdown for overflow hotkeys
function MoreDropdown({ hotkeys, onHotkeyClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (hotkeys.length === 0) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass hover:bg-primary/10 active:bg-primary/20 transition-all"
        data-testid="hotkey-more-btn"
      >
        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">More</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {hotkeys.length}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 glass-strong rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in" data-testid="more-dropdown">
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
            {hotkeys.map((hotkey) => {
              const Icon = hotkey.icon;
              return (
                <button
                  key={hotkey.id}
                  onClick={() => {
                    onHotkeyClick?.(hotkey.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${hotkey.color || 'text-primary'}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{hotkey.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{hotkey.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function HotkeysBar({ onHotkeyClick }) {
  const { pinned } = useHotkeys();
  const [showCustomize, setShowCustomize] = useState(false);
  
  const visibleHotkeys = pinned.slice(0, VISIBLE_COUNT);
  const overflowHotkeys = pinned.slice(VISIBLE_COUNT);
  
  return (
    <>
      <div className="glass-strong rounded-2xl p-3" data-testid="hotkeys-bar">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Access</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCustomize(true)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            data-testid="customize-hotkeys-btn"
          >
            <Settings className="w-3.5 h-3.5 mr-1" />
            Customize
          </Button>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {visibleHotkeys.map((hotkey) => (
            <HotkeyButton
              key={hotkey.id}
              hotkey={hotkey}
              onClick={() => onHotkeyClick?.(hotkey.id)}
            />
          ))}
          
          <MoreDropdown 
            hotkeys={overflowHotkeys} 
            onHotkeyClick={onHotkeyClick}
          />
        </div>
      </div>
      
      {showCustomize && (
        <HotkeysCustomizeModal onClose={() => setShowCustomize(false)} />
      )}
    </>
  );
}

export function HotkeysCustomizeModal({ onClose }) {
  const { pinnedIds, addHotkey, removeHotkey, moveHotkey, resetToDefault } = useHotkeys();
  
  const categorizedHotkeys = Object.entries(categoryNames).map(([category, name]) => ({
    category,
    name,
    hotkeys: allHotkeys.filter(h => h.category === category),
  }));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="hotkeys-customize-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative glass-strong rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-semibold">Customize Quick Access</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Info */}
          <p className="text-xs text-muted-foreground mb-4">
            First {VISIBLE_COUNT} tools show in the bar. Additional tools appear in "More" dropdown.
          </p>
          
          {/* Current Pinned */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Pinned ({pinnedIds.length})</h3>
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={resetToDefault}>
                Reset Default
              </Button>
            </div>
            
            <div className="space-y-1">
              {pinnedIds.map((id, index) => {
                const hotkey = allHotkeys.find(h => h.id === id);
                if (!hotkey) return null;
                const Icon = hotkey.icon;
                const isVisible = index < VISIBLE_COUNT;
                
                return (
                  <div
                    key={id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${isVisible ? 'glass' : 'glass opacity-60'}`}
                    data-testid={`pinned-${id}`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Icon className={`w-4 h-4 ${hotkey.color || 'text-primary'}`} />
                    <span className="flex-1 text-sm">{hotkey.name}</span>
                    {!isVisible && (
                      <span className="text-xs text-muted-foreground">in More</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveHotkey(id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveHotkey(id, 'down')}
                        disabled={index === pinnedIds.length - 1}
                        className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeHotkey(id)}
                        className="p-1 rounded hover:bg-destructive/20 text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Available Hotkeys */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Available Tools</h3>
            
            {categorizedHotkeys.map(({ category, name, hotkeys }) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">{name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {hotkeys.map((hotkey) => {
                    const Icon = hotkey.icon;
                    const isPinned = pinnedIds.includes(hotkey.id);
                    
                    return (
                      <button
                        key={hotkey.id}
                        onClick={() => isPinned ? removeHotkey(hotkey.id) : addHotkey(hotkey.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                          isPinned 
                            ? 'bg-primary/10 border border-primary/30' 
                            : 'glass hover:bg-secondary/50'
                        }`}
                        data-testid={`available-${hotkey.id}`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${hotkey.color || 'text-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{hotkey.name}</p>
                        </div>
                        {isPinned ? (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 glass-strong border-t border-border px-4 py-3">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HotkeysBar;
