import * as React from 'react';
import { Paper, Typography, Stack, Fab, Tabs, Tab, TextField, Button, MenuItem, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useSearchParams } from 'react-router';

import { useNotification } from '../components/notifications';
import EndpointsGrid from '../components/endpointsGrid';
import TrunksGrid from '../components/trunksGrid';

export default function ExtensionsPage() {
    const { showNotification } = useNotification();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'trunks' ? 'trunks' : 'extensions';
    const [showCreateForm, setShowCreateForm] = React.useState(false);

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

            // TODO: Implement actual extension creation via AMI action
            // For now, just show a notification and reset the form
            showNotification(`Extension ${newExtension.extension} (${newExtension.displayName}) created successfully`, 'success');

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

            // TODO: Implement actual trunk creation via AMI action
            // For now, just show a notification and reset the form
            showNotification(`Trunk ${newTrunk.name} (${newTrunk.host}) created successfully`, 'success');

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
                    <EndpointsGrid />
                </Paper>
            ) : (
                <Paper sx={{ mt: 2 }}>
                    <TrunksGrid />
                </Paper>
            )}
        </PageContainer>
    );
}