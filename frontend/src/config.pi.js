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
  
  // Determine base URL from current origin (relative URLs for all)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    // ========== Core URLs - ALL RELATIVE ==========
    // API base - relative path, nginx proxies to Pi backend
    API_BASE: runtimeConfig.API_BASE || '',
    
    // Kiwix - relative path, nginx proxies to Kiwix server
    // NO MORE http://talon.local:8090
    KIWIX_BASE: runtimeConfig.KIWIX_BASE || '/kiwix',
    
    // Jellyfin media server - configurable
    // Default: same origin on port 8096, or override via OMEGA_CONFIG
    JELLYFIN_BASE: runtimeConfig.JELLYFIN_BASE || 
      runtimeConfig.jellyfinBase || 
      (origin ? origin.replace(/:\d+$/, ':8096') : ':8096'),
    JELLYFIN_WEB_PATH: '/web/',
    
    // ========== Data Mode ==========
    // true = use mock data (offline/development)
    // false = use live backend data (Pi connected)
    USE_MOCK_DATA: runtimeConfig.USE_MOCK_DATA !== undefined 
      ? runtimeConfig.USE_MOCK_DATA 
      : (process.env.REACT_APP_USE_MOCK_DATA === 'true'),
    
    // ========== Backend Endpoints (all relative) ==========
    endpoints: {
      // Health check - PRIMARY source of system state
      health: '/api/cgi-bin/health.py',
      metrics: '/api/cgi-bin/metrics.py',
      sensors: '/api/cgi-bin/sensors.py',
      backup: '/api/cgi-bin/backup.py',
      keys: '/api/cgi-bin/keys.py',
      keysync: '/api/cgi-bin/keysync.py',
      dm: '/api/cgi-bin/dm.py',
      power: '/api/cgi-bin/power',
      weather: '/api/cgi-bin/weather',
      mesh: '/api/cgi-bin/mesh',
      gps: '/api/cgi-bin/gps',
      // Hotspot
      hotspotStatus: '/api/hotspot/status',
      hotspotToggle: '/api/hotspot/toggle',
      hotspotClients: '/api/hotspot/clients',
      // Ally Communications
      allyNodes: '/api/ally/nodes',
      allyChat: '/api/ally/chat',
      allyBroadcast: '/api/ally/broadcast',
    },
    
    // ========== Kiwix Endpoints (relative via nginx) ==========
    kiwix: {
      catalog: '/kiwix/catalog/v2/entries',
      search: '/kiwix/search',
      suggest: '/kiwix/suggest',
      content: '/kiwix/content',
      // Health check endpoint
      health: '/kiwix/',
    },
    
    // ========== Polling Intervals (ms) ==========
    polling: {
      healthCheck: 15000,      // 15 seconds for system health
      metrics: 5000,           // 5 seconds for system metrics
      sensors: 5000,           // 5 seconds for BME680 sensors
      community: 30000,        // 30 seconds for community updates
    },
    
    // ========== Request Configuration ==========
    request: {
      timeout: 8000,           // 8 second timeout (Pi can be slow)
      retryAttempts: 2,        // Retry twice on failure
      retryDelay: 1000,        // 1 second between retries
    },
    
    // ========== Feature Flags ==========
    features: {
      enableDiagnostics: true,
      enableAnimations: true,
      enableHealthPolling: true,
      enableOfflineMode: true,
      enableQuickAccess: true,  // NEW: Quick Access panel on landing
      enableMockData: runtimeConfig.USE_MOCK_DATA !== undefined 
        ? runtimeConfig.USE_MOCK_DATA 
        : (process.env.REACT_APP_USE_MOCK_DATA === 'true'),
    },
    
    // ========== Build Info ==========
    build: {
      version: BUILD_VERSION,
      timestamp: BUILD_TIMESTAMP,
      environment: process.env.NODE_ENV || 'production',
      piReady: true,
    },
    
    // ========== UI Configuration ==========
    ui: {
      searchDebounce: 300,
      toastDuration: 3000,
    },
    
    // ========== Hotspot Configuration ==========
    hotspot: {
      ssid: 'OMEGA-Hotspot',
      localUrl: '/',  // Relative - works on any hostname
      maxClients: 10,
    },
    
    // ========== GPS Configuration ==========
    gps: {
      breadcrumbLimit: 100,
      accuracyThreshold: 10,
      updateInterval: 3000,
    },
    
    // ========== API Configuration ==========
    api: {
      timeout: 8000,
    },
    
    // ========== Retry Configuration ==========
    retry: {
      maxAttempts: 3,
      baseDelay: 1000,
    },
  };
};

const config = getConfig();

// ============================================================
// System Health Check Utility (WAN-independent)
// ============================================================
export const checkSystemHealth = async () => {
  const results = {
    api: false,
    kiwix: false,
    state: SYSTEM_STATE.UNKNOWN,
    timestamp: Date.now(),
  };
  
  // Check API health
  try {
    const apiResponse = await fetch(config.endpoints.health, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    results.api = apiResponse.ok;
  } catch {
    results.api = false;
  }
  
  // Check Kiwix health
  try {
    const kiwixResponse = await fetch(config.kiwix.health, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    results.kiwix = kiwixResponse.ok;
  } catch {
    results.kiwix = false;
  }
  
  // Determine overall state
  if (results.api && results.kiwix) {
    results.state = SYSTEM_STATE.LOCAL_OK;
  } else if (results.api || results.kiwix) {
    results.state = SYSTEM_STATE.LOCAL_DEGRADED;
  } else {
    results.state = SYSTEM_STATE.LOCAL_DOWN;
  }
  
  return results;
};

// ============================================================
// URL Builders (all relative)
// ============================================================
export const buildApiUrl = (endpoint) => {
  return config.API_BASE + endpoint;
};

export const buildKiwixUrl = (path) => {
  return config.KIWIX_BASE + path;
};

export const buildKiwixSearchUrl = (query, limit = 20) => {
  return `${config.KIWIX_BASE}/search?pattern=${encodeURIComponent(query)}&limit=${limit}`;
};

export const buildKiwixSuggestUrl = (term) => {
  return `${config.KIWIX_BASE}/suggest?term=${encodeURIComponent(term)}`;
};

// Runtime config override
export const setRuntimeConfig = (newConfig) => {
  if (typeof window !== 'undefined') {
    window.OMEGA_CONFIG = { ...window.OMEGA_CONFIG, ...newConfig };
  }
};

export default config;
