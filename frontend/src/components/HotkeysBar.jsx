import React, { useState, useEffect } from 'react';
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
  // Default Pinned
  { id: 'comms', name: 'Comms Hub', icon: Users, category: 'default', description: 'Ally Communications Hub' },
  { id: 'map', name: 'Map', icon: Map, category: 'default', description: 'GPS / location / node map' },
  { id: 'flashlight', name: 'Flashlight', icon: Flashlight, category: 'default', description: 'Screen white-out + strobe' },
  { id: 'sos', name: 'SOS / Beacon', icon: AlertTriangle, category: 'default', description: 'Emergency beacon', color: 'text-destructive' },
  { id: 'notes', name: 'Notes', icon: FileText, category: 'default', description: 'Quick field log + timestamps' },
  { id: 'scanner', name: 'Scanner', icon: Radio, category: 'default', description: 'RF/Signal scan summary' },
  { id: 'files', name: 'Files Drop', icon: FolderOpen, category: 'default', description: 'Quick file share access' },
  { id: 'battery', name: 'Battery', icon: Battery, category: 'default', description: 'Power status + low-power mode' },
  
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

const defaultPinned = ['comms', 'map', 'flashlight', 'sos', 'notes', 'scanner', 'files', 'battery'];

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

export function HotkeyButton({ hotkey, onClick, size = 'normal' }) {
  const Icon = hotkey.icon;
  
  if (size === 'small') {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
        title={hotkey.description}
        data-testid={`hotkey-${hotkey.id}`}
      >
        <div className={`w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-primary/10 transition-colors`}>
          <Icon className={`w-4 h-4 ${hotkey.color || 'text-primary'}`} />
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-foreground truncate max-w-[60px]">
          {hotkey.name}
        </span>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg glass hover:bg-secondary/50 transition-colors"
      title={hotkey.description}
      data-testid={`hotkey-${hotkey.id}`}
    >
      <Icon className={`w-4 h-4 ${hotkey.color || 'text-primary'}`} />
      <span className="text-sm">{hotkey.name}</span>
    </button>
  );
}

export function HotkeysBar({ onHotkeyClick }) {
  const { pinned } = useHotkeys();
  const [showCustomize, setShowCustomize] = useState(false);
  
  return (
    <>
      <div className="glass rounded-lg p-2" data-testid="hotkeys-bar">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">QUICK ACCESS</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCustomize(true)}
            className="h-6 px-2 text-xs"
            data-testid="customize-hotkeys-btn"
          >
            <Settings className="w-3 h-3 mr-1" />
            Customize
          </Button>
        </div>
        
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {pinned.map((hotkey) => (
            <HotkeyButton
              key={hotkey.id}
              hotkey={hotkey}
              size="small"
              onClick={() => onHotkeyClick?.(hotkey.id)}
            />
          ))}
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
      <div className="relative glass-strong rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-semibold">Customize Hotkeys</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Current Pinned */}
          <div className="mb-4">
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
                
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 p-2 glass rounded-lg"
                    data-testid={`pinned-${id}`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Icon className={`w-4 h-4 ${hotkey.color || 'text-primary'}`} />
                    <span className="flex-1 text-sm">{hotkey.name}</span>
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
            <h3 className="text-sm font-semibold">Available Hotkeys</h3>
            
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
                          <p className="text-xs text-muted-foreground truncate">{hotkey.description}</p>
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
