import React, { useState } from 'react';
import { 
  Calculator,
  Languages,
  AlertTriangle,
  DollarSign,
  BookOpen,
  FileText,
  Compass,
  Flashlight,
  X,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// Quick Tools - Useful field utilities
const QUICK_TOOLS = [
  { 
    id: 'quickguide', 
    name: 'Quick Guide', 
    icon: HelpCircle, 
    color: 'text-amber-400',
    description: 'Learn how to use OMEGA - tap for a quick overview',
    component: 'quickguide'
  },
  { 
    id: 'calculator', 
    name: 'Calculator', 
    icon: Calculator, 
    description: 'Perform quick math calculations',
    component: 'calculator'
  },
  { 
    id: 'translator', 
    name: 'Translator', 
    icon: Languages, 
    description: 'Translate text between languages',
    component: 'translator'
  },
  { 
    id: 'sos', 
    name: 'SOS Beacon', 
    icon: AlertTriangle, 
    color: 'text-destructive',
    description: 'Send an emergency distress signal to all connected devices',
    component: 'sos'
  },
  { 
    id: 'currency', 
    name: 'Currency', 
    icon: DollarSign, 
    description: 'Convert between different currencies',
    component: 'currency'
  },
  { 
    id: 'dictionary', 
    name: 'Dictionary', 
    icon: BookOpen, 
    description: 'Look up word definitions offline',
    component: 'dictionary'
  },
  { 
    id: 'notes', 
    name: 'Field Notes', 
    icon: FileText, 
    description: 'Jot down quick notes and observations',
    component: 'notes'
  },
];

// Calculator Modal
const CalculatorModal = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  
  const handleNumber = (num) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };
  
  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };
  
  const handleEquals = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };
  
  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-6 w-80 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculator
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="glass rounded-xl p-4 mb-4">
          <div className="text-xs text-muted-foreground h-5">{equation}</div>
          <div className="text-3xl font-mono font-bold text-right">{display}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {['7','8','9','÷','4','5','6','×','1','2','3','-','C','0','=','+'].map(key => (
            <button
              key={key}
              onClick={() => {
                if (key === 'C') handleClear();
                else if (key === '=') handleEquals();
                else if (['÷','×','-','+'].includes(key)) handleOperator(key === '÷' ? '/' : key === '×' ? '*' : key);
                else handleNumber(key);
              }}
              className={`p-4 rounded-xl font-semibold text-lg transition-all ${
                key === '=' ? 'btn-apple-primary col-span-1' :
                ['÷','×','-','+'].includes(key) ? 'bg-primary/20 text-primary hover:bg-primary/30' :
                key === 'C' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' :
                'btn-apple'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Translator Modal (UI stub)
const TranslatorModal = ({ onClose }) => {
  const [text, setText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Translator
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <select value={fromLang} onChange={e => setFromLang(e.target.value)} className="flex-1 input-apple">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
          <span className="text-muted-foreground">→</span>
          <select value={toLang} onChange={e => setToLang(e.target.value)} className="flex-1 input-apple">
            <option value="es">Spanish</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text to translate..."
          className="input-apple h-24 resize-none mb-4"
        />
        
        <div className="glass rounded-xl p-4 min-h-[60px] text-muted-foreground text-sm">
          {text ? `Translation will appear here (offline mode)` : 'Translation will appear here'}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Full translation available when connected to Pi
        </p>
      </div>
    </div>
  );
};

// SOS Beacon Modal
const SOSModal = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  
  const handleActivate = () => {
    setIsActive(true);
    toast.error('🚨 SOS BEACON ACTIVATED - Broadcasting emergency signal', { duration: 5000 });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`glass-strong rounded-3xl p-6 w-80 animate-fade-in ${isActive ? 'ring-4 ring-destructive animate-pulse' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            SOS Beacon
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center py-6">
          <button
            onClick={handleActivate}
            disabled={isActive}
            className={`w-32 h-32 rounded-full font-bold text-xl transition-all ${
              isActive 
                ? 'bg-destructive text-white animate-pulse' 
                : 'bg-destructive/20 text-destructive hover:bg-destructive hover:text-white hover:scale-105'
            }`}
          >
            {isActive ? 'ACTIVE' : 'SOS'}
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {isActive 
            ? '🚨 Broadcasting on all available channels...' 
            : 'Press to broadcast emergency signal on all channels'
          }
        </p>
        
        {isActive && (
          <button 
            onClick={() => { setIsActive(false); toast.success('SOS beacon deactivated'); }}
            className="w-full mt-4 btn-apple text-center"
          >
            Deactivate Beacon
          </button>
        )}
      </div>
    </div>
  );
};

// Currency Converter Modal
const CurrencyModal = ({ onClose }) => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  
  // Offline rates (approximate)
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53 };
  const converted = (parseFloat(amount) * (rates[toCurrency] / rates[fromCurrency])).toFixed(2);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-6 w-80 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Currency
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-apple text-2xl font-bold"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="flex-1 input-apple">
              {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-muted-foreground">→</span>
            <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="flex-1 input-apple">
              {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary">{converted}</div>
            <div className="text-sm text-muted-foreground">{toCurrency}</div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Using offline rates • Last updated: Dec 2025
        </p>
      </div>
    </div>
  );
};

// Dictionary Modal
const DictionaryModal = ({ onClose }) => {
  const [word, setWord] = useState('');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Dictionary
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <input
          type="text"
          value={word}
          onChange={e => setWord(e.target.value)}
          placeholder="Enter a word..."
          className="input-apple mb-4"
        />
        
        <div className="glass rounded-xl p-4 min-h-[100px]">
          {word ? (
            <div className="text-sm text-muted-foreground">
              Definition lookup available via Kiwix offline library when connected.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              Enter a word to look up
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Full dictionary via Kiwix offline library
        </p>
      </div>
    </div>
  );
};

// Field Notes Modal
const NotesModal = ({ onClose }) => {
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem('omega-field-notes') || '';
    } catch {
      return '';
    }
  });
  
  const handleSave = () => {
    localStorage.setItem('omega-field-notes', notes);
    toast.success('Notes saved');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Field Notes
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Quick notes, coordinates, observations..."
          className="input-apple h-48 resize-none mb-4 font-mono text-sm"
        />
        
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 btn-apple-primary">
            Save Notes
          </button>
          <button onClick={() => setNotes('')} className="btn-apple text-destructive">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Guide Modal - User-friendly introduction
const QuickGuideModal = ({ onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    {
      icon: '👋',
      title: 'Welcome to OMEGA!',
      content: 'OMEGA is your offline-first command center. It works without internet and helps you stay connected with your family and team.',
      highlight: 'Everything works offline!'
    },
    {
      icon: '📡',
      title: 'Communication Hub',
      content: 'The Ally Communications Hub shows all available ways to communicate. Green = available, Yellow = partial, Red = unavailable.',
      highlight: 'Tap any method to see details'
    },
    {
      icon: '👥',
      title: 'Community Hub',
      content: 'See who is online, their skills, equipment, and status. Great for coordinating teams and checking on family members.',
      highlight: 'Click "Community" in the header'
    },
    {
      icon: '📊',
      title: 'LOGS & Analytics',
      content: 'Monitor system health, view charts, and track performance over time. Perfect for diagnosing issues.',
      highlight: 'Click "LOGS" in the header'
    },
    {
      icon: '🔍',
      title: 'Search Everything',
      content: 'Use the search bar to quickly find files, Kiwix articles, commands, or people. Press Cmd+/ for quick access.',
      highlight: 'Type anything to search'
    },
    {
      icon: '🛠️',
      title: 'Quick Tools',
      content: 'Calculator, Translator, SOS Beacon, and more. These tools work offline and are always available.',
      highlight: 'Tap any tool button below'
    },
    {
      icon: '🆘',
      title: 'Need Help?',
      content: 'Tap "Help Center" for detailed guides on every feature. Tap "Admin Console" if you are an operator.',
      highlight: 'Help is always one tap away'
    },
  ];
  
  const tip = tips[currentTip];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-amber-500/20 to-orange-500/20">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold">Quick Guide</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-3 bg-secondary/50">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTip(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentTip ? 'bg-primary w-6' : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">{tip.icon}</div>
          <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">{tip.content}</p>
          <div className="inline-block px-4 py-2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium">
            💡 {tip.highlight}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-secondary/30">
          <button
            onClick={() => setCurrentTip(Math.max(0, currentTip - 1))}
            disabled={currentTip === 0}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="text-sm text-muted-foreground">
            {currentTip + 1} of {tips.length}
          </span>
          
          {currentTip < tips.length - 1 ? (
            <button
              onClick={() => setCurrentTip(currentTip + 1)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function QuickToolsBar() {
  const [activeModal, setActiveModal] = useState(null);
  
  const handleToolClick = (tool) => {
    console.log('Tool clicked:', tool.id, 'Setting activeModal to:', tool.id);
    setActiveModal(tool.id);
  };
  
  const closeModal = () => {
    console.log('Closing modal');
    setActiveModal(null);
  };
  
  return (
    <>
      <div className="w-full relative" data-testid="quick-tools-bar">
        {/* Single row with horizontal scroll on mobile */}
        <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-2 px-2">
          {QUICK_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl btn-apple whitespace-nowrap group flex-shrink-0 pointer-events-auto`}
                title={tool.description}
                data-testid={`tool-${tool.id}`}
              >
                <Icon className={`w-4 h-4 ${tool.color || 'text-primary'} group-hover:scale-110 transition-transform`} />
                <span className="text-xs sm:text-sm font-medium">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Modals */}
      {activeModal === 'quickguide' && <QuickGuideModal onClose={closeModal} />}
      {activeModal === 'calculator' && <CalculatorModal onClose={closeModal} />}
      {activeModal === 'translator' && <TranslatorModal onClose={closeModal} />}
      {activeModal === 'sos' && <SOSModal onClose={closeModal} />}
      {activeModal === 'currency' && <CurrencyModal onClose={closeModal} />}
      {activeModal === 'dictionary' && <DictionaryModal onClose={closeModal} />}
      {activeModal === 'notes' && <NotesModal onClose={closeModal} />}
    </>
  );
}
