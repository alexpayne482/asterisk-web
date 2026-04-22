
"use client";
import { createTheme } from '@mui/material/styles';
import { red, lightGreen as green, lightBlue as blue, yellow, pink, purple, orange, teal, grey } from '@mui/material/colors';

const theme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    defaultColorScheme: 'dark',
    typography: {
        fontSize: 14,
    },
    components: {
    },
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    main: blue[300],
                    light: blue[100],
                    dark: blue[500],
                    contrastText: 'rgba(0, 0, 0, 0.87)',
                },
                secondary: {
                    main: 'rgba(65, 167, 214, 1)',
                },
                success: {
                    main: green[500],
                    light: green[300],
                    dark: green[700],
                },
                error: {
                    main: red[500],
                    light: red[300],
                    dark: red[700],
                },
                background: {
                    default: 'rgb(255, 255, 255)',
                    paper: 'rgb(240, 240, 240)',
                    selected: 'rgba(0, 0, 0, 0.16)',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                    disabled: 'rgba(0, 0, 0, 0.38)',
                },
            }
        },
        dark: {
            palette: {
                primary: {
                    main: blue[400],
                    light: blue[300],
                    dark: blue[800],
                    contrastText: 'rgba(0, 0, 0, 0.87)'
                },
                secondary: {
                    main: 'rgba(65, 167, 214, 1)',
                },
                success: {
                    main: green[500],
                    light: green[300],
                    dark: green[700],
                },
                error: {
                    main: red[500],
                    light: red[300],
                    dark: red[700],
                },
                background: {
                    default: 'rgb(18, 18, 18)',
                    paper: 'rgb(14, 14, 14)',
                    selected: 'rgba(255, 255, 255, 0.18)',
                },
                text: {
                    primary: 'rgba(255, 255, 255, 0.9)',
                    secondary: 'rgba(255, 255, 255, 0.7)',
                    disabled: 'rgba(255, 255, 255, 0.4)',
                },
                action: {
                    hover: 'rgba(255, 255, 255, 0.08)',
                    selected: 'rgba(255, 255, 255, 0.16)',
                    selectedOpacity: 0.16,
                },
            },
        },
    },
});

export default theme;
