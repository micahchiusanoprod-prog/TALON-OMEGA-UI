import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { 
  Satellite, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Clock,
  Cloud,
  Building,
  TreePine,
  Zap,
  RefreshCw,
  Battery,
  ThermometerSun,
  Radio,
  Globe
} from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'primary' }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 text-${color}`} />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    <div className="text-xs text-muted-foreground leading-relaxed pl-6">
      {children}
    </div>
  </div>
);

const Tip = ({ children }) => (
  <div className="flex items-start gap-2 mb-1.5">
    <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const Warning = ({ children }) => (
  <div className="flex items-start gap-2 mb-1.5">
    <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

export default function GpsGuide() {
  return (
    <div className="space-y-4" data-testid="gps-guide">
      {/* Intro */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Satellite className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">GPS Guide</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          GPS (Global Positioning System) uses satellites to determine your location. 
          This guide covers how it works, common issues, and how to get the best signal.
        </p>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" className="space-y-2" defaultValue={["how-gps-works"]}>
        
        {/* How GPS Works */}
        <AccordionItem value="how-gps-works" className="glass rounded-lg border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-how-gps-works">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">How GPS Works</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
              <p>
                <strong>The basics:</strong> 24+ satellites orbit Earth, broadcasting time signals. 
                Your device receives these signals and calculates distance to each satellite based on signal travel time.
              </p>
              <p>
                <strong>Getting a "fix":</strong> You need signals from at least <strong>4 satellites</strong> for 
                a 3D position (latitude, longitude, altitude). More satellites = better accuracy.
              </p>
              <div className="glass p-3 rounded-lg mt-2">
                <div className="font-medium mb-1">Signal Quality Indicators:</div>
                <ul className="space-y-1">
                  <li>• <strong>3-4 sats:</strong> Basic fix, 25-50m accuracy</li>
                  <li>• <strong>5-7 sats:</strong> Good fix, 10-25m accuracy</li>
                  <li>• <strong>8+ sats:</strong> Excellent fix, &lt;10m accuracy</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* What is a GPS Fix */}
        <AccordionItem value="what-is-fix" className="glass rounded-lg border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-what-is-fix">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">What "GPS Fix" Means</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-3 rounded-lg">
                  <div className="flex items-center gap-1 text-success font-medium mb-1">
                    <CheckCircle2 className="w-3 h-3" /> Fix
                  </div>
                  <p>Device has locked onto enough satellites to calculate your position. Location data is available and updating.</p>
                </div>
                <div className="glass p-3 rounded-lg">
                  <div className="flex items-center gap-1 text-warning font-medium mb-1">
                    <AlertTriangle className="w-3 h-3" /> No Fix
                  </div>
                  <p>Device cannot see enough satellites. Location is unknown or stale. Usually temporary—see troubleshooting.</p>
                </div>
              </div>
              <p>
                <strong>Fix types:</strong>
              </p>
              <ul className="space-y-1 pl-2">
                <li>• <strong>2D Fix:</strong> 3 satellites, no altitude (less common)</li>
                <li>• <strong>3D Fix:</strong> 4+ satellites, full position with altitude</li>
                <li>• <strong>DGPS/RTK:</strong> Enhanced accuracy using correction data</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Common Failure Reasons */}
        <AccordionItem value="failure-reasons" className="glass rounded-lg border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-failure-reasons">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Why GPS Fails</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Urban canyons:</strong> Tall buildings block and reflect signals, 
                    causing multipath errors or complete signal loss.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TreePine className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Dense foliage:</strong> Trees and vegetation weaken signals, 
                    especially wet leaves. Worst in summer.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Cloud className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Weather:</strong> Heavy rain, snow, or thick clouds can degrade 
                    signal quality (though GPS usually works through weather).
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Radio className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Interference:</strong> Some electronics, power lines, or 
                    intentional jammers can disrupt GPS signals.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Cold start:</strong> After being off for days, GPS needs to 
                    download new almanac data (can take 5-15 minutes).
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Troubleshooting */}
        <AccordionItem value="troubleshooting" className="glass rounded-lg border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-troubleshooting">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Troubleshooting Steps</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
              <p className="font-medium text-foreground">Follow these steps in order:</p>
              
              <div className="space-y-2">
                <div className="glass p-2.5 rounded-lg">
                  <div className="font-medium text-foreground mb-1">1. Check your environment</div>
                  <Tip>Move outdoors with clear sky view</Tip>
                  <Tip>Step away from buildings, overhangs, vehicles</Tip>
                  <Tip>Avoid dense tree cover if possible</Tip>
                </div>
                
                <div className="glass p-2.5 rounded-lg">
                  <div className="font-medium text-foreground mb-1">2. Wait for acquisition</div>
                  <Tip>Stay still for 30-60 seconds</Tip>
                  <Tip>Cold start can take up to 15 minutes</Tip>
                  <Warning>Moving during acquisition resets the process</Warning>
                </div>
                
                <div className="glass p-2.5 rounded-lg">
                  <div className="font-medium text-foreground mb-1">3. Check hardware</div>
                  <Tip>Verify antenna is connected and upright</Tip>
                  <Tip>Check for physical damage to antenna/cable</Tip>
                  <Tip>Ensure GPS module has power</Tip>
                </div>
                
                <div className="glass p-2.5 rounded-lg">
                  <div className="font-medium text-foreground mb-1">4. Software restart</div>
                  <Tip>Restart GPS service: <code className="bg-muted px-1 rounded">sudo systemctl restart gpsd</code></Tip>
                  <Tip>If stuck, full device reboot may help</Tip>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Best Practices */}
        <AccordionItem value="best-practices" className="glass rounded-lg border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="accordion-best-practices">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Best Practices</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
              <Section icon={Zap} title="For Best Signal" color="success">
                <Tip>Mount antenna with clear 360° sky view</Tip>
                <Tip>Keep antenna away from metal surfaces</Tip>
                <Tip>Position antenna horizontally (dome up)</Tip>
                <Tip>Avoid placing near WiFi/radio antennas</Tip>
              </Section>
              
              <Section icon={Battery} title="Power Management" color="warning">
                <Tip>GPS draws ~50mA continuously</Tip>
                <Tip>Consider duty cycling in battery-critical situations</Tip>
                <Tip>Hot start (recent fix data) is faster than cold start</Tip>
              </Section>
              
              <Section icon={ThermometerSun} title="Environmental Care" color="primary">
                <Tip>GPS works -40°C to +85°C (module dependent)</Tip>
                <Tip>Protect antenna from direct impact/abrasion</Tip>
                <Tip>Waterproof connections for outdoor use</Tip>
              </Section>
              
              <Section icon={RefreshCw} title="Regular Maintenance" color="muted-foreground">
                <Tip>Check antenna connections monthly</Tip>
                <Tip>Update GPS firmware when available</Tip>
                <Tip>Monitor signal quality trends over time</Tip>
              </Section>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
      
      {/* Quick Reference Card */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Minimum for fix:</div>
            <div className="font-medium">4 satellites</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Cold start time:</div>
            <div className="font-medium">5-15 minutes</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Hot start time:</div>
            <div className="font-medium">&lt;30 seconds</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Typical accuracy:</div>
            <div className="font-medium">3-15 meters</div>
          </div>
        </div>
      </div>
    </div>
  );
}
