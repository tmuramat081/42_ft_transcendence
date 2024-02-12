import { HTTP_METHOD } from '@/constants/api.constant';
import { Valueof } from './../../../../backend/src/common/types/global.d';
import { useState, useEffect } from 'react';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export interface UseApiReturnType<T> {
  // レスポンスデータ
  data: T | null;
  // ローディング状態
  isLoading: boolean;
  // エラーデータ
  error: ErrorData | null;
}

export interface RequestParams {
  // リクエストのパス
  path: string;
  // リクエストのメソッド
  method: Valueof<typeof HTTP_METHOD>;
  // クエリパラメータ
  query?: unknown;
  // リクエストボディ
  body?: object;
  // リクエストオプション
  options?: RequestInit;
}

export interface ErrorData {
  // ステータスコード
  status: number;
  // エラーテキスト
  errorText: string;
}

// APIリクエスト用の共通カスタムフック
export default function useApi<T>(request: RequestParams): UseApiReturnType<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorData | null>(null);

  const appendQueryParams = (url: URL, params: unknown) => {
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value || value === 0 || value === false) {
          url.searchParams.append(key, value as string);
        }
      });
    }
    return url;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // デフォルトのリクエスト形式
        const { path, method = HTTP_METHOD.GET, body, options = {} } = request;
        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        };
        if (method === HTTP_METHOD.POST || method === HTTP_METHOD.PATCH) {
          fetchOptions.body = JSON.stringify(body);
        }
        const url = new URL(`${API_URL}/${path}`);
        const urlAndQuery = appendQueryParams(url, request.query);
        const response = await fetch(urlAndQuery, fetchOptions);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(request)]);

  return { data, isLoading, error };
}
