export function parseTime(time: unknown): number | null {
    if (time === null || time === undefined) {
        return null;
    }

    if (typeof time === 'number') {
        return time > 1e12 ? time : time * 1000;
    }

    if (typeof time === 'string') {
        const numeric = Number(time);
        if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
            return numeric > 1e12 ? numeric : numeric * 1000;
        }

        const parsed = Date.parse(time);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return null;
}

export function formatUptime(startupTime: unknown): string {
    const startupMs = parseTime(startupTime);
    if (!startupMs) {
        return 'Unknown';
    }

    const deltaMs = Date.now() - startupMs;
    if (deltaMs < 0) {
        return 'Unknown';
    }

    const totalSeconds = Math.floor(deltaMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
