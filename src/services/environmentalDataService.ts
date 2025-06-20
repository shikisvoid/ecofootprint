// Real-time Environmental Data Service
// Integrates with multiple APIs for live environmental data

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  location: string;
  timestamp: string;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  location: string;
  timestamp: string;
  condition: string;
}

export interface CarbonIntensityData {
  intensity: number; // gCO2/kWh
  forecast: Array<{
    from: string;
    to: string;
    intensity: number;
  }>;
  region: string;
  timestamp: string;
}

export interface EnvironmentalNews {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'climate' | 'pollution' | 'renewable' | 'conservation' | 'policy';
}

export interface GlobalEnvironmentalStats {
  globalCO2: number;
  arcticSeaIce: number;
  globalTemperatureAnomaly: number;
  deforestation: number;
  renewableEnergyPercentage: number;
  timestamp: string;
}

class EnvironmentalDataService {
  private readonly WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo_key';
  private readonly GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo_key';
  private readonly WAQI_API_KEY = 'demo_key'; // Replace with actual API key
  private readonly NEWS_API_KEY = 'demo_key'; // Replace with actual API key

  // Cache for location and weather data
  private locationCache = new Map<string, { data: any; timestamp: number }>();
  private weatherCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Enhanced location service with Google Maps integration
  async getUserLocation(): Promise<{ lat: number; lon: number; city: string }> {
    const cacheKey = 'user_location';
    const cached = this.locationCache.get(cacheKey);

    // Return cached location if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📍 Using cached location:', cached.data);
      return cached.data;
    }

