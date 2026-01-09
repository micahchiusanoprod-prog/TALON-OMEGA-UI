import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ArrowLeft,
  Wifi,
  Map,
  Radio,
  MapPin,
  Thermometer,
  Battery,
  Book,
  Film,
  FileText,
  Users,
  Settings,
  Wrench,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  MessageSquare,
  Signal,
  X
} from 'lucide-react';
import { Button } from './ui/button';

// FAQ Data organized by category
const FAQ_CATEGORIES = [
  {
    id: 'connect',
    name: 'Connect',
    icon: Wifi,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    description: 'Join Wi-Fi, open the dashboard, first-time setup',
    faqs: [
      {
        q: 'Do I need internet?',
        a: 'No. OMEGA is designed to work without internet. Internet is optional and only used for features you intentionally add that depend on it.'
      },
      {
        q: 'What address do I open?',
        a: 'Open the local dashboard address the operator provides. Many setups use a local name (e.g., talon.local) or a local IP.'
      },
      {
        q: "What if the dashboard says 'site can't be reached'?",
        a: "Reconnect to OMEGA Wi-Fi and try again. If it still fails, tell the operator: your device type, the address you tried, and whether others can load it."
      },
      {
        q: 'Will I automatically stay signed in?',
        a: 'Yes. The dashboard stores a device token so when you reconnect on the same device, you are signed in automatically.'
      }
    ]
  },
  {
    id: 'navigate',
    name: 'Navigate',
    icon: Map,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    description: 'Tiles, status colors, where to find things',
    faqs: [
      {
        q: 'What is a tile?',
        a: 'A tile is a panel focused on one system (Comms, Map, Sensors, Power, Library, Media). Each tile is meant to be scannable and actionable.'
      },
      {
        q: 'Where do I find help?',
        a: 'Use the FAQ button in the header. It opens this FAQ with icons and a search bar.'
      },
      {
        q: 'What should I check first in the field?',
        a: 'Power (battery/runtime), Comms Hub (what is available), then Map/GPS (if moving).'
      },
      {
        q: 'What do the colors mean?',
        a: 'Green = available/healthy. Yellow = degraded/partial. Red = unavailable/down. The dashboard shows last-known-good values with timestamps.'
      },
      {
        q: "What is an 'alert'?",
        a: 'An alert is a high-visibility message: urgent broadcast, degraded subsystem warning, or operator notice. Treat urgent alerts as action items.'
      }
    ]
  },
  {
    id: 'comms',
    name: 'Comms Hub',
    icon: Radio,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    description: 'Pick the right comm method; understand Degraded',
    faqs: [
      {
        q: 'What is the Ally Communications Hub?',
        a: 'It is the dashboard area that helps you pick the best way to communicate or coordinate based on range and availability.'
      },
      {
        q: 'How do I pick the right method fast?',
        a: 'Use distance + infrastructure: same camp = LAN/Wi-Fi; spread out = Mesh/LoRa; cell available = SMS; very far = HF bridge; specialist monitoring = SDR.'
      },
      {
        q: 'What does Degraded mean?',
        a: 'Degraded means the method exists but is not fully healthy (unstable, missing upstream signal, or hardware not responding). Use a fallback method if possible.'
      },
      {
        q: 'What should I do if a method is Degraded?',
        a: 'Pick the next-best method and continue. Then report the degraded method to the operator with: what you tried, when, and what you saw.'
      },
      {
        q: 'What is LAN / Wi-Fi?',
        a: 'Messaging and coordination over the local Wi-Fi/Ethernet network. Your device talks directly to OMEGA and other devices on the same network. Think of it as "talking in the same room." Best for inside the same camp/building for chat, files, maps.'
      },
      {
        q: 'What is Mesh / LoRa?',
        a: 'Long-range, low-bandwidth messaging that can relay through other radios. Small packets hop node-to-node, like "passing notes down a line." Use when Wi-Fi cannot reach but you need check-ins, coordinates, alerts. Works up to 1-5 miles line of sight.'
      },
      {
        q: 'What is Radio / SDR?',
        a: 'Software-defined radio tools for monitoring and specialized radio tasks (hardware dependent). A flexible receiver/analyzer controlled by software. Use for situational awareness, monitoring, and advanced radio workflows.'
      },
      {
        q: 'What is SMS Gateway?',
        a: 'Sends messages via the cellular network as SMS (only if cell service exists). OMEGA forwards messages to a cellular modem/phone bridge. Use when you have cell coverage and need to reach outside the local network.'
      },
      {
        q: 'What is HF Bridge?',
        a: 'Very long-range radio messaging via HF digital modes (hardware and training required). Slow, robust digital messaging beyond line-of-sight. Use for long distance when no infrastructure exists. Range: 100-3000+ miles depending on conditions.'
      }
    ]
  },
  {
    id: 'gps',
    name: 'Map & GPS',
    icon: MapPin,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'Fix status, accuracy, stale data, coordinate tools',
    faqs: [
      {
        q: 'What is a GPS fix?',
        a: 'A fix means the GPS has locked enough satellites to compute position. "No Fix" means not ready. 2D is position only; 3D is best quality (adds altitude).'
      },
      {
        q: 'What does accuracy mean?',
        a: 'Accuracy is an estimated error radius in meters. Smaller is better. Example: 5m means your position is likely within about 5 meters of the reported location.'
      },
      {
        q: 'Why is GPS not working indoors?',
        a: 'GPS needs a clear view of the sky. Move near a window or go outside and wait 1-3 minutes for satellites to lock.'
      },
      {
        q: "What does 'stale' location mean?",
        a: 'Stale means the last fix is old. The UI shows a timestamp next to coordinates; if it is old, do not assume the location is current. Move to get a fresh fix.'
      }
    ]
  },
  {
    id: 'sensors',
    name: 'Sensors',
    icon: Thermometer,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    description: 'Environment readings, what they mean, missing data',
    faqs: [
      {
        q: 'What sensors does OMEGA typically use?',
        a: 'Commonly: temperature, humidity, pressure, and optional air-quality estimate (depending on the sensor module installed).'
      },
      {
        q: 'How should I interpret air-quality numbers?',
        a: 'Treat them as directional rather than medical-grade. Use them to spot changes: ventilation issues, smoke, or trapped heat inside the case.'
      },
      {
        q: 'What if sensors are missing?',
        a: "Report 'Sensor tile shows no data' to the operator. Users should not rewire anything in the field."
      }
    ]
  },
  {
    id: 'power',
    name: 'Power',
    icon: Battery,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    description: 'Battery state, runtime estimate, what drains power',
    faqs: [
      {
        q: 'What does the Power tile show?',
        a: 'Battery percent, voltage/current, estimated runtime, net flow (charge vs discharge), and major sources/loads (if configured).'
      },
      {
        q: 'What drains power the fastest?',
        a: 'High CPU load, high screen brightness (if using a built-in display), Wi-Fi congestion, radios at transmit power, and heavy media streaming.'
      },
      {
        q: 'What should I do to extend runtime?',
        a: 'Reduce streaming, reduce unnecessary services, keep radios to the minimum needed, and use power-saving settings. Ask the operator before changing system settings.'
      }
    ]
  },
  {
    id: 'library',
    name: 'Library',
    icon: Book,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    description: 'Offline knowledge (Kiwix), search, slow pages',
    faqs: [
      {
        q: 'What is Kiwix?',
        a: 'An offline reader for large libraries (Wikipedia, medical references, how-to content) stored on the OMEGA drive. Everything works without internet.'
      },
      {
        q: 'How do I use it?',
        a: 'Open the Library tile/link and search by keyword. Everything is local - no internet needed.'
      },
      {
        q: 'What if a library tile is missing?',
        a: 'Tell the operator which library is missing. This is a maintenance/registration issue they need to resolve.'
      }
    ]
  },
  {
    id: 'media',
    name: 'Media',
    icon: Film,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    description: 'Jellyfin streaming, buffering, bandwidth etiquette',
    faqs: [
      {
        q: 'What is Jellyfin?',
        a: 'A local media server. It streams offline movies/shows to devices connected to OMEGA without needing internet.'
      },
      {
        q: 'Why does video buffer?',
        a: 'Wi-Fi congestion or weak signal. Move closer to the OMEGA device, lower video quality, or pause other heavy usage.'
      },
      {
        q: 'When should I avoid streaming?',
        a: 'During critical comms or emergencies, pause streaming to preserve bandwidth for coordination and maps.'
      }
    ]
  },
  {
    id: 'files',
    name: 'Files',
    icon: FileText,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    description: 'File sharing, uploads/downloads, safe handling',
    faqs: [
      {
        q: 'How do file drops work?',
        a: 'OMEGA provides local file sharing. Use it to exchange documents, images, maps, and logs without internet.'
      },
      {
        q: 'What is a safe way to share files?',
        a: "Prefer the dashboard's file tile or the operator-provided share location. Avoid unknown USB drives. Keep sensitive files restricted to the operator."
      },
      {
        q: 'What should I do if an upload fails?',
        a: 'Retry once on a stable connection. If it keeps failing, tell the operator what file type/size and what action you took.'
      }
    ]
  },
  {
    id: 'profiles',
    name: 'Profiles',
    icon: Users,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    description: 'Profiles, households/groups, dependents, auto sign-in',
    faqs: [
      {
        q: 'What information belongs in a profile?',
        a: 'Name, photo (optional), languages, skills/certifications, and any planning-relevant fields you are comfortable sharing.'
      },
      {
        q: 'Can I add medical info and allergies?',
        a: 'Yes, but it should be optional and private by default. Only share it if you consent and understand who can see it.'
      },
      {
        q: 'Can I link family members?',
        a: 'Yes. Households/groups help the operator coordinate supplies and accountability across your group.'
      }
    ]
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: Settings,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    description: 'Broadcasts, polls, fleet updates, backups, monitoring',
    faqs: [
      {
        q: 'What does the operator manage?',
        a: 'System health, backups, fleet software updates, group broadcasts, emergency polls, and moderation for public areas.'
      },
      {
        q: 'How do broadcasts work?',
        a: "A broadcast is a message pushed to all connected devices (INFO or URGENT). URGENT creates an obvious prompt on the user's screen."
      },
      {
        q: 'How do emergency polls work?',
        a: "The operator can send a one-tap poll (e.g., 'Assemble now? Yes/No') to quickly gather status and decisions from all users."
      },
      {
        q: 'Can the operator force-update other devices?',
        a: 'OMEGA can distribute updates to other OMEGA nodes (fleet management), but it must be implemented with signed packages and rollback to prevent issues.'
      }
    ]
  },
  {
    id: 'troubleshoot',
    name: 'Fix It',
    icon: Wrench,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    description: 'Troubleshooting shortcuts and operator escalation',
    faqs: [
      {
        q: "Dashboard won't load",
        a: "Not connected or wrong address. Reconnect to OMEGA Wi-Fi and retry. If others also cannot load it, tell the operator."
      },
      {
        q: "Connected but nothing works",
        a: "Backend is degraded or network unstable. Refresh once, move closer to the device, and report the issue to the operator."
      },
      {
        q: "Comms Degraded",
        a: "Method partially working. Use a fallback method and report which one is degraded to the operator."
      },
      {
        q: "GPS No Fix",
        a: "No sky view or GPS not ready. Go outside or near a window and wait 1-3 minutes for satellites to lock."
      },
      {
        q: "Sensor missing",
        a: "Hardware or permissions issue. Report it to the operator; do not attempt to rewire anything in the field."
      },
      {
        q: "Library/Media slow",
        a: "Wi-Fi congestion. Move closer to the OMEGA device, pause other streaming, and retry."
      },
      {
        q: "What should I tell the operator when reporting an issue?",
        a: "Include: what tile you were in, what action you attempted, what you expected vs what happened, time of issue, device type (iPhone/Android/laptop), and a screenshot if possible."
      }
    ]
  }
];

