import React, { createContext, useState, useContext } from 'react';
import api from '../config/api';
import { Issue, IssueContextType, IssuesResponse, IssueResponse } from '../types';
import { Platform } from 'react-native';

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async (filters?: { category?: string; status?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);

      const response = await api.get<IssuesResponse>(
        `/api/issues${params.toString() ? `?${params.toString()}` : ''}`
      );

      setIssues(response.data.issues);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issues');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<IssuesResponse>('/api/issues/my-issues');
      setIssues(response.data.issues);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issues');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminIssues = async (filters?: { category?: string; status?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);

      const response = await api.get<IssuesResponse>(
        `/api/admin/issues${params.toString() ? `?${params.toString()}` : ''}`
      );

      setIssues(response.data.issues);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin issues');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueById = async (id: string): Promise<Issue | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<IssueResponse>(`/api/issues/${id}`);
      return response.data.issue;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (
  title: string,
  description: string,
  category: string,
  imageUri?: string
) => {
  try {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);

    if (imageUri) {
      if (Platform.OS === 'web') {
        // 🔥 WEB FIX
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'issue.jpg');
      } else {
        // ✅ MOBILE (Android / iOS)
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
    }

    await api.post('/api/issues', formData);

    await fetchMyIssues();
  } catch (err: any) {
    setError(err.message || 'Failed to create issue');
    throw err;
  } finally {
    setLoading(false);
  }
};

  const updateIssue = async (id: string, status?: string, remark?: string) => {
    try {
      setLoading(true);
      setError(null);

      const data: any = {};
      if (status) data.status = status;
      if (remark) data.remark = remark;

      await api.put(`/api/admin/issues/${id}`, data);

      // Refresh issues list
      const response = await api.get<IssuesResponse>('/api/admin/issues');
      setIssues(response.data.issues);
    } catch (err: any) {
      setError(err.message || 'Failed to update issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await api.put(`/api/admin/issues/${id}/resolve`);

      // Refresh issues list
      const response = await api.get<IssuesResponse>('/api/admin/issues');
      setIssues(response.data.issues);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve issue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        loading,
        error,
        fetchIssues,
        fetchMyIssues,
        fetchAdminIssues,
        fetchIssueById,
        createIssue,
        updateIssue,
        resolveIssue,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
