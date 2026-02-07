import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link as MuiLink, Grid, useTheme, useMediaQuery } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Side - Visuals */}
            {!isMobile && (
                <Box sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>SocialPost</Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 500, maxWidth: 500 }}>
                            Connect with friends, share your moments, and explore the world.
                        </Typography>
                    </Box>
                    {/* Decorative Circles */}
                    <Box sx={{
                        position: 'absolute', top: -100, left: -100, width: 400, height: 400,
                        borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)'
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: -50, right: -50, width: 300, height: 300,
                        borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)'
                    }} />
                </Box>
            )}

            {/* Right Side - Form */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                bgcolor: 'background.default'
            }}>
                <Container maxWidth="xs">
                    <Box sx={{ mb: 4, textAlign: isMobile ? 'center' : 'left' }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>Welcome Back</Typography>
                        <Typography variant="body1" color="text.secondary">Please enter your details to sign in.</Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'background.paper',
                                    borderRadius: 3
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'background.paper',
                                    borderRadius: 3
                                }
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            sx={{
                                py: 1.8,
                                fontSize: '1rem',
                                borderRadius: 50,
                                textTransform: 'none',
                                fontWeight: 700,
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)'
                            }}
                        >
                            Sign In
                        </Button>

                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <MuiLink
                                    component={Link}
                                    to="/signup"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Create account
                                </MuiLink>
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Login;
