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
  HelpCircle
} from 'lucide-react';
import TileHelpTabs, { QuickHelpTips } from './ui/TileHelpTabs';

// Help content for Camera tile
const cameraHelpContent = {
  whatItDoes: "Record video diaries, capture photos, and create voice memos. All media is stored locally on your device with optional timestamp overlays for documentation.",
  quickStart: [
    "Select a section (Diary, Photos, Videos, or Voice)",
    "Tap the record/capture button to start",
    "Enable timestamp overlay for documentation",
    "Tag people to organize your media",
    "Access recent entries from each section"
  ],
  controls: [
    { name: "Record Button", description: "Start/stop recording (red = recording)" },
    { name: "Timestamp Toggle", description: "Overlay date/time on recordings" },
    { name: "Tag Person", description: "Associate media with a person for organization" },
  ],
  bestPractices: [
    "Keep daily diary entries brief (1-3 minutes)",
    "Use voice memos for quick notes when hands are busy",
    "Enable timestamps for any documentation purposes",
    "Review storage periodically to manage space"
  ]
};

const cameraTroubleshootingContent = {
  issues: [
    {
      symptom: "Camera preview not showing",
      causes: ["Device not connected to Pi", "Camera service not running", "Camera hardware issue"],
      fixes: ["Verify Pi connection status", "Check backend services in Health tile", "Reconnect USB camera if external"],
      fallback: "Use voice memos as an alternative until camera is restored"
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
  { color: "bg-primary", label: "Ready", meaning: "Camera ready to record", action: "Tap to start" },
  { color: "bg-success", label: "Saved", meaning: "Recording saved successfully" },
  { color: "bg-muted-foreground", label: "Offline", meaning: "Camera not connected" },
];

const cameraQuickTips = [
  "Daily Diary: Record short video check-ins with auto-timestamps",
  "Voice Memo: Fastest way to capture notes hands-free",
  "Connect to Pi required for camera preview"
];

const sections = [
  {
    id: 'diary',
    name: 'Daily Diary',
    icon: Video,
    description: 'Record daily video entries',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: Image,
    description: 'Capture and view photos',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: Video,
    description: 'Record and view videos',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    id: 'voice',
    name: 'Voice Memo',
    icon: Mic,
    description: 'Quick audio recordings',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

const SectionCard = ({ section, onSelect }) => {
  const Icon = section.icon;
  return (
    <button
      onClick={() => onSelect(section.id)}
      className={`glass rounded-lg p-4 text-left hover:bg-secondary/50 transition-all group`}
      data-testid={`camera-section-${section.id}`}
    >
      <div className={`w-10 h-10 rounded-full ${section.bgColor} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${section.color}`} />
      </div>
      <h3 className="text-sm font-semibold mb-1">{section.name}</h3>
      <p className="text-xs text-muted-foreground">{section.description}</p>
      <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

const DiaryView = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [overlayTimestamp, setOverlayTimestamp] = useState(true);
  
  return (
    <div className="space-y-4" data-testid="diary-view">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <h3 className="text-sm font-semibold">Daily Diary</h3>
        <div className="w-16" />
      </div>
      
      {/* Preview Area */}
      <div className="glass rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
        <div className="text-center">
          <CameraIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Camera preview</p>
          <p className="text-xs text-muted-foreground/70">Connect to Pi to enable</p>
        </div>
        
        {/* Timestamp Overlay Preview */}
        {overlayTimestamp && (
          <div className="absolute bottom-3 right-3 glass px-2 py-1 rounded text-xs font-mono">
            {new Date().toLocaleString()}
          </div>
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-destructive text-white px-2 py-1 rounded text-xs">
            <Circle className="w-2 h-2 fill-current animate-pulse" />
            REC
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={() => setIsRecording(!isRecording)}
          className="w-16 h-16 rounded-full"
          data-testid="record-btn"
        >
          {isRecording ? <Square className="w-6 h-6" /> : <Circle className="w-6 h-6 fill-current" />}
        </Button>
      </div>
      
      {/* Settings */}
      <div className="glass rounded-lg p-3 space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">SETTINGS</h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Overlay date + time</span>
          </div>
          <button
            onClick={() => setOverlayTimestamp(!overlayTimestamp)}
            className={`w-10 h-6 rounded-full transition-colors ${overlayTimestamp ? 'bg-primary' : 'bg-muted'}`}
            data-testid="overlay-toggle"
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${overlayTimestamp ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
        
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
      
      {/* Recent Entries */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">RECENT ENTRIES</h4>
        <div className="text-center py-6 glass rounded-lg">
          <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No diary entries yet</p>
        </div>
      </div>
    </div>
  );
};

const PhotosView = ({ onBack }) => (
  <div className="space-y-4" data-testid="photos-view">
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
      <h3 className="text-sm font-semibold">Photos</h3>
      <Button size="sm" variant="outline" className="h-7">
        <CameraIcon className="w-3 h-3 mr-1" /> Capture
      </Button>
    </div>
    
    <div className="text-center py-12 glass rounded-lg">
      <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground mb-1">No photos yet</p>
      <p className="text-xs text-muted-foreground/70">Capture photos or import from device</p>
    </div>
  </div>
);

const VideosView = ({ onBack }) => (
  <div className="space-y-4" data-testid="videos-view">
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
      <h3 className="text-sm font-semibold">Videos</h3>
      <Button size="sm" variant="outline" className="h-7">
        <Video className="w-3 h-3 mr-1" /> Record
      </Button>
    </div>
    
    <div className="text-center py-12 glass rounded-lg">
      <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground mb-1">No videos yet</p>
      <p className="text-xs text-muted-foreground/70">Record videos or import from device</p>
    </div>
  </div>
);

const VoiceMemoView = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  
  return (
    <div className="space-y-4" data-testid="voice-view">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <h3 className="text-sm font-semibold">Voice Memo</h3>
        <div className="w-16" />
      </div>
      
      {/* Recording Area */}
      <div className="glass rounded-lg p-6 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full ${isRecording ? 'bg-destructive animate-pulse' : 'bg-primary/20'} flex items-center justify-center mb-4`}>
          <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-primary'}`} />
        </div>
        
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">Recording...</p>
            <p className="text-2xl font-mono">00:00</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tap to start recording</p>
        )}
        
        <Button
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={() => setIsRecording(!isRecording)}
          className="mt-4"
        >
          {isRecording ? 'Stop' : 'Start Recording'}
        </Button>
      </div>
      
      {/* Recent Memos */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">RECENT MEMOS</h4>
        <div className="text-center py-6 glass rounded-lg">
          <Mic className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No voice memos yet</p>
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
