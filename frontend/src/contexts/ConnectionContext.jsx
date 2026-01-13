import React, { createContext, useContext, useState, useCallback } from 'react';

// ============================================================
// CONNECTION STATUS CONTEXT
// ============================================================

// Connection states
export const CONNECTION_STATES = {
  CONNECTED: 'connected',
  DEGRADED: 'degraded',
  NOT_CONNECTED: 'not_connected',
};

// Default mock connection state (will be driven by real health checks later)
const defaultConnectionState = {
  status: CONNECTION_STATES.NOT_CONNECTED,
  lastPing: null,
  endpoints: {
    health: { status: 'unknown', lastCheck: null },
    metrics: { status: 'unknown', lastCheck: null },
    sensors: { status: 'unknown', lastCheck: null },
    gps: { status: 'unknown', lastCheck: null },
    backup: { status: 'unknown', lastCheck: null },
  },
  isBackendConnected: false,
};

const ConnectionContext = createContext();

export function ConnectionProvider({ children }) {
  const [connectionState, setConnectionState] = useState(defaultConnectionState);

  // Mock function to simulate connection changes (for QA/testing)
  const setMockConnection = useCallback((status) => {
    setConnectionState(prev => ({
      ...prev,
      status,
      isBackendConnected: status === CONNECTION_STATES.CONNECTED,
      lastPing: status === CONNECTION_STATES.CONNECTED ? new Date().toISOString() : prev.lastPing,
    }));
  }, []);

  // Future: This will be called by a real health check polling mechanism
  const updateConnectionStatus = useCallback((newState) => {
    setConnectionState(prev => ({
      ...prev,
      ...newState,
    }));
  }, []);

  // Check if a specific panel should show mock or live data
  const getDataSourceStatus = useCallback((panelId) => {
    // For now, everything is mock until backend is connected
    return connectionState.isBackendConnected ? 'live' : 'mock';
  }, [connectionState.isBackendConnected]);

  const value = {
    ...connectionState,
    setMockConnection,
    updateConnectionStatus,
    getDataSourceStatus,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

export default ConnectionContext;
