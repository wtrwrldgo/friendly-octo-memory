// file: hooks/useCRUD.ts

import { useState, useCallback, useMemo } from "react";

export interface UseCRUDOptions<T> {
  initialData: T[];
  generateId?: () => string;
  onBeforeCreate?: (item: Omit<T, "id">) => Partial<T>;
  onBeforeUpdate?: (item: T) => T;
  onBeforeDelete?: (id: string) => boolean;
}

export interface UseCRUDReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  // CRUD operations
  create: (item: Omit<T, "id">) => void;
  update: (id: string, updates: Partial<T>) => void;
  remove: (id: string) => void;
  // Utility operations
  getById: (id: string) => T | undefined;
  filter: (predicate: (item: T) => boolean) => T[];
  sort: (compareFn: (a: T, b: T) => number) => T[];
  // Bulk operations
  bulkCreate: (items: Omit<T, "id">[]) => void;
  bulkUpdate: (updates: Array<{ id: string; data: Partial<T> }>) => void;
  bulkRemove: (ids: string[]) => void;
  // State management
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  reset: () => void;
}

export function useCRUD<T extends { id: string }>(
  options: UseCRUDOptions<T>
): UseCRUDReturn<T> {
  const {
    initialData,
    generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    onBeforeCreate,
    onBeforeUpdate,
    onBeforeDelete,
  } = options;

  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create operation
  const create = useCallback(
    (item: Omit<T, "id">) => {
      try {
        setLoading(true);
        setError(null);

        let newItem = { ...item, id: generateId() } as T;

        if (onBeforeCreate) {
          newItem = { ...newItem, ...onBeforeCreate(item) } as T;
        }

        setItems((prev) => [newItem, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create item");
      } finally {
        setLoading(false);
      }
    },
    [generateId, onBeforeCreate]
  );

  // Update operation
  const update = useCallback(
    (id: string, updates: Partial<T>) => {
      try {
        setLoading(true);
        setError(null);

        setItems((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              let updated = { ...item, ...updates };
              if (onBeforeUpdate) {
                updated = onBeforeUpdate(updated);
              }
              return updated;
            }
            return item;
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update item");
      } finally {
        setLoading(false);
      }
    },
    [onBeforeUpdate]
  );

  // Delete operation
  const remove = useCallback(
    (id: string) => {
      try {
        setLoading(true);
        setError(null);

        if (onBeforeDelete && !onBeforeDelete(id)) {
          setError("Delete operation cancelled");
          return;
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete item");
      } finally {
        setLoading(false);
      }
    },
    [onBeforeDelete]
  );

  // Get by ID
  const getById = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  // Filter items
  const filter = useCallback(
    (predicate: (item: T) => boolean) => {
      return items.filter(predicate);
    },
    [items]
  );

  // Sort items
  const sort = useCallback(
    (compareFn: (a: T, b: T) => number) => {
      return [...items].sort(compareFn);
    },
    [items]
  );

  // Bulk create
  const bulkCreate = useCallback(
    (newItems: Omit<T, "id">[]) => {
      try {
        setLoading(true);
        setError(null);

        const itemsWithIds = newItems.map((item) => ({
          ...item,
          id: generateId(),
        })) as T[];

        setItems((prev) => [...itemsWithIds, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to bulk create");
      } finally {
        setLoading(false);
      }
    },
    [generateId]
  );

  // Bulk update
  const bulkUpdate = useCallback(
    (updates: Array<{ id: string; data: Partial<T> }>) => {
      try {
        setLoading(true);
        setError(null);

        const updateMap = new Map(updates.map((u) => [u.id, u.data]));

        setItems((prev) =>
          prev.map((item) => {
            const update = updateMap.get(item.id);
            return update ? { ...item, ...update } : item;
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to bulk update");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Bulk remove
  const bulkRemove = useCallback((ids: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const idsSet = new Set(ids);
      setItems((prev) => prev.filter((item) => !idsSet.has(item.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bulk remove");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to initial data
  const reset = useCallback(() => {
    setItems(initialData);
    setError(null);
  }, [initialData]);

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    getById,
    filter,
    sort,
    bulkCreate,
    bulkUpdate,
    bulkRemove,
    setItems,
    reset,
  };
}
