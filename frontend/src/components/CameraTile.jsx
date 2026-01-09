import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Camera as CameraIcon, 
  Video, 
  Image, 
  Mic, 
  BookOpen,
  Clock,
  Calendar,
  User,
  Play,
  Square,
  Circle,
  ChevronRight,
  Settings,
  Check,
  HelpCircle,
  MapPin,
  Thermometer,
  Battery,
  Activity,
  Gauge,
  X,
  ChevronDown,
  ChevronUp,
  Folder,
  Grid,
  List,
  Download,
  Trash2,
  Share2,
  Eye
} from 'lucide-react';
import TileHelpTabs, { QuickHelpTips } from './ui/TileHelpTabs';

// Help content for Camera tile
const cameraHelpContent = {
  whatItDoes: "Record video diaries, capture photos, and create voice memos. All media is stored locally with timestamps and optional metric overlays for documentation.",
  quickStart: [
    "Tap a capture mode (Diary, Photo, Video, Voice)",
    "Configure overlay options before recording",
    "Tap record/capture to activate camera",
    "Review media with timestamps in gallery",
    "Tag people to organize your media"
  ],
  controls: [
    { name: "Capture Button", description: "Activates camera and starts capture" },
    { name: "Overlay Options", description: "Add date, time, location, metrics to media" },
    { name: "Tag Person", description: "Associate media with a person" },
  ],
  bestPractices: [
    "Keep daily diary entries brief (1-3 minutes)",
    "Enable all overlays for documentation purposes",
    "Use voice memos for quick notes hands-free",
    "Review storage periodically to manage space"
  ]
};

const cameraTroubleshootingContent = {
  issues: [
    {
      symptom: "Camera not activating",
      causes: ["Device not connected to Pi", "Camera service not running", "Camera hardware issue"],
      fixes: ["Verify Pi connection status", "Check backend services in Health tile", "Reconnect USB camera if external"],
      fallback: "Use voice memos as alternative until camera is restored"
    },
    {
      symptom: "Recording stops unexpectedly",
      causes: ["Low storage space", "Device overheating", "Battery critically low"],
      fixes: ["Check available storage in Device Info", "Let device cool down", "Connect to power source"],
    },
    {
      symptom: "Audio not recording",
      causes: ["Microphone disabled", "Audio permissions not granted", "Hardware issue"],
      fixes: ["Check microphone settings", "Grant audio permissions in system settings", "Test with voice memo to isolate issue"],
    }
  ],
  safetyNotes: [
    "Recordings are stored locally - not automatically backed up",
    "Large video files may fill storage quickly",
    "Delete unwanted recordings to free space"
  ]
};

const cameraLegendItems = [
  { color: "bg-destructive", label: "Recording", meaning: "Currently recording video/audio", action: "Tap stop to end" },
  { color: "bg-primary", label: "Ready", meaning: "Ready to capture", action: "Tap to start" },
  { color: "bg-success", label: "Saved", meaning: "Media saved successfully" },
  { color: "bg-muted-foreground", label: "Offline", meaning: "Camera not connected" },
];

const cameraQuickTips = [
  "Camera activates only when you tap capture",
  "Enable overlays to document date, time, location & metrics",
  "All media includes automatic timestamps"
];

// Mock media gallery data
const mockGallery = [
  { id: 1, type: 'video', name: 'Daily Diary', timestamp: new Date(Date.now() - 86400000), duration: '2:34', hasOverlay: true, person: 'John' },
  { id: 2, type: 'photo', name: 'Camp Setup', timestamp: new Date(Date.now() - 172800000), hasOverlay: true, person: null },
  { id: 3, type: 'video', name: 'Perimeter Check', timestamp: new Date(Date.now() - 259200000), duration: '1:15', hasOverlay: false, person: 'Sarah' },
  { id: 4, type: 'voice', name: 'Supply Notes', timestamp: new Date(Date.now() - 345600000), duration: '0:45', hasOverlay: false, person: null },
];

// Mock current metrics for overlay
const getCurrentMetrics = () => ({
  temperature: '72°F',
  humidity: '45%',
  battery: '72%',
  location: '34.0522°N, 118.2437°W',
  pressure: '1013 hPa',
  signal: 'Strong'
});

