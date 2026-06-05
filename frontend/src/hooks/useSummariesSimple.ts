import { useState } from 'react';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { Summary } from '../types';

export const useSummaries = () => {
  const [data, setData] = useState<Summary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Summary[]>(API_ENDPOINTS.SUMMARY.BASE);
      setData(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};

export const useGenerateSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async (categoryId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Summary>(API_ENDPOINTS.SUMMARY.GENERATE(categoryId), {});
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateSummary, loading, error };
};
