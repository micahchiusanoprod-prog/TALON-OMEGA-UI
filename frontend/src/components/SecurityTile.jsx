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
  AlertTriangle,
  Edit3,
  Heart
} from 'lucide-react';
import TileHelpTabs, { QuickHelpTips, InlineLegend } from './ui/TileHelpTabs';
import UserProfileModal from './UserProfileModal';

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

// Mock people data with bio and medical info
const mockPeople = [
  { 
    id: '1', 
    name: 'John (You)', 
    avatar: null, 
    fingerprints: 2, 
    permission: 'admin', 
    isCurrentUser: true,
    bio: 'Group leader and primary communications operator. 20 years experience in electrical engineering.',
    roleLine: 'EMT • Radio Ops • Leader',
    medicalVisibility: 'admin',
    bloodType: 'O+',
    allergies: { food: [], medication: ['Penicillin'], environment: [] },
    medicalConditions: 'Mild hypertension (controlled)',
    medications: 'Lisinopril 10mg daily',
    emergencyContact: { name: 'Sarah (Wife)', relationship: 'Spouse', phone: 'Node omega-02' },
    responderNotes: 'Reading glasses in left pocket.',
  },
  { 
    id: '2', 
    name: 'Sarah', 
    avatar: null, 
    fingerprints: 1, 
    permission: 'member',
    bio: 'Registered nurse with 20+ years ER experience. Master gardener.',
    roleLine: 'RN • Medical Lead • Gardener',
    medicalVisibility: 'household',
    bloodType: 'A+',
    allergies: { food: ['Shellfish'], medication: [], environment: ['Latex'] },
  },
  { 
    id: '3', 
    name: 'Kids', 
    avatar: null, 
    fingerprints: 0, 
    permission: 'guest',
    bio: 'Emma (14) and Jake (12). Both trained in basic first aid.',
    roleLine: 'Students • Junior Operators',
    medicalVisibility: 'admin',
    bloodType: 'O+/A+',
    allergies: { food: [], medication: [], environment: [] },
    medicalConditions: 'Jake: Mild asthma',
    isDependent: true,
  },
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
          {person.roleLine && (
            <p className="text-xs text-primary truncate">{person.roleLine}</p>
          )}
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

const PersonDetail = ({ person, onBack, onUpdate, onEditProfile }) => {
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
        {person.roleLine && (
          <p className="text-xs text-primary font-medium mb-2">{person.roleLine}</p>
        )}
        <Button size="sm" variant="outline" className="text-xs">Change Photo</Button>
      </div>
      
      {/* Bio Section */}
      <div className="glass rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground">BIO</h4>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-2 text-xs"
            onClick={() => onEditProfile(person)}
          >
            <Edit3 className="w-3 h-3 mr-1" /> Edit Profile
          </Button>
        </div>
        <p className="text-sm text-foreground">
          {person.bio || <span className="text-muted-foreground italic">No bio provided</span>}
        </p>
      </div>
      
      {/* Medical Quick View */}
      <div className="glass rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Heart className="w-3 h-3" /> MEDICAL
          </h4>
          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
            person.medicalVisibility === 'private' 
              ? 'bg-muted text-muted-foreground' 
              : 'bg-primary/20 text-primary'
          }`}>
            {person.medicalVisibility === 'private' ? 'Private' : 'Shared'}
          </span>
        </div>
        {person.bloodType && person.bloodType !== 'Unknown' && (
          <p className="text-sm">Blood Type: <span className="font-bold text-destructive">{person.bloodType}</span></p>
        )}
        {person.allergies && (person.allergies.food?.length > 0 || person.allergies.medication?.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {[...(person.allergies.food || []), ...(person.allergies.medication || [])].map((allergy, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded">
                ⚠️ {allergy}
              </span>
            ))}
          </div>
        )}
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-full h-7 text-xs"
          onClick={() => onEditProfile(person)}
        >
          View & Edit Medical Info
        </Button>
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

export default function SecurityTile() {
  const [activeTab, setActiveTab] = useState('people');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [people, setPeople] = useState(mockPeople);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  
  const handleEditProfile = (person) => {
    setEditingPerson(person);
    setProfileModalOpen(true);
  };
  
  const handleSaveProfile = (profileData) => {
    // Update the person's profile data
    setPeople(prev => prev.map(p => 
      p.id === editingPerson.id 
        ? { ...p, ...profileData }
        : p
    ));
    // Also update selectedPerson if it's the same person
    if (selectedPerson?.id === editingPerson.id) {
      setSelectedPerson(prev => ({ ...prev, ...profileData }));
    }
  };
  
  // Help view using standardized component
  if (activeTab === 'help') {
    return (
      <Card className="glass-strong border-border-strong" data-testid="security-tile">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Help
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('people')}>
              ← Back
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TileHelpTabs
            helpContent={securityHelpContent}
            troubleshootingContent={securityTroubleshootingContent}
            legendItems={securityLegendItems}
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="glass-strong border-border-strong" data-testid="security-tile">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('help')}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Help & Troubleshooting"
              data-testid="security-help-btn"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Tips */}
          <QuickHelpTips tips={securityQuickTips} />
          
          {/* Content */}
          {activeTab === 'people' && (
            selectedPerson ? (
              <PersonDetail 
                person={selectedPerson} 
                onBack={() => setSelectedPerson(null)}
                onUpdate={() => {}}
                onEditProfile={handleEditProfile}
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
        </CardContent>
      </Card>
      
      {/* Profile Edit Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setEditingPerson(null);
        }}
        user={editingPerson}
        onSave={handleSaveProfile}
        isDependent={editingPerson?.isDependent}
      />
    </>
  );
}
