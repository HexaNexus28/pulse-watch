import { useState } from 'react';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { DashboardStats } from '../types';

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};

export const useDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<any>(API_ENDPOINTS.DASHBOARD.ACTIVITY);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard activity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
