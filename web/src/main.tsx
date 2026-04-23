import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { Dashboard as DashboardIcon, Person as PersonIcon, BarChart as BarChartIcon, Description as DescriptionIcon, Payment as PaymentIcon } from '@mui/icons-material';

import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { Container, createSvgIcon, GlobalStyles, IconButton, SvgIcon } from '@mui/material';
import { Stack, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Settings as SettingsIcon, Emergency as AsteriskIcon} from '@mui/icons-material';
import { SnackbarProvider } from 'notistack';

import theme from './theme';
import DashboardPage from './pages/dashboard';
import ExtensionsPage from './pages/extension';
import CallRecordsPage from './pages/callrecords';
import UsersPage from './pages/users';

if (typeof window !== 'undefined') {
    window.localStorage.setItem('toolpad-mode', 'dark');
    window.localStorage.setItem('toolpad-color-scheme', 'dark');
    window.localStorage.setItem('data-toolpad-color-scheme', 'dark');
}

function LogoIcon({ size = 40, color = '#fdd835' }: { size?: number; color?: string }) {
    return (
        <svg height={size} width={size} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g fill={color}>
                <polygon points="501.539,169.221 453.886,86.7 303.669,173.449 303.669,0 208.365,0 208.365,173.479 58.114,86.73
                            10.461,169.261 160.674,255.99 10.501,342.71 58.154,425.231 208.365,338.482 208.365,512 303.669,512 303.669,338.542
                            453.846,425.271 501.499,342.74 351.267,255.99"/>
            </g>
        </svg>
    );
}

const branding = {
    logo: <LogoIcon size={32} color="#fdd835" />,
    title: 'asterisk web',
};

const navigation: Navigation = [
    { segment: 'dashboard',     title: 'Dashboard',         icon: <DashboardIcon />, },
    { kind: 'divider', },
    { kind: 'header',           title: 'Main items', },
    { segment: 'extensions',    title: 'Extensions',        icon: <PersonIcon />, },
    { segment: 'call-records',  title: 'Call Records',      icon: <PersonIcon />, },
    { segment: 'users',         title: 'Users',             icon: <PersonIcon />, },
];

export function App() {
    return (
        <ReactRouterAppProvider theme={theme}>
            <SnackbarProvider maxSnack={3} autoHideDuration={5000} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <GlobalStyles styles={{
                    html: { height: '100%' },
                    body: { height: '100%', overflowX: 'hidden', overflowY: 'auto' },
                    '#root': { height: '100%' },
                }} />
                <Outlet />
            </SnackbarProvider>
        </ReactRouterAppProvider>
    );
}

export function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        console.log('Current path:', location.pathname);
    }, [location]);

    return (
        // <DashboardLayout
        //     defaultSidebarCollapsed={true}
        //     sidebarWidth={140}
        //     slots={{
        //         sidebarFooter: ({ mini }: SidebarFooterProps) => (
        //             <Typography variant="caption" sx={{ m: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        //                 {mini ? `v${APP_VERSION}` : `© ${new Date().getFullYear()} asterisk web v${APP_VERSION}`}
        //             </Typography>
        //         ),
        //     }}
        // >
        //     <Outlet />
        // </DashboardLayout>
        <Stack direction="column">
            <AppBar position="static" color="default" elevation={1} sx={{ flexShrink: 0, backgroundColor: 'background.var1' }}>
                <Toolbar variant="dense">
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LogoIcon size={28} color="#fdd835" />
                        </Box>
                        <Box sx={{ width: 300, height: '100%', paddingRight: 2, minWidth: 200 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '100%' }}>
                                <Typography variant="h6" component="div">
                                    {branding.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="right">
                                    v{APP_VERSION}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ ml: 2, display: 'flex', height: '100%' }}>
                            {navigation.map((item) => (
                                item.kind === 'divider' ? (
                                    <Box component="span" sx={{ width: 1, bgcolor: 'transparent' }} />
                                ) : (
                                item.kind === 'header' ? (
                                    null
                                ) : (
                                    <Button
                                        key={item.segment}
                                        size="large"
                                        variant={item.segment && location.pathname.startsWith('/' + item.segment) ? 'contained' : 'text'}
                                        sx={{ minWidth: 168, height: '100%', borderRadius: 0 }}
                                        onClick={() => navigate(item.segment || '')}
                                    >
                                        {item.title}
                                    </Button>
                                ))
                            ))}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                                <IconButton>
                                    <SettingsIcon />
                                </IconButton>
                            </Stack>
                        </Box>
                    </Stack>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>
                <Outlet />
            </Box>
        </Stack>
    );
}

export const router = createBrowserRouter([{
    Component: App,
    children: [{
        path: '/',
        Component: Layout,
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', Component: DashboardPage },
            { path: 'extensions', Component: ExtensionsPage },
            { path: 'call-records', Component: CallRecordsPage },
            { path: 'users', Component: UsersPage },
        ],
    }],
}]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);