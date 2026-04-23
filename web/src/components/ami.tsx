import * as React from 'react';
import AsteriskManager from 'asterisk-manager';

type AmiConfig = {
    host: string;
    port: number;
    username: string;
    password: string;
};

export function useAmi(config?: Partial<AmiConfig>) {
    const amiConfig = React.useMemo<AmiConfig>(
        () => ({
            host: config?.host ?? '192.168.1.21',
            port: config?.port ?? 5038,
            username: config?.username ?? 'asterisk',
            password: config?.password ?? 'asterisk',
        }),
        [config?.host, config?.port, config?.username, config?.password],
    );

    const managerRef = React.useRef<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [connected, setConnected] = React.useState(false);

    React.useEffect(() => {
        // `asterisk-manager` is Node-oriented and is not safe to run in browser bundles.
        if (typeof window !== 'undefined') {
            setError('AMI direct connection is not supported in the browser. Use a backend proxy/service.');
            setConnected(false);
            managerRef.current = null;
            return;
        }

        try {
            const ami = new AsteriskManager();
            ami.connect(amiConfig, (err: any) => {
                if (err) {
                    setError(String(err));
                    setConnected(false);
                    return;
                }
                setConnected(true);
            });
            managerRef.current = ami;
        } catch (err) {
            setError(String(err));
            setConnected(false);
            managerRef.current = null;
        }

        return () => {
            if (managerRef.current && typeof managerRef.current.disconnect === 'function') {
                managerRef.current.disconnect();
            }
            managerRef.current = null;
            setConnected(false);
        };
    }, [amiConfig]);

    return {
        manager: managerRef.current,
        connected,
        error,
    };
}
