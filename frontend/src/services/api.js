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
 * Integrates with real OMEGA backend on port 8093
 */

class APIService {
  constructor() {
    this.retryDelays = new Map();
    this.cache = new Map();
  }

  /**
   * Generic fetch with error handling and retry logic
   */
  async fetch(url, options = {}) {
    const { retry = true, timeout = 5000, useCache = false, cacheTime = 5000 } = options;

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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
        return this.fetch(url, { ...options, retry: false });
      }

      throw error;
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
   * Health Check - GET /cgi-bin/health.py
   */
  async getHealth() {
    try {
      const raw = await this.fetch(`${config.endpoints.backend}${config.endpoints.health}`);
      return normalizeHealth(raw);
    } catch (error) {
      console.error('Health check failed:', error);
      return normalizeHealth(null);
    }
  }

  /**
   * System Metrics - GET /cgi-bin/metrics.py
   */
  async getMetrics() {
    try {
      const raw = await this.fetch(`${config.endpoints.backend}${config.endpoints.metrics}`, {
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
   * Sensor Data (BME680) - GET /cgi-bin/sensors.py
   */
  async getSensors() {
    try {
      const raw = await this.fetch(`${config.endpoints.backend}${config.endpoints.sensors}`);
      return normalizeSensors(raw);
    } catch (error) {
      console.error('Sensors fetch failed:', error);
      return normalizeSensors(null);
    }
  }

  /**
   * Backups - GET /cgi-bin/backup.py
   */
  async getBackups() {
    try {
      const raw = await this.fetch(`${config.endpoints.backend}${config.endpoints.backup}`);
      return normalizeBackups(raw);
    } catch (error) {
      console.error('Backups fetch failed:', error);
      return normalizeBackups(null);
    }
  }

  /**
   * Trigger Backup - POST /cgi-bin/backup.py
   */
  async triggerBackup() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.backup}`, {
        method: 'POST',
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Keys Status - GET /cgi-bin/keys.py
   */
  async getKeys() {
    try {
      const raw = await this.fetch(`${config.endpoints.backend}${config.endpoints.keys}`);
      return normalizeKeys(raw);
    } catch (error) {
      console.error('Keys fetch failed:', error);
      return normalizeKeys(null);
    }
  }

  /**
   * Key Sync Status - GET /cgi-bin/keysync.py
   */
  async getKeySync() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.keysync}`);
    } catch (error) {
      console.error('KeySync fetch failed:', error);
      return { status: 'unknown', available: false };
    }
  }

  /**
   * Direct Messages - GET /cgi-bin/dm.py
   */
  async getDMs() {
    try {
      const raw = await this.fetch(`${config.endpoints.backend}${config.endpoints.dm}`);
      return normalizeDMs(raw);
    } catch (error) {
      console.error('DMs fetch failed:', error);
      return normalizeDMs(null);
    }
  }

  /**
   * Send DM - POST /cgi-bin/dm.py
   */
  async sendDM(to, content) {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.dm}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, content, encrypted: true }),
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new APIService();
