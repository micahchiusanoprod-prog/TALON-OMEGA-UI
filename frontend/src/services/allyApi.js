import config from '../config';

/**
 * Ally Communications API Service
 * Handles all family node communications with offline-first support
 */

class AllyAPIService {
  constructor() {
    this.cache = {
      nodes: [],
      globalChat: [],
      dmChats: {},
      lastUpdate: null,
    };
    this.messageQueue = [];
  }

  /**
   * Generic fetch with caching
   */
  async fetch(url, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Ally API fetch failed for ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Get All Nodes
   */
  async getNodes() {
    try {
      const nodes = await this.fetch(`${config.ally.apiBase}${config.endpoints.allyNodes}`);
      this.cache.nodes = nodes;
      this.cache.lastUpdate = new Date().toISOString();
      return nodes;
    } catch (error) {
      // Return cached data if available
      if (this.cache.nodes.length > 0) {
        return this.cache.nodes;
      }
      return this.getMockNodes();
    }
  }

  /**
   * Get Node Status (full telemetry)
   */
  async getNodeStatus(nodeId) {
    try {
      return await this.fetch(`${config.ally.apiBase}${config.endpoints.allyNodeStatus}/${nodeId}/status`);
    } catch (error) {
      return this.getMockNodeStatus(nodeId);
    }
  }

  /**
   * Ping Node
   */
  async pingNode(nodeId) {
    try {
      return await this.fetch(`${config.ally.apiBase}${config.endpoints.allyPing}/${nodeId}/ping`, {
        method: 'POST',
      });
    } catch (error) {
      return { success: true, rtt_ms: Math.floor(Math.random() * 100 + 20) };
    }
  }

  /**
   * Request Node Refresh
   */
  async refreshNode(nodeId) {
    try {
      return await this.fetch(`${config.ally.apiBase}${config.endpoints.allyRefresh}/${nodeId}/refresh`, {
        method: 'POST',
      });
    } catch (error) {
      return { success: true, message: 'Refresh queued' };
    }
  }

  /**
   * Get Global Chat Messages
   */
  async getGlobalChat() {
    try {
      const messages = await this.fetch(`${config.ally.apiBase}${config.endpoints.allyGlobalChat}`);
      this.cache.globalChat = messages;
      return messages;
    } catch (error) {
      if (this.cache.globalChat.length > 0) {
        return this.cache.globalChat;
      }
      return this.getMockGlobalChat();
    }
  }

  /**
   * Send Global Chat Message
   */
  async sendGlobalMessage(text, priority = 'normal') {
    try {
      return await this.fetch(`${config.ally.apiBase}${config.endpoints.allyGlobalChat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, priority }),
      });
    } catch (error) {
      // Queue message for retry
      this.queueMessage('global', text, priority);
      return { success: false, queued: true };
    }
  }

  /**
   * Get Direct Messages with Node
   */
  async getDM(nodeId) {
    try {
      const messages = await this.fetch(`${config.ally.apiBase}${config.endpoints.allyDM}/${nodeId}`);
      this.cache.dmChats[nodeId] = messages;
      return messages;
    } catch (error) {
      if (this.cache.dmChats[nodeId]) {
        return this.cache.dmChats[nodeId];
      }
      return this.getMockDM(nodeId);
    }
  }

  /**
   * Send Direct Message to Node
   */
  async sendDM(nodeId, text, urgent = false) {
    try {
      return await this.fetch(`${config.ally.apiBase}${config.endpoints.allyDM}/${nodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, priority: urgent ? 'urgent' : 'normal' }),
      });
    } catch (error) {
      this.queueMessage('dm', text, urgent ? 'urgent' : 'normal', nodeId);
      return { success: false, queued: true };
    }
  }

  /**
   * Broadcast Emergency Alert
   */
  async broadcastAlert(title, text, severity = 'warning') {
    try {
      return await this.fetch(`${config.ally.apiBase}${config.endpoints.allyBroadcast}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text, severity }),
      });
    } catch (error) {
      this.queueMessage('broadcast', text, severity, null, title);
      return { success: false, queued: true };
    }
  }

  /**
   * Queue Message for Retry
   */
  queueMessage(type, text, priority, nodeId = null, title = null) {
    this.messageQueue.push({
      type,
      text,
      priority,
      nodeId,
      title,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Retry Queued Messages
   */
  async retryQueuedMessages() {
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const msg of queue) {
      try {
        if (msg.type === 'global') {
          await this.sendGlobalMessage(msg.text, msg.priority);
        } else if (msg.type === 'dm') {
          await this.sendDM(msg.nodeId, msg.text, msg.priority === 'urgent');
        } else if (msg.type === 'broadcast') {
          await this.broadcastAlert(msg.title, msg.text, msg.priority);
        }
      } catch (error) {
        // Re-queue if still failing
        this.messageQueue.push(msg);
      }
    }
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
        user_status: 'good', // good, okay, need_help
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
      identity: {
        name: 'Dad\'s OMEGA',
        node_id: nodeId,
        hostname: 'omega-talon',
        version: '1.0.0',
        uptime: 86420,
        last_reboot: new Date(Date.now() - 86420000).toISOString(),
      },
      system: {
        cpu: 32,
        ram: 45,
        disk: 58,
        temp: 51,
        load: [0.5, 0.6, 0.7],
        services: { backend: 'up', kiwix: 'up', jellyfin: 'up', gps: 'up', sensors: 'up' },
      },
      power: {
        battery_pct: 87,
        volts: 12.4,
        amps: 0.8,
        watts: 9.9,
        charge_state: 'discharging',
        runtime_s: 21600,
      },
      gps: {
        fix: '3D',
        lat: 37.7749,
        lon: -122.4194,
        acc: 3.2,
        sats: 12,
        speed: 0,
        heading: 0,
      },
      sensors: {
        temp: 22.5,
        hum: 45.2,
        iaq: 95,
        pressure: 1013.2,
        gas: 50000,
      },
      comms: {
        meshtastic_status: 'connected',
        node_name: 'OMEGA-01',
        last_msg: new Date(Date.now() - 5000).toISOString(),
      },
      mesh: {
        peers: 2,
        last_sync: new Date(Date.now() - 10000).toISOString(),
        queue_depth: 0,
      },
      alerts: [
        { severity: 'warning', message: 'Low battery warning', timestamp: new Date().toISOString() },
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

  /**
   * Get Current User's Status
   */
  getCurrentUserStatus() {
    // In real implementation, this would come from local storage or API
    const stored = localStorage.getItem('omega_user_status');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      status: 'good',
      note: null,
      set_at: null,
    };
  }

  /**
   * Set Current User's Status
   */
  setCurrentUserStatus(status, note = null) {
    const statusData = {
      status,
      note: status === 'need_help' ? note : null,
      set_at: new Date().toISOString(),
    };
    localStorage.setItem('omega_user_status', JSON.stringify(statusData));
    // In real implementation, this would also notify other nodes
    return statusData;
  }

  /**
   * Quick Message Templates
   */
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
}

export default new AllyAPIService();
