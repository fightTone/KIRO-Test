import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import cacheService from './cacheService';

// Define error types for better handling
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

// Interface for cached request options
export interface CachedRequestConfig extends AxiosRequestConfig {
  cache?: boolean;
  cacheExpiry?: number;
  cacheKey?: string;
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status
    };

    // Handle specific error responses
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      
      // Try to extract error details from response
      if (error.response.data) {
        const data = error.response.data as any;
        
        if (data.error) {
          apiError.message = data.error.message || apiError.message;
          apiError.code = data.error.code;
          apiError.details = data.error.details;
        } else if (data.detail) {
          // FastAPI often returns errors in this format
          apiError.message = data.detail;
        } else if (typeof data === 'string') {
          apiError.message = data;
        }
      }

      // Handle specific status codes
      switch (status) {
        case 400:
          apiError.message = apiError.message || 'Invalid request';
          break;
        case 401:
          apiError.message = 'Authentication required';
          // Clear local storage and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          apiError.message = 'You do not have permission to perform this action';
          break;
        case 404:
          apiError.message = 'The requested resource was not found';
          break;
        case 422:
          apiError.message = 'Validation error';
          break;
        case 500:
          apiError.message = 'Server error, please try again later';
          break;
        default:
          // Keep default message for other status codes
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      apiError.message = 'No response from server. Please check your internet connection.';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Something happened in setting up the request that triggered an Error
      apiError.message = error.message || 'Error setting up the request';
    }

    // Attach the formatted error to the original error object for easier access
    (error as any).apiError = apiError;
    
    return Promise.reject(error);
  }
);

// Helper function to extract API error from axios error
export const extractApiError = (error: any): ApiError => {
  if (error.apiError) {
    return error.apiError;
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: error.response?.status
  };
};

// Enhanced API methods with caching support
const apiWithCache = {
  async get<T = any>(url: string, config?: CachedRequestConfig): Promise<T> {
    const useCache = config?.cache !== false;
    const cacheKey = config?.cacheKey || url;
    const cacheExpiry = config?.cacheExpiry;
    
    // Try to get from cache first if caching is enabled
    if (useCache) {
      const cachedData = cacheService.get<T>(cacheKey);
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
    }
    
    // If not in cache or cache disabled, make the API call
    const response = await api.get<T>(url, config);
    
    // Store in cache if caching is enabled
    if (useCache && response.data) {
      cacheService.set(cacheKey, response.data, cacheExpiry);
    }
    
    return response.data;
  },
  
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(url, data, config);
    
    // Invalidate cache for this endpoint
    cacheService.clearByPrefix(url);
    
    return response.data;
  },
  
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<T>(url, data, config);
    
    // Invalidate cache for this endpoint
    cacheService.clearByPrefix(url);
    
    return response.data;
  },
  
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    
    // Invalidate cache for this endpoint
    cacheService.clearByPrefix(url);
    
    return response.data;
  },
  
  // Expose the original axios instance
  axios: api,
  
  // Expose cache control methods
  cache: {
    clear: cacheService.clear.bind(cacheService),
    remove: cacheService.remove.bind(cacheService),
    clearByPrefix: cacheService.clearByPrefix.bind(cacheService)
  }
};

export default apiWithCache;