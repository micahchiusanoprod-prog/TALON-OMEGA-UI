import config from '../config';
import {
  normalizeHealth,
  normalizeMetrics,
  normalizeSensors,
  normalizeBackups,
  normalizeKeys,
  normalizeDMs,
} from './dataAdapter';

/**
 * API Service with graceful degradation and exponential backoff
 * Integrates with real OMEGA backend through Nginx /api proxy
 * 
 * API Strategy:
 * - All endpoints use relative paths: /api/cgi-bin/*
 * - Nginx reverse proxy routes to http://localhost:8093
 * - This keeps frontend same-origin for mobile/LAN clients
 */

class APIService {
  constructor() {
    this.retryDelays = new Map();
    this.cache = new Map();
  }

  /**
   * Build full URL for an endpoint
   * Uses API_BASE (empty for same-origin) + endpoint path
   */
  buildUrl(endpointPath) {
    const base = config.API_BASE || '';
    return `${base}${endpointPath}`;
  }

  /**
   * Generic fetch with error handling and retry logic
   */
  async fetch(endpointPath, options = {}) {
    const { retry = true, timeout = 5000, useCache = false, cacheTime = 5000 } = options;
    const url = this.buildUrl(endpointPath);

    // Check cache first
    if (useCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.httpStatus = response.status;
        throw error;
      }

      // Reset retry delay on success
      this.retryDelays.delete(url);

      const data = await response.json();

      // Cache successful response
      if (useCache) {
        this.cache.set(url, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.warn(`API fetch failed for ${url}:`, error.message);

      if (retry && this.shouldRetry(url)) {
        await this.wait(this.getRetryDelay(url));
        return this.fetch(endpointPath, { ...options, retry: false });
      }

      throw error;
    }
  }

  /**
   * Fetch with explicit handling for different response codes
   * Returns { ok, status, data, error }
   */
  async fetchWithStatus(endpointPath, options = {}) {
    const { timeout = 5000 } = options;
    const url = this.buildUrl(endpointPath);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      let data = null;
      try {
        data = await response.json();
      } catch {
        // Response not JSON
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
        error: response.ok ? null : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        status: error.name === 'AbortError' ? 408 : 0,
        data: null,
        error: error.message,
      };
    }
  }

  /**
   * Exponential backoff calculation
   */
  getRetryDelay(url) {
    const currentDelay = this.retryDelays.get(url) || config.retry.baseDelay;
    const nextDelay = Math.min(
      currentDelay * config.retry.backoffFactor,
      config.retry.maxDelay
    );
    this.retryDelays.set(url, nextDelay);
    return currentDelay;
  }

