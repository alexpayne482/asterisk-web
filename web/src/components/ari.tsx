'use client';
import { useState, useCallback, useEffect } from 'react';

// @ts-expect-error Vite provides import.meta.env at build time.
export const baseURL = import.meta.env.VITE_API_ENDPOINT;

type UseAriResult = [
    data: { [key: string]: any } | null,
    loading: boolean,
    error: string | null,
    invoke: (params?: Record<string, string>) => Promise<object | null>,
];

export function useAri(path: string, params?: Record<string, string>): UseAriResult {
    const [data, setData] = useState<{ [key: string]: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const invoke = useCallback(async (invokeParams?: Record<string, string>): Promise<object | null> => {
        setLoading(true);
        setError(null);
        let requestUrl = '';
        try {
            const url = new URL(`${baseURL}/ari/${path}`);
            const merged = { ...params, ...invokeParams };
            Object.entries(merged).forEach(([k, v]) => url.searchParams.set(k, v));
            requestUrl = url.toString();

            const res = await fetch(requestUrl, { method: 'GET' });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const json: object = await res.json();
            setData(json || null);
            return json;
        } catch (err) {
            const msg = 'ARI error: ' + (err instanceof Error ? err.message : String(err)) + ' [' + requestUrl + ']';
            console.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [path]);

    useEffect(() => {
        invoke(params);
    }, []);

    return [data, loading, error, invoke];
}
