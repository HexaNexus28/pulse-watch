import { useState } from 'react';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { CreateFeedDto, UpdateFeedDto, Feed } from '../types';

export const useFeeds = () => {
  const [data, setData] = useState<Feed[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Feed[]>(API_ENDPOINTS.FEED.BASE);
      setData(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};

export const useCreateFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFeed = async (feedData: CreateFeedDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Feed>(API_ENDPOINTS.FEED.CREATE, feedData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createFeed, loading, error };
};

export const useUpdateFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFeed = async (id: number, feedData: UpdateFeedDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<Feed>(API_ENDPOINTS.FEED.UPDATE(id), feedData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateFeed, loading, error };
};

export const useDeleteFeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFeed = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(API_ENDPOINTS.FEED.DELETE(id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteFeed, loading, error };
};
