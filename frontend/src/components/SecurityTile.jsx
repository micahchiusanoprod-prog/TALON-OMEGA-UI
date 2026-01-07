import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Shield, 
  Fingerprint, 
  User, 
  UserPlus, 
  UserMinus,
  Settings,
  HelpCircle,
  ChevronRight,
  Check,
  X,
  Crown,
  Users,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import TileHelpTabs, { QuickHelpTips, InlineLegend } from './ui/TileHelpTabs';

// Help content for Security tile
const securityHelpContent = {
  whatItDoes: "Manage people, permission levels, and fingerprint authentication for your OMEGA device. Control who can access what features.",
  quickStart: [
    "Review existing people and their permissions",
    "Select a person to view/edit their details",
    "Add fingerprints for biometric authentication",
    "Adjust permission levels as needed",
    "Add new people with 'Add Person' button"
  ],
  controls: [
    { 
      name: "Permission Levels", 
      description: "Control access to features",
      states: [
        { color: "bg-warning", label: "Admin", meaning: "Full access to all features" },
        { color: "bg-primary", label: "Member", meaning: "Standard access, most features" },
        { color: "bg-muted-foreground", label: "Guest", meaning: "View only, limited actions" },
      ]
    },
    { name: "Fingerprint Badge", description: "Number next to fingerprint icon shows enrolled prints" },
    { name: "You Badge", description: "Indicates your account (cannot be removed)" },
  ],
  bestPractices: [
    "Enroll 2+ fingerprints per person for reliability",
    "Keep at least one Admin account at all times",
    "Use Guest for temporary or limited access",
    "Clean fingers before enrollment for best results"
  ]
};

const securityTroubleshootingContent = {
  issues: [
    {
      symptom: "Fingerprint not recognized",
      causes: ["Dirty or wet finger", "Poor enrollment quality", "Sensor needs cleaning"],
      fixes: ["Clean and dry your finger", "Re-enroll the fingerprint", "Wipe sensor with dry cloth"],
      fallback: "Use password/PIN as backup authentication"
    },
    {
      symptom: "Sensor not responding",
      causes: ["USB disconnected", "Service not running", "Hardware failure"],
      fixes: ["Check USB connection to sensor", "Restart fingerprint service via Health tile", "Try different USB port"],
    },
    {
      symptom: "Cannot change permissions",
      causes: ["Not logged in as Admin", "Trying to modify own Admin status", "System error"],
      fixes: ["Log in with Admin account", "Have another Admin change your permissions", "Restart the device"],
    },
    {
      symptom: "Cannot add new person",
      causes: ["Not Admin permission", "Storage full", "Max users reached"],
      fixes: ["Get Admin to add person", "Free up device storage", "Remove unused accounts"],
    }
  ],
  safetyNotes: [
    "Always keep at least one Admin account",
    "Fingerprint data is stored locally only",
    "Removing a person deletes all their data"
  ]
};

const securityLegendItems = [
  { color: "bg-warning", label: "Admin", meaning: "Full control of device", action: "Can manage all users" },
  { color: "bg-primary", label: "Member", meaning: "Standard user", action: "Most features available" },
  { color: "bg-muted-foreground", label: "Guest", meaning: "Limited access", action: "View only" },
  { color: "bg-success", label: "Fingerprint", meaning: "Biometric enrolled" },
];

const securityQuickTips = [
  "Tap a person card to manage their fingerprints & permissions",
  "Enroll multiple fingerprints for better recognition",
  "Admin required to add/remove people"
];

const permissionLevels = [
  { id: 'admin', name: 'Admin', icon: Crown, color: 'text-warning', description: 'Full access to all features' },
  { id: 'member', name: 'Member', icon: Users, color: 'text-primary', description: 'Standard access, can use most features' },
  { id: 'guest', name: 'Guest', icon: Eye, color: 'text-muted-foreground', description: 'View only, limited actions' },
];

// Mock people data
const mockPeople = [
  { id: '1', name: 'John (You)', avatar: null, fingerprints: 2, permission: 'admin', isCurrentUser: true },
  { id: '2', name: 'Sarah', avatar: null, fingerprints: 1, permission: 'member' },
  { id: '3', name: 'Kids', avatar: null, fingerprints: 0, permission: 'guest' },
];

