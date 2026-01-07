import React, { useState, useMemo } from 'react';
import { 
  Book, 
  Search, 
  X, 
  Copy, 
  Check,
  Plus,
  Trash2,
  Send,
  Filter,
  Heart,
  Shield,
  Package,
  MapPin,
  Truck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

// Code categories with icons
const categories = [
  { id: 'all', name: 'All', icon: Book },
  { id: 'medical', name: 'Medical', icon: Heart },
  { id: 'safety', name: 'Safety', icon: Shield },
  { id: 'logistics', name: 'Logistics', icon: Truck },
  { id: 'location', name: 'Location', icon: MapPin },
  { id: 'supplies', name: 'Supplies', icon: Package },
];

// Codebook data - standard emergency/tactical codes
const codebookData = [
  // Medical
  { code: '10-52', meaning: 'Need ambulance / medical emergency', category: 'medical' },
  { code: 'MED-1', meaning: 'Minor injury, can self-treat', category: 'medical' },
  { code: 'MED-2', meaning: 'Moderate injury, need assistance', category: 'medical' },
  { code: 'MED-3', meaning: 'Serious injury, urgent help needed', category: 'medical' },
  { code: 'MED-OK', meaning: 'Medical situation resolved', category: 'medical' },
  { code: 'ALLERGY', meaning: 'Allergic reaction in progress', category: 'medical' },
  { code: 'DEHY', meaning: 'Dehydration symptoms', category: 'medical' },
  { code: 'HEAT', meaning: 'Heat exhaustion/stroke', category: 'medical' },
  { code: 'HYPO', meaning: 'Hypothermia risk', category: 'medical' },
  
  // Safety
  { code: '10-20', meaning: 'What is your location?', category: 'safety' },
  { code: '10-33', meaning: 'Emergency - all units respond', category: 'safety' },
  { code: 'ALL-CLEAR', meaning: 'Situation secure, no threats', category: 'safety' },
  { code: 'EVAC', meaning: 'Evacuate immediately', category: 'safety' },
  { code: 'HOLD', meaning: 'Stay in place, do not move', category: 'safety' },
  { code: 'RALLY', meaning: 'Meet at designated rally point', category: 'safety' },
  { code: 'CHECK-IN', meaning: 'Confirm your status', category: 'safety' },
  { code: 'SAFE', meaning: 'I am safe, no assistance needed', category: 'safety' },
  { code: 'HELP', meaning: 'Need assistance (non-emergency)', category: 'safety' },
  { code: 'MAYDAY', meaning: 'Life-threatening emergency', category: 'safety' },
  
  // Logistics
  { code: 'ETA', meaning: 'Estimated time of arrival', category: 'logistics' },
  { code: 'RTB', meaning: 'Returning to base', category: 'logistics' },
  { code: 'DELAY', meaning: 'Will be delayed', category: 'logistics' },
  { code: 'PROCEED', meaning: 'Continue as planned', category: 'logistics' },
  { code: 'ABORT', meaning: 'Cancel current task/mission', category: 'logistics' },
  { code: 'STANDBY', meaning: 'Wait for further instructions', category: 'logistics' },
  { code: 'COPY', meaning: 'Message received and understood', category: 'logistics' },
  { code: 'WILCO', meaning: 'Will comply with instructions', category: 'logistics' },
  { code: 'NEG', meaning: 'Negative / No', category: 'logistics' },
  { code: 'AFF', meaning: 'Affirmative / Yes', category: 'logistics' },
  
  // Location
  { code: 'LOC', meaning: 'Sending location coordinates', category: 'location' },
  { code: 'GRID', meaning: 'Grid reference follows', category: 'location' },
  { code: 'LZ', meaning: 'Landing zone / pickup point', category: 'location' },
  { code: 'CP', meaning: 'Checkpoint / waypoint', category: 'location' },
  { code: 'BASE', meaning: 'Main camp / home location', category: 'location' },
  { code: 'ALPHA', meaning: 'Primary location', category: 'location' },
  { code: 'BRAVO', meaning: 'Secondary location', category: 'location' },
  { code: 'CHARLIE', meaning: 'Tertiary location', category: 'location' },
  { code: 'GPS-FIX', meaning: 'Have good GPS signal', category: 'location' },
  { code: 'GPS-LOST', meaning: 'No GPS signal available', category: 'location' },
  
  // Supplies
  { code: 'FUEL', meaning: 'Need fuel/power', category: 'supplies' },
  { code: 'H2O', meaning: 'Need water', category: 'supplies' },
  { code: 'FOOD', meaning: 'Need food/rations', category: 'supplies' },
  { code: 'AMMO', meaning: 'Need ammunition/defense supplies', category: 'supplies' },
  { code: 'BATT', meaning: 'Battery low / need batteries', category: 'supplies' },
  { code: 'MED-SUP', meaning: 'Need medical supplies', category: 'supplies' },
  { code: 'TOOL', meaning: 'Need tools/equipment', category: 'supplies' },
  { code: 'SHELTER', meaning: 'Need shelter/cover', category: 'supplies' },
  { code: 'RESUPPLY', meaning: 'General resupply needed', category: 'supplies' },
  { code: 'FULL', meaning: 'Fully stocked, no needs', category: 'supplies' },
];

const CodeRow = ({ code, meaning, category, onAddToCompose }) => {
  const [copied, setCopied] = useState(false);
  const categoryInfo = categories.find(c => c.id === category);
  const CategoryIcon = categoryInfo?.icon || Book;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success(`Copied: ${code}`);
  };
  
  return (
    <div 
      className="flex items-center gap-3 py-2 px-3 hover:bg-secondary/50 rounded-lg transition-colors group"
      data-testid={`code-row-${code}`}
    >
      <div className="w-8 flex-shrink-0">
        <CategoryIcon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono font-bold text-primary">{code}</code>
        </div>
        <div className="text-xs text-muted-foreground truncate">{meaning}</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-7 w-7 p-0"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddToCompose(code)}
          className="h-7 w-7 p-0"
          title="Add to message"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

const ComposeWithCodes = ({ selectedCodes, onRemoveCode, onClear, onSend }) => {
  if (selectedCodes.length === 0) return null;
  
  const getMessage = () => selectedCodes.join(' ');
  
  return (
    <div className="glass rounded-lg p-3 space-y-2 animate-fade-in" data-testid="compose-with-codes">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Compose Message</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          className="h-6 px-2 text-xs text-muted-foreground"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {selectedCodes.map((code, i) => (
          <div 
            key={i}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono"
          >
            <span>{code}</span>
            <button
              onClick={() => onRemoveCode(i)}
              className="hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="glass-strong rounded p-2 text-sm font-mono">
        {getMessage()}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(getMessage());
            toast.success('Message copied to clipboard');
          }}
          variant="outline"
          className="flex-1"
        >
          <Copy className="w-3.5 h-3.5 mr-1" />
          Copy
        </Button>
        <Button
          size="sm"
          onClick={() => onSend(getMessage())}
          className="flex-1"
        >
          <Send className="w-3.5 h-3.5 mr-1" />
          Send to Chat
        </Button>
      </div>
    </div>
  );
};

export default function Codebook({ onSendMessage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCodes, setSelectedCodes] = useState([]);
  
  const filteredCodes = useMemo(() => {
    return codebookData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);
  
  const handleAddToCompose = (code) => {
    setSelectedCodes(prev => [...prev, code]);
  };
  
  const handleRemoveCode = (index) => {
    setSelectedCodes(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleClear = () => {
    setSelectedCodes([]);
  };
  
  const handleSend = (message) => {
    if (onSendMessage) {
      onSendMessage(message);
      setSelectedCodes([]);
      toast.success('Message sent to chat');
    }
  };
  
  return (
    <div className="space-y-4" data-testid="codebook">
      {/* Header */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Book className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">Codebook</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Standard codes for efficient communication. Click a code to add it to your message.
        </p>
      </div>
      
      {/* Compose Panel */}
      <ComposeWithCodes
        selectedCodes={selectedCodes}
        onRemoveCode={handleRemoveCode}
        onClear={handleClear}
        onSend={handleSend}
      />
      
      {/* Search and Filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search codes or meanings..."
            className="pl-9 h-9 text-sm"
            data-testid="code-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex items-center gap-1 flex-wrap" data-testid="category-filters">
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = cat.id === 'all' 
            ? codebookData.length 
            : codebookData.filter(c => c.category === cat.id).length;
          
          return (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-8 text-xs ${selectedCategory === cat.id ? '' : 'border-border-strong bg-secondary/30'}`}
              data-testid={`filter-${cat.id}`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {cat.name}
              <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                selectedCategory === cat.id ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>
      
      {/* Code List */}
      <div className="glass rounded-lg overflow-hidden" data-testid="code-list">
        <div className="glass-strong border-b border-border px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            {filteredCodes.length} codes
          </span>
          <span className="text-xs text-muted-foreground">
            Click <Plus className="w-3 h-3 inline" /> to add to message
          </span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin divide-y divide-border/50">
          {filteredCodes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No codes found</p>
              <p className="text-xs">Try a different search or category</p>
            </div>
          ) : (
            filteredCodes.map((item) => (
              <CodeRow
                key={item.code}
                code={item.code}
                meaning={item.meaning}
                category={item.category}
                onAddToCompose={handleAddToCompose}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Quick Reference */}
      <div className="glass rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Quick Reference</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <code className="font-mono text-success">COPY</code>
            <span className="text-muted-foreground">= Understood</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-success">WILCO</code>
            <span className="text-muted-foreground">= Will comply</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-warning">STANDBY</code>
            <span className="text-muted-foreground">= Wait</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-destructive">MAYDAY</code>
            <span className="text-muted-foreground">= Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
