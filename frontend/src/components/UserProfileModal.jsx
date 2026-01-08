import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  X,
  User,
  Heart,
  Shield,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
  Phone,
  Save,
  UserCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Blood type options
const BLOOD_TYPES = ['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Common allergy tags
const ALLERGY_TAGS = {
  food: ['Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Eggs', 'Milk/Dairy', 'Wheat/Gluten', 'Soy'],
  medication: ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'NSAIDs', 'Codeine', 'Morphine', 'Latex'],
  environment: ['Bee Stings', 'Pollen', 'Dust', 'Mold', 'Pet Dander'],
};

// Privacy visibility options
const PRIVACY_OPTIONS = [
  { id: 'private', label: 'Private (only me)', icon: Lock, description: 'Only you can see this information' },
  { id: 'admin', label: 'Share with Admin (Micah)', icon: Shield, description: 'Admin can view in emergency' },
  { id: 'household', label: 'Share with Admin + Household', icon: Users, description: 'Your household group can also view' },
];

// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, privacyBadge = null, infoTooltip = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
          {privacyBadge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
              privacyBadge === 'private' ? 'bg-muted text-muted-foreground' :
              privacyBadge === 'admin' ? 'bg-warning/20 text-warning' :
              'bg-primary/20 text-primary'
            }`}>
              <Lock className="w-3 h-3" />
              {privacyBadge === 'private' ? 'Private' : privacyBadge === 'admin' ? 'Admin Only' : 'Household'}
            </span>
          )}
          {infoTooltip && (
            <div className="relative group">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-popover border border-border rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {infoTooltip}
              </div>
            </div>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

// Allergy Tag Selector
const AllergyTagSelector = ({ category, label, selected, onToggle }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  
  const handleAddCustom = () => {
    if (customValue.trim()) {
      onToggle(customValue.trim());
      setCustomValue('');
      setShowCustom(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-2">
        {ALLERGY_TAGS[category].map(tag => (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selected.includes(tag)
                ? 'bg-destructive/20 text-destructive border border-destructive/30'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {selected.includes(tag) && '⚠️ '}{tag}
          </button>
        ))}
        {/* Custom tags that aren't in the preset list */}
        {selected.filter(s => !ALLERGY_TAGS[category].includes(s)).map(tag => (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive border border-destructive/30 flex items-center gap-1"
          >
            ⚠️ {tag}
            <X className="w-3 h-3" />
          </button>
        ))}
        {showCustom ? (
          <div className="flex items-center gap-1">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Other..."
              className="h-7 w-24 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleAddCustom}>
              <Plus className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowCustom(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground hover:bg-secondary border border-dashed border-border"
          >
            + Other
          </button>
        )}
      </div>
    </div>
  );
};

// Privacy Selector Component
const PrivacySelector = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Shield className="w-3 h-3" />
        Visibility
      </label>
      <div className="space-y-2">
        {PRIVACY_OPTIONS.map(option => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                value === option.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${value === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              {value === option.id && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function UserProfileModal({ isOpen, onClose, user, onSave, isDependent = false }) {
  // Bio state
  const [bio, setBio] = useState(user?.bio || '');
  const [roleLine, setRoleLine] = useState(user?.roleLine || '');
  
  // Medical info state
  const [medicalVisibility, setMedicalVisibility] = useState(user?.medicalVisibility || 'private');
  const [allergiesFood, setAllergiesFood] = useState(user?.allergies?.food || []);
  const [allergiesMedication, setAllergiesMedication] = useState(user?.allergies?.medication || []);
  const [allergiesEnvironment, setAllergiesEnvironment] = useState(user?.allergies?.environment || []);
  const [medicalConditions, setMedicalConditions] = useState(user?.medicalConditions || '');
  const [medications, setMedications] = useState(user?.medications || '');
  const [bloodType, setBloodType] = useState(user?.bloodType || 'Unknown');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || { name: '', relationship: '', phone: '' });
  const [responderNotes, setResponderNotes] = useState(user?.responderNotes || '');
  
  const toggleAllergy = (category, tag) => {
    const setters = {
      food: setAllergiesFood,
      medication: setAllergiesMedication,
      environment: setAllergiesEnvironment,
    };
    const current = { food: allergiesFood, medication: allergiesMedication, environment: allergiesEnvironment }[category];
    
    if (current.includes(tag)) {
      setters[category](current.filter(t => t !== tag));
    } else {
      setters[category]([...current, tag]);
    }
  };
  
  const handleSave = () => {
    const profileData = {
      bio,
      roleLine,
      medicalVisibility,
      allergies: {
        food: allergiesFood,
        medication: allergiesMedication,
        environment: allergiesEnvironment,
      },
      medicalConditions,
      medications,
      bloodType,
      emergencyContact: emergencyContact.name ? emergencyContact : null,
      responderNotes,
    };
    
    onSave?.(profileData);
    toast.success('Profile updated successfully');
    onClose();
  };
  
  const bioCharCount = bio.length;
  const bioRecommended = bioCharCount >= 200 && bioCharCount <= 400;
  const bioWarning = bioCharCount > 800;
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden mx-4 animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{isDependent ? 'Edit Dependent Profile' : 'Edit Profile'}</h2>
              <p className="text-sm text-muted-foreground">{user?.name || 'Your profile'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Bio Section */}
          <CollapsibleSection title="Bio" icon={User} defaultOpen={true}>
            <div className="space-y-4">
              {/* Role/Identity Line */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role / Identity Line (optional)</label>
                <Input
                  value={roleLine}
                  onChange={(e) => setRoleLine(e.target.value)}
                  placeholder="e.g., EMT • Radio Ops • Builder"
                  className="input-apple"
                  maxLength={100}
                />
                <p className="text-[10px] text-muted-foreground mt-1">A short tagline describing your roles or skills</p>
              </div>
              
              {/* Short Bio */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Short Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others a bit about yourself, your background, and what you bring to the group..."
                  className="input-apple min-h-[120px] resize-none"
                  maxLength={800}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground">Recommended: 200-400 characters</p>
                  <p className={`text-[10px] font-medium ${
                    bioWarning ? 'text-destructive' : bioRecommended ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {bioCharCount}/800
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>
          
          {/* Medical & Allergies Section */}
          <CollapsibleSection 
            title="Medical & Allergies" 
            icon={Heart} 
            defaultOpen={false}
            privacyBadge={medicalVisibility}
            infoTooltip="To help in emergencies and avoid medical mistakes."
          >
            {/* Disclosure */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong>This is optional.</strong> Use only what you're comfortable sharing. 
                  Medical information can help responders in an emergency.
                </span>
              </p>
            </div>
            
            {/* Privacy Selector */}
            <PrivacySelector value={medicalVisibility} onChange={setMedicalVisibility} />
            
            <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
              {/* Allergies */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Allergies
                </h4>
                <AllergyTagSelector
                  category="food"
                  label="Food Allergies"
                  selected={allergiesFood}
                  onToggle={(tag) => toggleAllergy('food', tag)}
                />
                <AllergyTagSelector
                  category="medication"
                  label="Medication Allergies"
                  selected={allergiesMedication}
                  onToggle={(tag) => toggleAllergy('medication', tag)}
                />
                <AllergyTagSelector
                  category="environment"
                  label="Environmental Allergies"
                  selected={allergiesEnvironment}
                  onToggle={(tag) => toggleAllergy('environment', tag)}
                />
              </div>
              
              {/* Medical Conditions */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Medical Conditions (optional)</label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g., Diabetes Type 2, Asthma, High blood pressure..."
                  className="input-apple min-h-[80px] resize-none"
                />
              </div>
              
              {/* Current Medications */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Medications (optional)</label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g., Metformin 500mg twice daily, Lisinopril 10mg daily..."
                  className="input-apple min-h-[80px] resize-none"
                />
              </div>
              
              {/* Blood Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Blood Type (optional)</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="input-apple w-full"
                >
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Emergency Contact */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Emergency Contact (optional)
                </label>
                <div className="space-y-2">
                  <Input
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    placeholder="Contact name"
                    className="input-apple"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={emergencyContact.relationship}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                      placeholder="Relationship (e.g., Spouse)"
                      className="input-apple"
                    />
                    <Input
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      placeholder="Phone or 'none'"
                      className="input-apple"
                    />
                  </div>
                </div>
              </div>
              
              {/* Notes for Responders */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes for Responders (optional)</label>
                <textarea
                  value={responderNotes}
                  onChange={(e) => setResponderNotes(e.target.value)}
                  placeholder="Any additional info that could help in an emergency..."
                  className="input-apple min-h-[60px] resize-none"
                  maxLength={300}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Keep it short - this is for quick reference</p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 btn-apple-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