const PersonCard = ({ person, onSelect, isSelected }) => {
  const permission = permissionLevels.find(p => p.id === person.permission);
  const PermIcon = permission?.icon || Users;
  
  return (
    <button
      onClick={() => onSelect(person)}
      className={`w-full glass rounded-lg p-3 text-left transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/50'
      }`}
      data-testid={`person-card-${person.id}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          {person.avatar ? (
            <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{person.name}</span>
            {person.isCurrentUser && (
              <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded">You</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <PermIcon className={`w-3 h-3 ${permission?.color}`} />
            <span className="text-xs text-muted-foreground">{permission?.name}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <Fingerprint className={`w-3 h-3 ${person.fingerprints > 0 ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">{person.fingerprints}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
};

const PersonDetail = ({ person, onBack, onUpdate }) => {
  const [permission, setPermission] = useState(person.permission);
  const [showEnroll, setShowEnroll] = useState(false);
  
  return (
    <div className="space-y-4" data-testid="person-detail">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <h3 className="text-sm font-semibold">{person.name}</h3>
        <div className="w-16" />
      </div>
      
      {/* Avatar */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
          <User className="w-10 h-10 text-primary" />
        </div>
        <Button size="sm" variant="outline" className="text-xs">Change Photo</Button>
      </div>
      
      {/* Permission Level */}
      <div className="glass rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">PERMISSION LEVEL</h4>
        <div className="space-y-2">
          {permissionLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = permission === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setPermission(level.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isSelected ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-secondary/50'
                }`}
                data-testid={`permission-${level.id}`}
              >
                <Icon className={`w-4 h-4 ${level.color}`} />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{level.name}</div>
                  <div className="text-xs text-muted-foreground">{level.description}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Fingerprints */}
      <div className="glass rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground">FINGERPRINTS</h4>
          <span className="text-xs text-muted-foreground">{person.fingerprints} enrolled</span>
        </div>
        
        {person.fingerprints > 0 ? (
          <div className="space-y-2">
            {[...Array(person.fingerprints)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-success" />
                  <span className="text-sm">Finger {i + 1}</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No fingerprints enrolled</p>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full"
          onClick={() => setShowEnroll(true)}
        >
          <Plus className="w-3 h-3 mr-1" /> Add Fingerprint
        </Button>
        
        {showEnroll && (
          <div className="glass p-3 rounded-lg border border-primary/30 animate-fade-in">
            <div className="text-center">
              <Fingerprint className="w-12 h-12 mx-auto mb-2 text-primary animate-pulse" />
              <p className="text-sm font-medium mb-1">Place finger on sensor</p>
              <p className="text-xs text-muted-foreground mb-3">
                Connect to Pi to enroll fingerprint
              </p>
              <Button size="sm" variant="outline" onClick={() => setShowEnroll(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Danger Zone */}
      {!person.isCurrentUser && (
        <div className="glass rounded-lg p-3 border border-destructive/30">
          <Button size="sm" variant="destructive" className="w-full">
            <UserMinus className="w-3 h-3 mr-1" /> Remove Person
          </Button>
        </div>
      )}
    </div>
  );
};

const EducationTab = () => (
  <div className="space-y-4" data-testid="security-education">
    <Accordion type="multiple" className="space-y-2" defaultValue={['add-fingerprint']}>
      <AccordionItem value="add-fingerprint" className="glass rounded-lg border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">How to add fingerprints</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
              <p>Select a person from the People list</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
              <p>Click "Add Fingerprint" button</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
              <p>Place finger firmly on the sensor</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
              <p>Repeat 3-4 times for best recognition</p>
            </div>
            <div className="flex items-start gap-2 mt-3">
              <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
              <p>Keep finger clean and dry for best results</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="permissions" className="glass rounded-lg border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">How permissions work</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="text-xs text-muted-foreground space-y-3">
            <div className="glass p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3 h-3 text-warning" />
                <span className="font-medium text-foreground">Admin</span>
              </div>
              <p>Full control: manage users, change settings, access all features</p>
            </div>
            <div className="glass p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3 text-primary" />
                <span className="font-medium text-foreground">Member</span>
              </div>
              <p>Standard access: use all features, cannot manage other users</p>
            </div>
            <div className="glass p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Guest</span>
              </div>
              <p>Limited access: view-only, cannot modify settings</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="troubleshooting" className="glass rounded-lg border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Troubleshooting</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="text-xs text-muted-foreground space-y-3">
            <div className="glass p-2 rounded">
              <div className="font-medium text-foreground mb-1">Fingerprint not recognized</div>
              <ul className="space-y-0.5">
                <li>• Clean finger and sensor</li>
                <li>• Try different angle/position</li>
                <li>• Re-enroll if persistent</li>
              </ul>
            </div>
            <div className="glass p-2 rounded">
              <div className="font-medium text-foreground mb-1">Sensor not responding</div>
              <ul className="space-y-0.5">
                <li>• Check USB connection</li>
                <li>• Restart fingerprint service</li>
                <li>• Verify sensor power</li>
              </ul>
            </div>
            <div className="glass p-2 rounded">
              <div className="font-medium text-foreground mb-1">Cannot add new person</div>
              <ul className="space-y-0.5">
                <li>• Check you have Admin permission</li>
                <li>• Verify device storage space</li>
              </ul>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export default function SecurityTile() {
  const [activeTab, setActiveTab] = useState('people');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [people] = useState(mockPeople);
  
  return (
    <Card className="glass-strong border-border-strong" data-testid="security-tile">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-primary" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-1 glass rounded-lg p-1 mb-4">
          <button
            onClick={() => { setActiveTab('people'); setSelectedPerson(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'people' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
            data-testid="tab-people"
          >
            <Users className="w-4 h-4" />
            People
          </button>
          <button
            onClick={() => { setActiveTab('education'); setSelectedPerson(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'education' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
            data-testid="tab-education"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'people' && (
          selectedPerson ? (
            <PersonDetail 
              person={selectedPerson} 
              onBack={() => setSelectedPerson(null)}
              onUpdate={() => {}}
            />
          ) : (
            <div className="space-y-3" data-testid="people-list">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{people.length} people</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <UserPlus className="w-3 h-3 mr-1" /> Add Person
                </Button>
              </div>
              
              <div className="space-y-2">
                {people.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onSelect={setSelectedPerson}
                    isSelected={false}
                  />
                ))}
              </div>
            </div>
          )
        )}
        
        {activeTab === 'education' && <EducationTab />}
      </CardContent>
    </Card>
  );
}
