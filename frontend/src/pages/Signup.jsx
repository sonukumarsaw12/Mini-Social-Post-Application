import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link as MuiLink, useTheme, useMediaQuery } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(username, email, password);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || "Signup failed");
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Side - Visuals (Reversed logic or same side?) Let's keep visuals on left for consistency */}
            {!isMobile && (
                <Box sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', // Different gradient for variety
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
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>Join Us</Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 500, maxWidth: 500 }}>
                            Be part of the community and start collecting your memories.
                        </Typography>
                    </Box>
                    <Box sx={{
                        position: 'absolute', top: -100, right: -100, width: 400, height: 400,
                        borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)'
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: -50, left: -50, width: 300, height: 300,
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
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>Create Account</Typography>
                        <Typography variant="body1" color="text.secondary">It's free and easy.</Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 3 } }}
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
                                bgcolor: 'secondary.main', // Pink button for signup
                                '&:hover': { bgcolor: 'secondary.dark' },
                                boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)'
                            }}
                        >
                            Sign Up
                        </Button>

                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <MuiLink
                                    component={Link}
                                    to="/login"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'secondary.main',
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Log in
                                </MuiLink>
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Signup;
