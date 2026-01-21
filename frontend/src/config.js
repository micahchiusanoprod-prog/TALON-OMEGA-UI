// ============================================================
// OMEGA Dashboard Runtime Configuration
// Pi-Ready Deployment - ZERO EXTERNAL DEPENDENCIES
// ============================================================
// All URLs are RELATIVE - works behind nginx reverse proxy
// API: /api/* → Pi backend (127.0.0.1:8093)
// Kiwix: /kiwix/* → Kiwix server (127.0.0.1:8090)

// Build-time injected version (set during build)
export const BUILD_VERSION = process.env.REACT_APP_BUILD_VERSION || 'pi-1.0.0';
export const BUILD_TIMESTAMP = process.env.REACT_APP_BUILD_TIMESTAMP || new Date().toISOString();

// ============================================================
// System Health State (not just navigator.onLine)
// ============================================================
export const SYSTEM_STATE = {
  LOCAL_OK: 'LOCAL_OK',           // All local services responding
  LOCAL_DEGRADED: 'LOCAL_DEGRADED', // Some services down
  LOCAL_DOWN: 'LOCAL_DOWN',       // All local services unreachable
  UNKNOWN: 'UNKNOWN'              // Haven't checked yet
};

// ============================================================
// Runtime Configuration - Can be overridden via window.OMEGA_CONFIG
// ============================================================

const getConfig = () => {
  // Check for runtime override (allows config without rebuild)
  const runtimeConfig = (typeof window !== 'undefined' && window.OMEGA_CONFIG) ? window.OMEGA_CONFIG : {};
  
  // Determine base URL from current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    // ========== Core URLs - ALL RELATIVE ==========
    // API base - relative path, nginx proxies to Pi backend
    API_BASE: runtimeConfig.API_BASE || process.env.REACT_APP_API_BASE || '',
    
    // Kiwix - relative path, nginx proxies to Kiwix server
    KIWIX_BASE: runtimeConfig.KIWIX_BASE || '/kiwix',
    
    // Jellyfin media server - configurable
    JELLYFIN_BASE: runtimeConfig.JELLYFIN_BASE || 
      runtimeConfig.jellyfinBase || 
      process.env.REACT_APP_JELLYFIN_BASE || 
      (origin ? origin.replace(/:\d+$/, ':8096') : ':8096'),
    JELLYFIN_WEB_PATH: '/web/',
    
    // ========== Data Mode ==========
    // true = use mock data (offline/development)
    // false = use live backend data
    USE_MOCK_DATA: runtimeConfig.USE_MOCK_DATA !== undefined 
      ? runtimeConfig.USE_MOCK_DATA 
      : (process.env.REACT_APP_USE_MOCK_DATA !== 'false'),
    
    // ========== Backend Endpoints ==========
    // All CGI endpoints go through /api/cgi-bin/ proxy
    endpoints: {
      health: '/api/cgi-bin/health.py',
      metrics: '/api/cgi-bin/metrics.py',
      sensors: '/api/cgi-bin/sensors.py',
      backup: '/api/cgi-bin/backup.py',
      keys: '/api/cgi-bin/keys.py',
      keysync: '/api/cgi-bin/keysync.py',
      dm: '/api/cgi-bin/dm.py',
      gps: null, // Not configured - endpoint path unknown
      // Hotspot
      hotspotStatus: '/api/hotspot/status',
      hotspotToggle: '/api/hotspot/toggle',
      hotspotClients: '/api/hotspot/clients',
      // Ally Communications
      allyNodes: '/api/ally/nodes',
      allyChat: '/api/ally/chat',
    },
    
    // ========== Polling Intervals (ms) ==========
    polling: {
      healthCheck: 12000,      // 12 seconds for connection health
      metrics: 3000,           // 3 seconds for system metrics
      sensors: 5000,           // 5 seconds for BME680 sensors
      community: 30000,        // 30 seconds for community updates
    },
    
    // ========== Request Configuration ==========
    request: {
      timeout: 5000,           // 5 second timeout
      retryAttempts: 2,        // Retry twice on failure
      retryDelay: 1000,        // 1 second between retries
    },
    
    // ========== Feature Flags ==========
    features: {
      enableDiagnostics: true,
      enableAnimations: true,
      enableHealthPolling: true,
      enableOfflineMode: true,
      enableMockData: runtimeConfig.USE_MOCK_DATA !== undefined 
        ? runtimeConfig.USE_MOCK_DATA 
        : (process.env.REACT_APP_USE_MOCK_DATA !== 'false'),
    },
    
    // ========== Build Info ==========
    build: {
      version: BUILD_VERSION,
      timestamp: BUILD_TIMESTAMP,
      environment: process.env.NODE_ENV || 'development',
    },
    
    // ========== UI Configuration ==========
    ui: {
      searchDebounce: 300,
      toastDuration: 3000,
    },
    
    // ========== Hotspot Configuration ==========
    hotspot: {
      ssid: 'OMEGA-Hotspot',
      localUrl: 'http://talon.local/',
      maxClients: 10,
    },
    
    // ========== GPS Configuration ==========
    gps: {
      breadcrumbLimit: 100,
      accuracyThreshold: 10,
      updateInterval: 3000,
    },
    
    // ========== Ally API Configuration ==========
    ally: {
      apiBase: runtimeConfig.API_BASE || process.env.REACT_APP_API_BASE || '',
    },
    
    // ========== API Configuration (General) ==========
    api: {
      apiKey: process.env.REACT_APP_API_KEY || null,
      timeout: 5000,
    },
    
    // ========== Retry Configuration ==========
    retry: {
      maxAttempts: 3,
      baseDelay: 1000,
      backoffFactor: 2,
      maxDelay: 10000,
    },
  };
};

// Export singleton config
const config = getConfig();

// Ensure config is valid before exporting
if (!config) {
  console.error('OMEGA Config Error: Config not properly initialized');
}

// Helper to get full endpoint URL
// API_BASE can be empty (same-origin) or a full URL like http://talon.local:8093
export const getEndpointUrl = (endpoint) => {
  const baseUrl = config.API_BASE || '';
  const path = config.endpoints[endpoint];
  if (path === null || path === undefined) {
    // Endpoint not configured (like GPS)
    return null;
  }
  return `${baseUrl}${path}`;
};

// Helper to check if we're in mock mode
export const isMockMode = () => config.USE_MOCK_DATA;

// Helper to get build info
export const getBuildInfo = () => config.build;

// Export for runtime config override
export const updateRuntimeConfig = (newConfig) => {
  if (typeof window !== 'undefined') {
    window.OMEGA_CONFIG = { ...window.OMEGA_CONFIG, ...newConfig };
  }
};

export default config;
