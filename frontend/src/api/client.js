const API_BASE = '/api/crm';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('crm_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('crm_token', token);
    } else {
      localStorage.removeItem('crm_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'API Request failed');
      }

      return data;
    } catch (err) {
      console.error(`[API Client Error] ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Auth ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async switchRole(role) {
    const res = await this.request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res.data;
  }

  // --- Dashboard ---
  async getDashboard(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/dashboard${q ? '?' + q : ''}`);
  }

  // --- Leads ---
  async getLeads(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/leads${q ? '?' + q : ''}`);
  }

  async getLead(id) {
    return this.request(`/leads/${id}`);
  }

  async createLead(lead) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(lead)
    });
  }

  async updateLead(id, updates) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteLead(id) {
    return this.request(`/leads/${id}`, { method: 'DELETE' });
  }

  async convertLead(id, payload = {}) {
    return this.request(`/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async importLeads(leads) {
    return this.request('/leads/import', {
      method: 'POST',
      body: JSON.stringify({ leads })
    });
  }

  async getScoringRules() {
    return this.request('/leads/scoring-rules');
  }

  async updateScoringRules(rules) {
    return this.request('/leads/scoring-rules', {
      method: 'PUT',
      body: JSON.stringify(rules)
    });
  }

  // --- Accounts ---
  async getAccounts(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/accounts${q ? '?' + q : ''}`);
  }

  async getAccount360(id) {
    return this.request(`/accounts/${id}`);
  }

  async createAccount(account) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(account)
    });
  }

  async updateAccount(id, updates) {
    return this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteAccount(id) {
    return this.request(`/accounts/${id}`, { method: 'DELETE' });
  }

  // --- Contacts ---
  async getContacts(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/contacts${q ? '?' + q : ''}`);
  }

  async createContact(contact) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
  }

  async updateContact(id, updates) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteContact(id) {
    return this.request(`/contacts/${id}`, { method: 'DELETE' });
  }

  // --- Opportunities ---
  async getOpportunities(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/opportunities${q ? '?' + q : ''}`);
  }

  async getPipelineBoard() {
    return this.request('/opportunities/pipeline-board');
  }

  async getForecast() {
    return this.request('/opportunities/forecast');
  }

  async createOpportunity(opp) {
    return this.request('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opp)
    });
  }

  async updateOpportunity(id, updates) {
    return this.request(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async updateOpportunityStage(id, stage, reason = 'Stage moved via Kanban') {
    return this.request(`/opportunities/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage, reason })
    });
  }

  async deleteOpportunity(id) {
    return this.request(`/opportunities/${id}`, { method: 'DELETE' });
  }

  // --- Activities ---
  async getActivities(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/activities${q ? '?' + q : ''}`);
  }

  async createActivity(activity) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
  }

  async updateActivity(id, updates) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteActivity(id) {
    return this.request(`/activities/${id}`, { method: 'DELETE' });
  }

  // --- Sales ---
  async getProducts() {
    return this.request('/sales/products');
  }

  async createProduct(product) {
    return this.request('/sales/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  async getQuotes(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/sales/quotes${q ? '?' + q : ''}`);
  }

  async createQuote(quote) {
    return this.request('/sales/quotes', {
      method: 'POST',
      body: JSON.stringify(quote)
    });
  }

  async updateQuoteStatus(id, status) {
    return this.request(`/sales/quotes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getOrders(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/sales/orders${q ? '?' + q : ''}`);
  }

  async createOrder(order) {
    return this.request('/sales/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }

  async updateOrderStatus(id, status, erpSync = null) {
    return this.request(`/sales/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, erpSync })
    });
  }

  // --- Marketing ---
  async getCampaigns(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/marketing/campaigns${q ? '?' + q : ''}`);
  }

  async createCampaign(campaign) {
    return this.request('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign)
    });
  }

  async getLeadSources() {
    return this.request('/marketing/lead-sources');
  }

  // --- Customer Service ---
  async getTickets(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/service/tickets${q ? '?' + q : ''}`);
  }

  async createTicket(ticket) {
    return this.request('/service/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    });
  }

  async updateTicket(id, updates) {
    return this.request(`/service/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getComplaints() {
    return this.request('/service/complaints');
  }

  async createComplaint(complaint) {
    return this.request('/service/complaints', {
      method: 'POST',
      body: JSON.stringify(complaint)
    });
  }

  async getSlaRules() {
    return this.request('/service/sla-rules');
  }

  async updateSlaRule(id, updates) {
    return this.request(`/service/sla-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // --- Automation ---
  async getWorkflows() {
    return this.request('/automation');
  }

  async createWorkflow(workflow) {
    return this.request('/automation', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  }

  async toggleWorkflow(id) {
    return this.request(`/automation/${id}/toggle`, { method: 'PUT' });
  }

  async deleteWorkflow(id) {
    return this.request(`/automation/${id}`, { method: 'DELETE' });
  }

  async getWorkflowExecutions() {
    return this.request('/automation/executions');
  }

  // --- Reports ---
  async getReports(category = 'sales') {
    return this.request(`/reports?category=${category}`);
  }

  // --- AI Agent Center ---
  async queryAgent(agentType, query, payload = {}) {
    return this.request('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ agentType, query, payload })
    });
  }

  async executeTool(toolName, params, confirmedByHuman = false) {
    return this.request('/ai/tools', {
      method: 'POST',
      body: JSON.stringify({ toolName, params, confirmedByHuman })
    });
  }

  async getAiTasks() {
    return this.request('/ai/tasks');
  }

  async approveAiTask(id) {
    return this.request(`/ai/tasks/${id}/approve`, { method: 'POST' });
  }

  async rejectAiTask(id) {
    return this.request(`/ai/tasks/${id}/reject`, { method: 'POST' });
  }

  // --- Administration ---
  async getUsers() {
    return this.request('/admin/users');
  }

  async createUser(user) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  async updateUser(id, updates) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getRoles() {
    return this.request('/admin/roles');
  }

  async updateRolePermissions(id, permissions) {
    return this.request(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
  }

  async getAuditLogs(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/admin/audit-logs${q ? '?' + q : ''}`);
  }

  // --- Notifications ---
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  // --- ERP Integrations ---
  async getErpStatus() {
    return this.request('/integrations/status');
  }

  async syncOrderToErp(orderId) {
    return this.request('/integrations/sync-order', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    });
  }
}

export const api = new ApiClient();
export default api;
