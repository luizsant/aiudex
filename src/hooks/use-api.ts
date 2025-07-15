import { useState, useCallback } from "react";
import { CustomError, ErrorCodes, handleError } from "@/lib/error-handler";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    initialData?: T | null;
  }
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: options?.initialData || null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState((prev) => ({ ...prev, data: result, loading: false }));
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const appError = handleError(err);
        setState((prev) => ({
          ...prev,
          error: appError.message,
          loading: false,
        }));
        options?.onError?.(appError.message);
        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({
      data: options?.initialData || null,
      loading: false,
      error: null,
    });
  }, [options?.initialData]);

  return {
    ...state,
    execute,
    reset,
  };
};

// Hook para operações CRUD
export const useCrud = <T>(apiFunctions: {
  create?: (data: Partial<T>) => Promise<T>;
  read?: (id: string) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<void>;
  list?: () => Promise<T[]>;
}) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Partial<T>): Promise<T | null> => {
      if (!apiFunctions.create) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunctions.create(data);
        setItems((prev) => [...prev, result]);
        return result;
      } catch (err) {
        const appError = handleError(err);
        setError(appError.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunctions.create]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T | null> => {
      if (!apiFunctions.update) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunctions.update(id, data);
        setItems((prev) =>
          prev.map((item) => ((item as any).id === id ? result : item))
        );
        return result;
      } catch (err) {
        const appError = handleError(err);
        setError(appError.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunctions.update]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!apiFunctions.delete) return false;

      setLoading(true);
      setError(null);

      try {
        await apiFunctions.delete(id);
        setItems((prev) => prev.filter((item) => (item as any).id !== id));
        return true;
      } catch (err) {
        const appError = handleError(err);
        setError(appError.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiFunctions.delete]
  );

  const load = useCallback(async (): Promise<T[] | null> => {
    if (!apiFunctions.list) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunctions.list();
      setItems(result);
      return result;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunctions.list]);

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    load,
    setItems,
  };
};
