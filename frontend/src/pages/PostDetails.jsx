import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress, Typography, Paper, Avatar, IconButton, Divider, TextField, Button } from '@mui/material';
import axios from 'axios';
import { Heart, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const PostDetails = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/posts/${postId}`);
                setPost(res.data);
            } catch (err) {
                console.error("Error fetching post", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/posts/${post._id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPost(res.data);
        } catch (err) {
            console.error("Error liking post", err);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/posts/${post._id}/comment`, { text: commentText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPost(res.data);
            setCommentText('');
        } catch (err) {
            console.error("Error commenting", err);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!post) return <Typography sx={{ textAlign: 'center', mt: 4 }}>Post not found</Typography>;

    const isLiked = post.likes.includes(user?._id || user?.id);

    return (
        <Container maxWidth="sm" sx={{ mt: 2, pb: 4 }}>
            <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.primary' }}>
                Back
            </Button>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={post.userId?.profilePic} sx={{ bgcolor: 'secondary.main' }}>
                        {post.userId?.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{post.userId?.username}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ px: 2, pb: 1 }}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1.5 }}>{post.content}</Typography>
                </Box>
                {post.image && (
                    <Box sx={{ width: '100%', bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                        <img src={post.image} alt="post" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                    </Box>
                )}

                {/* Actions */}
                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={handleLike}>
                        <Heart size={24} fill={isLiked ? "#f91880" : "none"} color={isLiked ? "#f91880" : "#536471"} />
                    </IconButton>
                    <Typography>{post.likes.length}</Typography>

                    <IconButton sx={{ ml: 2 }}>
                        <MessageSquare size={24} color="#536471" />
                    </IconButton>
                    <Typography>{post.comments.length}</Typography>
                </Box>

                <Divider />

                {/* Comments List */}
                <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', mb: 3, fontWeight: 800 }}>Comments</Typography>
                    {post.comments.length === 0 && <Typography color="text.secondary" variant="body2" align="center">No comments yet. Be the first!</Typography>}

                    {post.comments.map((comment, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Avatar src={comment.userId?.profilePic} sx={{ width: 36, height: 36, fontSize: '0.9rem', border: '2px solid', borderColor: 'background.paper' }}>
                                {comment.userId?.username?.[0]}
                            </Avatar>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: '0px 16px 16px 16px', border: '1px solid', borderColor: 'divider', width: 'fit-content', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5, color: 'text.primary' }}>
                                        {comment.username}
                                    </Typography>
                                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>{comment.text}</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ ml: 1, mt: 0.5, color: 'text.secondary', fontWeight: 500 }}>Reply • Like</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Comment Input */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar src={user?.profilePic} sx={{ width: 32, height: 32 }} />
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 50,
                                bgcolor: 'background.neutral',
                                '& fieldset': { border: 'none' },
                                '&.Mui-focused': { bgcolor: 'background.paper', '& fieldset': { border: '1px solid #6366f1' } }
                            }
                        }}
                    />
                    <IconButton color="primary" onClick={handleComment} disabled={!commentText.trim()} sx={{ bgcolor: '#e0e7ff', '&:hover': { bgcolor: '#c7d2fe' } }}>
                        <Send size={18} />
                    </IconButton>
                </Box>
            </Paper>
        </Container>
    );
};

export default PostDetails;