    try {
      if (!navigator.geolocation) {
        console.warn('🚫 Geolocation not supported, using default location');
        const defaultLocation = { lat: 40.7128, lon: -74.0060, city: 'New York' };
        this.locationCache.set(cacheKey, { data: defaultLocation, timestamp: Date.now() });
        return defaultLocation;
      }

      return new Promise((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 GPS Location obtained:', { latitude, longitude });

            // Try Google Maps Geocoding first, fallback to OpenWeatherMap
            const location = await this.reverseGeocode(latitude, longitude);

            // Cache the result
            this.locationCache.set(cacheKey, { data: location, timestamp: Date.now() });
            resolve(location);
          },
          async (error) => {
            console.error('❌ Geolocation error:', error);
            console.log('🔄 Using IP-based location fallback');

            // Try IP-based location as fallback
            try {
              const ipLocation = await this.getLocationFromIP();
              this.locationCache.set(cacheKey, { data: ipLocation, timestamp: Date.now() });
              resolve(ipLocation);
            } catch (ipError) {
              console.log('🔄 Using default location (New York)');
              const defaultLocation = { lat: 40.7128, lon: -74.0060, city: 'New York' };
              this.locationCache.set(cacheKey, { data: defaultLocation, timestamp: Date.now() });
              resolve(defaultLocation);
            }
          },
          options
        );
      });
    } catch (error) {
      console.error('💥 Location service error:', error);
      const defaultLocation = { lat: 40.7128, lon: -74.0060, city: 'New York' };
      this.locationCache.set(cacheKey, { data: defaultLocation, timestamp: Date.now() });
      return defaultLocation;
    }
  }

  // Enhanced reverse geocoding with Google Maps API
  private async reverseGeocode(lat: number, lon: number): Promise<{ lat: number; lon: number; city: string }> {
    // Try Google Maps Geocoding API first
    if (this.GOOGLE_MAPS_API_KEY && this.GOOGLE_MAPS_API_KEY !== 'demo_key') {
      try {
        console.log('🗺️ Using Google Maps Geocoding API');
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${this.GOOGLE_MAPS_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const cityComponent = result.address_components.find((component: any) =>
              component.types.includes('locality') || component.types.includes('administrative_area_level_1')
            );
            const city = cityComponent?.long_name || result.formatted_address.split(',')[0] || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

            console.log('✅ Google Maps geocoding successful:', city);
            return { lat, lon, city };
          }
        }
      } catch (error) {
        console.warn('⚠️ Google Maps geocoding failed, trying OpenWeatherMap:', error);
      }
    }

    // Fallback to OpenWeatherMap geocoding
    try {
      console.log('🌤️ Using OpenWeatherMap geocoding as fallback');
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.WEATHER_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const locationData = data[0];
        const city = locationData ?
          `${locationData.name}${locationData.state ? ', ' + locationData.state : ''}${locationData.country ? ', ' + locationData.country : ''}` :
          `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        console.log('✅ OpenWeatherMap geocoding successful:', city);
        return { lat, lon, city };
      }
    } catch (error) {
      console.warn('⚠️ OpenWeatherMap geocoding failed:', error);
    }

    // Final fallback to coordinates
    console.log('🔄 Using coordinates as city name');
    return { lat, lon, city: `${lat.toFixed(2)}, ${lon.toFixed(2)}` };
  }

  // IP-based location fallback
  private async getLocationFromIP(): Promise<{ lat: number; lon: number; city: string }> {
    try {
      console.log('🌐 Attempting IP-based location');
      const response = await fetch('https://ipapi.co/json/');

      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          console.log('✅ IP-based location successful:', data.city || data.region);
          return {
            lat: data.latitude,
            lon: data.longitude,
            city: data.city || data.region || `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ IP-based location failed:', error);
    }

    throw new Error('IP-based location failed');
  }

  // Get real-time air quality data
  async getAirQuality(lat?: number, lon?: number): Promise<AirQualityData> {
    try {
      const location = lat && lon ? { lat, lon } : await this.getUserLocation();
      
      // Using World Air Quality Index API
      const response = await fetch(
        `https://api.waqi.info/feed/geo:${location.lat};${location.lon}/?token=${this.WAQI_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error('Air quality API error');
      }

      const aqi = data.data.aqi;
      const iaqi = data.data.iaqi || {};

      return {
        aqi,
        pm25: iaqi.pm25?.v || 0,
        pm10: iaqi.pm10?.v || 0,
        o3: iaqi.o3?.v || 0,
        no2: iaqi.no2?.v || 0,
        so2: iaqi.so2?.v || 0,
        co: iaqi.co?.v || 0,
        location: data.data.city?.name || 'Unknown',
        timestamp: new Date().toISOString(),
        status: this.getAQIStatus(aqi)
      };
    } catch (error) {
      console.error('Error fetching air quality:', error);
      return this.getMockAirQuality();
    }
  }

  // Enhanced weather data with caching and better error handling
  async getWeatherData(lat?: number, lon?: number): Promise<WeatherData> {
    try {
      let location;
      if (lat && lon) {
        location = { lat, lon, city: 'Unknown' };
      } else {
        location = await this.getUserLocation();
      }

      // Check cache first
      const cacheKey = `weather_${location.lat.toFixed(3)}_${location.lon.toFixed(3)}`;
      const cached = this.weatherCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('🌤️ Using cached weather data:', cached.data);
        return cached.data;
      }

      console.log('🌤️ Fetching fresh weather data for location:', location);
      console.log('🔑 Using Weather API Key:', this.WEATHER_API_KEY ? `${this.WEATHER_API_KEY.substring(0, 8)}...` : 'Missing');

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.WEATHER_API_KEY}&units=metric`;
      console.log('🌐 Weather API URL:', weatherUrl.replace(this.WEATHER_API_KEY, 'API_KEY'));

      const response = await fetch(weatherUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Weather API response not ok:', response.status, response.statusText);
        console.error('❌ Error details:', errorText);

        // Return cached data if available, even if expired
        if (cached) {
          console.log('🔄 Using expired cached weather data due to API error');
          return cached.data;
        }

        throw new Error(`Failed to fetch weather data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Weather API response:', data);

      // Get UV Index data (separate API call with timeout)
      let uvIndex = 0;
      try {
        const uvController = new AbortController();
        const uvTimeout = setTimeout(() => uvController.abort(), 5000); // 5 second timeout

        const uvResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/uvi?lat=${location.lat}&lon=${location.lon}&appid=${this.WEATHER_API_KEY}`,
          { signal: uvController.signal }
        );

        clearTimeout(uvTimeout);

        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          uvIndex = Math.round(uvData.value || 0);
          console.log('☀️ UV Index data:', uvData);
        }
      } catch (uvError) {
        console.warn('⚠️ Could not fetch UV index:', uvError);
      }

      // Enhanced location name resolution
      const locationName = this.getLocationName(data, location);

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round((data.wind?.speed || 0) * 10) / 10, // Round to 1 decimal
        windDirection: data.wind?.deg || 0,
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 100) / 10 : 10, // Convert to km, round to 1 decimal
        uvIndex,
        location: locationName,
        timestamp: new Date().toISOString(),
        condition: this.formatWeatherCondition(data.weather[0])
      };

      console.log('🎯 Processed weather data:', weatherData);

      // Cache the result
      this.weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

      return weatherData;
    } catch (error) {
      console.error('💥 Error fetching weather data:', error);
      console.log('🔄 Falling back to mock weather data');
      return this.getMockWeatherData();
    }
  }

  // Enhanced weather forecast with caching (5-day forecast)
  async getWeatherForecast(lat?: number, lon?: number): Promise<any> {
    try {
      const location = lat && lon ? { lat, lon } : await this.getUserLocation();

      // Check cache first
      const cacheKey = `forecast_${location.lat.toFixed(3)}_${location.lon.toFixed(3)}`;
      const cached = this.weatherCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📅 Using cached forecast data');
        return cached.data;
      }

      console.log('📅 Fetching fresh weather forecast for location:', location);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.WEATHER_API_KEY}&units=metric`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        // Return cached data if available, even if expired
        if (cached) {
          console.log('🔄 Using expired cached forecast data due to API error');
          return cached.data;
        }
        throw new Error(`Failed to fetch weather forecast: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Weather forecast data received');

      // Cache the result
      this.weatherCache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  // Get carbon intensity data (UK Grid)
  async getCarbonIntensity(): Promise<CarbonIntensityData> {
    try {
      const response = await fetch('https://api.carbonintensity.org.uk/intensity');
      
      if (!response.ok) {
        throw new Error('Failed to fetch carbon intensity data');
      }
      
      const data = await response.json();
      const current = data.data[0];

      // Get forecast
      const forecastResponse = await fetch('https://api.carbonintensity.org.uk/intensity/date');
      const forecastData = await forecastResponse.json();

      return {
        intensity: current.intensity.actual || current.intensity.forecast,
        forecast: forecastData.data.slice(0, 24).map((item: any) => ({
          from: item.from,
          to: item.to,
          intensity: item.intensity.forecast
        })),
        region: 'UK',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching carbon intensity:', error);
      return this.getMockCarbonIntensity();
    }
  }

  // Get environmental news
  async getEnvironmentalNews(): Promise<EnvironmentalNews[]> {
    try {
      const keywords = ['climate change', 'renewable energy', 'carbon emissions', 'environmental policy'];
      const query = keywords.join(' OR ');
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&apiKey=${this.NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch environmental news');
      }
      
      const data = await response.json();

      return data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: this.categorizeNews(article.title + ' ' + article.description)
      }));
    } catch (error) {
      console.error('Error fetching environmental news:', error);
      return this.getMockEnvironmentalNews();
    }
  }

  // Get global environmental statistics
  async getGlobalEnvironmentalStats(): Promise<GlobalEnvironmentalStats> {
    try {
      // This would integrate with APIs like NASA, NOAA, etc.
      // For now, returning realistic mock data with some variation
      const baseStats = {
        globalCO2: 421.5 + (Math.random() - 0.5) * 2, // ppm
        arcticSeaIce: 14.2 + (Math.random() - 0.5) * 1, // million km²
        globalTemperatureAnomaly: 1.1 + (Math.random() - 0.5) * 0.2, // °C
        deforestation: 10.2 + (Math.random() - 0.5) * 0.5, // million hectares/year
        renewableEnergyPercentage: 29.5 + (Math.random() - 0.5) * 2, // %
        timestamp: new Date().toISOString()
      };

      return baseStats;
    } catch (error) {
      console.error('Error fetching global stats:', error);
      return this.getMockGlobalStats();
    }
  }

  // Helper methods
  private getLocationName(weatherData: any, location: { lat: number; lon: number; city: string }): string {
    // Priority: Weather API name > Geocoded city > Coordinates
    if (weatherData.name && weatherData.name !== '') {
      return weatherData.name;
    }
    if (location.city && location.city !== 'Unknown' && !location.city.includes(',')) {
      return location.city;
    }
    return `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`;
  }

  private formatWeatherCondition(weather: any): string {
    if (!weather) return 'Unknown';

    const condition = weather.description || weather.main || 'Unknown';
    // Capitalize first letter of each word
    return condition.split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private getAQIStatus(aqi: number): AirQualityData['status'] {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  private categorizeNews(text: string): EnvironmentalNews['category'] {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('renewable') || lowerText.includes('solar') || lowerText.includes('wind')) return 'renewable';
    if (lowerText.includes('pollution') || lowerText.includes('air quality')) return 'pollution';
    if (lowerText.includes('conservation') || lowerText.includes('wildlife')) return 'conservation';
    if (lowerText.includes('policy') || lowerText.includes('regulation')) return 'policy';
    return 'climate';
  }

  // Mock data methods for fallback
  private getMockAirQuality(): AirQualityData {
    const aqi = Math.floor(Math.random() * 150) + 20;
    return {
      aqi,
      pm25: Math.floor(Math.random() * 50) + 10,
      pm10: Math.floor(Math.random() * 80) + 20,
      o3: Math.floor(Math.random() * 100) + 30,
      no2: Math.floor(Math.random() * 60) + 15,
      so2: Math.floor(Math.random() * 40) + 5,
      co: Math.floor(Math.random() * 20) + 2,
      location: 'Demo Location',
      timestamp: new Date().toISOString(),
      status: this.getAQIStatus(aqi)
    };
  }

  private getMockWeatherData(): WeatherData {
    return {
      temperature: Math.floor(Math.random() * 30) + 5,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      windDirection: Math.floor(Math.random() * 360),
      pressure: Math.floor(Math.random() * 50) + 1000,
      visibility: Math.floor(Math.random() * 15) + 5,
      uvIndex: Math.floor(Math.random() * 10) + 1,
      location: 'Demo Location',
      timestamp: new Date().toISOString(),
      condition: 'Clear sky'
    };
  }

  private getMockCarbonIntensity(): CarbonIntensityData {
    const intensity = Math.floor(Math.random() * 300) + 100;
    return {
      intensity,
      forecast: Array.from({ length: 24 }, (_, i) => ({
        from: new Date(Date.now() + i * 3600000).toISOString(),
        to: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
        intensity: Math.floor(Math.random() * 200) + 100
      })),
      region: 'Demo Region',
      timestamp: new Date().toISOString()
    };
  }

  private getMockEnvironmentalNews(): EnvironmentalNews[] {
    return [
      {
        title: 'Global Renewable Energy Capacity Reaches New Record',
        description: 'Worldwide renewable energy installations continue to grow at unprecedented rates.',
        url: '#',
        source: 'Environmental Times',
        publishedAt: new Date().toISOString(),
        category: 'renewable'
      },
      {
        title: 'New Climate Policy Aims to Reduce Carbon Emissions by 50%',
        description: 'Government announces ambitious new targets for carbon reduction.',
        url: '#',
        source: 'Climate News',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'policy'
      }
    ];
  }

  private getMockGlobalStats(): GlobalEnvironmentalStats {
    return {
      globalCO2: 421.8,
      arcticSeaIce: 14.1,
      globalTemperatureAnomaly: 1.15,
      deforestation: 10.3,
      renewableEnergyPercentage: 30.2,
      timestamp: new Date().toISOString()
    };
  }
}

export const environmentalDataService = new EnvironmentalDataService();
