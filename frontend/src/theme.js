import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light Mode
                primary: {
                    main: '#6366f1',
                    light: '#818cf8',
                    dark: '#4f46e5',
                },
                secondary: {
                    main: '#ec4899',
                    light: '#f472b6',
                    dark: '#db2777'
                },
                background: {
                    default: '#f8fafc',
                    paper: '#ffffff',
                    neutral: '#f1f5f9', // Added for custom components
                },
                text: {
                    primary: '#0f172a',
                    secondary: '#64748b',
                }
            }
            : {
                // Dark Mode
                primary: {
                    main: '#818cf8', // Lighter for better visibility on dark
                    light: '#a5b4fc',
                    dark: '#6366f1',
                },
                secondary: {
                    main: '#f472b6',
                    light: '#fbcfe8',
                    dark: '#ec4899'
                },
                background: {
                    default: '#0f172a', // Slate-900
                    paper: '#1e293b',   // Slate-800
                    neutral: '#334155', // Slate-700
                },
                text: {
                    primary: '#f1f5f9', // Slate-100
                    secondary: '#94a3b8', // Slate-400
                }
            }),
    },
    typography: {
        fontFamily: '"Outfit", sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    },
                },
                contained: {
                    boxShadow: 'none',
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation0: {
                    boxShadow: 'none',
                    border: mode === 'light' ? '1px solid #dfe1e5' : '1px solid #334155', // Dynamic border
                },
                elevation1: {
                    boxShadow: mode === 'light'
                        ? '0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)'
                        : '0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
                    border: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)',
                        '& fieldset': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                        },
                    }
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                }
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: mode === 'dark' ? "#6b7280 #1e293b" : "#94a3b8 #f1f5f9",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: mode === 'dark' ? "#1e293b" : "#f1f5f9",
                        width: '8px',
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: mode === 'dark' ? "#6b7280" : "#94a3b8",
                        minHeight: 24,
                    },
                }
            }
        }
    },
});

export default getTheme;
