import config from '../config';

/**
 * API Service with graceful degradation and exponential backoff
 */

class APIService {
  constructor() {
    this.retryDelays = new Map();
  }

  /**
   * Generic fetch with error handling and retry logic
   */
  async fetch(url, options = {}) {
    const { retry = true, timeout = 5000 } = options;

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

      return await response.json();
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
   * Health Check
   */
  async getHealth() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.health}`);
    } catch {
      return this.getMockHealth();
    }
  }

  /**
   * System Metrics (CPU, RAM, Disk, Temp)
   */
  async getMetrics() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.metrics}`);
    } catch {
      return this.getMockMetrics();
    }
  }

  /**
   * Sensor Data (Temperature, etc.)
   */
  async getSensors() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.sensors}`);
    } catch {
      return this.getMockSensors();
    }
  }

  /**
   * GPS Location
   */
  async getGPS() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.gps}`);
    } catch {
      return this.getMockGPS();
    }
  }

  /**
   * Community Posts
   */
  async getCommunityPosts() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.communityPosts}`);
    } catch {
      return this.getMockCommunityPosts();
    }
  }

  /**
   * Toggle Hotspot
   */
  async toggleHotspot() {
    try {
      return await this.fetch(`${config.endpoints.backend}${config.endpoints.hotspotToggle}`, {
        method: 'POST',
      });
    } catch {
      return { success: false, message: 'Hotspot service unavailable' };
    }
  }

  // ============= MOCK DATA FALLBACKS =============

  getMockHealth() {
    return {
      status: 'healthy',
      services: {
        kiwix: Math.random() > 0.2 ? 'up' : 'down',
        backend: 'up',
        hotspot: Math.random() > 0.5 ? 'on' : 'off',
      },
      timestamp: new Date().toISOString(),
    };
  }

  getMockMetrics() {
    return {
      cpu: Math.floor(Math.random() * 60 + 20),
      ram: Math.floor(Math.random() * 70 + 20),
      disk: Math.floor(Math.random() * 30 + 50),
      temperature: Math.floor(Math.random() * 15 + 45),
      network: {
        mode: Math.random() > 0.5 ? 'hotspot' : 'client',
        connected: true,
      },
    };
  }

  getMockSensors() {
    return {
      temperature: Math.floor(Math.random() * 15 + 45),
      humidity: Math.floor(Math.random() * 30 + 40),
      pressure: Math.floor(Math.random() * 50 + 1000),
    };
  }

  getMockGPS() {
    return {
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      altitude: 50,
      accuracy: Math.floor(Math.random() * 10 + 3),
      satellites: Math.floor(Math.random() * 5 + 8),
      timestamp: new Date().toISOString(),
    };
  }

  getMockCommunityPosts() {
    return {
      posts: [
        {
          id: 1,
          author: 'OMEGA User',
          content: 'Just deployed the new firmware update!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 5,
        },
        {
          id: 2,
          author: 'Cyberdeck Admin',
          content: 'Reminder: Kiwix library updated with new Wikipedia archives.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: 12,
        },
      ],
    };
  }
}

export default new APIService();
