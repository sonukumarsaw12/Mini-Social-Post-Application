import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Paper, Avatar, Button, Divider, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare } from 'lucide-react';
import { API_URL } from '../config';

const Search = () => {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q');
    const { user } = useAuth();
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Users
                const userRes = await axios.get(`${API_URL}/api/users/search?query=${query}`, { headers });
                setUsers(userRes.data);

                // Fetch Posts
                const postRes = await axios.get(`${API_URL}/api/posts?search=${query}`, { headers });
                setPosts(postRes.data);

                // Fetch My Details to check following status
                const meRes = await axios.get(`${API_URL}/api/auth/me`, { headers });
                setFollowing(meRes.data.following || []);

            } catch (err) {
                console.error("Error searching", err);
            }
        };

        if (query) fetchResults();
    }, [query]);

    const handleFollow = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const isFollowing = following.includes(userId);
            const endpoint = isFollowing ? 'unfollow' : 'follow';

            await axios.put(`${API_URL}/api/users/${userId}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isFollowing) {
                setFollowing(prev => prev.filter(id => id !== userId));
            } else {
                setFollowing(prev => [...prev, userId]);
            }
        } catch (err) {
            console.error("Error following/unfollowing", err);
        }
    };

    const handleLike = async (postId) => {
        const userId = user?.id || user?._id;
        if (!userId) return;

        // Optimistic Update
        setPosts(prevPosts => prevPosts.map(post => {
            if (post._id === postId) {
                const isLiked = post.likes.includes(userId);
                return {
                    ...post,
                    likes: isLiked
                        ? post.likes.filter(id => id !== userId)
                        : [...post.likes, userId]
                };
            }
            return post;
        }));

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/posts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error liking post", err);
            // Revert by re-fetching if needed, or simply let it fail silently for now
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Search Results for "{query}"</Typography>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label={`People (${users.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label={`Posts (${posts.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    {users.length === 0 && <Typography color="text.secondary">No people found.</Typography>}
                    {users.map(u => (
                        <Paper
                            key={u._id}
                            elevation={0}
                            onClick={() => navigate(`/profile/${u._id}`)}
                            sx={{
                                p: 2,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: '1px solid #e0e0e0',
                                borderRadius: '16px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'background.neutral', borderColor: 'divider' }
                            }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={u.profilePic} sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{u.username[0].toUpperCase()}</Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{u.username}</Typography>
                                    <Typography variant="body2" color="text.secondary">{u.name || `@${u.username}`}</Typography>
                                </Box>
                            </Box>
                            {user?.id !== u._id && (
                                <Button
                                    size="small"
                                    variant={following.includes(u._id) ? "outlined" : "contained"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFollow(u._id);
                                    }}
                                    sx={{ borderRadius: 50, textTransform: 'none', px: 3, fontWeight: 700 }}
                                    disableElevation
                                >
                                    {following.includes(u._id) ? 'Following' : 'Follow'}
                                </Button>
                            )}
                        </Paper>
                    ))}
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    {posts.length === 0 && <Typography color="text.secondary">No posts found.</Typography>}
                    {posts.map(post => (
                        <Paper key={post._id} elevation={0} sx={{
                            mb: 3,
                            border: '1px solid #e0e0e0',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }
                        }}>
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>{post.username[0].toUpperCase()}</Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{post.userId?.username || post.username}</Typography>
                                    <Typography variant="caption" color="text.secondary">{new Date(post.createdAt).toLocaleDateString()}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ px: 2, pb: 1 }}>
                                <Typography variant="body1" sx={{ fontSize: '1rem' }}>{post.content}</Typography>
                            </Box>
                            {post.image && (
                                <Box sx={{ width: '100%', bgcolor: 'background.neutral', display: 'flex', justifyContent: 'center' }}>
                                    <img src={post.image} alt="post" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                                </Box>
                            )}
                            <Box sx={{ p: 1.5, display: 'flex', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton onClick={() => handleLike(post._id)} size="small" sx={{ color: post.likes.includes(user?.id || user?._id) ? '#f91880' : 'inherit' }}>
                                        <Heart size={20} fill={post.likes.includes(user?.id || user?._id) ? "#f91880" : "none"} />
                                    </IconButton>
                                    <Typography variant="body2" fontWeight={600}>{post.likes.length}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton size="small">
                                        <MessageSquare size={20} />
                                    </IconButton>
                                    <Typography variant="body2" fontWeight={600}>{post.comments.length}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default Search;
