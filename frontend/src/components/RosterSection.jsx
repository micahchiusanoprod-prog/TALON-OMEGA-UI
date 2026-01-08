import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Users,
  Search,
  Filter,
  User,
  Heart,
  AlertTriangle,
  Phone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Eye,
  EyeOff,
  X,
  Crown,
  Droplets,
  Pill,
  TreePine
} from 'lucide-react';

// Mock roster data with bio and medical info
const MOCK_ROSTER = [
  {
    id: '1',
    name: 'John (You)',
    permission: 'admin',
    bio: 'Group leader and primary communications operator. 20 years experience in electrical engineering and emergency response.',
    roleLine: 'EMT • Radio Ops • Leader',
    medicalVisibility: 'admin',
    bloodType: 'O+',
    allergies: { food: [], medication: ['Penicillin'], environment: [] },
    medicalConditions: 'Mild hypertension (controlled)',
    medications: 'Lisinopril 10mg daily',
    emergencyContact: { name: 'Sarah (Wife)', relationship: 'Spouse', phone: 'Node omega-02' },
    responderNotes: 'Reading glasses in left pocket. Medical kit in backpack.',
    isCurrentUser: true,
  },
  {
    id: '2',
    name: 'Sarah',
    permission: 'member',
    bio: 'Registered nurse with 20+ years ER experience. Master gardener and primary medical provider for the group.',
    roleLine: 'RN • Medical Lead • Gardener',
    medicalVisibility: 'household',
    bloodType: 'A+',
    allergies: { food: ['Shellfish'], medication: [], environment: ['Latex'] },
    medicalConditions: '',
    medications: '',
    emergencyContact: { name: 'John (Husband)', relationship: 'Spouse', phone: 'Node omega-01' },
    responderNotes: '',
  },
  {
    id: '3',
    name: 'Kids',
    permission: 'guest',
    bio: 'Emma (14) and Jake (12). Both trained in basic first aid and radio operation.',
    roleLine: 'Students • Junior Operators',
    medicalVisibility: 'admin',
    bloodType: 'O+/A+',
    allergies: { food: [], medication: [], environment: [] },
    medicalConditions: 'Jake: Mild asthma',
    medications: 'Jake: Albuterol inhaler as needed',
    emergencyContact: { name: 'Parents', relationship: 'Parents', phone: 'Nodes omega-01/02' },
    responderNotes: "Jake's inhaler always in backpack front pocket.",
  },
];

