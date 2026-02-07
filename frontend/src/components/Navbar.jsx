import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar, TextField, InputAdornment, Badge, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, Heart, Sun, Moon, X, Menu as MenuIcon, User, LogOut } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../context/ThemeContext';
import { API_URL } from '../config';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const { toggleColorMode, mode } = useColorMode();
    const [searchTerm, setSearchTerm] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [showSearch, setShowSearch] = useState(false);


    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUnreadCount(res.data.count);
                } catch (err) {
                    console.error("Failed to fetch unread count", err);
                }
            }
        };

        fetchUnreadCount();
        // Poll every 10 seconds for real-time-ish updates
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleMenuClose();
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/search?q=${searchTerm}`);
            setSearchTerm('');
        }
    };

    return (
        <AppBar position="sticky" color="inherit" elevation={0} sx={{
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(224, 224, 224, 0.5)'}`,
            backdropFilter: 'blur(20px)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255,255,255,0.85)',
            transition: 'all 0.3s ease'
        }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: '64px !important', justifyContent: 'space-between' }}>
                    {/* Logo - Hide on mobile if search is open */}
                    {/* Logo - Always visible */}
                    <Typography
                        variant="h5"
                        component={Link}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 900,
                            letterSpacing: '-0.5px',
                            fontSize: { xs: '1.4rem', sm: '1.6rem' },
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        SocialPost
                    </Typography>

                    {/* Search Bar */}
                    {user && (
                        <>
                            {/* Desktop Search */}
                            <Box sx={{
                                position: { md: 'absolute' },
                                left: { md: '50%' },
                                transform: { md: 'translateX(-50%)' },
                                width: '100%',
                                maxWidth: '600px',
                                display: { xs: 'none', md: 'flex' },
                                justifyContent: 'center',
                                alignItems: 'center',
                                px: { xs: 0, md: 2 },
                                flexGrow: { xs: 1, md: 0 }
                            }}>
                                <TextField
                                    placeholder="Search users or posts..."
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearch}
                                    autoFocus={showSearch} // Auto focus when opened on mobile
                                    onBlur={() => {
                                        // Optional: close on blur if empty on mobile
                                        // if (window.innerWidth < 900 && !searchTerm) setShowSearch(false);
                                    }}
                                    sx={{
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 50,
                                            bgcolor: 'background.neutral',
                                            transition: 'all 0.2s ease',
                                            '& fieldset': { border: '1px solid transparent' },
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            },
                                            '&.Mui-focused': {
                                                bgcolor: 'background.paper',
                                                '& fieldset': { borderColor: 'primary.main', borderWidth: 1 },
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                            }
                                        },
                                        '& input': {
                                            py: 1.2,
                                            px: 2
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ pl: 1 }}>
                                                <SearchIcon size={20} color="#536471" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>


                        </>
                    )}

                    {/* Right Side Icons */}
                    {user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
                            {/* Desktop/Tablet Icons */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                                <Link to="/notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                                    <IconButton sx={{ p: 1, color: 'text.primary', '&:hover': { bgcolor: 'action.hover', color: 'secondary.main' } }}>
                                        <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 16, minWidth: 16 } }}>
                                            <Heart size={26} />
                                        </Badge>
                                    </IconButton>
                                </Link>

                                <Link to={`/profile/${user.id || user._id}`} style={{ textDecoration: 'none' }}>
                                    <Avatar
                                        src={user.profilePic}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'primary.main',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: 'background.paper',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    >
                                        {user.username[0].toUpperCase()}
                                    </Avatar>
                                </Link>

                                <IconButton onClick={toggleColorMode} sx={{ color: 'text.primary' }}>
                                    {mode === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                                </IconButton>

                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={handleLogout}
                                    sx={{
                                        borderRadius: 50,
                                        textTransform: 'none',
                                        px: 2.5,
                                        py: 0.8,
                                        borderWidth: '1.5px',
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            borderColor: 'text.primary',
                                            bgcolor: 'action.hover',
                                            color: 'text.primary'
                                        }
                                    }}
                                >
                                    Logout
                                </Button>
                            </Box>

                            {/* Mobile Menu Icon */}
                            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
                                <Link to="/notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
                                    <IconButton sx={{ color: 'text.primary' }}>
                                        <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 16, minWidth: 16 } }}>
                                            <Heart size={24} />
                                        </Badge>
                                    </IconButton>
                                </Link>
                                <IconButton onClick={handleMenuOpen} sx={{ color: 'text.primary' }}>
                                    <MenuIcon size={24} />
                                </IconButton>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    onClick={handleMenuClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1,
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={() => navigate(`/profile/${user.id || user._id}`)}>
                                        <ListItemIcon><User size={20} /></ListItemIcon>
                                        <ListItemText>Profile</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={toggleColorMode}>
                                        <ListItemIcon>
                                            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                        </ListItemIcon>
                                        <ListItemText>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon><LogOut size={20} /></ListItemIcon>
                                        <ListItemText>Logout</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={toggleColorMode} sx={{ color: 'text.primary', mr: 1 }}>
                                {mode === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                            </IconButton>
                            <Button component={Link} to="/login" variant="text" size="medium" sx={{ fontWeight: 700, borderRadius: 50, display: { xs: 'none', sm: 'block' } }}>Login</Button>
                            <Button component={Link} to="/signup" variant="contained" size="small" disableElevation sx={{ fontWeight: 700, borderRadius: 50, px: 3 }}>Signup</Button>
                        </Box>
                    )
                    }
                </Toolbar>
                {/* Mobile Search Bar - Displayed below Toolbar on xs screens */}
                {user && (
                    <Box sx={{ display: { xs: 'block', md: 'none' }, pb: 2 }}>
                        <TextField
                            placeholder="Search users or posts..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 50,
                                    bgcolor: 'background.neutral',
                                    '& fieldset': { border: '1px solid transparent' },
                                    '&.Mui-focused': {
                                        bgcolor: 'background.paper',
                                        '& fieldset': { borderColor: 'primary.main', borderWidth: 1 }
                                    }
                                },
                                '& input': { py: 1.2, px: 2 }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ pl: 1 }}>
                                        <SearchIcon size={20} color="#536471" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                )}
            </Container>
        </AppBar>
    );
};

export default Navbar;
