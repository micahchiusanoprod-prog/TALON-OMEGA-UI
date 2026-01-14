import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Role hierarchy: guest < member < admin
const ROLES = {
  GUEST: 'guest',
  MEMBER: 'member',
  ADMIN: 'admin'
};

const ROLE_LEVELS = {
  guest: 0,
  member: 1,
  admin: 2
};

// PIN unlock timeout (15 minutes)
const PIN_UNLOCK_TIMEOUT = 15 * 60 * 1000;

// Default admin PIN (in production, this would be set by user)
const DEFAULT_ADMIN_PIN = '1234';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Profile state (localStorage-backed)
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('omega-profile');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { displayName: 'Guest', role: ROLES.GUEST };
      }
    }
    return { displayName: 'Guest', role: ROLES.GUEST };
  });

  // PIN unlock state
  const [pinUnlocked, setPinUnlocked] = useState(() => {
    const unlockData = localStorage.getItem('omega-pin-unlock');
    if (unlockData) {
      try {
        const { timestamp } = JSON.parse(unlockData);
        return Date.now() - timestamp < PIN_UNLOCK_TIMEOUT;
      } catch {
        return false;
      }
    }
    return false;
  });

  // Admin PIN (stored locally, in production would be hashed)
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('omega-admin-pin') || DEFAULT_ADMIN_PIN;
  });

  // Persist profile changes
  useEffect(() => {
    localStorage.setItem('omega-profile', JSON.stringify(profile));
  }, [profile]);

  // Check PIN unlock timeout
  useEffect(() => {
    if (!pinUnlocked) return;
    
    const checkTimeout = () => {
      const unlockData = localStorage.getItem('omega-pin-unlock');
      if (unlockData) {
        try {
          const { timestamp } = JSON.parse(unlockData);
          if (Date.now() - timestamp >= PIN_UNLOCK_TIMEOUT) {
            setPinUnlocked(false);
            localStorage.removeItem('omega-pin-unlock');
          }
        } catch {
          setPinUnlocked(false);
        }
      }
    };

    const interval = setInterval(checkTimeout, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [pinUnlocked]);

  // Update profile
  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if user has required role level
  const hasRole = useCallback((requiredRole) => {
    return ROLE_LEVELS[profile.role] >= ROLE_LEVELS[requiredRole];
  }, [profile.role]);

  // Check if admin actions are unlocked (role + PIN)
  const isAdminUnlocked = useCallback(() => {
    return hasRole(ROLES.ADMIN) && pinUnlocked;
  }, [hasRole, pinUnlocked]);

  // Verify PIN and unlock admin actions
  const verifyPin = useCallback((enteredPin) => {
    if (enteredPin === adminPin) {
      setPinUnlocked(true);
      localStorage.setItem('omega-pin-unlock', JSON.stringify({
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  }, [adminPin]);

  // Lock admin actions
  const lockAdmin = useCallback(() => {
    setPinUnlocked(false);
    localStorage.removeItem('omega-pin-unlock');
  }, []);

  // Set new admin PIN
  const setNewAdminPin = useCallback((newPin) => {
    setAdminPin(newPin);
    localStorage.setItem('omega-admin-pin', newPin);
  }, []);

  // Get unlock status message
  const getUnlockStatus = useCallback(() => {
    if (!hasRole(ROLES.ADMIN)) {
      return { locked: true, reason: 'ROLE_REQUIRED', message: 'Admin role required' };
    }
    if (!pinUnlocked) {
      return { locked: true, reason: 'PIN_REQUIRED', message: 'PIN verification required' };
    }
    return { locked: false, reason: null, message: 'Admin access granted' };
  }, [hasRole, pinUnlocked]);

  // Get remaining unlock time
  const getUnlockTimeRemaining = useCallback(() => {
    if (!pinUnlocked) return 0;
    const unlockData = localStorage.getItem('omega-pin-unlock');
    if (unlockData) {
      try {
        const { timestamp } = JSON.parse(unlockData);
        const remaining = PIN_UNLOCK_TIMEOUT - (Date.now() - timestamp);
        return Math.max(0, remaining);
      } catch {
        return 0;
      }
    }
    return 0;
  }, [pinUnlocked]);

  const value = {
    // Profile
    profile,
    updateProfile,
    
    // Roles
    ROLES,
    hasRole,
    
    // PIN/Admin
    pinUnlocked,
    isAdminUnlocked,
    verifyPin,
    lockAdmin,
    setNewAdminPin,
    getUnlockStatus,
    getUnlockTimeRemaining,
    PIN_UNLOCK_TIMEOUT,
    
    // Backend auth status (PLANNED)
    backendAuthStatus: 'PLANNED',
    backendAuthMessage: 'Backend authentication is not yet implemented. Profile is stored locally.'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { ROLES, ROLE_LEVELS };
export default AuthContext;
