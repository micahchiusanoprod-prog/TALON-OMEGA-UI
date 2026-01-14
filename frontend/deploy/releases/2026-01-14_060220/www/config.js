// OMEGA Dashboard Runtime Configuration
// Edit this file to configure the dashboard for your Pi

window.OMEGA_CONFIG = {
  // Pi backend CGI base URL
  API_BASE: 'http://127.0.0.1:8093',
  
  // Kiwix offline wiki server URL
  KIWIX_BASE: 'http://127.0.0.1:8090',
  
  // Set to false to enable live backend connections
  // Set to true to use mock/demo data
  USE_MOCK_DATA: false,
};
