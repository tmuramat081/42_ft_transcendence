import { useState, useEffect } from 'react';

export interface UseApiReturnType<T> {
  data: T | null;
  isLoading: boolean;
  error: ErrorData | null;
}

export interface RequestParams {
  url: string;
  options?: RequestInit;
}

export interface ErrorData {
  status: number;
  errorText: string;
}

// APIリクエスト用の共通カスタムフック
export default function useApi<T>(request: RequestParams): UseApiReturnType<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(request.url, request.options);
        if (!response.ok) {
          const errorData: ErrorData = {
            status: response.status,
            errorText: response.statusText,
          };
          throw errorData;
        }
        const jsonData = (await response.json()) as T;
        setData(jsonData);
      } catch (error: unknown) {
        setError(error as ErrorData);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, [request.url, request.options]);

  return { data, isLoading, error };
}
