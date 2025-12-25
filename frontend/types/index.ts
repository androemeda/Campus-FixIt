export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Remark {
  _id: string;
  text: string;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  addedAt: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'Electrical' | 'Water' | 'Internet' | 'Infrastructure';
  status: 'Open' | 'In Progress' | 'Resolved';
  imageUrl?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  remarks: Remark[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface IssuesResponse {
  count: number;
  issues: Issue[];
  filters?: {
    category?: string;
    status?: string;
  };
}

export interface IssueResponse {
  issue: Issue;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

export interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  fetchIssues: (filters?: { category?: string; status?: string }) => Promise<void>;
  fetchMyIssues: () => Promise<void>;
  fetchAdminIssues: (filters?: { category?: string; status?: string }) => Promise<void>;
  fetchIssueById: (id: string) => Promise<Issue | null>;
  createIssue: (title: string, description: string, category: string, imageUri?: string) => Promise<void>;
  updateIssue: (id: string, status?: string, remark?: string) => Promise<void>;
  resolveIssue: (id: string) => Promise<void>;
}
