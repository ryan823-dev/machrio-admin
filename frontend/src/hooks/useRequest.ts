import { useState, useCallback } from 'react';
import { message } from 'antd';

interface UseRequestOptions<T> {
  onSuccess?: (data: T) => void;
  successMessage?: string;
}

export function useRequest<T, P extends unknown[]>(
  fn: (...args: P) => Promise<T>,
  options?: UseRequestOptions<T>,
) {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (...args: P): Promise<T | undefined> => {
    setLoading(true);
    try {
      const result = await fn(...args);
      if (options?.successMessage) {
        message.success(options.successMessage);
      }
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Operation failed');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [fn, options?.successMessage, options?.onSuccess]);

  return { loading, run };
}