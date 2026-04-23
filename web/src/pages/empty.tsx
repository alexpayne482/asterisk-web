import * as React from 'react';
import { Paper, Typography, IconButton, styled, ButtonProps, Stack, Box } from '@mui/material';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useSearchParams } from 'react-router';
// import { useNotification } from '../components/notifications';

export default function EmptyPage() {
    return (
        <PageContainer>
            <Typography variant="h4" gutterBottom>
                Welcome to asterisk web
            </Typography>
            <Typography variant="body1">
                This is an empty page.
            </Typography>
        </PageContainer>
    );
}