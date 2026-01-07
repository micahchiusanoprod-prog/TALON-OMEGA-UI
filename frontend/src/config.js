// OMEGA Dashboard Configuration
// Single source of truth for all endpoints and settings

const config = {
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
  },

  // Polling intervals (milliseconds)
  polling: {
    metrics: 3000,        // 3 seconds for system metrics (real-time feel)
    sensors: 5000,        // 5 seconds for BME680 sensors
    health: 15000,        // 15 seconds for health check
    community: 30000,     // 30 seconds for community updates
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
    enableMockData: true,  // Use mock data when endpoints unavailable
    enableAnimations: true,
  },

  // UI Configuration
  ui: {
    searchDebounce: 300,   // ms
    toastDuration: 3000,   // ms
  },
};

export default config;
