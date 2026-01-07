// OMEGA Dashboard Configuration
// Single source of truth for all configurable values

const config = {
  // API Configuration
  api: {
    // Base URL for the main OMEGA backend (port 8093 on Pi)
    // In preview: uses mock data
    // In production: set via REACT_APP_PI_API_URL environment variable
    baseUrl: process.env.REACT_APP_PI_API_URL || 'http://127.0.0.1:8093/cgi-bin',
    
    // API Key for authentication
    // Set via REACT_APP_PI_API_KEY environment variable
    apiKey: process.env.REACT_APP_PI_API_KEY || '',
    
    // Request timeout in milliseconds
    timeout: 5000,
  },

  // Base URLs for local services
  endpoints: {
    kiwix: 'http://127.0.0.1:8090',
    kiwixAlt: 'http://talon.local:8090',
    backend: 'http://127.0.0.1:8093',
    // Backend CGI endpoints (existing API)
    health: '/cgi-bin/health.py',
    metrics: '/cgi-bin/metrics.py',
    sensors: '/cgi-bin/sensors.py',
    backup: '/cgi-bin/backup.py',
    keys: '/cgi-bin/keys.py',
    keysync: '/cgi-bin/keysync.py',
    dm: '/cgi-bin/dm.py',
    // Hotspot endpoints
    hotspotStatus: '/api/hotspot/status',
    hotspotToggle: '/api/hotspot/toggle',
    hotspotClients: '/api/hotspot/clients',
    hotspotUsage: '/api/hotspot/usage',
    // Ally Communications endpoints
    allyNodes: '/api/ally/nodes',
    allyNodeStatus: '/api/ally/node',
    allyGlobalChat: '/api/ally/chat/global',
    allyDM: '/api/ally/chat/dm',
    allyBroadcast: '/api/ally/broadcast',
    allyPing: '/api/ally/node',
    allyRefresh: '/api/ally/node',
  },

  // Hotspot configuration
  hotspot: {
    ssid: 'OMEGA-Hotspot', // Default SSID for display/QR
    password: '', // Leave empty for security - don't store passwords in config
    localUrl: 'http://talon.local/',
    maxClients: 10, // Default max clients
  },

  // Ally Communications Hub API
  ally: {
    // Ally-specific API base (can be same as main or different)
    apiBase: process.env.REACT_APP_PI_API_URL || 'http://127.0.0.1:8093/cgi-bin',
    
    // Message retry configuration
    messageRetryInterval: 30000,  // 30 seconds
    maxQueueSize: 100,
    
    // Additional ally configuration
    nodeOfflineThreshold: 60, // seconds
    pollingOnline: 5000, // 5 seconds for online nodes
    pollingOffline: 20000, // 20 seconds for offline nodes
  },

  // Polling intervals (milliseconds)
  polling: {
    metrics: 3000,        // 3 seconds for system metrics (real-time feel)
    sensors: 5000,        // 5 seconds for BME680 sensors
    health: 15000,        // 15 seconds for health check
    community: 30000,     // 30 seconds for community updates
    hotspotOn: 4000,      // 4 seconds when hotspot is ON
    hotspotOff: 12000,    // 12 seconds when hotspot is OFF
    allyNodes: 5000,      // 5 seconds for Ally node status
    allyChat: 3000,       // 3 seconds for chat messages
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,      // Start with 1 second
    maxDelay: 30000,      // Cap at 30 seconds
    backoffFactor: 2,     // Exponential backoff
  },

  // GPS configuration
  gps: {
    breadcrumbLimit: 100,  // Keep last 100 GPS points
    accuracyThreshold: 10, // Meters
    updateInterval: 3000,  // 3 seconds
  },

  // Map configuration (for offline fallback)
  map: {
    defaultCenter: [0, 0],
    defaultZoom: 13,
    tileProvider: 'offline', // 'offline' or 'online' (if available)
  },

  // Feature flags
  features: {
    enableDiagnostics: true,
    enableMockData: true,   // Preview: use mock data. Set false + env vars for Pi deployment
    enableAnimations: true,
  },

  // UI Configuration
  ui: {
    searchDebounce: 300,   // ms
    toastDuration: 3000,   // ms
  },
};

export default config;
