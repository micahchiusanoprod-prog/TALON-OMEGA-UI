import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import config, { getEndpointUrl, isMockMode } from '../config';

// ============================================================
// CONNECTION STATUS CONTEXT
// With Health Check Polling for Pi Backend
// ============================================================

// Connection states
export const CONNECTION_STATES = {
  CONNECTED: 'connected',
  DEGRADED: 'degraded',
  NOT_CONNECTED: 'not_connected',
};

// Endpoint status
const ENDPOINT_STATUS = {
  OK: 'ok',
  ERROR: 'error',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

// Default connection state
const defaultConnectionState = {
  status: CONNECTION_STATES.NOT_CONNECTED,
  lastPing: null,
  lastPingTime: null,
  isBackendConnected: false,
  dataMode: 'mock', // 'mock' or 'live'
  endpoints: {
    health: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null },
    metrics: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null },
    sensors: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null },
  },
  healthData: null,
  error: null,
};

const ConnectionContext = createContext();

export function ConnectionProvider({ children }) {
  const [connectionState, setConnectionState] = useState(defaultConnectionState);
  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  // Perform health check against backend
  const performHealthCheck = useCallback(async () => {
    if (!mountedRef.current) return;
    
    const healthUrl = getEndpointUrl('health');
    if (!healthUrl) return;
    
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.request.timeout);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (!mountedRef.current) return;
      
      if (response.ok) {
        const data = await response.json();
        
        setConnectionState(prev => ({
          ...prev,
          status: CONNECTION_STATES.CONNECTED,
          lastPing: new Date().toISOString(),
          lastPingTime: responseTime,
          isBackendConnected: true,
          dataMode: isMockMode() ? 'mock' : 'live',
          endpoints: {
            ...prev.endpoints,
            health: { 
              status: ENDPOINT_STATUS.OK, 
              lastCheck: new Date().toISOString(),
              responseTime,
            },
          },
          healthData: data,
          error: null,
        }));
      } else {
        // Backend reachable but returned error
        setConnectionState(prev => ({
          ...prev,
          status: CONNECTION_STATES.DEGRADED,
          lastPing: new Date().toISOString(),
          lastPingTime: responseTime,
          isBackendConnected: true,
          dataMode: 'mock',
          endpoints: {
            ...prev.endpoints,
            health: { 
              status: ENDPOINT_STATUS.ERROR, 
              lastCheck: new Date().toISOString(),
              responseTime,
            },
          },
          error: `HTTP ${response.status}`,
        }));
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      const isTimeout = error.name === 'AbortError';
      
      setConnectionState(prev => ({
        ...prev,
        status: CONNECTION_STATES.NOT_CONNECTED,
        isBackendConnected: false,
        dataMode: 'mock',
        endpoints: {
          ...prev.endpoints,
          health: { 
            status: isTimeout ? ENDPOINT_STATUS.TIMEOUT : ENDPOINT_STATUS.ERROR, 
            lastCheck: new Date().toISOString(),
            responseTime: null,
          },
        },
        error: isTimeout ? 'Connection timeout' : error.message,
      }));
    }
  }, []);

  // Check specific endpoint status
  const checkEndpoint = useCallback(async (endpointName) => {
    const url = getEndpointUrl(endpointName);
    if (!url) return { status: ENDPOINT_STATUS.UNKNOWN, error: 'Invalid endpoint' };
    
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.request.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json().catch(() => null);
        return { 
          status: ENDPOINT_STATUS.OK, 
          responseTime, 
          data,
          httpStatus: response.status,
        };
      } else {
        return { 
          status: ENDPOINT_STATUS.ERROR, 
          responseTime,
          httpStatus: response.status,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return { 
        status: error.name === 'AbortError' ? ENDPOINT_STATUS.TIMEOUT : ENDPOINT_STATUS.ERROR,
        error: error.message,
      };
    }
  }, []);

  // Run self-test on all endpoints
  const runSelfTest = useCallback(async () => {
    const endpointsToTest = ['health', 'metrics', 'sensors'];
    const results = {};
    
    for (const endpoint of endpointsToTest) {
      results[endpoint] = await checkEndpoint(endpoint);
    }
    
    // Update state with results
    setConnectionState(prev => ({
      ...prev,
      endpoints: Object.fromEntries(
        endpointsToTest.map(ep => [ep, {
          status: results[ep].status,
          lastCheck: new Date().toISOString(),
          responseTime: results[ep].responseTime,
        }])
      ),
    }));
    
    return results;
  }, [checkEndpoint]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    
    // Initial check
    performHealthCheck();
    
    // Set up interval
    pollingRef.current = setInterval(() => {
      performHealthCheck();
    }, config.polling.healthCheck);
  }, [performHealthCheck]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Manual connection toggle (for testing)
  const setMockConnection = useCallback((status) => {
    setConnectionState(prev => ({
      ...prev,
      status,
      isBackendConnected: status === CONNECTION_STATES.CONNECTED,
      lastPing: status === CONNECTION_STATES.CONNECTED ? new Date().toISOString() : prev.lastPing,
    }));
  }, []);

  // Get data source status for a panel
  const getDataSourceStatus = useCallback((panelId) => {
    return connectionState.isBackendConnected && !isMockMode() ? 'live' : 'mock';
  }, [connectionState.isBackendConnected]);

  // Get debug info for copy
  const getDebugInfo = useCallback(() => {
    return {
      buildVersion: config.build.version,
      buildTimestamp: config.build.timestamp,
      apiBase: config.API_BASE,
      kiwixBase: config.KIWIX_BASE,
      useMockData: config.USE_MOCK_DATA,
      connectionStatus: connectionState.status,
      lastPing: connectionState.lastPing,
      lastPingTime: connectionState.lastPingTime,
      dataMode: connectionState.dataMode,
      endpoints: connectionState.endpoints,
      error: connectionState.error,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      timestamp: new Date().toISOString(),
    };
  }, [connectionState]);

  // Start/stop polling based on feature flag
  useEffect(() => {
    mountedRef.current = true;
    
    if (config.features.enableHealthPolling && !isMockMode()) {
      startPolling();
    }
    
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const value = {
    ...connectionState,
    setMockConnection,
    getDataSourceStatus,
    performHealthCheck,
    runSelfTest,
    checkEndpoint,
    getDebugInfo,
    startPolling,
    stopPolling,
    config: {
      apiBase: config?.API_BASE || 'http://127.0.0.1:8093',
      kiwixBase: config?.KIWIX_BASE || 'http://127.0.0.1:8090',
      useMockData: config?.USE_MOCK_DATA ?? true,
      build: config?.build || { version: 'dev', timestamp: new Date().toISOString(), environment: 'development' },
    },
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
