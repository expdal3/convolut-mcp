/**
 * Convolut API Client for direct MCP server integration
 */

const https = require('https');
const { URL } = require('url');

class ConvolutAPIClient {
  constructor(apiKey) {
    this.baseUrl = 'https://api.convolut.app/v1';
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api_key': this.apiKey,
        'User-Agent': 'convolut-mcp-client/1.0.0',
        ...options.headers,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              reject(new Error(`API Error ${res.statusCode}: ${data}`));
              return;
            }
            
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  // Context operations
  async listContexts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.contain) queryParams.append('contain', params.contain);
    if (params.category) queryParams.append('category', params.category);
    if (params.tags && params.tags.length) queryParams.append('tags', params.tags.join(','));
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.is_favorite !== undefined) queryParams.append('is_favorite', params.is_favorite.toString());

    const endpoint = `/contexts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.request(endpoint);
  }

  async getContext(contextId) {
    // The Convolut API doesn't have a direct GET /contexts/{id} endpoint
    // Instead, we use the list endpoint and filter by searching for the specific ID
    const response = await this.listContexts({ limit: 100 });
    const context = response.items.find(item => item.id === contextId);
    
    if (!context) {
      throw new Error(`Context with ID ${contextId} not found`);
    }
    
    return context;
  }

  async createContext(contextData) {
    return await this.request('/contexts', {
      method: 'POST',
      body: JSON.stringify(contextData),
    });
  }

  async updateContext(contextId, updates) {
    return await this.request(`/contexts/${contextId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContext(contextId) {
    return await this.request(`/contexts/${contextId}`, {
      method: 'DELETE',
    });
  }

  // AI-powered operations
  async consolidateContexts(request) {
    return await this.request('/contexts/consolidate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async planFromContexts(request) {
    return await this.request('/contexts/plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Export functionality
  async exportContexts(request) {
    return await this.request('/contexts/export', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Raw URL generation
  async generateRawUrl(request) {
    return await this.request('/contexts/raw-url', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health check
  async healthCheck() {
    const healthUrl = this.baseUrl.replace('/v1', '') + '/health';
    const url = new URL(healthUrl);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'convolut-mcp-client/1.0.0',
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              reject(new Error(`Health check failed: ${res.statusCode} ${data}`));
              return;
            }
            
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Health check timeout'));
      });

      req.end();
    });
  }
}

module.exports = { ConvolutAPIClient };