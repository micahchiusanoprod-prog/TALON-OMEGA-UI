import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ============================================================
// TRANSLATIONS - Centralized dictionary for i18n
// ============================================================

const translations = {
  en: {
    // Navigation & Header
    'nav.logs': 'LOGS',
    'nav.community': 'Community',
    'nav.helpCenter': 'Help Center',
    'nav.help': 'Help',
    'nav.adminConsole': 'Admin Console',
    'nav.settings': 'Settings',
    'nav.language': 'Language',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.switchToLight': 'Switch to Light Mode',
    'theme.switchToDark': 'Switch to Dark Mode',
    
    // Header Subtitle
    'header.subtitle': 'Offline Modular Emergency Guidance Archive',
    
    // Connection Status
    'connection.connected': 'Connected',
    'connection.degraded': 'Degraded',
    'connection.notConnected': 'Not Connected',
    'connection.tooltipConnected': 'Live data from OMEGA backend.',
    'connection.tooltipNotConnected': 'Using mock data. Backend not connected yet.',
    'connection.tooltipDegraded': 'Backend reachable but some endpoints failing.',
    'connection.lastPing': 'Last ping',
    
    // Data Source Badges
    'dataSource.mock': 'MOCK DATA',
    'dataSource.live': 'LIVE',
    'dataSource.loading': 'Loading...',
    'dataSource.error': 'Error loading data',
    'dataSource.empty': 'No data available',
    'dataSource.retry': 'Retry',
    
    // Community Hub
    'community.title': 'Community Hub',
    'community.overview': 'Overview',
    'community.directory': 'Directory',
    'community.analytics': 'Analytics',
    'community.comms': 'Comms',
    'community.incidents': 'Incidents',
    'community.members': 'members',
    'community.online': 'online',
    'community.offline': 'offline',
    'community.searchPlaceholder': 'Search members by name, skills, or languages...',
    
    // Official Teams & Bulletins
    'teams.title': 'Official Teams & Updates',
    'teams.subtitle': 'Critical updates from official community teams',
    'teams.latestUpdates': 'Latest Updates',
    'teams.teams': 'Teams',
    'teams.allBulletins': 'All Bulletins',
    'teams.searchBulletins': 'Search bulletins...',
    'teams.post': 'Post',
    'teams.new': 'NEW',
    'teams.lead': 'Lead',
    'teams.viewAll': 'View all bulletins',
    'teams.noBulletins': 'No bulletins from this team yet.',
    'teams.noUpdates': 'No new updates. Check back later!',
    'teams.noMatch': 'No bulletins match your filters.',
    'teams.readBy': 'Read by',
    'teams.acknowledge': 'Acknowledge',
    'teams.close': 'Close',
    'teams.postNewBulletin': 'Post New Bulletin',
    'teams.teamMembers': 'Team Members',
    'teams.recentBulletins': 'Recent Bulletins',
    'teams.teamLead': 'Team Lead',
    'teams.attachments': 'Attachments',
    
    // Severity Labels
    'severity.critical': 'CRITICAL',
    'severity.warning': 'WARNING',
    'severity.info': 'INFO',
    'severity.resolved': 'RESOLVED',
    'severity.all': 'All',
    
    // Status Labels
    'status.ok': 'OK',
    'status.warn': 'WARN',
    'status.p0': 'P0',
    'status.good': 'GOOD',
    'status.needHelp': 'NEED HELP',
    'status.up': 'Up',
    'status.down': 'Down',
    'status.unknown': 'Unknown',
    
    // Common Actions
    'action.view': 'View',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.copy': 'Copy',
    'action.copied': 'Copied!',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.clear': 'Clear',
    'action.clearFilters': 'Clear Filters',
    'action.showAll': 'Show All',
    'action.showLess': 'Show Less',
    'action.viewAll': 'View All',
    'action.previous': 'Previous',
    'action.next': 'Next',
    
    // Empty States
    'empty.noResults': 'No results found',
    'empty.noData': 'No data available',
    'empty.noMembers': 'No members match your filters',
    'empty.tryAgain': 'Try adjusting your filters',
    
    // Help Guide
    'help.quickHelp': 'Quick Help',
    'help.legend': 'Legend',
    'help.troubleshooting': 'Troubleshooting',
    'help.whatThisPageDoes': 'What this page does',
    'help.needMoreHelp': 'Need more help?',
    'help.visitHelpCenter': 'Visit Help Center',
    
    // Time
    'time.ago': 'ago',
    'time.justNow': 'Just now',
    'time.minutes': 'minutes',
    'time.hours': 'hours',
    'time.days': 'days',
    
    // Metrics
    'metrics.cpu': 'CPU',
    'metrics.ram': 'RAM',
    'metrics.disk': 'Disk',
    'metrics.temp': 'Temp',
    'metrics.battery': 'Battery',
    
    // Skill Domains
    'domain.medical': 'Medical',
    'domain.comms': 'Comms',
    'domain.security': 'Security',
    'domain.foodWater': 'Food & Water',
    'domain.engineering': 'Engineering',
    'domain.logistics': 'Logistics',
  },
  
  es: {
    // Navigation & Header
    'nav.logs': 'REGISTROS',
    'nav.community': 'Comunidad',
    'nav.helpCenter': 'Centro de Ayuda',
    'nav.help': 'Ayuda',
    'nav.adminConsole': 'Consola Admin',
    'nav.settings': 'Configuración',
    'nav.language': 'Idioma',
    
    // Theme
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.switchToLight': 'Cambiar a modo claro',
    'theme.switchToDark': 'Cambiar a modo oscuro',
    
    // Header Subtitle
    'header.subtitle': 'Archivo de Guía de Emergencia Modular Sin Conexión',
    
    // Connection Status
    'connection.connected': 'Conectado',
    'connection.degraded': 'Degradado',
    'connection.notConnected': 'No Conectado',
    'connection.tooltipConnected': 'Datos en vivo del backend OMEGA.',
    'connection.tooltipNotConnected': 'Usando datos simulados. Backend no conectado.',
    'connection.tooltipDegraded': 'Backend accesible pero algunos endpoints fallando.',
    'connection.lastPing': 'Último ping',
    
    // Data Source Badges
    'dataSource.mock': 'DATOS SIMULADOS',
    'dataSource.live': 'EN VIVO',
    'dataSource.loading': 'Cargando...',
    'dataSource.error': 'Error al cargar datos',
    'dataSource.empty': 'Sin datos disponibles',
    'dataSource.retry': 'Reintentar',
    
    // Community Hub
    'community.title': 'Centro Comunitario',
    'community.overview': 'Resumen',
    'community.directory': 'Directorio',
    'community.analytics': 'Análisis',
    'community.comms': 'Comunicaciones',
    'community.incidents': 'Incidentes',
    'community.members': 'miembros',
    'community.online': 'en línea',
    'community.offline': 'desconectado',
    'community.searchPlaceholder': 'Buscar miembros por nombre, habilidades o idiomas...',
    
    // Official Teams & Bulletins
    'teams.title': 'Equipos Oficiales y Actualizaciones',
    'teams.subtitle': 'Actualizaciones críticas de los equipos oficiales',
    'teams.latestUpdates': 'Últimas Actualizaciones',
    'teams.teams': 'Equipos',
    'teams.allBulletins': 'Todos los Boletines',
    'teams.searchBulletins': 'Buscar boletines...',
    'teams.post': 'Publicar',
    'teams.new': 'NUEVO',
    'teams.lead': 'Líder',
    'teams.viewAll': 'Ver todos los boletines',
    'teams.noBulletins': 'No hay boletines de este equipo todavía.',
    'teams.noUpdates': '¡No hay nuevas actualizaciones. Vuelve más tarde!',
    'teams.noMatch': 'Ningún boletín coincide con tus filtros.',
    'teams.readBy': 'Leído por',
    'teams.acknowledge': 'Confirmar',
    'teams.close': 'Cerrar',
    'teams.postNewBulletin': 'Publicar Nuevo Boletín',
    'teams.teamMembers': 'Miembros del Equipo',
    'teams.recentBulletins': 'Boletines Recientes',
    'teams.teamLead': 'Líder del Equipo',
    'teams.attachments': 'Archivos Adjuntos',
    
    // Severity Labels
    'severity.critical': 'CRÍTICO',
    'severity.warning': 'ADVERTENCIA',
    'severity.info': 'INFO',
    'severity.resolved': 'RESUELTO',
    'severity.all': 'Todos',
    
    // Status Labels
    'status.ok': 'OK',
    'status.warn': 'ALERTA',
    'status.p0': 'P0',
    'status.good': 'BIEN',
    'status.needHelp': 'NECESITA AYUDA',
    'status.up': 'Activo',
    'status.down': 'Caído',
    'status.unknown': 'Desconocido',
    
    // Common Actions
    'action.view': 'Ver',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'action.confirm': 'Confirmar',
    'action.copy': 'Copiar',
    'action.copied': '¡Copiado!',
    'action.search': 'Buscar',
    'action.filter': 'Filtrar',
    'action.clear': 'Limpiar',
    'action.clearFilters': 'Limpiar Filtros',
    'action.showAll': 'Mostrar Todo',
    'action.showLess': 'Mostrar Menos',
    'action.viewAll': 'Ver Todo',
    'action.previous': 'Anterior',
    'action.next': 'Siguiente',
    
    // Empty States
    'empty.noResults': 'Sin resultados',
    'empty.noData': 'Sin datos disponibles',
    'empty.noMembers': 'Ningún miembro coincide con tus filtros',
    'empty.tryAgain': 'Intenta ajustar tus filtros',
    
    // Help Guide
    'help.quickHelp': 'Ayuda Rápida',
    'help.legend': 'Leyenda',
    'help.troubleshooting': 'Solución de Problemas',
    'help.whatThisPageDoes': 'Qué hace esta página',
    'help.needMoreHelp': '¿Necesitas más ayuda?',
    'help.visitHelpCenter': 'Visitar Centro de Ayuda',
    
    // Time
    'time.ago': 'hace',
    'time.justNow': 'Ahora mismo',
    'time.minutes': 'minutos',
    'time.hours': 'horas',
    'time.days': 'días',
    
    // Metrics
    'metrics.cpu': 'CPU',
    'metrics.ram': 'RAM',
    'metrics.disk': 'Disco',
    'metrics.temp': 'Temp',
    'metrics.battery': 'Batería',
    
    // Skill Domains
    'domain.medical': 'Médico',
    'domain.comms': 'Comunicaciones',
    'domain.security': 'Seguridad',
    'domain.foodWater': 'Comida y Agua',
    'domain.engineering': 'Ingeniería',
    'domain.logistics': 'Logística',
  },
};

// Available languages
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  // { code: 'more', label: 'More soon...', flag: '🌐', disabled: true },
];

// ============================================================
// LANGUAGE CONTEXT
// ============================================================

const LanguageContext = createContext();

const STORAGE_KEY = 'omega-language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    // Load from localStorage or default to 'en'
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    }
    return 'en';
  });

  // Persist language changes to localStorage
  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  // Translation function
  const t = useCallback((key, fallback) => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || translations.en[key] || fallback || key;
  }, [language]);

  // Get all translations for current language (useful for debugging)
  const getAllTranslations = useCallback(() => {
    return translations[language] || translations.en;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    getAllTranslations,
    availableLanguages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Simple t() function for use outside of React components
// Note: This won't react to language changes, use useLanguage() in components
export function getTranslation(key, lang = 'en') {
  const langTranslations = translations[lang] || translations.en;
  return langTranslations[key] || translations.en[key] || key;
}

export default LanguageContext;
