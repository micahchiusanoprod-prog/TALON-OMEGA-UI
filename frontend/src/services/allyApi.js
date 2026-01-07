// Ally Communications API Service
// Supports both mock data and live backend (port 8093)
// Controlled via config.features.enableMockData

import config from '../config';

class AllyApiService {
  constructor() {
    this.baseUrl = config.ally.apiBase;
    this.apiKey = config.api.apiKey;
    this.timeout = config.api.timeout || 5000;
    this.cache = {
      nodes: null,
      nodesTimestamp: null,
      globalChat: [],
      globalChatTimestamp: null,
      dmChats: {},
      userStatus: null,
    };
    this.messageQueue = [];
    this.isOnline = false;
    this.lastError = null;
    this.retryTimer = null;
  }

  // ============= HELPERS =============

  /**
   * Build URL with optional API key as query parameter
   * Supports both header auth and query param fallback
   */
  buildUrl(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add API key as query param if configured (fallback auth method)
    if (this.apiKey) {
      url.searchParams.set('key', this.apiKey);
    }
    
    // Add any additional params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  }

  /**
   * Build headers with API key (primary auth method)
   */
  buildHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
    
    // Add API key as header if configured
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    return headers;
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.buildHeaders(options.headers),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.isOnline = true;
      this.lastError = null;
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      this.isOnline = false;
      this.lastError = error.name === 'AbortError' ? 'Request timeout' : error.message;
      throw error;
    }
  }

  async retryFetch(url, options = {}, retries = config.retry?.maxAttempts || 3) {
    let lastError;
    let delay = config.retry?.baseDelay || 1000;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await this.fetchWithTimeout(url, options);
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * (config.retry?.backoffFactor || 2), config.retry?.maxDelay || 10000);
        }
      }
    }
    throw lastError;
  }

  shouldUseMock() {
    return config.features.enableMockData || !this.isOnline;
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastError: this.lastError,
      lastUpdated: this.cache.nodesTimestamp,
      queuedMessages: this.messageQueue.length,
    };
  }

  // ============= NODE DISCOVERY =============

  async getNodes() {
    // Try live backend first if mock mode is disabled
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl('/api/ally/nodes');
        const response = await this.retryFetch(url);
        const data = await response.json();
        
        // Cache the result
        this.cache.nodes = data.nodes || data;
        this.cache.nodesTimestamp = new Date();
        
        return this.cache.nodes;
      } catch (error) {
        console.warn('Failed to fetch nodes from backend, using cache/mock:', error.message);
        // Fall through to cached/mock data
      }
    }
    
    // Return cached data if available
    if (this.cache.nodes) {
      return this.cache.nodes;
    }
    
    // Fall back to mock data
    return this.getMockNodes();
  }

  async getNodeStatus(nodeId) {
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl(`/api/ally/node/${nodeId}/status`);
        const response = await this.retryFetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Failed to fetch node status, using mock:', error.message);
      }
    }
    return this.getMockNodeStatus(nodeId);
  }

  // ============= GLOBAL CHAT =============

  async getGlobalChat() {
    if (!config.features.enableMockData) {
      try {
        const params = this.cache.globalChatTimestamp 
          ? { since: this.cache.globalChatTimestamp.toISOString() }
          : {};
        const url = this.buildUrl('/api/ally/chat/global', params);
        const response = await this.retryFetch(url);
        const data = await response.json();
        
        // Merge new messages with cache
        const newMessages = data.messages || data;
        if (newMessages.length > 0) {
          const existingIds = new Set(this.cache.globalChat.map(m => m.id));
          const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
          this.cache.globalChat = [...this.cache.globalChat, ...uniqueNew];
        }
        this.cache.globalChatTimestamp = new Date();
        
        return this.cache.globalChat;
      } catch (error) {
        console.warn('Failed to fetch global chat, using cache/mock:', error.message);
      }
    }
    
    if (this.cache.globalChat.length > 0) {
      return this.cache.globalChat;
    }
    
    return this.getMockGlobalChat();
  }

  async sendGlobalMessage(text, priority = 'normal') {
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'me',
      sender_name: 'This Device',
      text,
      timestamp: new Date().toISOString(),
      priority,
      status: 'sending',
    };
    
    // Add to local cache immediately (optimistic update)
    this.cache.globalChat.push(tempMessage);
    
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl('/api/ally/chat/global');
        const response = await this.fetchWithTimeout(url, {
          method: 'POST',
          body: JSON.stringify({ text, priority }),
        });
        const result = await response.json();
        
        // Update temp message with server response
        const idx = this.cache.globalChat.findIndex(m => m.id === tempMessage.id);
        if (idx !== -1) {
          this.cache.globalChat[idx] = {
            ...tempMessage,
            id: result.id || tempMessage.id,
            status: result.status || 'sent',
          };
        }
        
        return { queued: result.status === 'queued', id: result.id };
      } catch (error) {
        console.warn('Failed to send global message, queuing:', error.message);
        // Mark as queued and add to retry queue
        const idx = this.cache.globalChat.findIndex(m => m.id === tempMessage.id);
        if (idx !== -1) {
          this.cache.globalChat[idx].status = 'queued';
        }
        this.messageQueue.push({ type: 'global', text, priority, tempId: tempMessage.id });
        return { queued: true };
      }
    }
    
    // Mock mode
    setTimeout(() => {
      const idx = this.cache.globalChat.findIndex(m => m.id === tempMessage.id);
      if (idx !== -1) {
        this.cache.globalChat[idx].status = 'sent';
      }
    }, 500);
    
    return { queued: false };
  }

  // ============= DIRECT MESSAGES =============

  async getDM(nodeId) {
    if (!config.features.enableMockData) {
      try {
        const params = this.cache.dmChats[nodeId]?.timestamp
          ? { since: this.cache.dmChats[nodeId].timestamp.toISOString() }
          : {};
        const url = this.buildUrl(`/api/ally/chat/dm/${nodeId}`, params);
        const response = await this.retryFetch(url);
        const data = await response.json();
        
        // Initialize cache for this node if needed
        if (!this.cache.dmChats[nodeId]) {
          this.cache.dmChats[nodeId] = { messages: [], timestamp: null };
        }
        
        // Merge new messages
        const newMessages = data.messages || data;
        if (newMessages.length > 0) {
          const existingIds = new Set(this.cache.dmChats[nodeId].messages.map(m => m.id));
          const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
          this.cache.dmChats[nodeId].messages = [...this.cache.dmChats[nodeId].messages, ...uniqueNew];
        }
        this.cache.dmChats[nodeId].timestamp = new Date();
        
        return this.cache.dmChats[nodeId].messages;
      } catch (error) {
        console.warn('Failed to fetch DMs, using cache/mock:', error.message);
      }
    }
    
    if (this.cache.dmChats[nodeId]?.messages.length > 0) {
      return this.cache.dmChats[nodeId].messages;
    }
    
    return this.getMockDM(nodeId);
  }

  async sendDM(nodeId, text, urgent = false) {
    const priority = urgent ? 'urgent' : 'normal';
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'me',
      text,
      timestamp: new Date().toISOString(),
      status: 'sending',
      priority,
    };
    
    // Initialize cache for this node if needed
    if (!this.cache.dmChats[nodeId]) {
      this.cache.dmChats[nodeId] = { messages: [], timestamp: null };
    }
    
    // Add to local cache immediately
    this.cache.dmChats[nodeId].messages.push(tempMessage);
    
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl(`/api/ally/chat/dm/${nodeId}`);
        const response = await this.fetchWithTimeout(url, {
          method: 'POST',
          body: JSON.stringify({ text, priority }),
        });
        const result = await response.json();
        
        // Update temp message
        const idx = this.cache.dmChats[nodeId].messages.findIndex(m => m.id === tempMessage.id);
        if (idx !== -1) {
          this.cache.dmChats[nodeId].messages[idx] = {
            ...tempMessage,
            id: result.id || tempMessage.id,
            status: result.status || 'sent',
          };
        }
        
        return { queued: result.status === 'queued', id: result.id };
      } catch (error) {
        console.warn('Failed to send DM, queuing:', error.message);
        const idx = this.cache.dmChats[nodeId].messages.findIndex(m => m.id === tempMessage.id);
        if (idx !== -1) {
          this.cache.dmChats[nodeId].messages[idx].status = 'queued';
        }
        this.messageQueue.push({ type: 'dm', nodeId, text, priority, tempId: tempMessage.id });
        return { queued: true };
      }
    }
    
    // Mock mode
    setTimeout(() => {
      const idx = this.cache.dmChats[nodeId]?.messages.findIndex(m => m.id === tempMessage.id);
      if (idx !== -1) {
        this.cache.dmChats[nodeId].messages[idx].status = 'sent';
      }
    }, 500);
    
    return { queued: false };
  }

  // ============= BROADCAST =============

  async broadcastAlert(title, message, severity = 'warning') {
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl('/api/ally/broadcast');
        const response = await this.fetchWithTimeout(url, {
          method: 'POST',
          body: JSON.stringify({ title, message, severity }),
        });
        const result = await response.json();
        return { queued: result.status === 'queued', id: result.id };
      } catch (error) {
        console.warn('Failed to send broadcast, queuing:', error.message);
        this.messageQueue.push({ type: 'broadcast', title, message, severity });
        return { queued: true };
      }
    }
    
    // Mock mode - simulate sending
    return { queued: false, id: `broadcast-${Date.now()}` };
  }

  // ============= USER STATUS =============

  async getCurrentUserStatus() {
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl('/api/ally/status/me');
        const response = await this.retryFetch(url);
        const data = await response.json();
        this.cache.userStatus = data;
        // Also save to localStorage for offline access
        localStorage.setItem('omega_user_status', JSON.stringify(data));
        return data;
      } catch (error) {
        console.warn('Failed to fetch user status, using cache:', error.message);
      }
    }
    
    // Return cached or localStorage status
    if (this.cache.userStatus) {
      return this.cache.userStatus;
    }
    
    const stored = localStorage.getItem('omega_user_status');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    return { status: 'good', note: null, set_at: null };
  }

  async setCurrentUserStatus(status, note = null) {
    const statusData = {
      status,
      note: status === 'need_help' ? note : null,
      set_at: new Date().toISOString(),
    };
    
    // Update local cache and localStorage immediately
    this.cache.userStatus = statusData;
    localStorage.setItem('omega_user_status', JSON.stringify(statusData));
    
    if (!config.features.enableMockData) {
      try {
        const url = this.buildUrl('/api/ally/status/me');
        const response = await this.fetchWithTimeout(url, {
          method: 'PUT',
          body: JSON.stringify({ status, note: statusData.note }),
        });
        const result = await response.json();
        return result;
      } catch (error) {
        console.warn('Failed to update user status on server:', error.message);
        // Status is already saved locally, will sync later
      }
    }
    
    return statusData;
  }

  // ============= PING/REFRESH =============

  async pingNode(nodeId) {
    if (!config.features.enableMockData) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/ally/node/${nodeId}/ping`,
          { method: 'POST' }
        );
        const result = await response.json();
        return result;
      } catch (error) {
        console.warn('Ping failed:', error.message);
        throw error;
      }
    }
    
    // Mock ping response
    const mockRtt = Math.floor(Math.random() * 50) + 10;
    return { rtt_ms: mockRtt, status: 'success' };
  }

  async refreshNode(nodeId) {
    if (!config.features.enableMockData) {
      try {
        const response = await this.fetchWithTimeout(
          `${this.baseUrl}/api/ally/node/${nodeId}/refresh`,
          { method: 'POST' }
        );
        const result = await response.json();
        return result;
      } catch (error) {
        console.warn('Refresh failed:', error.message);
        throw error;
      }
    }
    
    return { status: 'requested', timestamp: new Date().toISOString() };
  }

  // ============= MESSAGE QUEUE RETRY =============

  async retryQueuedMessages() {
    if (this.messageQueue.length === 0 || config.features.enableMockData) return;
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    for (const msg of queue) {
      try {
        if (msg.type === 'global') {
          await this.sendGlobalMessage(msg.text, msg.priority);
        } else if (msg.type === 'dm') {
          await this.sendDM(msg.nodeId, msg.text, msg.priority === 'urgent');
        } else if (msg.type === 'broadcast') {
          await this.broadcastAlert(msg.title, msg.message, msg.severity);
        }
      } catch (error) {
        // Re-queue failed messages
        this.messageQueue.push(msg);
      }
    }
  }

  // ============= QUICK TEMPLATES =============

  getMessageTemplates() {
    return [
      { id: 'omw', text: "On my way!", icon: '🚶' },
      { id: 'ok', text: "All good here", icon: '✓' },
      { id: 'help', text: "Need assistance", icon: '🆘' },
      { id: 'wait', text: "Wait for me", icon: '⏳' },
      { id: 'loc', text: "Share your location", icon: '📍' },
      { id: 'call', text: "Call when you can", icon: '📞' },
    ];
  }

  // ============= MOCK DATA =============

  getMockNodes() {
    return [
      {
        node_id: 'omega-01',
        name: "Dad's OMEGA",
        role: 'Primary',
        ip: '192.168.4.2',
        url: 'http://192.168.4.2:3000',
        status: 'online',
        user_status: 'good',
        user_status_note: null,
        user_status_set_at: null,
        last_seen: new Date().toISOString(),
        link_type: 'Hotspot',
        rssi: -45,
        alerts_count: 0,
      },
      {
        node_id: 'omega-02',
        name: "Mom's OMEGA",
        role: 'Secondary',
        ip: '192.168.4.3',
        url: 'http://192.168.4.3:3000',
        status: 'online',
        user_status: 'okay',
        user_status_note: null,
        user_status_set_at: new Date(Date.now() - 600000).toISOString(),
        last_seen: new Date(Date.now() - 30000).toISOString(),
        link_type: 'LAN',
        rssi: -52,
        alerts_count: 1,
      },
      {
        node_id: 'omega-03',
        name: "Kids' OMEGA",
        role: 'Mobile',
        ip: '192.168.4.4',
        url: 'http://192.168.4.4:3000',
        status: 'degraded',
        user_status: 'need_help',
        user_status_note: 'Device running hot',
        user_status_set_at: new Date(Date.now() - 300000).toISOString(),
        last_seen: new Date(Date.now() - 120000).toISOString(),
        link_type: 'Mesh',
        rssi: -68,
        alerts_count: 2,
      },
      {
        node_id: 'omega-04',
        name: "Backup Unit",
        role: 'Backup',
        ip: null,
        url: null,
        status: 'offline',
        user_status: null,
        user_status_note: null,
        user_status_set_at: null,
        last_seen: new Date(Date.now() - 3600000).toISOString(),
        link_type: null,
        rssi: null,
        alerts_count: 0,
      },
    ];
  }

  getMockNodeStatus(nodeId) {
    return {
      node_id: nodeId,
      identity: {
        hostname: 'omega-primary',
        version: '1.0.0',
        uptime: 86400,
        last_reboot: new Date(Date.now() - 86400000).toISOString(),
      },
      system: {
        cpu: Math.floor(Math.random() * 40) + 20,
        ram: Math.floor(Math.random() * 30) + 40,
        disk: Math.floor(Math.random() * 20) + 50,
        temp: Math.floor(Math.random() * 15) + 45,
        services: {
          backend: 'up',
          kiwix: 'up',
          jellyfin: 'up',
          gps: 'up',
          sensors: 'up',
        },
      },
      power: {
        battery_pct: Math.floor(Math.random() * 30) + 70,
        volts: 12.4,
        amps: 0.8,
        watts: 9.9,
        charge_state: 'discharging',
        runtime_s: 7200,
      },
      gps: {
        fix: '3D',
        sats: 12,
        lat: 37.7749,
        lon: -122.4194,
        acc: 3.2,
        speed: 0,
      },
      sensors: {
        temp: 22.5,
        hum: 45.2,
        pressure: 1013.2,
        iaq: 95,
      },
      alerts: [
        {
          message: 'Low battery warning',
          severity: 'warning',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }

  getMockGlobalChat() {
    return [
      {
        id: '1',
        sender: 'omega-01',
        sender_name: "Dad's OMEGA",
        sender_status: 'good',
        text: 'Everyone check in - heading to the north ridge',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        priority: 'normal',
        status: 'delivered',
      },
      {
        id: '2',
        sender: 'omega-02',
        sender_name: "Mom's OMEGA",
        sender_status: 'okay',
        text: "Copy that, we're at base camp",
        timestamp: new Date(Date.now() - 240000).toISOString(),
        priority: 'normal',
        status: 'delivered',
      },
      {
        id: '3',
        sender: 'broadcast',
        sender_name: 'SYSTEM',
        text: 'Weather alert: Storm approaching from west',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        priority: 'emergency',
        status: 'delivered',
        broadcast_title: 'EMERGENCY WEATHER ALERT',
        broadcast_severity: 'emergency',
      },
      {
        id: '4',
        sender: 'omega-03',
        sender_name: "Kids' OMEGA",
        sender_status: 'need_help',
        text: 'Need assistance - device overheating',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        priority: 'urgent',
        status: 'delivered',
      },
    ];
  }

  getMockDM(nodeId) {
    return [
      {
        id: '1',
        sender: nodeId,
        text: 'Hey, can you send me those coordinates?',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'delivered',
      },
      {
        id: '2',
        sender: 'me',
        text: 'Sure thing, sending now',
        timestamp: new Date(Date.now() - 540000).toISOString(),
        status: 'delivered',
      },
      {
        id: '3',
        sender: 'me',
        text: 'GPS coordinates shared',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        status: 'sent',
      },
      {
        id: '4',
        sender: 'me',
        text: 'Let me know when you receive them',
        timestamp: new Date(Date.now() - 420000).toISOString(),
        status: 'queued',
      },
    ];
  }
}

// Export singleton instance
const allyApi = new AllyApiService();
export default allyApi;
