import * as React from 'react';
import { Paper, Typography, Stack, List, ListItem, ListItemText, Divider, Chip, Box } from '@mui/material';
import {
    TaskAlt as TaskAltIcon,
    PeopleAlt as PeopleAltIcon,
    CallMade as CallMadeIcon,
    CallReceived as CallReceivedIcon,
    CallMissed as CallMissedIcon,
} from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';

const serverOnline = true;
const onlineEndpoints = 4;
const totalEndpoints = 6;
const systemHealth = 'Good';
const callHistory = [
    { id: 1, from: '1001', to: '1002', time: '09:12', duration: '00:02:31', type: 'Answered', active: true },
    { id: 2, from: '1003', to: '1001', time: '09:45', duration: '00:00:00', type: 'Missed', active: false },
    { id: 3, from: '+1 555 203 8842', to: '1002', time: '10:03', duration: '00:04:18', type: 'Answered', active: false },
    { id: 4, from: '1004', to: 'Trunk-1', time: '10:26', duration: '00:01:09', type: 'Outbound', active: false },
    { id: 5, from: '1002', to: '1005', time: '10:41', duration: '00:03:22', type: 'Answered', active: false },
    { id: 6, from: '+1 555 991 7345', to: '1003', time: '10:58', duration: '00:00:00', type: 'Missed', active: false },
    { id: 7, from: '1006', to: 'Trunk-2', time: '11:07', duration: '00:05:44', type: 'Outbound', active: false },
    { id: 8, from: '1001', to: '1004', time: '11:19', duration: '00:01:37', type: 'Answered', active: false },
    { id: 9, from: '+44 20 7041 2218', to: '1002', time: '11:25', duration: '00:06:12', type: 'Answered', active: false },
    { id: 10, from: '1007', to: '1001', time: '11:42', duration: '00:00:00', type: 'Missed', active: false },
    { id: 11, from: '1005', to: 'Trunk-1', time: '12:01', duration: '00:02:05', type: 'Outbound', active: false },
    { id: 12, from: '+1 555 203 1199', to: '1006', time: '12:14', duration: '00:08:09', type: 'Answered', active: false },
    { id: 13, from: '1003', to: '1008', time: '12:27', duration: '00:01:58', type: 'Answered', active: false },
    { id: 14, from: '1008', to: '1002', time: '12:39', duration: '00:00:00', type: 'Missed', active: false },
    { id: 15, from: '1004', to: 'Trunk-3', time: '12:52', duration: '00:03:41', type: 'Outbound', active: false },
    { id: 16, from: '+49 30 9021 7744', to: '1005', time: '13:08', duration: '00:04:56', type: 'Answered', active: false },
    { id: 17, from: '1002', to: '1006', time: '13:22', duration: '00:02:49', type: 'Answered', active: false },
    { id: 18, from: '1009', to: '1001', time: '13:34', duration: '00:00:00', type: 'Missed', active: false },
    { id: 19, from: '1001', to: 'Trunk-2', time: '13:49', duration: '00:07:15', type: 'Outbound', active: false },
    { id: 20, from: '+1 555 642 0081', to: '1007', time: '14:03', duration: '00:03:03', type: 'Answered', active: false },
    { id: 21, from: '1010', to: '1003', time: '14:16', duration: '00:01:14', type: 'Answered', active: false },
    { id: 22, from: '1006', to: '1002', time: '14:29', duration: '00:00:00', type: 'Missed', active: false },
    { id: 23, from: '1005', to: 'Trunk-1', time: '14:43', duration: '00:02:27', type: 'Outbound', active: false },
    { id: 24, from: '+33 1 73 44 6621', to: '1004', time: '14:58', duration: '00:05:20', type: 'Answered', active: false },
];

export default function DashboardPage() {
    const renderCallTypeIcon = (type: string) => {
        if (type === 'Missed') {
            return <CallMissedIcon sx={{ color: 'error.main' }} />;
        }
        if (type === 'Outbound') {
            return <CallMadeIcon sx={{ color: 'warning.main' }} />;
        }
        return <CallReceivedIcon sx={{ color: 'success.main' }} />;
    };

    return (
        <PageContainer title="Dashboard">
            {/* Dashboard summary cards */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="text.secondary">
                        Asterisk Server
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5, mb: 1 }}>
                        <Typography variant="h5">
                            {serverOnline ? 'Online' : 'Offline'}
                        </Typography>
                        <TaskAltIcon sx={{ color: serverOnline ? 'success.main' : 'error.main', fontSize: 32 }} />
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="text.secondary">
                        Online Endpoints
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5, mb: 1 }}>
                        <Typography variant="h5">
                            {onlineEndpoints} / {totalEndpoints}
                        </Typography>
                        <PeopleAltIcon sx={{ color: 'info.main', fontSize: 32 }} />
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="text.secondary">
                        System Health
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5, mb: 1 }}>
                        <Typography variant="h5">
                            {systemHealth}
                        </Typography>
                        <TaskAltIcon sx={{ color: systemHealth === 'Good' ? 'success.main' : 'error.main', fontSize: 32 }} />
                    </Stack>
                </Paper>
            </Stack>

            {/* Call History List */}
            <Paper sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Call History
                </Typography>
                <List disablePadding>
                    {callHistory.map((call, index) => (
                        <React.Fragment key={call.id}>
                            <ListItem
                                sx={{
                                    px: 0,
                                    py: 1,
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '40px 2fr 2fr 1fr 1fr 1fr' },
                                    gap: 1,
                                    alignItems: 'center',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {renderCallTypeIcon(call.type)}
                                </Box>
                                <ListItemText
                                    primary="From"
                                    secondary={call.from}
                                    sx={{ m: 0, '& .MuiListItemText-primary': { fontSize: 12, color: 'text.secondary' } }}
                                />
                                <ListItemText
                                    primary="To"
                                    secondary={call.to}
                                    sx={{ m: 0, '& .MuiListItemText-primary': { fontSize: 12, color: 'text.secondary' } }}
                                />
                                <ListItemText
                                    primary="Time"
                                    secondary={call.time}
                                    sx={{ m: 0, '& .MuiListItemText-primary': { fontSize: 12, color: 'text.secondary' } }}
                                />
                                <ListItemText
                                    primary="Duration"
                                    secondary={call.duration}
                                    sx={{ m: 0, '& .MuiListItemText-primary': { fontSize: 12, color: 'text.secondary' } }}
                                />
                                <Chip
                                    size="small"
                                    label={call.type}
                                    color={call.active ? 'primary' : (call.type === 'Missed' ? 'error' : 'success')}
                                    sx={{ justifySelf: { xs: 'start', md: 'end' } }}
                                />
                            </ListItem>
                            {index < callHistory.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

        </PageContainer>
    );
}