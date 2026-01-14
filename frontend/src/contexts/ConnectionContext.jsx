import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import config, { getEndpointUrl, isMockMode } from '../config';

// ============================================================
// CONNECTION STATUS CONTEXT
// With Health Check Polling for Pi Backend
// Supports: CONNECTED, DEGRADED, NOT_CONNECTED, FORBIDDEN, NOT_CONFIGURED
// ============================================================

// Connection states
export const CONNECTION_STATES = {
  CONNECTED: 'connected',
  DEGRADED: 'degraded',
  NOT_CONNECTED: 'not_connected',
  FORBIDDEN: 'forbidden',
  NOT_CONFIGURED: 'not_configured',
};

// Endpoint status
export const ENDPOINT_STATUS = {
  OK: 'ok',
  ERROR: 'error',
  TIMEOUT: 'timeout',
  FORBIDDEN: 'forbidden',
  DEGRADED: 'degraded',
  NOT_CONFIGURED: 'not_configured',
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
    health: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    metrics: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    sensors: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    backup: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    keys: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    keysync: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    dm: { status: ENDPOINT_STATUS.UNKNOWN, lastCheck: null, responseTime: null, data: null, httpStatus: null },
    gps: { status: ENDPOINT_STATUS.NOT_CONFIGURED, lastCheck: null, responseTime: null, data: null, httpStatus: null },
  },
  healthData: null,
  metricsData: null,
  keysData: null,
  keysyncData: null,
  error: null,
};

const ConnectionContext = createContext();

