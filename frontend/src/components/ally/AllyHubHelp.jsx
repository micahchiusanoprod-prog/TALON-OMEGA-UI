import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  MessageSquare, 
  Map, 
  BookOpen,
  Users,
  CheckCircle,
  Circle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';

const tabDescriptions = {
  chat: {
    title: 'Global Chat',
    icon: MessageSquare,
    description: 'Send and receive messages with all connected OMEGA devices. Messages sync automatically when online. Emergency broadcasts appear pinned at the top.',
    tips: [
      'Messages are queued when offline and sent when connection returns',
      'Use "Broadcast Alert" for urgent messages to all devices',
      'Your status (GOOD/OKAY/NEED HELP) shows next to your messages'
    ]
  },
  map: {
    title: 'Map',
    icon: Map,
    description: 'View the real-time location of all OMEGA devices on an interactive map. Each pin shows the device status at a glance.',
    tips: [
      'Green = GOOD, Amber = OKAY, Red = NEED HELP, Gray = Offline',
      'Click any pin to see device details and last update time',
      'Devices without GPS appear in the panel below the map'
    ]
  },
  guide: {
    title: 'GPS Guide',
    icon: BookOpen,
    description: 'Learn how GPS works and troubleshoot signal issues. Useful when you need to diagnose location problems in the field.',
    tips: [
      'Check the "Troubleshooting" section if GPS shows "No Fix"',
      'Best Practices helps optimize your antenna setup',
      'Quick Reference has key numbers you need to remember'
    ]
  }
};

const StatusLegend = ({ compact = false }) => (
  <div className={`${compact ? 'flex items-center gap-3' : 'space-y-2'}`}>
    {compact ? (
      <>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-xs">Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span className="text-xs">Okay</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-xs">Need Help</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
          <span className="text-xs">Offline</span>
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-xs"><strong>GOOD</strong> — All clear, no issues</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-warning" />
          <span className="text-xs"><strong>OKAY</strong> — Manageable, monitoring</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-xs"><strong>NEED HELP</strong> — Requires attention</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs"><strong>OFFLINE</strong> — Not reachable</span>
        </div>
      </>
    )}
  </div>
);

export default function AllyHubHelp({ activeTab, isOpen, onClose, compact = false }) {
  const tabInfo = tabDescriptions[activeTab] || tabDescriptions.chat;
  const TabIcon = tabInfo.icon;
  
  if (compact) {
    // Inline help description for tab headers
    return (
      <div className="text-xs text-muted-foreground mb-3 glass rounded-lg p-3" data-testid="tab-description">
        <div className="flex items-start gap-2">
          <TabIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="mb-2">{tabInfo.description}</p>
            <StatusLegend compact />
          </div>
        </div>
      </div>
    );
  }
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="ally-help-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-strong rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold">Ally Hub Help</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
            data-testid="close-help-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Tab Info */}
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TabIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{tabInfo.title}</span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Current Tab</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{tabInfo.description}</p>
            <div className="space-y-1.5">
              {tabInfo.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Status Legend */}
          <div className="glass rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Status Legend</div>
            <StatusLegend />
          </div>
          
          {/* All Tabs Overview */}
          <div className="glass rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">All Tabs</div>
            <div className="space-y-2">
              {Object.entries(tabDescriptions).map(([key, info]) => {
                const Icon = info.icon;
                const isActive = key === activeTab;
                return (
                  <div 
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'hover:bg-secondary/50'}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>{info.title}</span>
                    {isActive && <span className="text-xs text-primary ml-auto">Active</span>}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd> anytime to open this help
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the legend for use in other components
export { StatusLegend };
