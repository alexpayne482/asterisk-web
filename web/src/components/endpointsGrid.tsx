import * as React from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

import { useNotification } from './notifications';
import { useAri } from './ari';
import { useAmiAction } from './ami';

type EndpointDetails = {
    endpoint: Record<string, any>;
    auth: Record<string, any>;
    aors: Record<string, any>;
};

function getDisplayName(endpointDetails?: EndpointDetails): string {
    const callerId: string = endpointDetails?.endpoint?.Callerid || '';
    const match = callerId.match(/^"([^"]*)"/) || callerId.match(/^([^<]+)</);
    const callerIdName = match ? match[1].trim() : callerId.trim();
    return callerIdName || endpointDetails?.auth?.EndpointName || 'Unknown';
}

export default function EndpointsGrid() {
    const { showNotification } = useNotification();
    const [endpoints] = useAri('endpoints');
    const [_, __, amiError, fetchEndpointDetails] = useAmiAction('PJSIPShowEndpoint', { autoInvoke: false }, undefined);
    const [endpointDetails, setEndpointDetails] = React.useState<Record<string, EndpointDetails>>({});

    const endpointsGridColumns = React.useMemo<GridColDef[]>(() => [
        { field: 'extension', headerName: 'Extension', flex: 1, minWidth: 140 },
        { field: 'displayName', headerName: 'Display Name', flex: 1.3, minWidth: 180 },
        { field: 'username', headerName: 'Username', flex: 1.1, minWidth: 170 },
        { field: 'context', headerName: 'Context', flex: 1, minWidth: 150 },
        {
            field: 'state',
            headerName: 'Status',
            flex: 0.8,
            minWidth: 130,
            sortable: false,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={params.value}
                    color={params.value === 'offline' ? 'default' : 'success'}
                />
            ),
        },
    ], []);

    const endpointsGridRows = React.useMemo(() => {
        const list = Array.isArray(endpoints) ? endpoints : [];
        return list.map((ep: any, index: number) => {
            const extension = String(ep?.resource || ep?.id || ep?.endpoint || `unknown-${index}`);
            const details = endpointDetails[extension];
            return {
                id: extension,
                extension,
                displayName: getDisplayName(details),
                username: details?.auth?.EndpointName || '',
                context: 'from-internal',
                state: ep?.state || 'offline',
            };
        });
    }, [endpoints, endpointDetails]);

    React.useEffect(() => {
        if (amiError) {
            showNotification(`${amiError}`, 'error');
        }
    }, [amiError]);

    React.useEffect(() => {
        const list = Array.isArray(endpoints) ? endpoints : [];
        if (list.length === 0) {
            setEndpointDetails({});
            return;
        }

        let cancelled = false;
        const loadDetails = async () => {
            const pairs = await Promise.all(
                list.map(async (ep: any) => {
                    const endpoint = ep?.resource || ep?.id || ep?.endpoint;
                    if (!endpoint) {
                        return null;
                    }

                    const result = await fetchEndpointDetails({ Endpoint: String(endpoint) });
                    if (!result?.success || !Array.isArray(result.data?.events)) {
                        return null;
                    }
                    const details: EndpointDetails = {
                        endpoint: {},
                        auth: {},
                        aors: {},
                    };
                    for (const event of result.data.events) {
                        const type = event?.ObjectType?.toLowerCase();
                        if (type === 'endpoint') {
                            details.endpoint = event;
                        } else if (type === 'auth') {
                            details.auth = event;
                        } else if (type === 'aor') {
                            details.aors = event;
                        }
                    }
                    return [String(endpoint), details] as [string, EndpointDetails];
                }),
            );

            if (cancelled) {
                return;
            }

            const nextDetails: Record<string, EndpointDetails> = Object.fromEntries(
                pairs.filter((entry): entry is [string, EndpointDetails] => Array.isArray(entry) && entry !== null),
            );

            setEndpointDetails(nextDetails);
        };

        loadDetails();
        return () => {
            cancelled = true;
        };
    }, [endpoints, fetchEndpointDetails]);

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={endpointsGridRows}
                columns={endpointsGridColumns}
                disableRowSelectionOnClick
                hideFooter
                initialState={{
                    sorting: {
                        sortModel: [{ field: 'extension', sort: 'asc' }],
                    },
                }}
            />
        </Box>
    );
}
