import * as React from 'react';
import {
    Paper,
    Typography,
    Stack,
    Box,
    IconButton,
    TextField,
    MenuItem,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
} from '@mui/material';
import {
    CallSplit as CallSplitIcon,
    CallReceived as CallReceivedIcon,
    CallMade as CallMadeIcon,
    Timer as TimerIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { PageContainer } from '@toolpad/core/PageContainer';

const internalCalls = 128;
const inboundCalls = 74;
const outboundCalls = 91;
const totalOutboundDuration = '08:46:12';

const callRecords = [
    { id: 1, dateTime: '2026-04-23 09:12', from: '1001', to: '1002', direction: 'Internal', duration: '00:02:31', status: 'Answered' },
    { id: 2, dateTime: '2026-04-23 09:45', from: '+1 555 203 8842', to: '1001', direction: 'Inbound', duration: '00:00:00', status: 'Missed' },
    { id: 3, dateTime: '2026-04-23 10:26', from: '1004', to: 'Trunk-1', direction: 'Outbound', duration: '00:01:09', status: 'Answered' },
    { id: 4, dateTime: '2026-04-23 10:41', from: '1002', to: '1005', direction: 'Internal', duration: '00:03:22', status: 'Answered' },
    { id: 5, dateTime: '2026-04-23 11:07', from: '1006', to: 'Trunk-2', direction: 'Outbound', duration: '00:05:44', status: 'Answered' },
    { id: 6, dateTime: '2026-04-23 11:42', from: '1007', to: '1001', direction: 'Internal', duration: '00:00:00', status: 'Missed' },
    { id: 7, dateTime: '2026-04-23 12:14', from: '+1 555 203 1199', to: '1006', direction: 'Inbound', duration: '00:08:09', status: 'Answered' },
    { id: 8, dateTime: '2026-04-23 12:52', from: '1004', to: 'Trunk-3', direction: 'Outbound', duration: '00:03:41', status: 'Answered' },
];

export default function CallRecordsPage() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [directionFilter, setDirectionFilter] = React.useState('All');
    const [statusFilter, setStatusFilter] = React.useState('All');

    const filteredCallRecords = callRecords.filter((record) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
            query.length === 0 ||
            record.from.toLowerCase().includes(query) ||
            record.to.toLowerCase().includes(query) ||
            record.dateTime.toLowerCase().includes(query);
        const matchesDirection = directionFilter === 'All' || record.direction === directionFilter;
        const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
        return matchesSearch && matchesDirection && matchesStatus;
    });

    const sortedCallRecords = [...filteredCallRecords].sort((a, b) => {
        const timeA = new Date(a.dateTime.replace(' ', 'T')).getTime();
        const timeB = new Date(b.dateTime.replace(' ', 'T')).getTime();
        return timeB - timeA;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setDirectionFilter('All');
        setStatusFilter('All');
    };

    return (
        <PageContainer title="Call Records">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="primary.main">
                        Internal Calls
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        <Typography variant="h4">
                            {internalCalls}
                        </Typography>
                        <CallSplitIcon sx={{ fontSize: 30, color: 'primary.main' }} />
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="success.main">
                        Inbound Calls
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        <Typography variant="h4">
                            {inboundCalls}
                        </Typography>
                        <CallReceivedIcon sx={{ fontSize: 30, color: 'success.main' }} />
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="warning.main">
                        Outbound Calls
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        <Typography variant="h4">
                            {outboundCalls}
                        </Typography>
                        <CallMadeIcon sx={{ fontSize: 30, color: 'warning.main' }} />
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="overline" color="info.main">
                        Outbound Duration
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        <Typography variant="h4">
                            {totalOutboundDuration}
                        </Typography>
                        <TimerIcon sx={{ fontSize: 30, color: 'info.main' }} />
                    </Stack>
                </Paper>
            </Stack>

            <Paper sx={{ mt: 2 }}>
                <Box sx={{ p: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' } }}>
                    <TextField
                        label="Search (from, to, date/time)"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        size="small"
                    />
                    <TextField
                        select
                        label="Direction"
                        value={directionFilter}
                        onChange={(event) => setDirectionFilter(event.target.value)}
                        size="small"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Internal">Internal</MenuItem>
                        <MenuItem value="Inbound">Inbound</MenuItem>
                        <MenuItem value="Outbound">Outbound</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Status"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        size="small"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Answered">Answered</MenuItem>
                        <MenuItem value="Missed">Missed</MenuItem>
                    </TextField>
                    <IconButton aria-label="Clear filters" onClick={clearFilters}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <TableContainer>
                    <Table size="medium">
                        <TableHead sx={{ '& .MuiTableCell-head': { color: 'text.secondary' } }}>
                            <TableRow>
                                <TableCell>Date / Time</TableCell>
                                <TableCell>From</TableCell>
                                <TableCell>To</TableCell>
                                <TableCell>Direction</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedCallRecords.map((record) => (
                                <TableRow key={record.id} hover>
                                    <TableCell>{record.dateTime}</TableCell>
                                    <TableCell>{record.from}</TableCell>
                                    <TableCell>{record.to}</TableCell>
                                    <TableCell>{record.direction}</TableCell>
                                    <TableCell>{record.duration}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={record.status}
                                            color={record.status === 'Missed' ? 'error' : 'success'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sortedCallRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                        No call records match the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </PageContainer>
    );
}