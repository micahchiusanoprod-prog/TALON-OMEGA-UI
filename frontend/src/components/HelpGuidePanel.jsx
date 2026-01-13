import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle, ChevronDown, ChevronUp, BookOpen, AlertTriangle, 
  Info, List, ExternalLink, CheckCircle, XCircle, Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';

// ============================================================
// HELP GUIDE PANEL - Reusable Help Component
// ============================================================
// Used across Community Hub, Help Center, Logs, and other pages
// Provides consistent help experience with Legend, Troubleshooting,
// and "What this page does" sections

/**
 * HelpGuidePanel - Standardized help component
 * 
 * Props:
 * - pageTitle: string - Name of the current page/section
 * - quickHelp: string - Brief 1-2 sentence summary
 * - legendItems: array - [{ icon, label, description, color }]
 * - troubleshootingItems: array - [{ problem, solution }]
 * - whatItDoes: string - Longer explanation of the page purpose
 * - additionalSections: array - [{ title, icon, content }] for custom sections
 * - variant: 'compact' | 'full' - Display mode
 * - onOpenHelpCenter: function - Callback to open full Help Center
 */

export default function HelpGuidePanel({
  pageTitle = 'This Page',
  quickHelp = 'Quick tips and information to help you navigate.',
  legendItems = [],
  troubleshootingItems = [],
  whatItDoes = '',
  additionalSections = [],
  variant = 'compact',
  onOpenHelpCenter,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('legend');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  
  // Update dropdown position when expanded
  useEffect(() => {
    if (isExpanded && buttonRef.current && variant === 'compact') {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isExpanded, variant]);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (variant === 'compact' && dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded && variant === 'compact') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, variant]);

  const tabs = [
    { id: 'legend', label: 'Legend', icon: List, show: legendItems.length > 0 },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle, show: troubleshootingItems.length > 0 },
    { id: 'about', label: 'What this page does', icon: Info, show: !!whatItDoes },
    ...additionalSections.map(s => ({ id: s.id || s.title, label: s.title, icon: s.icon || Lightbulb, show: true })),
  ].filter(t => t.show);

  // Compact variant - just a help button that expands
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-sm"
          data-testid="help-guide-toggle"
        >
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Quick Help</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </button>

        {isExpanded && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/10"
              style={{ zIndex: 9998 }}
              onClick={() => setIsExpanded(false)}
            />
            {/* Dropdown Panel */}
            <div 
              ref={dropdownRef}
              className="fixed w-80 sm:w-96 max-w-[calc(100vw-2rem)] glass rounded-xl border border-border shadow-2xl overflow-hidden"
              style={{ 
                zIndex: 9999,
                top: dropdownPosition.top,
                right: Math.max(16, dropdownPosition.right),
              }}
              data-testid="help-guide-panel"
            >
              <HelpGuideContent
                pageTitle={pageTitle}
                quickHelp={quickHelp}
                legendItems={legendItems}
                troubleshootingItems={troubleshootingItems}
                whatItDoes={whatItDoes}
                additionalSections={additionalSections}
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenHelpCenter={onOpenHelpCenter}
                onClose={() => setIsExpanded(false)}
              />
            </div>
          </>,
          document.body
        )}
      </div>
    );
  }

  // Full variant - always visible panel
  return (
    <div className={`glass rounded-xl border border-border overflow-hidden ${className}`} data-testid="help-guide-panel-full">
      <HelpGuideContent
        pageTitle={pageTitle}
        quickHelp={quickHelp}
        legendItems={legendItems}
        troubleshootingItems={troubleshootingItems}
        whatItDoes={whatItDoes}
        additionalSections={additionalSections}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHelpCenter={onOpenHelpCenter}
      />
    </div>
  );
}

