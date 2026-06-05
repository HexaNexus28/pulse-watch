import { useState, useEffect, useCallback } from 'react';
import { noteService } from '../services/noteService';
import { CreateNoteDto, UpdateNoteDto, Note } from '../types';

interface UseNotesReturn {
    data: Note[] | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseNoteReturn {
    data: Note | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
    reset: () => void;
}

interface UseCreateNoteReturn {
    createNote: (note: CreateNoteDto) => Promise<Note | null>;
    loading: boolean;
    error: string | null;
}

interface UseUpdateNoteReturn {
    updateNote: (id: number, note: UpdateNoteDto) => Promise<Note | null>;
    loading: boolean;
    error: string | null;
}

interface UseDeleteNoteReturn {
    deleteNote: (id: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

// Hook pour récupérer toutes les notes
export const useNotes = (immediate = true): UseNotesReturn => {
    const [data, setData] = useState<Note[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await noteService.getAll();

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch notes');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer une note par ID
export const useNote = (id: number): UseNoteReturn => {
    const [data, setData] = useState<Note | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const response = await noteService.getById(id);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch note');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (id) {
            execute();
        }
    }, [execute, id]);

    return { data, loading, error, execute, reset };
};

// Hook pour récupérer les notes par catégorie
export const useNotesByCategory = (categoryId: number): UseNotesReturn => {
    const [data, setData] = useState<Note[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        if (!categoryId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await noteService.getByCategory(categoryId);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch notes by category');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (categoryId) {
            execute();
        }
    }, [execute, categoryId]);

    return { data, loading, error, execute, reset };
};

// Hook pour créer une note
export const useCreateNote = (): UseCreateNoteReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createNote = useCallback(async (note: CreateNoteDto): Promise<Note | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await noteService.create(note);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to create note');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createNote, loading, error };
};

// Hook pour mettre à jour une note
export const useUpdateNote = (): UseUpdateNoteReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateNote = useCallback(async (id: number, note: UpdateNoteDto): Promise<Note | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await noteService.update(id, note);

            if (response.success && response.data) {
                return response.data;
            } else {
                setError(response.message || 'Failed to update note');
                return null;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateNote, loading, error };
};

// Hook pour supprimer une note
export const useDeleteNote = (): UseDeleteNoteReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const deleteNote = useCallback(async (id: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await noteService.delete(id);

            if (response.success) {
                return true;
            } else {
                setError(response.message || 'Failed to delete note');
                return false;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteNote, loading, error };
};
