import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, TextField, Button, Paper, Typography, Avatar, IconButton, Divider, LinearProgress, Popover } from '@mui/material';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Image as ImageIcon, Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const { user } = useAuth();

    // File upload ref and state
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(null);

    const [following, setFollowing] = useState([]);

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/posts`);
            setPosts(res.data);
        } catch (err) {
            console.error("Error fetching posts", err);
        }
    };

    const fetchFollowing = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await axios.get(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFollowing(res.data.following || []);
            }
        } catch (err) {
            console.error("Error fetching following list", err);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchFollowing();
    }, []);

    // ... (rest of the file until return)

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImageUrl(URL.createObjectURL(file)); // For preview
        }
    };

    const onEmojiClick = (emojiObject) => {
        setContent(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(null);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim() && !imageUrl.trim() && !selectedFile) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('content', content);

            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (imageUrl) {
                formData.append('image', imageUrl);
            }

            await axios.post(`${API_URL}/api/posts`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );
            setContent('');
            setImageUrl('');
            setSelectedFile(null);
            fetchPosts();
        } catch (err) {
            alert("Error creating post");
        } finally {
            setIsUploading(false);
        }
    };

    const handleLike = async (postId) => {
        const userId = user.id || user._id;

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
            // No need to fetchPosts() if successful, as state is already updated
        } catch (err) {
            console.error("Error liking post", err);
            // Revert state if error (optional, but good for data integrity)
            fetchPosts();
        }
    };

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

    const [commentText, setCommentText] = useState({});
    const handleComment = async (postId) => {
        const text = commentText[postId];
        if (!text?.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/posts/${postId}/comment`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCommentText({ ...commentText, [postId]: '' });
            fetchPosts();
        } catch (err) {
            console.error("Error commenting", err);
        }
    };

    const [replyText, setReplyText] = useState({});
    const [activeReply, setActiveReply] = useState(null);

    const handleReplySubmit = async (postId, commentId) => {
        const text = replyText[commentId];
        if (!text?.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/posts/${postId}/comment/${commentId}/reply`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReplyText({ ...replyText, [commentId]: '' });
            setActiveReply(null);
            fetchPosts();
        } catch (err) {
            console.error("Error replying", err);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, pb: 8 }}>
            {/* Create Post Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {isUploading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: '1.2rem' }} src={user?.profilePic}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                    <Box sx={{ flexGrow: 1, px: 2, py: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            placeholder="What's happening?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                                sx: { fontSize: '1.2rem', fontWeight: 400 }
                            }}
                            sx={{ mt: 0 }}
                            disabled={isUploading}
                        />
                    </Box>
                </Box>
                {imageUrl && (
                    <Box sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center', bgcolor: 'background.neutral' }}>
                        <img
                            src={imageUrl}
                            alt="Preview"
                            style={{
                                width: '100%',
                                maxHeight: '600px',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>
                )}
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            disabled={isUploading}
                        />
                        <IconButton onClick={() => fileInputRef.current.click()} size="small" sx={{ color: 'primary.main', bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light', color: 'white' }, p: 1 }} disabled={isUploading}>
                            <ImageIcon size={20} />
                        </IconButton>
                        <IconButton onClick={(e) => setShowEmojiPicker(e.currentTarget)} size="small" sx={{ color: 'primary.main', bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light', color: 'white' }, p: 1 }} disabled={isUploading}>
                            <Smile size={20} />
                        </IconButton>
                        <Popover
                            open={Boolean(showEmojiPicker)}
                            anchorEl={showEmojiPicker}
                            onClose={() => setShowEmojiPicker(null)}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </Popover>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleCreatePost}
                        disabled={(!content.trim() && !imageUrl.trim() && !selectedFile) || isUploading}
                        sx={{ borderRadius: 50, px: 4, textTransform: 'none', fontWeight: 700, fontSize: '1rem' }}
                        disableElevation
                    >
                        {isUploading ? 'Posting...' : 'Post'}
                    </Button>
                </Box>
            </Paper>

            {/* Feed Section */}
            {posts.map((post) => (
                <Paper key={post._id} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' } }}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Link to={`/profile/${post.userId._id || post.userId}`} style={{ textDecoration: 'none' }}>
                            <Avatar
                                sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}
                                src={post.userId?.profilePic}
                            >
                                {post.username[0].toUpperCase()}
                            </Avatar>
                        </Link>
                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Link to={`/profile/${post.userId._id || post.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{post.userId?.username || post.username}</Typography>
                                    </Link>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(post.createdAt).toLocaleString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </Typography>
                                </Box>
                                {user && (user.id !== (post.userId._id || post.userId) && user._id !== (post.userId._id || post.userId)) && (
                                    <Button
                                        size="small"
                                        variant={following.includes(post.userId._id || post.userId) ? "outlined" : "contained"}
                                        onClick={() => handleFollow(post.userId._id || post.userId)}
                                        sx={{
                                            borderRadius: 20,
                                            textTransform: 'none',
                                            height: 28,
                                            minWidth: 80,
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            boxShadow: 'none',
                                            '&:hover': {
                                                boxShadow: 'none',
                                                bgcolor: following.includes(post.userId._id || post.userId) ? 'transparent' : 'primary.dark'
                                            }
                                        }}
                                    >
                                        {following.includes(post.userId._id || post.userId) ? 'Following' : 'Follow'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ px: 2, pb: 1 }}>
                        <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1.5 }}>{post.content}</Typography>
                    </Box>

                    {post.image && (
                        <Box
                            onDoubleClick={() => handleLike(post._id)}
                            sx={{
                                width: '100%',
                                maxHeight: '600px',
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: 'background.neutral',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            <img
                                src={post.image}
                                alt="post"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '600px',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                        </Box>
                    )}

                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(() => {
                            const currentUserId = user?.id || user?._id;
                            const isLiked = post.likes.includes(currentUserId);
                            return (
                                <IconButton onClick={() => handleLike(post._id)} sx={{ borderRadius: 2 }}>
                                    <Heart
                                        size={20}
                                        fill={isLiked ? "#f91880" : "none"}
                                        color={isLiked ? "#f91880" : "#536471"}
                                        style={{
                                            transition: 'transform 0.2s',
                                            transform: isLiked ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, color: isLiked ? "#f91880" : "text.secondary" }}>{post.likes.length || ''}</Typography>
                                </IconButton>
                            );
                        })()}

                        <IconButton sx={{ borderRadius: 2, color: 'text.secondary' }}>
                            <MessageSquare size={20} />
                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>{post.comments.length || ''}</Typography>
                        </IconButton>
                    </Box>

                    {/* Comments Section */}
                    <Box sx={{ px: 2, pb: 2 }}>
                        {post.comments.length > 0 && (
                            <Box sx={{ mb: 2, bgcolor: 'background.neutral', p: 2, borderRadius: 3 }}>
                                {post.comments.map((comment, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.primary">
                                            <strong>{comment.username}:</strong> {comment.text}
                                        </Typography>
                                        <Button
                                            size="small"
                                            sx={{ fontSize: '0.7rem', textTransform: 'none', color: 'text.secondary', p: 0, minWidth: 0, mt: 0.5 }}
                                            onClick={() => setActiveReply(activeReply?.commentId === comment._id ? null : { postId: post._id, commentId: comment._id })}
                                        >
                                            Reply
                                        </Button>

                                        {comment.replies && comment.replies.length > 0 && (
                                            <Box sx={{ ml: 3, mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                                                {comment.replies.map((reply, rIdx) => (
                                                    <Box key={rIdx} sx={{ mb: 0.5 }}>
                                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }} color="text.secondary">
                                                            <strong>{reply.username}:</strong> {reply.text}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {activeReply?.commentId === comment._id && (
                                            <Box sx={{ mt: 1, ml: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    variant="standard"
                                                    placeholder={`Reply to ${comment.username}...`}
                                                    value={replyText[comment._id] || ''}
                                                    onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                                                    InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem' } }}
                                                />
                                                <Button size="small" onClick={() => handleReplySubmit(post._id, comment._id)} disabled={!replyText[comment._id]?.trim()}>Send</Button>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light' }} src={user?.profilePic} />
                            <Box sx={{ display: 'flex', flexGrow: 1, bgcolor: 'background.neutral', borderRadius: 4, px: 2, py: 0.5, alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    placeholder="Write a comment..."
                                    value={commentText[post._id] || ''}
                                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                    InputProps={{ disableUnderline: true }}
                                />
                                <IconButton size="small" onClick={() => handleComment(post._id)} disabled={!commentText[post._id]?.trim()} color="primary">
                                    <Send size={16} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Container>
    );
};

export default Feed;