// Single FAQ Item component
const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className="border-b border-border/50 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors active:bg-white/10"
      data-testid={`faq-item-${faq.q.slice(0, 20)}`}
    >
      <span className="font-medium text-[13px] sm:text-sm pr-3 leading-snug">{faq.q}</span>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 animate-fade-in">
        <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
      </div>
    )}
  </div>
);

// Category Section component
const CategorySection = ({ category, openItems, toggleItem, searchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = category.icon;
  
  // Filter FAQs based on search
  const filteredFaqs = searchQuery
    ? category.faqs.filter(
        faq =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : category.faqs;
  
  if (searchQuery && filteredFaqs.length === 0) return null;
  
  return (
    <div className="glass rounded-xl sm:rounded-2xl overflow-hidden" data-testid={`faq-category-${category.id}`}>
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-white/5 transition-colors active:bg-white/10"
      >
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${category.bgColor} flex-shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${category.color}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{category.description}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <span className="text-[10px] sm:text-xs text-muted-foreground">{filteredFaqs.length}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* FAQs */}
      {isExpanded && (
        <div className="border-t border-border/50">
          {filteredFaqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              faq={faq}
              isOpen={openItems[`${category.id}-${idx}`]}
              onToggle={() => toggleItem(`${category.id}-${idx}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FAQPage({ onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});
  
  const toggleItem = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // Count total matching FAQs
  const totalMatches = searchQuery
    ? FAQ_CATEGORIES.reduce((acc, cat) => {
        return acc + cat.faqs.filter(
          faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).length;
      }, 0)
    : FAQ_CATEGORIES.reduce((acc, cat) => acc + cat.faqs.length, 0);
  
  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden" data-testid="faq-page">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="faq-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/20">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Help Center</h1>
              <p className="text-sm text-muted-foreground">Find answers to common questions</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              data-testid="faq-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              Found {totalMatches} results for "{searchQuery}"
            </p>
          )}
        </div>
      </div>
      
      {/* Quick Navigation (Icon Grid) */}
      {!searchQuery && (
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">QUICK NAVIGATION</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {FAQ_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  title={cat.name}
                >
                  <div className={`p-2 rounded-lg ${cat.bgColor} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate max-w-full">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* FAQ Categories */}
      <div className="container mx-auto px-4 pb-8 overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="space-y-4">
          {FAQ_CATEGORIES.map(category => (
            <div key={category.id} id={`cat-${category.id}`}>
              <CategorySection
                category={category}
                openItems={openItems}
                toggleItem={toggleItem}
                searchQuery={searchQuery}
              />
            </div>
          ))}
        </div>
        
        {/* Still Need Help */}
        <div className="mt-8 glass rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-warning" />
          <h3 className="font-semibold text-lg mb-2">Still Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you can't find what you're looking for, contact your operator with:
          </p>
          <div className="text-left glass rounded-xl p-4 text-xs text-muted-foreground space-y-1">
            <p>• What tile you were in and what action you attempted</p>
            <p>• What you expected vs what happened</p>
            <p>• Time of the issue</p>
            <p>• Device type (iPhone/Android/laptop)</p>
            <p>• Screenshot if possible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
