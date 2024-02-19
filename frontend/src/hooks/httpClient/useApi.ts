import { HTTP_METHOD } from '@/constants/api.constant';
import { Valueof } from './../../../../backend/src/common/types/global.d';
import { useState } from 'react';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export interface UseApiReturnType<T> {
  // レスポンスデータ
  data: T | null;
  // ローディング状態
  isLoading: boolean;
  // エラーデータ
  error: ErrorData | null;
  // APIリクエスト実行関数
  fetchData: (params?: Partial<RequestParams>) => Promise<void>;
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
export default function useApi<T>(initialRequest: RequestParams): UseApiReturnType<T> {
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

  const fetchData = async (params: Partial<RequestParams> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const { path, method = 'GET', query, body, options = {} } = { ...initialRequest, ...params };
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
        console.log('fetchOptions', body, fetchOptions);
      }
      const url = new URL(`${API_URL}/${path}`);
      const urlAndQuery = appendQueryParams(url, query);
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
      if (error instanceof Error) {
        setError({ status: 500, errorText: error.message });
      } else {
        setError(error as ErrorData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchData };
}
