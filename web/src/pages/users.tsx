import * as React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';

const userRows = [
    { id: 1, username: 'admin', fullName: 'System Administrator', role: 'Admin', extension: '1001', status: 'Active' },
    { id: 2, username: 'jsmith', fullName: 'John Smith', role: 'Supervisor', extension: '1002', status: 'Active' },
    { id: 3, username: 'adoe', fullName: 'Alice Doe', role: 'Agent', extension: '1003', status: 'Active' },
    { id: 4, username: 'bmartin', fullName: 'Bob Martin', role: 'Agent', extension: '1004', status: 'Inactive' },
    { id: 5, username: 'ckhan', fullName: 'Chris Khan', role: 'Agent', extension: '1005', status: 'Active' },
];

export default function UsersPage() {
    return (
        <PageContainer title="Users">
            <Paper>
                <TableContainer>
                    <Table size="medium">
                        <TableHead sx={{ '& .MuiTableCell-head': { color: 'text.secondary' } }}>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Extension</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userRows.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.extension}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={user.status}
                                            color={user.status === 'Active' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </PageContainer>
    );
}