  shouldRetry(url) {
    const attempts = (this.retryDelays.get(url) || config.retry.baseDelay) / config.retry.baseDelay;
    return attempts < config.retry.maxAttempts;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health Check - GET /api/cgi-bin/health.py
   */
  async getHealth() {
    try {
      const raw = await this.fetch(config.endpoints.health);
      return normalizeHealth(raw);
    } catch (error) {
      console.error('Health check failed:', error);
      return normalizeHealth(null);
    }
  }

  /**
   * System Metrics - GET /api/cgi-bin/metrics.py
   */
  async getMetrics() {
    try {
      const raw = await this.fetch(config.endpoints.metrics, {
        useCache: true,
        cacheTime: 2000, // 2 second cache for metrics
      });
      return normalizeMetrics(raw);
    } catch (error) {
      console.error('Metrics fetch failed:', error);
      return normalizeMetrics(null);
    }
  }

  /**
   * Sensor Data (BME680) - GET /api/cgi-bin/sensors.py
   * Note: May return degraded state if I2C bus not configured
   */
  async getSensors() {
    try {
      const result = await this.fetchWithStatus(config.endpoints.sensors);
      
      // Handle degraded state (sensor hardware not available)
      if (result.ok && result.data?.status === 'error') {
        return {
          ...normalizeSensors(null),
          degraded: true,
          degradedReason: result.data.error || 'Sensor hardware not available',
        };
      }
      
      return normalizeSensors(result.data);
    } catch (error) {
      console.error('Sensors fetch failed:', error);
      return normalizeSensors(null);
    }
  }

  /**
   * Backups - GET /api/cgi-bin/backup.py
   */
  async getBackups() {
    try {
      const raw = await this.fetch(config.endpoints.backup);
      return normalizeBackups(raw);
    } catch (error) {
      console.error('Backups fetch failed:', error);
      return normalizeBackups(null);
    }
  }

  /**
   * Trigger Backup - POST /api/cgi-bin/backup.py
   */
  async triggerBackup() {
    try {
      return await this.fetch(config.endpoints.backup, {
        method: 'POST',
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Keys Status - GET /api/cgi-bin/keys.py
   */
  async getKeys() {
    try {
      const raw = await this.fetch(config.endpoints.keys);
      return normalizeKeys(raw);
    } catch (error) {
      console.error('Keys fetch failed:', error);
      return normalizeKeys(null);
    }
  }

  /**
   * Key Sync Status - GET /api/cgi-bin/keysync.py
   */
  async getKeySync() {
    try {
      return await this.fetch(config.endpoints.keysync);
    } catch (error) {
      console.error('KeySync fetch failed:', error);
      return { status: 'unknown', available: false };
    }
  }

  /**
   * Direct Messages - GET /api/cgi-bin/dm.py
   * Note: Returns 403 Forbidden if not authorized
   */
  async getDMs() {
    try {
      const result = await this.fetchWithStatus(config.endpoints.dm);
      
      // Handle forbidden state
      if (result.status === 403) {
        return {
          ...normalizeDMs(null),
          forbidden: true,
          forbiddenReason: result.data?.err || 'Authentication required',
        };
      }
      
      return normalizeDMs(result.data);
    } catch (error) {
      console.error('DMs fetch failed:', error);
      return normalizeDMs(null);
    }
  }

  /**
   * Send DM - POST /api/cgi-bin/dm.py
   */
  async sendDM(to, content) {
    try {
      return await this.fetch(config.endpoints.dm, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, content, encrypted: true }),
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Hotspot Status - GET /api/hotspot/status
   */
  async getHotspotStatus() {
    try {
      const raw = await this.fetch(config.endpoints.hotspotStatus);
      return {
        enabled: raw.enabled || false,
        ssid: raw.ssid || config.hotspot.ssid,
        band: raw.band || '2.4GHz',
        channel: raw.channel || null,
        uptime: raw.uptime_s || 0,
        maxClients: raw.max_clients || config.hotspot.maxClients,
        connectedCount: raw.connected_count || 0,
        available: true,
      };
    } catch (error) {
      console.error('Hotspot status fetch failed:', error);
      return this.getMockHotspotStatus();
    }
  }

  /**
   * Toggle Hotspot - POST /api/hotspot/toggle
   */
  async toggleHotspot(enabled) {
    try {
      return await this.fetch(config.endpoints.hotspotToggle, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch (error) {
      console.error('Hotspot toggle failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Hotspot Clients - GET /api/hotspot/clients
   */
  async getHotspotClients() {
    try {
      const raw = await this.fetch(config.endpoints.hotspotClients);
      return {
        clients: (raw || []).map(c => ({
          hostname: c.hostname || 'Unknown Device',
          mac: c.mac || 'Unknown',
          ip: c.ip || 'Unknown',
          connectedAt: c.connected_at || c.last_seen,
          lastSeen: c.last_seen,
          rssi: c.rssi || null,
          rxBytes: c.rx_bytes || 0,
          txBytes: c.tx_bytes || 0,
        })),
        available: true,
      };
    } catch (error) {
      console.error('Hotspot clients fetch failed:', error);
      return this.getMockHotspotClients();
    }
  }

  /**
   * Hotspot Usage - GET /api/hotspot/usage
   */
  async getHotspotUsage() {
    try {
      const raw = await this.fetch(config.endpoints.hotspotUsage);
      return {
        rxBytesTotal: raw.rx_bytes_total || 0,
        txBytesTotal: raw.tx_bytes_total || 0,
        rxRateBps: raw.rx_rate_bps || 0,
        txRateBps: raw.tx_rate_bps || 0,
        available: true,
      };
    } catch (error) {
      console.error('Hotspot usage fetch failed:', error);
      return this.getMockHotspotUsage();
    }
  }

  // ============= MOCK HOTSPOT DATA =============

  getMockHotspotStatus() {
    return {
      enabled: true,
      ssid: config.hotspot.ssid,
      band: '2.4GHz',
      channel: 6,
      uptime: 7245,
      maxClients: config.hotspot.maxClients,
      connectedCount: 3,
      available: false,
    };
  }

  getMockHotspotClients() {
    return {
      clients: [
        {
          hostname: 'Phone-Android',
          mac: 'AA:BB:CC:DD:EE:01',
          ip: '192.168.4.2',
          connectedAt: new Date(Date.now() - 3600000).toISOString(),
          lastSeen: new Date().toISOString(),
          rssi: -45,
          rxBytes: 15728640,
          txBytes: 8388608,
        },
        {
          hostname: 'Laptop-Ubuntu',
          mac: 'AA:BB:CC:DD:EE:02',
          ip: '192.168.4.3',
          connectedAt: new Date(Date.now() - 1800000).toISOString(),
          lastSeen: new Date().toISOString(),
          rssi: -52,
          rxBytes: 52428800,
          txBytes: 26214400,
        },
        {
          hostname: 'Tablet-iPad',
          mac: 'AA:BB:CC:DD:EE:03',
          ip: '192.168.4.4',
          connectedAt: new Date(Date.now() - 900000).toISOString(),
          lastSeen: new Date().toISOString(),
          rssi: -38,
          rxBytes: 10485760,
          txBytes: 5242880,
        },
      ],
      available: false,
    };
  }

  getMockHotspotUsage() {
    return {
      rxBytesTotal: 78643200,
      txBytesTotal: 39845888,
      rxRateBps: 524288,
      txRateBps: 262144,
      available: false,
    };
  }
}

export default new APIService();
