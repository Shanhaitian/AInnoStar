const BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, email: string, password: string, role = 'pm') =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password, role }) }),
  me: () => request('/auth/me'),

  // ── Research ──────────────────────────────────────────────────────────
  listProjects: () => request('/research/projects'),
  createProject: (name: string, goal?: string) =>
    request('/research/projects', { method: 'POST', body: JSON.stringify({ name, goal }) }),
  getProject: (id: number) => request(`/research/projects/${id}`),
  listInterviews: (projectId?: number) =>
    request(`/research/interviews${projectId ? `?project_id=${projectId}` : ''}`),
  createInterview: (project_id: number, interviewee: string) =>
    request('/research/interviews', { method: 'POST', body: JSON.stringify({ project_id, interviewee }) }),
  transcribeInterview: (id: number) =>
    request(`/research/interviews/${id}/transcribe`, { method: 'POST' }),
  listInsights: (interviewId?: number) =>
    request(`/research/insights${interviewId ? `?interview_id=${interviewId}` : ''}`),

  // ── Projects (文档模块) ───────────────────────────────────────────────
  listDocProjects: () => request('/documents/projects'),
  createDocProject: (data: any) =>
    request('/documents/projects', { method: 'POST', body: JSON.stringify(data) }),
  getDocProject: (id: number) => request(`/documents/projects/${id}`),
  updateDocProject: (id: number, data: any) =>
    request(`/documents/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Requirements ──────────────────────────────────────────────────────
  listRequirements: (params?: { priority?: string; status?: string; source?: string; project_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.priority) qs.set('priority', params.priority);
    if (params?.status) qs.set('status', params.status);
    if (params?.source) qs.set('source', params.source);
    if (params?.project_id) qs.set('project_id', String(params.project_id));
    return request(`/documents/requirements${qs.toString() ? `?${qs}` : ''}`);
  },
  createRequirement: (data: any) =>
    request('/documents/requirements', { method: 'POST', body: JSON.stringify(data) }),
  updateRequirement: (id: number, data: any) =>
    request(`/documents/requirements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── PRD ───────────────────────────────────────────────────────────────
  listPRDs: (project_id?: number) =>
    request(`/documents/prd${project_id ? `?project_id=${project_id}` : ''}`),
  createPRD: (data: any) =>
    request('/documents/prd', { method: 'POST', body: JSON.stringify(data) }),
  getPRD: (id: number) => request(`/documents/prd/${id}`),
  updatePRD: (id: number, data: any) =>
    request(`/documents/prd/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  generatePRD: (id: number) => request(`/documents/prd/${id}/generate`, { method: 'POST' }),
  listPRDVersions: (id: number) => request(`/documents/prd/${id}/versions`),

  // ── Technical Documents ───────────────────────────────────────────────
  listTechDocs: (params?: { project_id?: number; doc_type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.project_id) qs.set('project_id', String(params.project_id));
    if (params?.doc_type) qs.set('doc_type', params.doc_type);
    return request(`/documents/tech-docs${qs.toString() ? `?${qs}` : ''}`);
  },
  createTechDoc: (data: any) =>
    request('/documents/tech-docs', { method: 'POST', body: JSON.stringify(data) }),
  getTechDoc: (id: number) => request(`/documents/tech-docs/${id}`),
  updateTechDoc: (id: number, data: any) =>
    request(`/documents/tech-docs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Customer Documents ────────────────────────────────────────────────
  listCustomerDocs: (params?: { project_id?: number; direction?: string }) => {
    const qs = new URLSearchParams();
    if (params?.project_id) qs.set('project_id', String(params.project_id));
    if (params?.direction) qs.set('direction', params.direction);
    return request(`/documents/customer-docs${qs.toString() ? `?${qs}` : ''}`);
  },
  createCustomerDoc: (data: any) =>
    request('/documents/customer-docs', { method: 'POST', body: JSON.stringify(data) }),
  getCustomerDoc: (id: number) => request(`/documents/customer-docs/${id}`),
  updateCustomerDoc: (id: number, data: any) =>
    request(`/documents/customer-docs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Prototypes ────────────────────────────────────────────────────────
  listPrototypes: () => request('/prototypes'),
  createPrototype: (prd_id: number, name: string, generation_path = 'agent', preview_url?: string) =>
    request('/prototypes', { method: 'POST', body: JSON.stringify({ prd_id, name, generation_path, preview_url }) }),
  getPrototype: (id: number) => request(`/prototypes/${id}`),
  updatePrototype: (id: number, data: any) =>
    request(`/prototypes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  generatePrototype: (id: number) => request(`/prototypes/${id}/generate`, { method: 'POST' }),
  listPrototypePages: (id: number) => request(`/prototypes/${id}/pages`),
  createPrototypeNote: (id: number, content: string, note_type = 'meeting') =>
    request(`/prototypes/${id}/notes`, { method: 'POST', body: JSON.stringify({ content, note_type }) }),
  listPrototypeNotes: (id: number) => request(`/prototypes/${id}/notes`),
};
