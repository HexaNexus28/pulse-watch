import { useState } from 'react';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import { CreateNoteDto, UpdateNoteDto, Note } from '../types';

export const useNotes = () => {
  const [data, setData] = useState<Note[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Note[]>(API_ENDPOINTS.NOTE.BASE);
      setData(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};

export const useCreateNote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = async (noteData: CreateNoteDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Note>(API_ENDPOINTS.NOTE.CREATE, noteData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createNote, loading, error };
};

export const useUpdateNote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNote = async (id: number, noteData: UpdateNoteDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<Note>(API_ENDPOINTS.NOTE.UPDATE(id), noteData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateNote, loading, error };
};

export const useDeleteNote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteNote = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(API_ENDPOINTS.NOTE.DELETE(id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteNote, loading, error };
};
