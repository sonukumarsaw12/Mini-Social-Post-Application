import React, { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { ThemeProvider as __MuiThemeProvider, createTheme } from '@mui/material/styles';
import getTheme from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode ? savedMode : 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode]
    );

    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={colorMode}>
            <__MuiThemeProvider theme={theme}>
                {children}
            </__MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useColorMode = () => useContext(ThemeContext);
