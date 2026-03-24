const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
    this.token = null;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('creatorchain_token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('creatorchain_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creatorchain_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...options.headers };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // ─── Auth ──────────────────────────────────────
  async register(email, name, role = 'creator') {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, role }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(email) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.request('/api/auth/me');
  }

  // ─── Content ───────────────────────────────────
  async uploadContent(file, metadata) {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([k, v]) => formData.append(k, v));

    return this.request('/api/content/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getJobStatus(jobId) {
    return this.request(`/api/content/status/${jobId}`);
  }

  async getMarketplace(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/content?${qs}`);
  }

  async getContent(id) {
    return this.request(`/api/content/${id}`);
  }

  async getMyContent() {
    return this.request('/api/content/creator/mine');
  }

  async deleteContent(id) {
    return this.request(`/api/content/${id}`, {
      method: 'DELETE',
    });
  }

  // ─── Licensing ─────────────────────────────────
  async purchaseLicense(contentId) {
    return this.request('/api/license/purchase', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
    });
  }

  async getMyLicenses() {
    return this.request('/api/license/my');
  }

  // ─── Royalty ───────────────────────────────────
  async getEarnings() {
    return this.request('/api/royalty/earnings');
  }

  async claimRoyalty(amount, proof) {
    return this.request('/api/royalty/claim', {
      method: 'POST',
      body: JSON.stringify({ amount, proof }),
    });
  }

  // ─── Detection ─────────────────────────────────
  async detectContent(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/api/detect', {
      method: 'POST',
      body: formData,
    });
  }
}

const api = new ApiClient();
export default api;