// User Detail Panel Component
const UserDetailPanel = ({ user, onClose, isAdmin }) => {
  const [showMedical, setShowMedical] = useState(false);
  
  const hasAllergies = user.allergies && (
    user.allergies.food?.length > 0 || 
    user.allergies.medication?.length > 0 || 
    user.allergies.environment?.length > 0
  );
  
  const canViewMedical = isAdmin && (user.medicalVisibility === 'admin' || user.medicalVisibility === 'household');
  
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">{user.name}</h3>
            {user.roleLine && (
              <p className="text-xs text-primary font-medium">{user.roleLine}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Bio - Always shown */}
      <div className="p-4 border-b border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
          <User className="w-3 h-3" />
          Bio
        </h4>
        <p className="text-sm text-foreground">
          {user.bio || <span className="text-muted-foreground italic">No bio provided</span>}
        </p>
      </div>
      
      {/* Medical Info - Privacy controlled */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Heart className="w-3 h-3" />
            Medical & Allergies
          </h4>
          {user.medicalVisibility === 'private' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
              user.medicalVisibility === 'admin' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
            }`}>
              <Eye className="w-3 h-3" />
              {user.medicalVisibility === 'admin' ? 'Admin View' : 'Household View'}
            </span>
          )}
        </div>
        
        {user.medicalVisibility === 'private' ? (
          <div className="glass rounded-lg p-4 text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Medical info: Private</p>
            <p className="text-xs text-muted-foreground mt-1">User has not shared medical information</p>
          </div>
        ) : canViewMedical ? (
          <div className="space-y-4">
            {/* Blood Type */}
            {user.bloodType && user.bloodType !== 'Unknown' && (
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-destructive" />
                <span className="text-sm">Blood Type:</span>
                <span className="font-bold text-destructive">{user.bloodType}</span>
              </div>
            )}
            
            {/* Allergies */}
            {hasAllergies && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  Allergies
                </p>
                <div className="flex flex-wrap gap-1">
                  {[...user.allergies.food, ...user.allergies.medication, ...user.allergies.environment].map((allergy, i) => (
                    <span key={i} className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs font-medium">
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Medical Conditions */}
            {user.medicalConditions && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Conditions</p>
                <p className="text-sm">{user.medicalConditions}</p>
              </div>
            )}
            
            {/* Medications */}
            {user.medications && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  Medications
                </p>
                <p className="text-sm">{user.medications}</p>
              </div>
            )}
            
            {/* Emergency Contact */}
            {user.emergencyContact?.name && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Emergency Contact
                </p>
                <div className="glass rounded-lg p-2">
                  <p className="text-sm font-medium">{user.emergencyContact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.emergencyContact.relationship} • {user.emergencyContact.phone}
                  </p>
                </div>
              </div>
            )}
            
            {/* Responder Notes */}
            {user.responderNotes && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <p className="text-xs font-medium text-warning mb-1">Notes for Responders</p>
                <p className="text-sm">{user.responderNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You don't have permission to view this information.</p>
        )}
      </div>
    </div>
  );
};

export default function RosterSection() {
  const [roster] = useState(MOCK_ROSTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    hasAllergy: null,
    hasEmergencyContact: null,
    allergyTag: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const isAdmin = true; // Current user is admin
  
  // Filter roster
  const filteredRoster = roster.filter(user => {
    // Search filter
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Only apply filters for shared medical info
    const canViewMedical = user.medicalVisibility !== 'private';
    
    // Allergy filter
    if (filters.hasAllergy !== null && canViewMedical) {
      const hasAllergies = user.allergies && (
        user.allergies.food?.length > 0 || 
        user.allergies.medication?.length > 0 || 
        user.allergies.environment?.length > 0
      );
      if (filters.hasAllergy && !hasAllergies) return false;
      if (!filters.hasAllergy && hasAllergies) return false;
    }
    
    // Emergency contact filter
    if (filters.hasEmergencyContact !== null && canViewMedical) {
      const hasContact = user.emergencyContact?.name;
      if (filters.hasEmergencyContact && !hasContact) return false;
      if (!filters.hasEmergencyContact && hasContact) return false;
    }
    
    // Allergy tag filter
    if (filters.allergyTag && canViewMedical) {
      const allAllergies = [
        ...(user.allergies?.food || []),
        ...(user.allergies?.medication || []),
        ...(user.allergies?.environment || []),
      ];
      if (!allAllergies.some(a => a.toLowerCase().includes(filters.allergyTag.toLowerCase()))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get unique allergy tags for filter dropdown
  const allAllergyTags = [...new Set(
    roster
      .filter(u => u.medicalVisibility !== 'private')
      .flatMap(u => [
        ...(u.allergies?.food || []),
        ...(u.allergies?.medication || []),
        ...(u.allergies?.environment || []),
      ])
  )];
  
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roster..."
            className="pl-10 input-apple"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-apple ${showFilters ? 'bg-primary/10' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>
      
      {/* Filter Options */}
      {showFilters && (
        <div className="glass rounded-xl p-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Allergy Present */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Allergy Present</label>
              <select
                value={filters.hasAllergy === null ? '' : filters.hasAllergy.toString()}
                onChange={(e) => setFilters({ ...filters, hasAllergy: e.target.value === '' ? null : e.target.value === 'true' })}
                className="input-apple w-full"
              >
                <option value="">Any</option>
                <option value="true">Yes - Has allergies</option>
                <option value="false">No allergies</option>
              </select>
            </div>
            
            {/* Has Emergency Contact */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Emergency Contact</label>
              <select
                value={filters.hasEmergencyContact === null ? '' : filters.hasEmergencyContact.toString()}
                onChange={(e) => setFilters({ ...filters, hasEmergencyContact: e.target.value === '' ? null : e.target.value === 'true' })}
                className="input-apple w-full"
              >
                <option value="">Any</option>
                <option value="true">Has contact</option>
                <option value="false">No contact</option>
              </select>
            </div>
            
            {/* Allergy Tag */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Allergy Type</label>
              <select
                value={filters.allergyTag || ''}
                onChange={(e) => setFilters({ ...filters, allergyTag: e.target.value || null })}
                className="input-apple w-full"
              >
                <option value="">Any</option>
                {allAllergyTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ hasAllergy: null, hasEmergencyContact: null, allergyTag: null })}
            >
              Clear Filters
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Note: Filters only apply to users who have shared their medical information.
          </p>
        </div>
      )}
      
      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User List */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Roster
              <span className="text-xs text-muted-foreground ml-2">{filteredRoster.length} people</span>
            </h3>
          </div>
          <div className="divide-y divide-border/30">
            {filteredRoster.map(user => {
              const hasAllergies = user.medicalVisibility !== 'private' && user.allergies && (
                user.allergies.food?.length > 0 || 
                user.allergies.medication?.length > 0 || 
                user.allergies.environment?.length > 0
              );
              
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 text-left hover:bg-secondary/30 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        {user.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">You</span>
                        )}
                        {user.permission === 'admin' && (
                          <Crown className="w-3 h-3 text-warning" />
                        )}
                      </div>
                      {user.roleLine && (
                        <p className="text-xs text-primary truncate">{user.roleLine}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {hasAllergies && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Allergies
                          </span>
                        )}
                        {user.medicalVisibility === 'private' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded flex items-center gap-0.5">
                            <Lock className="w-3 h-3" />
                            Medical Private
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* User Detail Panel */}
        <div>
          {selectedUser ? (
            <UserDetailPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="glass rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a person to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