export function ConnectionProvider({ children }) {
  const [connectionState, setConnectionState] = useState(defaultConnectionState);
  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  // Check specific endpoint status
  const checkEndpoint = useCallback(async (endpointName) => {
    const path = config.endpoints[endpointName];
    
    // Handle not-configured endpoints (like GPS)
    if (!path) {
      return { 
        status: ENDPOINT_STATUS.NOT_CONFIGURED, 
        error: 'Endpoint not configured',
        data: null,
        httpStatus: null,
      };
    }
    
    // Construct full URL: API_BASE + endpoint path
    const url = `${config.API_BASE}${path}`;
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.request.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Handle 403 Forbidden (like dm.py)
      if (response.status === 403) {
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = { ok: false, err: 'forbidden' };
        }
        return { 
          status: ENDPOINT_STATUS.FORBIDDEN, 
          responseTime,
          httpStatus: 403,
          data,
          error: 'Forbidden - authentication required',
        };
      }
      
      if (response.ok) {
        let data = null;
        try {
          data = await response.json();
        } catch {
          // Response OK but not JSON
        }
        
        // Check for degraded state (like sensors.py with I2C error)
        if (data && data.status === 'error') {
          return { 
            status: ENDPOINT_STATUS.DEGRADED, 
            responseTime, 
            data,
            httpStatus: response.status,
            error: data.error || data.err || 'Endpoint returned error status',
          };
        }
        
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
        httpStatus: null,
      };
    }
  }, []);

  // Perform health check against backend
  const performHealthCheck = useCallback(async () => {
    if (!mountedRef.current) return;
    
    const healthResult = await checkEndpoint('health');
    const startTime = Date.now();
    const responseTime = healthResult.responseTime || (Date.now() - startTime);
    
    if (!mountedRef.current) return;
    
    if (healthResult.status === ENDPOINT_STATUS.OK) {
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
            data: healthResult.data,
            httpStatus: healthResult.httpStatus,
          },
        },
        healthData: healthResult.data,
        error: null,
      }));
    } else if (healthResult.status === ENDPOINT_STATUS.FORBIDDEN) {
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
            status: ENDPOINT_STATUS.FORBIDDEN, 
            lastCheck: new Date().toISOString(),
            responseTime,
            data: healthResult.data,
            httpStatus: 403,
          },
        },
        error: 'Health endpoint requires authentication',
      }));
    } else {
      // Not connected or error
      setConnectionState(prev => ({
        ...prev,
        status: CONNECTION_STATES.NOT_CONNECTED,
        isBackendConnected: false,
        dataMode: 'mock',
        endpoints: {
          ...prev.endpoints,
          health: { 
            status: healthResult.status, 
            lastCheck: new Date().toISOString(),
            responseTime: null,
            data: null,
            httpStatus: healthResult.httpStatus,
          },
        },
        error: healthResult.error || 'Connection failed',
      }));
    }
  }, [checkEndpoint]);

  // Run self-test on all endpoints
  const runSelfTest = useCallback(async () => {
    const endpointsToTest = ['health', 'metrics', 'sensors', 'backup', 'keys', 'keysync', 'dm', 'gps'];
    const results = {};
    
    for (const endpoint of endpointsToTest) {
      results[endpoint] = await checkEndpoint(endpoint);
    }
    
    // Determine overall status
    const okCount = Object.values(results).filter(r => r.status === ENDPOINT_STATUS.OK).length;
    const forbiddenCount = Object.values(results).filter(r => r.status === ENDPOINT_STATUS.FORBIDDEN).length;
    const notConfiguredCount = Object.values(results).filter(r => r.status === ENDPOINT_STATUS.NOT_CONFIGURED).length;
    const degradedCount = Object.values(results).filter(r => r.status === ENDPOINT_STATUS.DEGRADED).length;
    const errorCount = Object.values(results).filter(r => 
      r.status === ENDPOINT_STATUS.ERROR || r.status === ENDPOINT_STATUS.TIMEOUT
    ).length;
    
    // Calculate overall connection state
    let overallStatus = CONNECTION_STATES.CONNECTED;
    if (okCount === 0) {
      overallStatus = CONNECTION_STATES.NOT_CONNECTED;
    } else if (errorCount > 0 || degradedCount > 0 || forbiddenCount > 0) {
      overallStatus = CONNECTION_STATES.DEGRADED;
    }
    
    // Update state with all results
    setConnectionState(prev => ({
      ...prev,
      status: overallStatus,
      isBackendConnected: okCount > 0,
      dataMode: okCount > 0 && !isMockMode() ? 'live' : 'mock',
      endpoints: Object.fromEntries(
        endpointsToTest.map(ep => [ep, {
          status: results[ep].status,
          lastCheck: new Date().toISOString(),
          responseTime: results[ep].responseTime,
          data: results[ep].data,
          httpStatus: results[ep].httpStatus,
        }])
      ),
      healthData: results.health?.data,
      metricsData: results.metrics?.data,
      keysData: results.keys?.data,
      keysyncData: results.keysync?.data,
    }));
    
    return results;
  }, [checkEndpoint]);

  // Fetch specific endpoint data (for components to use)
  const fetchEndpointData = useCallback(async (endpointName) => {
    const result = await checkEndpoint(endpointName);
    
    // Update just that endpoint in state
    setConnectionState(prev => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [endpointName]: {
          status: result.status,
          lastCheck: new Date().toISOString(),
          responseTime: result.responseTime,
          data: result.data,
          httpStatus: result.httpStatus,
        },
      },
    }));
    
    return result;
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

  // Get endpoint-specific status
  const getEndpointStatus = useCallback((endpointName) => {
    return connectionState.endpoints[endpointName] || { status: ENDPOINT_STATUS.UNKNOWN };
  }, [connectionState.endpoints]);

  // Get debug info for copy
  const getDebugInfo = useCallback(() => {
    return {
      buildVersion: config.build.version,
      buildTimestamp: config.build.timestamp,
      apiBase: config.API_BASE || '(same-origin)',
      kiwixBase: config.KIWIX_BASE,
      jellyfinBase: config.JELLYFIN_BASE,
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
    getEndpointStatus,
    performHealthCheck,
    runSelfTest,
    checkEndpoint,
    fetchEndpointData,
    getDebugInfo,
    startPolling,
    stopPolling,
    config: {
      apiBase: config?.API_BASE || '(same-origin)',
      kiwixBase: config?.KIWIX_BASE || 'http://talon.local:8090',
      jellyfinBase: config?.JELLYFIN_BASE || 'http://talon.local:8096',
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