// Inner content component
function HelpGuideContent({
  pageTitle,
  quickHelp,
  legendItems,
  troubleshootingItems,
  whatItDoes,
  additionalSections,
  tabs,
  activeTab,
  setActiveTab,
  onOpenHelpCenter,
  onClose,
}) {
  return (
    <>
      {/* Header */}
      <div className="p-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{pageTitle} Help</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{quickHelp}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
              <XCircle className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="p-3 max-h-64 overflow-y-auto">
        {/* Legend Tab */}
        {activeTab === 'legend' && legendItems.length > 0 && (
          <div className="space-y-2">
            {legendItems.map((item, idx) => {
              // Handle icon - either a React component or a pre-rendered element
              const IconComponent = item.icon;
              const iconElement = item.iconElement || (IconComponent ? <IconComponent className={`w-3.5 h-3.5 ${item.color || 'text-primary'}`} /> : null);
              
              return (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                  {iconElement && (
                    <div className={`p-1 rounded ${item.bgColor || 'bg-primary/20'} flex items-center justify-center`}>
                      {iconElement}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Troubleshooting Tab */}
        {activeTab === 'troubleshooting' && troubleshootingItems.length > 0 && (
          <div className="space-y-3">
            {troubleshootingItems.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-secondary/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-400">{item.problem}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && whatItDoes && (
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground leading-relaxed">{whatItDoes}</p>
          </div>
        )}

        {/* Additional Sections */}
        {additionalSections.map(section => (
          activeTab === (section.id || section.title) && (
            <div key={section.id || section.title} className="p-2 rounded-lg bg-secondary/30">
              {typeof section.content === 'string' ? (
                <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
              ) : (
                section.content
              )}
            </div>
          )
        ))}
      </div>

      {/* Footer */}
      {onOpenHelpCenter && (
        <div className="p-3 border-t border-border bg-secondary/20">
          <button
            onClick={onOpenHelpCenter}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Visit Help Center for more
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  );
}

// ============================================================
// PRE-BUILT LEGEND ITEMS FOR COMMON UI PATTERNS
// ============================================================

export const COMMON_LEGEND_ITEMS = {
  statusDots: [
    { iconElement: <div className="w-2 h-2 rounded-full bg-success" />, label: 'Online / OK', description: 'System or member is active and healthy', color: 'text-success', bgColor: 'bg-success/20' },
    { iconElement: <div className="w-2 h-2 rounded-full bg-warning" />, label: 'Warning / Degraded', description: 'Needs attention or partially available', color: 'text-warning', bgColor: 'bg-warning/20' },
    { iconElement: <div className="w-2 h-2 rounded-full bg-destructive" />, label: 'Critical / Offline', description: 'Requires immediate attention or unavailable', color: 'text-destructive', bgColor: 'bg-destructive/20' },
    { iconElement: <div className="w-2 h-2 rounded-full bg-muted-foreground" />, label: 'Unknown', description: 'Status cannot be determined', color: 'text-muted-foreground', bgColor: 'bg-muted/20' },
  ],
  
  severityBadges: [
    { icon: AlertTriangle, label: 'CRITICAL', description: 'Urgent - requires immediate action', color: 'text-destructive', bgColor: 'bg-destructive/20' },
    { icon: AlertTriangle, label: 'WARNING', description: 'Important - should be addressed soon', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    { icon: Info, label: 'INFO', description: 'Informational - for awareness', color: 'text-primary', bgColor: 'bg-primary/20' },
    { icon: CheckCircle, label: 'RESOLVED', description: 'Issue has been addressed', color: 'text-success', bgColor: 'bg-success/20' },
  ],
  
  dataSourceBadges: [
    { iconElement: <span className="text-[8px] font-bold text-amber-400">MOCK</span>, label: 'MOCK DATA', description: 'Using simulated data - backend not connected', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    { iconElement: <span className="text-[8px] font-bold text-success">LIVE</span>, label: 'LIVE', description: 'Real-time data from OMEGA backend', color: 'text-success', bgColor: 'bg-success/20' },
  ],
};

// ============================================================
// PRE-BUILT TROUBLESHOOTING ITEMS
// ============================================================

export const COMMON_TROUBLESHOOTING = {
  noData: { problem: 'No data showing', solution: 'Check if backend is connected. If using mock data, try refreshing the page.' },
  slowLoading: { problem: 'Page loads slowly', solution: 'Large datasets may take a moment. Try filtering to reduce data volume.' },
  filterNoResults: { problem: 'Filters return no results', solution: 'Try clearing filters or broadening your search criteria.' },
  offlineMode: { problem: 'Working offline', solution: 'OMEGA works offline with cached data. Full features require backend connection.' },
};
