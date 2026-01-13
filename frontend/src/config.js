// ============================================================
// OMEGA Dashboard Runtime Configuration
// Pi-Ready Deployment Configuration
// ============================================================
// This config supports both MOCK mode (offline development) and
// LIVE mode (connected to Pi backend)

// Build-time injected version (set during build)
export const BUILD_VERSION = process.env.REACT_APP_BUILD_VERSION || 'dev';
export const BUILD_TIMESTAMP = process.env.REACT_APP_BUILD_TIMESTAMP || new Date().toISOString();

// ============================================================
// Runtime Configuration - Can be overridden via window.OMEGA_CONFIG
// ============================================================

const getConfig = () => {
  // Check for runtime override (allows config without rebuild)
  const runtimeConfig = typeof window !== 'undefined' ? window.OMEGA_CONFIG : {};
  
  return {
    // ========== Core URLs ==========
    // API base for Pi backend (CGI scripts)
    API_BASE: runtimeConfig.API_BASE || process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8093',
    
    // Kiwix offline wiki server
    KIWIX_BASE: runtimeConfig.KIWIX_BASE || process.env.REACT_APP_KIWIX_BASE || 'http://127.0.0.1:8090',
    
    // ========== Data Mode ==========
    // true = use mock data (offline/development)
    // false = use live backend data
    USE_MOCK_DATA: runtimeConfig.USE_MOCK_DATA !== undefined 
      ? runtimeConfig.USE_MOCK_DATA 
      : (process.env.REACT_APP_USE_MOCK_DATA !== 'false'),
    
    // ========== Backend Endpoints ==========
    endpoints: {
      health: '/cgi-bin/health.py',
      metrics: '/cgi-bin/metrics.py',
      sensors: '/cgi-bin/sensors.py',
      backup: '/cgi-bin/backup.py',
      keys: '/cgi-bin/keys.py',
      keysync: '/cgi-bin/keysync.py',
      dm: '/cgi-bin/dm.py',
      gps: '/cgi-bin/gps.py',
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
  };
};

// Export singleton config
const config = getConfig();

// Ensure config is valid before exporting
if (!config || !config.API_BASE) {
  console.error('OMEGA Config Error: Config not properly initialized');
}

// Helper to get full endpoint URL
export const getEndpointUrl = (endpoint) => {
  const baseUrl = config.API_BASE;
  const path = config.endpoints[endpoint];
  if (!path) {
    console.warn(`Unknown endpoint: ${endpoint}`);
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
