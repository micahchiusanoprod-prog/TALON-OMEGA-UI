import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Network request log entry type
// { id, url, method, status, latency, timestamp, success }

// UI error log entry type
// { id, message, stack, component, timestamp }

// Self-test result type
// { subsystem, status: OK|DEGRADED|NOT_CONFIGURED|FORBIDDEN, timestamp, latency, details }

const MAX_NETWORK_LOGS = 100;
const MAX_ERROR_LOGS = 100;

const EvidenceContext = createContext(null);

export const useEvidence = () => {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error('useEvidence must be used within EvidenceProvider');
  }
  return context;
};

export const EvidenceProvider = ({ children }) => {
  // Network request log (client-side evidence)
  const [networkLog, setNetworkLog] = useState([]);
  const networkIdRef = useRef(0);

  // UI error log
  const [errorLog, setErrorLog] = useState([]);
  const errorIdRef = useRef(0);

  // Self-test results
  const [selfTestResults, setSelfTestResults] = useState(() => {
    const stored = localStorage.getItem('omega-self-test-results');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Connection state summary
  const [connectionState, setConnectionState] = useState({
    overall: 'UNKNOWN',
    lastCheck: null,
    subsystems: {}
  });

  // Persist self-test results
  useEffect(() => {
    if (selfTestResults) {
      localStorage.setItem('omega-self-test-results', JSON.stringify(selfTestResults));
    }
  }, [selfTestResults]);

  // Log a network request
  const logNetworkRequest = useCallback((entry) => {
    setNetworkLog(prev => {
      const newLog = [{
        id: ++networkIdRef.current,
        timestamp: Date.now(),
        ...entry
      }, ...prev].slice(0, MAX_NETWORK_LOGS);
      return newLog;
    });
  }, []);

  // Log a UI error
  const logUIError = useCallback((error, component = 'unknown') => {
    setErrorLog(prev => {
      const newLog = [{
        id: ++errorIdRef.current,
        timestamp: Date.now(),
        message: error.message || String(error),
        stack: error.stack || null,
        component
      }, ...prev].slice(0, MAX_ERROR_LOGS);
      return newLog;
    });
  }, []);

  // Update connection state
  const updateConnectionState = useCallback((subsystem, status, details = {}) => {
    setConnectionState(prev => ({
      ...prev,
      lastCheck: Date.now(),
      subsystems: {
        ...prev.subsystems,
        [subsystem]: { status, ...details, lastCheck: Date.now() }
      }
    }));
  }, []);

  // Run self-tests
  const runSelfTest = useCallback(async () => {
    const results = {
      timestamp: Date.now(),
      tests: []
    };

    // Test subsystems
    const subsystems = [
      { name: 'Frontend', endpoint: null, type: 'local' },
      { name: 'LocalStorage', endpoint: null, type: 'storage' },
      { name: 'API_Health', endpoint: '/api/cgi-bin/health.py', type: 'api' },
      { name: 'API_Metrics', endpoint: '/api/cgi-bin/metrics.py', type: 'api' },
      { name: 'API_DM', endpoint: '/api/cgi-bin/dm.py', type: 'api' },
      { name: 'API_Sensors', endpoint: '/api/cgi-bin/sensors.py', type: 'api' },
      { name: 'GPS', endpoint: null, type: 'sensor' }
    ];

    for (const sub of subsystems) {
      const testResult = {
        subsystem: sub.name,
        type: sub.type,
        timestamp: Date.now(),
        status: 'UNKNOWN',
        latency: null,
        details: {}
      };

      try {
        if (sub.type === 'local') {
          // Frontend is always OK if we're running
          testResult.status = 'OK';
          testResult.details = { message: 'Frontend application running' };
        } else if (sub.type === 'storage') {
          // Test localStorage
          const testKey = 'omega-test-' + Date.now();
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          testResult.status = 'OK';
          testResult.details = { message: 'LocalStorage accessible' };
        } else if (sub.type === 'api' && sub.endpoint) {
          // Test API endpoint
          const start = performance.now();
          try {
            const response = await fetch(sub.endpoint, { 
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });
            testResult.latency = Math.round(performance.now() - start);
            
            if (response.ok) {
              testResult.status = 'OK';
              testResult.details = { httpStatus: response.status };
            } else if (response.status === 403) {
              testResult.status = 'FORBIDDEN';
              testResult.details = { httpStatus: response.status, message: 'Access denied' };
            } else if (response.status === 503) {
              testResult.status = 'DEGRADED';
              testResult.details = { httpStatus: response.status, message: 'Service degraded' };
            } else {
              testResult.status = 'DEGRADED';
              testResult.details = { httpStatus: response.status };
            }
          } catch (fetchError) {
            testResult.latency = Math.round(performance.now() - start);
            testResult.status = 'NOT_CONFIGURED';
            testResult.details = { 
              message: 'Endpoint not reachable',
              error: fetchError.message
            };
          }
        } else if (sub.type === 'sensor') {
          // GPS sensor (mock - NOT_CONFIGURED until wired)
          testResult.status = 'NOT_CONFIGURED';
          testResult.details = { message: 'GPS sensor not configured' };
        }
      } catch (err) {
        testResult.status = 'UNKNOWN';
        testResult.details = { error: err.message };
      }

      results.tests.push(testResult);
      
      // Update connection state
      updateConnectionState(sub.name, testResult.status, {
        latency: testResult.latency,
        details: testResult.details
      });
    }

    // Calculate overall status
    const statuses = results.tests.map(t => t.status);
    if (statuses.every(s => s === 'OK')) {
      results.overall = 'OK';
    } else if (statuses.some(s => s === 'FORBIDDEN')) {
      results.overall = 'FORBIDDEN';
    } else if (statuses.some(s => s === 'DEGRADED')) {
      results.overall = 'DEGRADED';
    } else if (statuses.every(s => s === 'NOT_CONFIGURED' || s === 'UNKNOWN')) {
      results.overall = 'NOT_CONFIGURED';
    } else {
      results.overall = 'DEGRADED';
    }

    setSelfTestResults(results);
    setConnectionState(prev => ({
      ...prev,
      overall: results.overall,
      lastCheck: results.timestamp
    }));

    return results;
  }, [updateConnectionState]);

  // Get evidence for a specific metric/panel
  const getEvidence = useCallback((panelId) => {
    // Filter network logs related to this panel
    const relevantRequests = networkLog.filter(req => 
      req.panelId === panelId || req.url?.includes(panelId)
    );

    return {
      clientEvidence: {
        available: true,
        requests: relevantRequests,
        count: relevantRequests.length
      },
      systemEvidence: {
        available: false,
        status: 'PLANNED',
        schema: {
          events: '[]',
          source: 'backend_event_log',
          note: 'System evidence will be available when backend API is implemented'
        }
      }
    };
  }, [networkLog]);

  // Generate debug bundle
  const generateDebugBundle = useCallback(() => {
    const buildInfo = {
      version: '2.1.0',
      buildDate: '2025-01-14',
      environment: process.env.NODE_ENV || 'development'
    };

    const configSnapshot = {
      backendUrl: process.env.REACT_APP_BACKEND_URL || 'not_set',
      theme: localStorage.getItem('omega-theme') || 'dark',
      language: localStorage.getItem('omega-language') || 'en'
    };

    return {
      generatedAt: new Date().toISOString(),
      buildInfo,
      configSnapshot,
      selfTestResults: selfTestResults || { status: 'NOT_RUN' },
      networkLog: networkLog.slice(0, 100),
      errorLog: errorLog.slice(0, 100),
      connectionState,
      profile: JSON.parse(localStorage.getItem('omega-profile') || '{}'),
      localStorage: {
        keys: Object.keys(localStorage).filter(k => k.startsWith('omega-')),
        note: 'Values redacted for security'
      }
    };
  }, [selfTestResults, networkLog, errorLog, connectionState]);

  // Copy debug bundle to clipboard
  const copyDebugBundle = useCallback(async () => {
    const bundle = generateDebugBundle();
    const json = JSON.stringify(bundle, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      return { success: true, size: json.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [generateDebugBundle]);

  const value = {
    // Network log
    networkLog,
    logNetworkRequest,
    
    // Error log
    errorLog,
    logUIError,
    
    // Self-test
    selfTestResults,
    runSelfTest,
    
    // Connection state
    connectionState,
    updateConnectionState,
    
    // Evidence
    getEvidence,
    
    // Debug bundle
    generateDebugBundle,
    copyDebugBundle,
    
    // Status
    systemEvidenceStatus: 'PLANNED'
  };

  return (
    <EvidenceContext.Provider value={value}>
      {children}
    </EvidenceContext.Provider>
  );
};

export default EvidenceContext;
