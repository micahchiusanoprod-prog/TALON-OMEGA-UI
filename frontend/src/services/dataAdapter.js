/**
 * Data Adapter Layer
 * Normalizes raw backend JSON into stable UI fields
 * Prevents UI breakage if backend field names evolve
 */

/**
 * Normalize Health Status
 * Derives: Up / Degraded / Down (green/yellow/red)
 */
export function normalizeHealth(rawHealth) {
  if (!rawHealth) {
    return {
      status: 'down',
      statusColor: 'destructive',
      services: {},
      lastCheck: null,
    };
  }

  // Derive overall status from services
  const services = rawHealth.services || {};
  const serviceStatuses = Object.values(services);
  
  let overallStatus = 'up';
  if (serviceStatuses.some(s => s === 'down' || s === 'failed')) {
    overallStatus = 'down';
  } else if (serviceStatuses.some(s => s === 'degraded' || s === 'warning')) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    statusColor: overallStatus === 'up' ? 'success' : overallStatus === 'degraded' ? 'warning' : 'destructive',
    services: services,
    timers: rawHealth.timers || {},
    lastCheck: rawHealth.timestamp || new Date().toISOString(),
  };
}

/**
 * Normalize System Metrics
 * For header pills: CPU, RAM, Disk, CPU Temp
 */
export function normalizeMetrics(rawMetrics) {
  if (!rawMetrics) {
    return {
      cpu: null,
      ram: null,
      disk: null,
      temp: null,
      uptime: null,
      available: false,
    };
  }

  return {
    cpu: extractNumeric(rawMetrics.cpu || rawMetrics.cpu_percent),
    ram: extractNumeric(rawMetrics.ram || rawMetrics.memory_percent || rawMetrics.mem),
    disk: extractNumeric(rawMetrics.disk || rawMetrics.disk_percent || rawMetrics.disk_usage),
    diskFree: rawMetrics.disk_free || rawMetrics.disk_free_gb,
    temp: extractNumeric(rawMetrics.cpu_temp || rawMetrics.temp || rawMetrics.temperature),
    uptime: rawMetrics.uptime,
    available: true,
  };
}

/**
 * Normalize Sensor Data (BME680)
 * For Environment tile
 */
export function normalizeSensors(rawSensors) {
  if (!rawSensors || rawSensors.error) {
    return {
      temperature: null,
      humidity: null,
      pressure: null,
      gas: null,
      iaq: null,
      available: false,
      offline: true,
    };
  }

  return {
    temperature: extractNumeric(rawSensors.temperature || rawSensors.temp),
    humidity: extractNumeric(rawSensors.humidity),
    pressure: extractNumeric(rawSensors.pressure),
    gas: extractNumeric(rawSensors.gas || rawSensors.gas_resistance),
    iaq: extractNumeric(rawSensors.iaq || rawSensors.air_quality),
    available: true,
    offline: false,
  };
}

/**
 * Normalize Backup Data
 */
export function normalizeBackups(rawBackups) {
  if (!rawBackups || !rawBackups.backups) {
    return {
      backups: [],
      lastBackup: null,
      available: false,
    };
  }

  return {
    backups: rawBackups.backups.map(b => ({
      id: b.id || b.name,
      name: b.name,
      date: b.date || b.timestamp,
      size: b.size,
      verified: b.verified || false,
      path: b.path,
    })),
    lastBackup: rawBackups.last_backup || rawBackups.lastBackup,
    available: true,
  };
}

/**
 * Normalize Keys Status
 */
export function normalizeKeys(rawKeys) {
  if (!rawKeys) {
    return {
      keys: [],
      syncStatus: 'unknown',
      available: false,
    };
  }

  return {
    keys: rawKeys.keys || [],
    syncStatus: rawKeys.sync_status || rawKeys.status,
    lastRotation: rawKeys.last_rotation || rawKeys.lastRotation,
    available: true,
  };
}

/**
 * Normalize Direct Messages
 */
export function normalizeDMs(rawDMs) {
  if (!rawDMs || !rawDMs.messages) {
    return {
      messages: [],
      unread: 0,
      available: false,
    };
  }

  return {
    messages: rawDMs.messages.map(m => ({
      id: m.id,
      from: m.from || m.sender,
      to: m.to || m.recipient,
      content: m.content || m.message,
      timestamp: m.timestamp || m.date,
      read: m.read || false,
      encrypted: m.encrypted !== false,
    })),
    unread: rawDMs.unread_count || rawDMs.unread || 0,
    available: true,
  };
}

/**
 * Helper: Extract numeric value from various formats
 */
function extractNumeric(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Math.round(value * 10) / 10;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : Math.round(num * 10) / 10;
  }
  return null;
}
