import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
import { 
  HelpCircle, 
  Wrench, 
  List,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  Lightbulb,
  Shield,
  ChevronRight
} from 'lucide-react';

// Reusable step component
const Step = ({ number, children }) => (
  <div className="flex items-start gap-2 mb-1.5">
    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
      {number}
    </span>
    <span className="text-xs">{children}</span>
  </div>
);

const Tip = ({ children }) => (
  <div className="flex items-start gap-2 mb-1">
    <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
    <span className="text-xs">{children}</span>
  </div>
);

const Warning = ({ children }) => (
  <div className="flex items-start gap-2 mb-1">
    <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
    <span className="text-xs">{children}</span>
  </div>
);

const Bullet = ({ children }) => (
  <div className="flex items-start gap-2 mb-1">
    <span className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0 mt-1.5" />
    <span className="text-xs">{children}</span>
  </div>
);

// Legend Item Component
const LegendItem = ({ color, label, meaning, action }) => (
  <div className="flex items-start gap-2 p-2 glass rounded-lg">
    <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0 mt-0.5`} />
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{meaning}</div>
      {action && (
        <div className="text-xs text-primary mt-0.5">→ {action}</div>
      )}
    </div>
  </div>
);

// Symptom-Cause-Fix mapping component
const TroubleshootItem = ({ symptom, causes, fixes, fallback }) => (
  <div className="glass rounded-lg p-3 mb-2">
    <div className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-warning" />
      {symptom}
    </div>
    
    <div className="space-y-2 text-xs text-muted-foreground">
      <div>
        <span className="font-medium text-foreground">Likely causes:</span>
        <ul className="mt-1 space-y-0.5">
          {causes.map((cause, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-warning">•</span>
              <span>{cause}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <span className="font-medium text-foreground">Fix steps:</span>
        <ol className="mt-1 space-y-1">
          {fixes.map((fix, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span>{fix}</span>
            </li>
          ))}
        </ol>
      </div>
      
      {fallback && (
        <div className="pt-2 border-t border-border/50">
          <span className="font-medium text-foreground">If all else fails:</span>
          <p className="mt-1">{fallback}</p>
        </div>
      )}
    </div>
  </div>
);

/**
 * Standardized Help Tab Content
 * @param {string} whatItDoes - 1-2 sentence description
 * @param {string[]} quickStart - 3-6 step quick start guide
 * @param {object[]} controls - Array of {name, description, states?}
 * @param {string[]} bestPractices - Field-optimized tips
 */
export function HelpTabContent({ whatItDoes, quickStart, controls, bestPractices }) {
  return (
    <div className="space-y-4" data-testid="help-tab-content">
      {/* What This Does */}
      <div className="glass rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">What This Does</span>
        </div>
        <p className="text-xs text-muted-foreground">{whatItDoes}</p>
      </div>
      
      {/* Quick Start */}
      {quickStart && quickStart.length > 0 && (
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold">Quick Start</span>
          </div>
          <div className="text-muted-foreground">
            {quickStart.map((step, i) => (
              <Step key={i} number={i + 1}>{step}</Step>
            ))}
          </div>
        </div>
      )}
      
      {/* Controls & Indicators */}
      {controls && controls.length > 0 && (
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <List className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Controls & Indicators</span>
          </div>
          <div className="space-y-2">
            {controls.map((ctrl, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium text-foreground">{ctrl.name}:</span>
                <span className="text-muted-foreground ml-1">{ctrl.description}</span>
                {ctrl.states && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {ctrl.states.map((state, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${state.color}`} />
                        <span className="text-muted-foreground">{state.label}: {state.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Best Practices */}
      {bestPractices && bestPractices.length > 0 && (
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold">Best Practices</span>
          </div>
          <div className="text-muted-foreground">
            {bestPractices.map((tip, i) => (
              <Tip key={i}>{tip}</Tip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Standardized Troubleshooting Tab Content
 * @param {object[]} issues - Array of {symptom, causes[], fixes[], fallback?}
 * @param {string[]} safetyNotes - Safety/data notes
 */
export function TroubleshootingTabContent({ issues, safetyNotes }) {
  return (
    <div className="space-y-4" data-testid="troubleshooting-tab-content">
      <div className="glass rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Common Issues & Fixes</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Click an issue to see causes and step-by-step fixes.
        </p>
        
        <Accordion type="multiple" className="space-y-2">
          {issues.map((issue, i) => (
            <AccordionItem key={i} value={`issue-${i}`} className="glass rounded-lg border-0">
              <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span>{issue.symptom}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Likely causes:</span>
                    <ul className="mt-1 space-y-0.5 pl-2">
                      {issue.causes.map((cause, j) => (
                        <li key={j}>• {cause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <span className="font-medium text-foreground">Fix steps:</span>
                    <ol className="mt-1 space-y-1">
                      {issue.fixes.map((fix, j) => (
                        <Step key={j} number={j + 1}>{fix}</Step>
                      ))}
                    </ol>
                  </div>
                  
                  {issue.fallback && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="font-medium text-warning">If all else fails:</span>
                      <p className="mt-1">{issue.fallback}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      {/* Safety Notes */}
      {safetyNotes && safetyNotes.length > 0 && (
        <div className="glass rounded-lg p-3 border border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold">Safety & Data Notes</span>
          </div>
          <div className="text-muted-foreground">
            {safetyNotes.map((note, i) => (
              <Warning key={i}>{note}</Warning>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Standardized Legend Component
 * @param {object[]} items - Array of {color, label, meaning, action?}
 */
export function LegendContent({ items, title = "Status Legend" }) {
  return (
    <div className="space-y-2" data-testid="legend-content">
      <div className="flex items-center gap-2">
        <List className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <LegendItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Help/Troubleshooting/Legend Tabs Component
 * Use this as a standard pattern in every tile
 */
export default function TileHelpTabs({ 
  helpContent, 
  troubleshootingContent, 
  legendItems,
  defaultTab = 'help'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div data-testid="tile-help-tabs">
      {/* Tab Navigation */}
      <div className="flex gap-1 glass rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('help')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'help' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
          data-testid="tile-tab-help"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
        <button
          onClick={() => setActiveTab('troubleshoot')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'troubleshoot' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
          data-testid="tile-tab-troubleshoot"
        >
          <Wrench className="w-4 h-4" />
          Troubleshoot
        </button>
        {legendItems && (
          <button
            onClick={() => setActiveTab('legend')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'legend' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
            data-testid="tile-tab-legend"
          >
            <List className="w-4 h-4" />
            Legend
          </button>
        )}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'help' && helpContent && (
        <HelpTabContent {...helpContent} />
      )}
      
      {activeTab === 'troubleshoot' && troubleshootingContent && (
        <TroubleshootingTabContent {...troubleshootingContent} />
      )}
      
      {activeTab === 'legend' && legendItems && (
        <LegendContent items={legendItems} />
      )}
    </div>
  );
}

// Export utilities for custom use
export { Step, Tip, Warning, Bullet, LegendItem, TroubleshootItem };
