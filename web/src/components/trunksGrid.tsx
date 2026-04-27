import * as React from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

export type TrunkRow = {
    id: number;
    name: string;
    host: string;
    port: number;
    transport: string;
    status: string;
};

export const trunkRows: TrunkRow[] = [
    { id: 1, name: 'SIP-Provider-1', host: 'sip.provider-one.com', port: 5060, transport: 'UDP', status: 'Online' },
    { id: 2, name: 'SIP-Provider-2', host: 'sip.provider-two.com', port: 5061, transport: 'TLS', status: 'Online' },
    { id: 3, name: 'Backup-Trunk', host: 'backup.provider.com', port: 5060, transport: 'TCP', status: 'Offline' },
];

export function useTrunks(initialRows: TrunkRow[] = trunkRows) {
    return React.useState<TrunkRow[]>(initialRows);
}

export default function TrunksGrid() {
    const [trunks] = useTrunks();

    const trunkGridColumns = React.useMemo<GridColDef[]>(() => [
        { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 180 },
        { field: 'host', headerName: 'Host', flex: 1.4, minWidth: 220 },
        { field: 'port', headerName: 'Port', flex: 0.7, minWidth: 100 },
        { field: 'transport', headerName: 'Transport', flex: 0.9, minWidth: 130 },
        {
            field: 'status',
            headerName: 'Status',
            flex: 0.8,
            minWidth: 130,
            sortable: false,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={params.value}
                    color={params.value === 'Online' ? 'success' : 'default'}
                />
            ),
        },
    ], []);

    const trunkGridRows = React.useMemo(() => {
        return trunks.map((row) => ({
            id: row.id,
            name: row.name,
            host: row.host,
            port: row.port,
            transport: row.transport,
            status: row.status,
        }));
    }, [trunks]);

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={trunkGridRows}
                columns={trunkGridColumns}
                disableRowSelectionOnClick
                hideFooter
            />
        </Box>
    );
}
