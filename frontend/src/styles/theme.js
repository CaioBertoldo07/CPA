import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1D5E24', // Forest Green
            light: '#4B8B4E',
            dark: '#003400',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#2D3748', // Text Main / Dark Gray
            light: '#718096', // Text Muted
            dark: '#1A202C',
            contrastText: '#ffffff',
        },
        error: {
            main: '#E53E3E',
        },
        background: {
            default: '#F8FAFC',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none', // Prevent all-caps buttons
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
    },
});

export default theme;
