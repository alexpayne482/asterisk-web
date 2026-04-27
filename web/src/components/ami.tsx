'use client';
import { useState, useCallback, useEffect } from 'react';

// @ts-expect-error Vite provides import.meta.env at build time.
export const baseURL = import.meta.env.VITE_API_ENDPOINT;

export interface AmiResponse {
    success: boolean;
    action: string;
    id?: number;
    data?: { [key: string]: any } | null;
    error?: string;
}

type UseAmiActionResult = [
    data: { [key: string]: any } | null,
    loading: boolean,
    error: string | null,
    invoke: (params?: Record<string, string>) => Promise<AmiResponse | null>,
];

type UseAmiActionOptions = {
    autoInvoke?: boolean;
};

export function useAmiAction(action: string, options?: UseAmiActionOptions, params?: Record<string, string>): UseAmiActionResult {
    const autoInvoke = options?.autoInvoke ?? true;
    const [data, setData] = useState<{ [key: string]: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const invoke = useCallback(async (invokeParams?: Record<string, string>): Promise<AmiResponse | null> => {
        setLoading(true);
        setError(null);
        let requestUrl = '';
        try {
            const url = `${baseURL}/ami/action/${action}`;
            const merged = { ...(params || {}), ...(invokeParams || {}) };
            requestUrl = url.toString();
            // console.log('Invoking AMI action:', action, 'baseURL:', baseURL, 'params:', merged);

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(merged),
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const json: AmiResponse = await res.json();
            // console.log('AMI action response:', json);
            if (!json.success) {
                throw new Error(json.error || 'Unknown AMI error');
            }
            setData(json.data || null);
            return json;
        } catch (err) {
            const msg = 'AMI error: ' + (err instanceof Error ? err.message : String(err)) + ' [' + requestUrl + ']';
            console.error(msg);
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [action, params]);

    useEffect(() => {
        if (autoInvoke || (params && Object.keys(params).length > 0)) {
            invoke();
        }
    }, [invoke, params, autoInvoke]);

    return [data, loading, error, invoke];
}