// Overlay Options Component
const OverlayOptionsPanel = ({ options, onChange }) => {
  const toggleOption = (key) => {
    onChange({ ...options, [key]: !options[key] });
  };

  const metrics = getCurrentMetrics();

  return (
    <div className="glass rounded-xl p-4 space-y-3" data-testid="overlay-options">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Data Overlay Options</h4>
        <span className="text-[10px] text-muted-foreground">
          {Object.values(options).filter(Boolean).length} selected
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select data to overlay on your recording or photo
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Date */}
        <button
          onClick={() => toggleOption('date')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
            options.date ? 'bg-primary/20 ring-1 ring-primary' : 'glass hover:bg-secondary/50'
          }`}
        >
          <Calendar className={`w-4 h-4 ${options.date ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">Date</div>
            <div className="text-[10px] text-muted-foreground truncate">{new Date().toLocaleDateString()}</div>
          </div>
          {options.date && <Check className="w-3 h-3 text-primary" />}
        </button>
        
        {/* Time */}
        <button
          onClick={() => toggleOption('time')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
            options.time ? 'bg-primary/20 ring-1 ring-primary' : 'glass hover:bg-secondary/50'
          }`}
        >
          <Clock className={`w-4 h-4 ${options.time ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">Time</div>
            <div className="text-[10px] text-muted-foreground truncate">{new Date().toLocaleTimeString()}</div>
          </div>
          {options.time && <Check className="w-3 h-3 text-primary" />}
        </button>
        
        {/* Location */}
        <button
          onClick={() => toggleOption('location')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
            options.location ? 'bg-success/20 ring-1 ring-success' : 'glass hover:bg-secondary/50'
          }`}
        >
          <MapPin className={`w-4 h-4 ${options.location ? 'text-success' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">Location</div>
            <div className="text-[10px] text-muted-foreground truncate">{metrics.location}</div>
          </div>
          {options.location && <Check className="w-3 h-3 text-success" />}
        </button>
        
        {/* Temperature */}
        <button
          onClick={() => toggleOption('temperature')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
            options.temperature ? 'bg-red-500/20 ring-1 ring-red-500' : 'glass hover:bg-secondary/50'
          }`}
        >
          <Thermometer className={`w-4 h-4 ${options.temperature ? 'text-red-400' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">Temp</div>
            <div className="text-[10px] text-muted-foreground">{metrics.temperature}</div>
          </div>
          {options.temperature && <Check className="w-3 h-3 text-red-400" />}
        </button>
        
        {/* Battery */}
        <button
          onClick={() => toggleOption('battery')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
            options.battery ? 'bg-warning/20 ring-1 ring-warning' : 'glass hover:bg-secondary/50'
          }`}
        >
          <Battery className={`w-4 h-4 ${options.battery ? 'text-warning' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">Battery</div>
            <div className="text-[10px] text-muted-foreground">{metrics.battery}</div>
          </div>
          {options.battery && <Check className="w-3 h-3 text-warning" />}
        </button>
        
        {/* All Metrics */}
        <button
          onClick={() => toggleOption('allMetrics')}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all ${
            options.allMetrics ? 'bg-cyan-500/20 ring-1 ring-cyan-500' : 'glass hover:bg-secondary/50'
          }`}
        >
          <Activity className={`w-4 h-4 ${options.allMetrics ? 'text-cyan-400' : 'text-muted-foreground'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">All Metrics</div>
            <div className="text-[10px] text-muted-foreground">Full sensor data</div>
          </div>
          {options.allMetrics && <Check className="w-3 h-3 text-cyan-400" />}
        </button>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-2 pt-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 text-xs h-8"
          onClick={() => onChange({ date: true, time: true, location: true, temperature: true, battery: true, allMetrics: true })}
        >
          Select All
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 text-xs h-8"
          onClick={() => onChange({ date: false, time: false, location: false, temperature: false, battery: false, allMetrics: false })}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

// Media Gallery Item
const MediaItem = ({ item, viewMode }) => {
  const TypeIcon = item.type === 'video' ? Video : item.type === 'photo' ? Image : Mic;
  const typeColor = item.type === 'video' ? 'text-primary' : item.type === 'photo' ? 'text-success' : 'text-cyan-400';
  const typeBg = item.type === 'video' ? 'bg-primary/20' : item.type === 'photo' ? 'bg-success/20' : 'bg-cyan-500/20';

  if (viewMode === 'grid') {
    return (
      <div className="glass rounded-xl p-3 hover:bg-secondary/50 transition-all cursor-pointer group" data-testid={`media-item-${item.id}`}>
        <div className={`aspect-square rounded-lg ${typeBg} flex items-center justify-center mb-2 relative overflow-hidden`}>
          <TypeIcon className={`w-8 h-8 ${typeColor} opacity-50`} />
          {item.duration && (
            <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-white px-1 rounded">
              {item.duration}
            </span>
          )}
          {item.hasOverlay && (
            <span className="absolute top-1 left-1 text-[10px] bg-primary/80 text-white px-1 rounded">
              DATA
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <p className="text-xs font-medium truncate">{item.name}</p>
        <p className="text-[10px] text-muted-foreground">{item.timestamp.toLocaleDateString()}</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-3 flex items-center gap-3 hover:bg-secondary/50 transition-all cursor-pointer" data-testid={`media-item-${item.id}`}>
      <div className={`w-12 h-12 rounded-lg ${typeBg} flex items-center justify-center flex-shrink-0 relative`}>
        <TypeIcon className={`w-6 h-6 ${typeColor}`} />
        {item.hasOverlay && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <Activity className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{item.timestamp.toLocaleDateString()}</span>
          <span>{item.timestamp.toLocaleTimeString()}</span>
          {item.duration && <span>• {item.duration}</span>}
        </div>
        {item.person && (
          <span className="text-[10px] text-primary">Tagged: {item.person}</span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};

// Capture Mode Component
const CaptureMode = ({ mode, onBack, overlayOptions, setOverlayOptions }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [captureTime, setCaptureTime] = useState(0);
  
  const modeConfig = {
    diary: { title: 'Daily Diary', icon: Video, color: 'primary', description: 'Record video diary with optional data overlays' },
    photo: { title: 'Photo Capture', icon: Image, color: 'success', description: 'Take photos with timestamp and data overlays' },
    video: { title: 'Video Recording', icon: Video, color: 'warning', description: 'Record videos with optional overlays' },
    voice: { title: 'Voice Memo', icon: Mic, color: 'cyan-500', description: 'Record audio notes with timestamps' },
  };
  
  const config = modeConfig[mode];
  const Icon = config.icon;
  const isVideo = mode === 'diary' || mode === 'video';
  const isVoice = mode === 'voice';

  // Timer effect for recording
  React.useEffect(() => {
    let interval;
    if (isCapturing && (isVideo || isVoice)) {
      interval = setInterval(() => {
        setCaptureTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCapturing, isVideo, isVoice]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCapture = () => {
    if (isCapturing) {
      // Stop capturing
      setIsCapturing(false);
      setShowCamera(false);
      setCaptureTime(0);
    } else {
      // Start capturing - this activates the camera
      setShowCamera(true);
      if (mode !== 'photo') {
        setIsCapturing(true);
      }
    }
  };

  const handleTakePhoto = () => {
    // Simulate taking photo
    setShowCamera(false);
  };

  const getActiveOverlayCount = () => Object.values(overlayOptions).filter(Boolean).length;

  return (
    <div className="space-y-4" data-testid={`${mode}-capture-view`}>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <h3 className="text-sm font-semibold">{config.title}</h3>
        <div className="w-16" />
      </div>
      
      {/* Camera/Preview Area - Only shows when activated */}
      {showCamera ? (
        <div className="glass rounded-xl aspect-video flex items-center justify-center relative overflow-hidden border-2 border-primary/50">
          {/* Simulated camera view */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <Icon className="w-16 h-16 mx-auto mb-3 text-white/30" />
              <p className="text-white/50 text-sm">Camera Preview</p>
              <p className="text-white/30 text-xs">Connect to Pi for live feed</p>
            </div>
          </div>
          
          {/* Recording indicator */}
          {isCapturing && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-destructive text-white px-2.5 py-1 rounded-full text-xs font-bold">
              <Circle className="w-2.5 h-2.5 fill-current animate-pulse" />
              REC {formatTime(captureTime)}
            </div>
          )}
          
          {/* Overlay Preview */}
          {getActiveOverlayCount() > 0 && (
            <div className="absolute bottom-3 right-3 glass-strong px-3 py-2 rounded-lg text-[10px] font-mono space-y-0.5 max-w-[200px]">
              {overlayOptions.date && <div className="text-white/90">{new Date().toLocaleDateString()}</div>}
              {overlayOptions.time && <div className="text-white/90">{new Date().toLocaleTimeString()}</div>}
              {overlayOptions.location && <div className="text-green-400 truncate">34.0522°N, 118.2437°W</div>}
              {overlayOptions.temperature && <div className="text-red-400">72°F | 45% RH</div>}
              {overlayOptions.battery && <div className="text-yellow-400">Battery: 72%</div>}
              {overlayOptions.allMetrics && <div className="text-cyan-400">1013 hPa | Good Signal</div>}
            </div>
          )}
        </div>
      ) : (
        /* Inactive state - tap to activate */
        <button
          onClick={() => setShowCamera(true)}
          className="w-full glass rounded-xl aspect-video flex items-center justify-center relative overflow-hidden hover:bg-secondary/50 transition-all group border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
          data-testid="activate-camera-btn"
        >
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full bg-${config.color}/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-10 h-10 text-${config.color}`} />
            </div>
            <p className="text-sm font-semibold mb-1">Tap to Activate Camera</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {getActiveOverlayCount() > 0 && (
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary">
                <Activity className="w-3 h-3" />
                {getActiveOverlayCount()} overlays enabled
              </div>
            )}
          </div>
        </button>
      )}
      
      {/* Capture Controls - Only shows when camera is active */}
      {showCamera && (
        <div className="flex items-center justify-center gap-4">
          {mode === 'photo' ? (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowCamera(false)}
                className="h-14 px-6"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleTakePhoto}
                className={`h-16 w-16 rounded-full bg-white hover:bg-white/90 shadow-lg`}
                data-testid="capture-photo-btn"
              >
                <CameraIcon className="w-7 h-7 text-slate-900" />
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              variant={isCapturing ? 'destructive' : 'default'}
              onClick={handleCapture}
              className={`h-16 w-16 rounded-full shadow-lg ${!isCapturing ? `bg-${config.color} hover:bg-${config.color}/90` : ''}`}
              data-testid="capture-btn"
            >
              {isCapturing ? (
                <Square className="w-7 h-7" />
              ) : (
                <Circle className="w-7 h-7 fill-current" />
              )}
            </Button>
          )}
        </div>
      )}
      
      {/* Overlay Options - Always visible for configuration */}
      <OverlayOptionsPanel options={overlayOptions} onChange={setOverlayOptions} />
      
      {/* Tag Person */}
      <div className="glass rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Tag person</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            Select...
          </Button>
        </div>
      </div>
    </div>
  );
};

// Gallery View Component  
const GalleryView = ({ onBack }) => {
  const [viewMode, setViewMode] = useState('list');
  const [filter, setFilter] = useState('all');
  
  const filteredMedia = mockGallery.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'photos') return item.type === 'photo';
    if (filter === 'videos') return item.type === 'video';
    if (filter === 'voice') return item.type === 'voice';
    return true;
  });

  return (
    <div className="space-y-4" data-testid="gallery-view">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <h3 className="text-sm font-semibold">Media Gallery</h3>
        <div className="flex gap-1">
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'photos', 'videos', 'voice'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f 
                ? 'bg-primary text-white' 
                : 'glass hover:bg-secondary/50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'photos' ? 'Photos' : f === 'videos' ? 'Videos' : 'Voice'}
            <span className="ml-1 opacity-70">
              ({f === 'all' ? mockGallery.length : mockGallery.filter(m => m.type === (f === 'photos' ? 'photo' : f === 'videos' ? 'video' : 'voice')).length})
            </span>
          </button>
        ))}
      </div>
      
      {/* Media Grid/List */}
      {filteredMedia.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'space-y-2'}>
          {filteredMedia.map((item) => (
            <MediaItem key={item.id} item={item} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass rounded-lg">
          <Folder className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No media found</p>
        </div>
      )}
      
      {/* Storage Info */}
      <div className="glass rounded-lg p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Storage used</span>
          <span className="font-medium">2.4 GB / 32 GB</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '7.5%' }} />
        </div>
      </div>
    </div>
  );
};

export default function CameraTile() {
  const [activeSection, setActiveSection] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const renderSection = () => {
    switch (activeSection) {
      case 'diary':
        return <DiaryView onBack={() => setActiveSection(null)} />;
      case 'photos':
        return <PhotosView onBack={() => setActiveSection(null)} />;
      case 'videos':
        return <VideosView onBack={() => setActiveSection(null)} />;
      case 'voice':
        return <VoiceMemoView onBack={() => setActiveSection(null)} />;
      default:
        return null;
    }
  };
  
  // Help view
  if (showHelp) {
    return (
      <Card className="glass-strong border-border-strong" data-testid="camera-tile">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <CameraIcon className="w-5 h-5 text-primary" />
              Camera Help
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
              ← Back
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TileHelpTabs
            helpContent={cameraHelpContent}
            troubleshootingContent={cameraTroubleshootingContent}
            legendItems={cameraLegendItems}
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="camera-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-primary" />
            Camera
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Help & Troubleshooting"
            data-testid="camera-help-btn"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeSection ? (
          renderSection()
        ) : (
          <>
            <QuickHelpTips tips={cameraQuickTips} />
            <div className="grid grid-cols-2 gap-3" data-testid="camera-sections">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onSelect={setActiveSection}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
