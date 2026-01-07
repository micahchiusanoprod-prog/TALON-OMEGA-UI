import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { 
  Wifi, 
  Radio, 
  MessageSquare, 
  Antenna,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  Signal,
  Battery,
  Map,
  Users
} from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'primary' }) => (
  <div className="mb-3">
    <div className="flex items-center gap-2 mb-1.5">
      <Icon className={`w-4 h-4 text-${color}`} />
      <h4 className="text-xs font-semibold">{title}</h4>
    </div>
    <div className="text-xs text-muted-foreground leading-relaxed pl-6">
      {children}
    </div>
  </div>
);

const Tip = ({ children }) => (
  <div className="flex items-start gap-2 mb-1">
    <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const Warning = ({ children }) => (
  <div className="flex items-start gap-2 mb-1">
    <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const commsMethodsData = [
  {
    id: 'lan',
    name: 'LAN / Wi-Fi',
    icon: Wifi,
    color: 'primary',
    summary: 'Local network communication. Fast, reliable, but limited range.',
    howItWorks: `
      Wi-Fi connects OMEGA devices through a local router or direct hotspot connection.
      Messages travel at high speed with low latency. Ideal for same-building or 
      close-proximity coordination.
    `,
    whenToUse: [
      'All devices are within Wi-Fi range (typically <300 ft indoors)',
      'You need fast, real-time communication',
      'Sharing large files or streaming',
      'Base camp or home scenarios',
    ],
    failureModes: [
      { issue: 'Router down', fix: 'Switch to OMEGA hotspot mode or mesh' },
      { issue: 'Out of range', fix: 'Move closer or use mesh/LoRa' },
      { issue: 'Too many devices', fix: 'Reduce connected devices or use 5GHz band' },
      { issue: 'Interference', fix: 'Change Wi-Fi channel or move away from microwaves/cordless phones' },
    ],
    specs: {
      range: '150-300 ft (indoors), 650+ ft (outdoors)',
      speed: '10-100+ Mbps',
      latency: '<50ms',
      power: 'Moderate (500-1000mW)',
    },
  },
  {
    id: 'mesh',
    name: 'Mesh / LoRa / Meshtastic',
    icon: Radio,
    color: 'success',
    summary: 'Long-range, low-power mesh network. Slower but works without infrastructure.',
    howItWorks: `
      LoRa (Long Range) radio creates a mesh network where messages hop between devices.
      Each OMEGA acts as a relay, extending range. Works without any infrastructure.
      Uses Meshtastic protocol for encrypted, decentralized messaging.
    `,
    whenToUse: [
      'Devices are spread over long distances (0.5-6+ mi)',
      'No Wi-Fi or cellular infrastructure available',
      'Low-bandwidth text messaging is sufficient',
      'Need maximum battery life',
      'Outdoor/wilderness scenarios',
    ],
    failureModes: [
      { issue: 'No route to node', fix: 'Position a relay device between endpoints' },
      { issue: 'Weak signal', fix: 'Elevate antenna, clear obstructions, reduce distance' },
      { issue: 'Message delays', fix: 'Normal for mesh - wait 30-60s for multi-hop' },
      { issue: 'Antenna disconnected', fix: 'Check SMA/U.FL connector, never transmit without antenna' },
    ],
    specs: {
      range: '0.5-6 mi (line of sight), 1-3 mi typical',
      speed: '0.3-5 kbps',
      latency: '1-60s (depends on hops)',
      power: 'Very low (100-500mW)',
    },
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    icon: MessageSquare,
    color: 'warning',
    summary: 'Cellular text messaging bridge. Reaches phones outside the OMEGA network.',
    howItWorks: `
      An OMEGA device with a cellular modem can bridge messages to/from standard SMS.
      Allows communication with family members who don't have OMEGA devices.
      Requires cellular signal and active SIM card.
    `,
    whenToUse: [
      'Need to reach people without OMEGA devices',
      'Cellular coverage is available',
      'Backup when other methods fail',
      'Sending alerts to emergency contacts',
    ],
    failureModes: [
      { issue: 'No signal', fix: 'Move to higher ground, try different carrier if available' },
      { issue: 'SIM issues', fix: 'Check SIM is active, has credit, properly seated' },
      { issue: 'Modem not responding', fix: 'Restart modem service, check USB connection' },
      { issue: 'Messages not sending', fix: 'Check APN settings, carrier may be congested' },
    ],
    specs: {
      range: 'Depends on cell towers',
      speed: '~1 kbps (SMS)',
      latency: '1-30s typical',
      power: 'High during transmit (1-2W)',
    },
  },
  {
    id: 'hf',
    name: 'HF Radio Bridge',
    icon: Antenna,
    color: 'muted-foreground',
    summary: 'High-frequency radio for extreme long-range. Future capability.',
    howItWorks: `
      HF (High Frequency) radio can bounce signals off the ionosphere for 
      continent-spanning range. Requires amateur radio license and specialized equipment.
      Will support digital modes like JS8Call for text messaging.
    `,
    whenToUse: [
      'All other methods unavailable',
      'Need to reach 100+ km distances',
      'Grid-down scenarios',
      'Requires proper licensing and equipment',
    ],
    failureModes: [
      { issue: 'Poor propagation', fix: 'Check solar conditions, try different bands/times' },
      { issue: 'High noise floor', fix: 'Use noise reduction, move away from electronics' },
      { issue: 'Antenna problems', fix: 'Check SWR, ensure proper tuning for band' },
      { issue: 'Regulatory issues', fix: 'Ensure proper licensing, follow band plans' },
    ],
    specs: {
      range: '100-10,000+ km',
      speed: '~50 bps (digital modes)',
      latency: 'Minutes (store-and-forward)',
      power: 'High (5-100W)',
    },
    future: true,
  },
];

const MethodSection = ({ method }) => {
  const Icon = method.icon;
  
  return (
    <AccordionItem value={method.id} className="glass rounded-lg border-0 mb-2">
      <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid={`knowledge-${method.id}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 text-${method.color}`} />
          <span className="text-sm font-medium">{method.name}</span>
          {method.future && (
            <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">Future</span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="text-xs text-muted-foreground space-y-4">
          {/* Summary */}
          <p className="text-foreground/80 font-medium">{method.summary}</p>
          
          {/* How It Works */}
          <Section icon={Zap} title="How It Works" color={method.color}>
            <p className="whitespace-pre-line">{method.howItWorks.trim()}</p>
          </Section>
          
          {/* When To Use */}
          <Section icon={Target} title="When To Use" color="success">
            {method.whenToUse.map((use, i) => (
              <Tip key={i}>{use}</Tip>
            ))}
          </Section>
          
          {/* Failure Modes */}
          <Section icon={AlertTriangle} title="Failure Modes & Fixes" color="warning">
            <div className="space-y-2">
              {method.failureModes.map((fm, i) => (
                <div key={i} className="glass p-2 rounded">
                  <div className="font-medium text-foreground">{fm.issue}</div>
                  <div className="text-muted-foreground">→ {fm.fix}</div>
                </div>
              ))}
            </div>
          </Section>
          
          {/* Specs */}
          <Section icon={Signal} title="Specifications" color="muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div className="glass p-2 rounded">
                <div className="text-muted-foreground">Range</div>
                <div className="font-medium text-foreground">{method.specs.range}</div>
              </div>
              <div className="glass p-2 rounded">
                <div className="text-muted-foreground">Speed</div>
                <div className="font-medium text-foreground">{method.specs.speed}</div>
              </div>
              <div className="glass p-2 rounded">
                <div className="text-muted-foreground">Latency</div>
                <div className="font-medium text-foreground">{method.specs.latency}</div>
              </div>
              <div className="glass p-2 rounded">
                <div className="text-muted-foreground">Power</div>
                <div className="font-medium text-foreground">{method.specs.power}</div>
              </div>
            </div>
          </Section>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function CommsKnowledge() {
  return (
    <div className="space-y-4" data-testid="comms-knowledge">
      {/* Intro */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">Communications Field Manual</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Understanding your communication options is critical when infrastructure fails.
          Each method has trade-offs between range, speed, power, and reliability.
        </p>
      </div>

      {/* Quick Decision Guide */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" />
          Quick Decision Guide
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="glass p-2 rounded">
            <div className="text-muted-foreground mb-1">Same building/camp</div>
            <div className="font-medium text-primary flex items-center gap-1">
              <Wifi className="w-3 h-3" /> LAN / Wi-Fi
            </div>
          </div>
          <div className="glass p-2 rounded">
            <div className="text-muted-foreground mb-1">1-10km apart</div>
            <div className="font-medium text-success flex items-center gap-1">
              <Radio className="w-3 h-3" /> Mesh / LoRa
            </div>
          </div>
          <div className="glass p-2 rounded">
            <div className="text-muted-foreground mb-1">Contact non-OMEGA</div>
            <div className="font-medium text-warning flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> SMS Gateway
            </div>
          </div>
          <div className="glass p-2 rounded">
            <div className="text-muted-foreground mb-1">100+ km / grid down</div>
            <div className="font-medium text-muted-foreground flex items-center gap-1">
              <Antenna className="w-3 h-3" /> HF Radio (future)
            </div>
          </div>
        </div>
      </div>

      {/* Methods Detail */}
      <Accordion type="multiple" className="space-y-2" defaultValue={['lan']}>
        {commsMethodsData.map((method) => (
          <MethodSection key={method.id} method={method} />
        ))}
      </Accordion>

      {/* General Tips */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-success" />
          General Best Practices
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <Tip>Always have at least two communication methods ready</Tip>
          <Tip>Test all methods before you need them</Tip>
          <Tip>Keep spare batteries charged for radios</Tip>
          <Tip>Establish check-in schedules with your group</Tip>
          <Tip>Use standard codes to save bandwidth and time</Tip>
          <Warning>Never transmit on amateur bands without proper license</Warning>
        </div>
      </div>
    </div>
  );
}
