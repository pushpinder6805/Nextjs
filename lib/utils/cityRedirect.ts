// Utility for IP-based city detection and redirection
// This can be extended in the future to detect user's location and redirect accordingly

// For now, this just returns the default city
export const getDefaultCityFromIP = (ip?: string): string => {
  // TODO: Implement IP geolocation lookup
  // For now, always return nyc as default
  return 'nyc';
};

// City mapping for IP ranges (this would be expanded with real data)
const IP_CITY_MAPPING = {
  // Example: 
  // '192.168.1.': 'toronto',
  // '10.0.0.': 'vancouver',
  // Default fallback
  default: 'nyc'
};

// Function to get city based on IP (placeholder for future implementation)
export const getCityFromIP = (ip: string): string => {
  // In a real implementation, you would:
  // 1. Use a service like MaxMind GeoIP2 or ipapi.co
  // 2. Look up the IP address to get location data
  // 3. Map the location to your available cities
  // 4. Return the closest city slug
  
  for (const [ipPrefix, city] of Object.entries(IP_CITY_MAPPING)) {
    if (ipPrefix !== 'default' && ip.startsWith(ipPrefix)) {
      return city;
    }
  }
  
  return IP_CITY_MAPPING.default;
};

// Available cities that support automatic redirection
export const REDIRECT_ENABLED_CITIES = [
  'nyc',
  'toronto', 
  'vancouver',
  'montreal',
  'calgary'
];

// Check if a city supports automatic redirection
export const isCityRedirectEnabled = (citySlug: string): boolean => {
  return REDIRECT_ENABLED_CITIES.includes(citySlug);
}; 