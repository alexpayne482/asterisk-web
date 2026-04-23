import * as React from 'react';
import { Paper, Typography, Stack, Fab, Tabs, Tab, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, TextField, Button, MenuItem, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useSearchParams } from 'react-router';

const extensionRows = [
    { id: 1, extension: '1001', displayName: 'Front Desk', username: 'ext1001', context: 'from-internal', status: 'Enabled' },
    { id: 2, extension: '1002', displayName: 'Support', username: 'ext1002', context: 'from-internal', status: 'Enabled' },
    { id: 3, extension: '1003', displayName: 'Sales', username: 'ext1003', context: 'from-internal', status: 'Disabled' },
];

const trunkRows = [
    { id: 1, name: 'SIP-Provider-1', host: 'sip.provider-one.com', port: 5060, transport: 'UDP', status: 'Online' },
    { id: 2, name: 'SIP-Provider-2', host: 'sip.provider-two.com', port: 5061, transport: 'TLS', status: 'Online' },
    { id: 3, name: 'Backup-Trunk', host: 'backup.provider.com', port: 5060, transport: 'TCP', status: 'Offline' },
];

export default function ExtensionsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'trunks' ? 'trunks' : 'extensions';
    const [showCreateForm, setShowCreateForm] = React.useState(false);

    const [extensions, setExtensions] = React.useState(extensionRows);
    const [trunks, setTrunks] = React.useState(trunkRows);

    React.useEffect(() => {
        if (amiError) {
            console.warn('AMI unavailable:', amiError);
        }
    }, [amiError]);

    React.useEffect(() => {
        if (!ami) {
            return;
        }

        const handleExtensionUpdate = (event: any) => {
            console.log('Received extension update event:', event);
            // Here you would typically fetch the updated list of extensions from the server
            // For this example, we'll just log the event
        }
        ami.on('extensionUpdate', handleExtensionUpdate);

        return () => {
            ami.off('extensionUpdate', handleExtensionUpdate);
        };
    }, [ami]);

    const [newExtension, setNewExtension] = React.useState({
        extension: '',
        displayName: '',
        username: '',
        context: 'from-internal',
        status: 'Enabled',
    });

    const [newTrunk, setNewTrunk] = React.useState({
        name: '',
        host: '',
        port: '5060',
        transport: 'UDP',
        status: 'Online',
    });

    const handleTabChange = (_event: React.SyntheticEvent, value: string) => {
        setSearchParams({ tab: value });
        setShowCreateForm(false);
    };

    const handleCreate = () => {
        if (activeTab === 'extensions') {
            if (!newExtension.extension.trim() || !newExtension.displayName.trim()) {
                return;
            }

            setExtensions((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    extension: newExtension.extension.trim(),
                    displayName: newExtension.displayName.trim(),
                    username: newExtension.username.trim() || `ext${newExtension.extension.trim()}`,
                    context: newExtension.context.trim() || 'from-internal',
                    status: newExtension.status,
                },
            ]);

            setNewExtension({
                extension: '',
                displayName: '',
                username: '',
                context: 'from-internal',
                status: 'Enabled',
            });
        } else {
            if (!newTrunk.name.trim() || !newTrunk.host.trim()) {
                return;
            }

            setTrunks((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    name: newTrunk.name.trim(),
                    host: newTrunk.host.trim(),
                    port: Number(newTrunk.port) || 5060,
                    transport: newTrunk.transport,
                    status: newTrunk.status,
                },
            ]);

            setNewTrunk({
                name: '',
                host: '',
                port: '5060',
                transport: 'UDP',
                status: 'Online',
            });
        }

        setShowCreateForm(false);
    };

    return (
        <PageContainer title="Extensions">
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} height={32}>
                <Typography variant="body1">
                    SIP Accounts and Trunks
                </Typography>
                {!showCreateForm && (
                    <Fab variant="extended" size="medium" color="primary" sx={{ width: '180px' }} onClick={() => setShowCreateForm(true)}>
                        <AddIcon/>{activeTab === 'extensions' ? 'Add Extension' : 'Add Trunk'}
                    </Fab>
                )}
            </Stack>

            <Box sx={{ mt: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                    <Tab value="extensions" label="Extensions" />
                    <Tab value="trunks" label="Trunks" />
                </Tabs>
            </Box>

            {showCreateForm && (
                <Paper sx={{ mt: 2, p: 2 }}>
                    <Typography variant="h6" sx={{ ml: 2, mb: 2 }}>
                        {activeTab === 'extensions' ? 'New Extension' : 'New Trunk'}
                    </Typography>
                    {activeTab === 'extensions' ? (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                            <TextField
                                label="Extension"
                                value={newExtension.extension}
                                onChange={(event) => setNewExtension((prev) => ({ ...prev, extension: event.target.value }))}
                                required
                            />
                            <TextField
                                label="Display Name"
                                value={newExtension.displayName}
                                onChange={(event) => setNewExtension((prev) => ({ ...prev, displayName: event.target.value }))}
                                required
                            />
                            <TextField
                                label="Username"
                                value={newExtension.username}
                                onChange={(event) => setNewExtension((prev) => ({ ...prev, username: event.target.value }))}
                            />
                            <TextField
                                label="Context"
                                value={newExtension.context}
                                onChange={(event) => setNewExtension((prev) => ({ ...prev, context: event.target.value }))}
                            />
                            <TextField
                                select
                                label="Status"
                                value={newExtension.status}
                                onChange={(event) => setNewExtension((prev) => ({ ...prev, status: event.target.value }))}
                            >
                                <MenuItem value="Enabled">Enabled</MenuItem>
                                <MenuItem value="Disabled">Disabled</MenuItem>
                            </TextField>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                            <TextField
                                label="Trunk Name"
                                value={newTrunk.name}
                                onChange={(event) => setNewTrunk((prev) => ({ ...prev, name: event.target.value }))}
                                required
                            />
                            <TextField
                                label="Host"
                                value={newTrunk.host}
                                onChange={(event) => setNewTrunk((prev) => ({ ...prev, host: event.target.value }))}
                                required
                            />
                            <TextField
                                type="number"
                                label="Port"
                                value={newTrunk.port}
                                onChange={(event) => setNewTrunk((prev) => ({ ...prev, port: event.target.value }))}
                            />
                            <TextField
                                select
                                label="Transport"
                                value={newTrunk.transport}
                                onChange={(event) => setNewTrunk((prev) => ({ ...prev, transport: event.target.value }))}
                            >
                                <MenuItem value="UDP">UDP</MenuItem>
                                <MenuItem value="TCP">TCP</MenuItem>
                                <MenuItem value="TLS">TLS</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Status"
                                value={newTrunk.status}
                                onChange={(event) => setNewTrunk((prev) => ({ ...prev, status: event.target.value }))}
                            >
                                <MenuItem value="Online">Online</MenuItem>
                                <MenuItem value="Offline">Offline</MenuItem>
                            </TextField>
                        </Box>
                    )}

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                        <Button variant="contained" onClick={handleCreate} sx={{ width: 100 }}>
                            Add
                        </Button>
                        <Button variant="text" onClick={() => setShowCreateForm(false)} sx={{ width: 100 }}>
                            Cancel
                        </Button>
                    </Stack>
                </Paper>
            )}

            {activeTab === 'extensions' ? (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table size="medium">
                            <TableHead sx={{ '& .MuiTableCell-head': { color: 'text.secondary' } }}>
                                <TableRow>
                                    <TableCell>Extension</TableCell>
                                    <TableCell>Display Name</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Context</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {extensions.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.extension}</TableCell>
                                        <TableCell>{row.displayName}</TableCell>
                                        <TableCell>{row.username}</TableCell>
                                        <TableCell>{row.context}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={row.status}
                                                color={row.status === 'Enabled' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table size="medium">
                            <TableHead sx={{ '& .MuiTableCell-head': { color: 'text.secondary' } }}>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Host</TableCell>
                                    <TableCell>Port</TableCell>
                                    <TableCell>Transport</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {trunks.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.host}</TableCell>
                                        <TableCell>{row.port}</TableCell>
                                        <TableCell>{row.transport}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={row.status}
                                                color={row.status === 'Online' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </PageContainer>
    );
}