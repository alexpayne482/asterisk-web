import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { Dashboard as DashboardIcon, Person as PersonIcon, BarChart as BarChartIcon, Description as DescriptionIcon, Payment as PaymentIcon } from '@mui/icons-material';

import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { Container, GlobalStyles, IconButton } from '@mui/material';
import { Stack, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Settings as SettingsIcon} from '@mui/icons-material';
import { SnackbarProvider } from 'notistack';

import theme from './theme';
import EmptyPage from './pages/empty';

if (typeof window !== 'undefined') {
    window.localStorage.setItem('toolpad-mode', 'dark');
    window.localStorage.setItem('toolpad-color-scheme', 'dark');
    window.localStorage.setItem('data-toolpad-color-scheme', 'dark');
}

const Logo = () => (
    <img src="logo.png" alt="Logo" color='white'/>
);

const branding = {
    logo: <Logo />,
    title: 'aStar',
};

const navigation: Navigation = [
    { segment: '',              title: 'Dashboard',     icon: <DashboardIcon />, },
    { kind: 'divider', },
    { kind: 'header',           title: 'Main items', },
    { segment: 'todo',          title: 'TBD',           icon: <PersonIcon />, },
];

export function App() {
    return (
        <ReactRouterAppProvider branding={branding} navigation={navigation} theme={theme}>
            <SnackbarProvider maxSnack={3} autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <GlobalStyles styles={{
                    html: { height: '100%' },
                    body: { height: '100%', overflow: 'hidden' },
                    '#root': { height: '100%' },
                }} />
                <Outlet />
            </SnackbarProvider>
        </ReactRouterAppProvider>
    );
}

export function Layout() {
    return (
        <DashboardLayout
            defaultSidebarCollapsed={false}
            sidebarWidth={140}
            slots={{
                sidebarFooter: ({ mini }: SidebarFooterProps) => (
                    <Typography variant="caption" sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {mini ? `v${APP_VERSION}` : `© ${new Date().getFullYear()} aStar v${APP_VERSION}`}
                    </Typography>
                ),
            }}
        >
            <Outlet />
        </DashboardLayout>
    );
}

export const router = createBrowserRouter([{
    Component: App,
    children: [{
        path: '/',
        Component: Layout,
        children: [
            { index: true, element: <Navigate to="overview" replace /> },
            { path: 'overview', Component: EmptyPage },
        ],
    }],
}]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);