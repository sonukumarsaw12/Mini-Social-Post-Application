import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Box, Avatar, Button, Divider, CircularProgress, Grid, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, Menu, MenuItem, Snackbar, Alert, DialogContentText, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Heart, MessageSquare, Send, X, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const CustomInput = ({ label, value, onChange, multiline = false }) => (
    <Box sx={{ mb: 2, bgcolor: 'background.neutral', borderRadius: 2, border: '1px solid transparent', overflow: 'hidden', '&:focus-within': { border: '1px solid #1976d2', bgcolor: 'background.paper' } }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', px: 2, pt: 1, display: 'block' }}>
            {label}
        </Typography>
        <TextField
            fullWidth
            variant="standard"
            value={value}
            onChange={onChange}
            multiline={multiline}
            rows={multiline ? 3 : 1}
            InputProps={{
                disableUnderline: true,
                style: { color: 'inherit', padding: '4px 16px 12px 16px', fontSize: '1rem' }
            }}
        />
    </Box>
);

const Profile = () => {
    const { userId } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user: currentUser, updateUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    // Derived state for local updates
    const [commentText, setCommentText] = useState({});
    const [replyText, setReplyText] = useState({});
    const [activeReply, setActiveReply] = useState(null);
    const [showComments, setShowComments] = useState({}); // Track expanded comments per post

    // Edit & Delete State
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [activePostId, setActivePostId] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Users List State (Followers/Following)
    const [userListOpen, setUserListOpen] = useState(false);
    const [listType, setListType] = useState('followers'); // 'followers' or 'following'
    const [userList, setUserList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);

    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
    const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

    // Helper to check post ownership
    const isOwner = (post) => {
        if (!currentUser) return false;
        const currentUserId = String(currentUser.id || currentUser._id);
        const postOwnerId = String(post.userId?._id || post.userId);
        return currentUserId === postOwnerId;
    };

    const handleMenuOpen = (e, postId) => {
        setMenuAnchor(e.currentTarget);
        setActivePostId(postId);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setActivePostId(null);
    };

    const handleEditClick = (post) => {
        setEditingPostId(post._id);
        setEditContent(post.content);
        handleMenuClose();
    };

    const handleUpdatePost = async () => {
        if (!editContent.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/posts/${editingPostId}`,
                { content: editContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPosts(prev => prev.map(p => p._id === editingPostId ? res.data : p));
            setEditingPostId(null);
            setEditContent('');
            showSnackbar("Post updated");
        } catch (err) {
            console.error("Error updating post", err);
            showSnackbar("Failed to update post", "error");
        }
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
        setItemToDelete(activePostId);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/posts/${itemToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(prev => prev.filter(p => p._id !== itemToDelete));
            showSnackbar("Post deleted");
        } catch (err) {
            console.error("Error deleting post", err);
            showSnackbar("Failed to delete post", "error");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [userRes, postsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/users/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/api/posts/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                console.log("Fetched Posts:", postsRes.data);
                setProfileUser(userRes.data);
                setPosts(postsRes.data);

                // Check if current user is following this profile
                const currentUserId = currentUser?.id || currentUser?._id;
                if (userRes.data.followers.some(id => String(id) === String(currentUserId))) {
                    setIsFollowing(true);
                } else {
                    setIsFollowing(false);
                }
            } catch (err) {
                console.error("Error fetching profile data", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId && currentUser) {
            fetchData();
        }
    }, [userId, currentUser]);

    const handleFollow = async (targetUserId = userId) => {
        try {
            const token = localStorage.getItem('token');
            // Check if we are following the target user.
            // If targetUserId is the profile owner, use isFollowing state.
            // If it's a user in the list, check if they are in the current user's following list (we might need to track this better, but for now let's assume we can check profileUser.followers if we are viewing the signed-in user's profile, OR we just toggle based on button state in the list).
            // Actually, for the list, we should probably check if *currentUser* follows them.
            // Let's simplify: `handleFollow` in list will need to update the list state too.

            const isTargetProfile = targetUserId === userId;
            const currentlyFollowing = isTargetProfile
                ? isFollowing
                : userList.find(u => u._id === targetUserId)?.isFollowing; // We need to know if we follow them. 

            // Wait, the backend doesn't return "isFollowing" for the list. 
            // We can check if `currentUser.following` contains the `targetUserId`.
            // But `currentUser` from auth context might not be up-to-date with every follow action unless we update it.
            // For now, let's rely on looking up in `currentUser.following` if available, or just toggle.

            // Better approach for List: Pass the current status explicitly or derive it.
            // Let's refactor handleFollow to be more generic or create a separate one for list.

            // Let's stick to the main profile follow for now, and distinct one for list.
        } catch (err) {
            console.error("Error toggling follow", err);
        }
    };

    // Refactored handleFollow for Profile Page Button
    const handleProfileFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = isFollowing ? 'unfollow' : 'follow';

            await axios.put(`${API_URL}/api/users/${userId}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsFollowing(!isFollowing);

            // Update follower count locally
            const currentUserId = currentUser?.id || currentUser?._id;
            setProfileUser(prev => ({
                ...prev,
                followers: isFollowing
                    ? prev.followers.filter(id => String(id) !== String(currentUserId))
                    : [...prev.followers, currentUserId]
            }));

            // Also update currentUser context if needed, but skipping for now to avoid complexity
        } catch (err) {
            console.error("Error toggling follow", err);
        }
    };

    const handleListFollow = async (targetUser) => {
        try {
            const token = localStorage.getItem('token');
            const isFollowingTarget = currentUser.following.includes(targetUser._id);
            // Note: currentUser.following might be IDs.

            const endpoint = isFollowingTarget ? 'unfollow' : 'follow';
            await axios.put(`${API_URL}/api/users/${targetUser._id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update currentUser in context to reflect change (crucial for UI update)
            if (isFollowingTarget) {
                updateUser({ ...currentUser, following: currentUser.following.filter(id => id !== targetUser._id) });
            } else {
                updateUser({ ...currentUser, following: [...currentUser.following, targetUser._id] });
            }

        } catch (err) {
            console.error("Error toggling follow from list", err);
        }
    };

    const fetchFriends = async (type) => {
        setLoadingList(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/users/${userId}/friends`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserList(res.data[type]);
        } catch (err) {
            console.error("Error fetching friends", err);
        } finally {
            setLoadingList(false);
        }
    };

    const handleOpenList = (type) => {
        setListType(type);
        setUserListOpen(true);
        fetchFriends(type);
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/posts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedPosts = posts.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(currentUser.id);
                    return {
                        ...p,
                        likes: isLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id]
                    };
                }
                return p;
            });
            setPosts(updatedPosts);
        } catch (err) {
            console.error("Error liking post", err);
        }
    };

    const handleComment = async (postId) => {
        const text = commentText[postId];
        if (!text?.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/posts/${postId}/comment`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedPosts = posts.map(p => {
                if (p._id === postId) {
                    return res.data;
                }
                return p;
            });
            setPosts(updatedPosts);
            setCommentText({ ...commentText, [postId]: '' });
        } catch (err) {
            console.error("Error commenting", err);
        }
    };

    const handleReplySubmit = async (postId, commentId) => {
        const text = replyText[commentId];
        if (!text?.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/posts/${postId}/comment/${commentId}/reply`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedPosts = posts.map(p => {
                if (p._id === postId) {
                    return res.data;
                }
                return p;
            });
            setPosts(updatedPosts);
            setReplyText({ ...replyText, [commentId]: '' });
            setActiveReply(null);
        } catch (err) {
            console.error("Error replying", err);
        }
    };

    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setIsUploadingProfilePic(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/users/${userId}/profile-pic`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setProfileUser(prev => ({ ...prev, profilePic: res.data.profilePic }));
            updateUser({ ...currentUser, profilePic: res.data.profilePic });
        } catch (err) {
            console.error("Error updating profile picture", err);
        } finally {
            setIsUploadingProfilePic(false);
        }
    };

    // Edit Profile Logic
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', username: '', bio: '', pronouns: '' });

    useEffect(() => {
        if (profileUser) {
            setEditForm({
                name: profileUser.name || '',
                username: profileUser.username || '',
                bio: profileUser.bio || '',
                pronouns: profileUser.pronouns || ''
            });
        }
    }, [profileUser]);

    const handleEditSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/users/${userId}/profile`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileUser(res.data);
            updateUser(res.data);
            setOpenEditModal(false);
        } catch (err) {
            console.error("Error updating profile", err);
            alert(err.response?.data?.message || "Error updating profile");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!profileUser) return <Typography align="center" sx={{ mt: 4 }}>User not found</Typography>;

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!profileUser) return <Typography align="center" sx={{ mt: 4 }}>User not found</Typography>;

    return (
        <Container maxWidth="sm" sx={{ mt: 2, pb: 8 }}>


            {/* Header Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {/* Profile Picture Section - Only clickable for upload if current user */}
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                        {currentUser && currentUser.id === userId ? (
                            <label htmlFor="profile-pic-upload">
                                <input
                                    accept="image/*"
                                    id="profile-pic-upload"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    disabled={isUploadingProfilePic}
                                />
                                <Avatar
                                    sx={{
                                        width: { xs: 80, sm: 120 },
                                        height: { xs: 80, sm: 120 },
                                        bgcolor: 'primary.main',
                                        fontSize: { xs: '2rem', sm: '3rem' },
                                        cursor: 'pointer',
                                        opacity: isUploadingProfilePic ? 0.5 : 1,
                                        '&:hover': { opacity: 0.8 },
                                        border: '4px solid #fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    src={profileUser.profilePic}
                                >
                                    {profileUser.username[0].toUpperCase()}
                                </Avatar>
                            </label>
                        ) : (
                            <Avatar
                                sx={{
                                    width: { xs: 80, sm: 120 },
                                    height: { xs: 80, sm: 120 },
                                    bgcolor: 'primary.main',
                                    fontSize: { xs: '2rem', sm: '3rem' },
                                    border: '4px solid #fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                src={profileUser.profilePic}
                            >
                                {profileUser.username[0].toUpperCase()}
                            </Avatar>
                        )}

                        {isUploadingProfilePic && (
                            <CircularProgress
                                size={40}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-20px',
                                    marginLeft: '-20px',
                                    color: 'primary.main',
                                    pointerEvents: 'none'
                                }}
                            />
                        )}
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{profileUser.name || profileUser.username}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>@{profileUser.username}</Typography>
                    {profileUser.pronouns && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>{profileUser.pronouns}</Typography>
                    )}
                    {profileUser.bio && (
                        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', px: { xs: 1, sm: 4 }, color: 'text.primary', lineHeight: 1.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{profileUser.bio}</Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: { xs: 4, sm: 6 }, mb: 4 }}>
                        <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleOpenList('following')}>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{profileUser.following.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Following</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleOpenList('followers')}>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{profileUser.followers.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Followers</Typography>
                        </Box>
                    </Box>

                    {currentUser && (currentUser._id === userId || currentUser.id === userId) ? (
                        <Button
                            variant="outlined"
                            onClick={() => setOpenEditModal(true)}
                            sx={{
                                borderRadius: 50,
                                textTransform: 'none',
                                px: { xs: 4, sm: 6 },
                                py: 1,
                                borderWidth: '1.5px',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.primary',
                                '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
                            }}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Button
                            variant={isFollowing ? "outlined" : "contained"}
                            onClick={handleProfileFollow}
                            sx={{ borderRadius: 50, textTransform: 'none', px: { xs: 4, sm: 6 }, py: 1, fontWeight: 700, boxShadow: 'none' }}
                            disableElevation
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                    )}
                </Box>

                {/* Tabs / Filter Placeholder */}
                <Box sx={{ mt: 4, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-around' }}>
                    <Box sx={{ pb: 1.5, borderBottom: '3px solid', borderColor: 'primary.main', width: '33%', textAlign: 'center', cursor: 'pointer' }}>
                        <Typography sx={{ color: 'text.primary', fontWeight: 700 }}>Posts ({posts.length})</Typography>
                    </Box>
                    <Box sx={{ pb: 1.5, width: '33%', textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                        <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Liked</Typography>
                    </Box>
                    <Box sx={{ pb: 1.5, width: '33%', textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                        <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Commented</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Posts Feed */}
            <Box>
                {posts.map((post) => (
                    <Paper key={post._id} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' } }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }} src={post.userId?.profilePic || profileUser.profilePic}>
                                {post.username[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{post.userId?.username || post.username}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(post.createdAt).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </Typography>
                                    </Box>

                                    {isOwner(post) && (
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, post._id)}>
                                            <MoreVertical size={20} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ px: 2, pb: 1 }}>
                            {editingPostId === post._id ? (
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        variant="outlined"
                                        sx={{ mb: 1, bgcolor: 'background.neutral', borderRadius: 2 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        <Button size="small" onClick={() => setEditingPostId(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                                        <Button size="small" variant="contained" onClick={handleUpdatePost} sx={{ borderRadius: 20 }}>Save</Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1.5 }}>{post.content}</Typography>
                            )}
                        </Box>

                        {
                            post.image && (
                                <Box
                                    onDoubleClick={() => handleLike(post._id)}
                                    sx={{
                                        width: '100%',
                                        maxHeight: '500px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        bgcolor: '#f8f9fa',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <img
                                        src={post.image}
                                        alt="post"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '500px' }}
                                    />
                                </Box>
                            )
                        }

                        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {(() => {
                                const currentUserId = currentUser?.id || currentUser?._id;
                                const isLiked = post.likes.some(id => String(id) === String(currentUserId));
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
                                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, color: isLiked ? "#f91880" : "#536471" }}>{post.likes.length || ''}</Typography>
                                    </IconButton>
                                );
                            })()}

                            <IconButton
                                onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                                sx={{ borderRadius: 2, color: showComments[post._id] ? 'primary.main' : 'text.secondary' }}
                            >
                                <MessageSquare size={20} />
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>{post.comments.length || ''}</Typography>
                            </IconButton>

                            <IconButton sx={{ borderRadius: 2, color: 'text.secondary' }} onClick={() => {
                                const shareText = `Check out this post by ${post.username}:\n\n${post.content}`;
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Post by ${post.username}`,
                                        text: shareText,
                                        url: window.location.href
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(shareText)
                                        .then(() => alert("Post copied to clipboard!"))
                                        .catch(console.error);
                                }
                            }}>
                                <Send size={20} />
                            </IconButton>
                        </Box>

                        {/* Comments Section (Toggled) */}
                        {showComments[post._id] && (
                            <Box sx={{ px: 2, pb: 1, maxHeight: 300, overflowY: 'auto' }}>
                                {post.comments.length > 0 ? (
                                    post.comments.map((comment, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                            <Avatar
                                                src={comment.userId?.profilePic}
                                                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}
                                            >
                                                {(comment.username?.[0] || '?').toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ bgcolor: '#f0f2f5', borderRadius: 3, px: 2, py: 1, flexGrow: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                                    {comment.username || 'User'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{comment.text}</Typography>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                        No comments yet. Be the first to say something!
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Simple Comment Input for Profile View */}
                        <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Write a comment..."
                                variant="outlined"
                                value={commentText[post._id] || ''}
                                onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'background.neutral' }, '& fieldset': { border: 'none' } }}
                            />
                            <IconButton onClick={() => handleComment(post._id)} disabled={!commentText[post._id]?.trim()} color="primary">
                                <Send size={20} />
                            </IconButton>
                        </Box>
                    </Paper>
                ))
                }
            </Box >
            {/* Edit Profile Dialog */}
            < Dialog
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                fullWidth
                maxWidth="sm"
                fullScreen={isMobile}
                PaperProps={{
                    sx: { borderRadius: isMobile ? 0 : 3 }
                }}
            >
                {/* Custom Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={() => setOpenEditModal(false)} edge="start" color="inherit">
                            <X size={24} />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit profile</Typography>
                    </Box>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        sx={{
                            borderRadius: 20,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            boxShadow: 'none',
                            bgcolor: 'black',
                            color: 'white',
                            '&:hover': { bgcolor: '#333', boxShadow: 'none' }
                        }}
                    >
                        Save
                    </Button>
                </Box>

                <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: 2 }}>
                        <label htmlFor="edit-profile-pic">
                            <input
                                accept="image/*"
                                id="edit-profile-pic"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <Avatar
                                src={profileUser?.profilePic}
                                sx={{ width: 90, height: 90, mb: 2, cursor: 'pointer', opacity: isUploadingProfilePic ? 0.5 : 1 }}
                            />
                        </label>
                        <Typography variant="button" component="label" htmlFor="edit-profile-pic" sx={{ cursor: 'pointer', textTransform: 'none', color: '#2196f3', fontWeight: 600 }}>
                            Edit picture or avatar
                        </Typography>
                        {isUploadingProfilePic && <CircularProgress size={24} sx={{ mt: 1 }} />}
                    </Box>

                    <CustomInput
                        label="Name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <CustomInput
                        label="Username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                    <CustomInput
                        label="Pronouns"
                        value={editForm.pronouns}
                        onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })}
                    />
                    <CustomInput
                        label="Bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        multiline
                    />
                </DialogContent>
            </Dialog>

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { width: 150, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                }}
            >
                <MenuItem onClick={() => handleEditClick(posts.find(p => p._id === activePostId))} sx={{ gap: 1.5 }}>
                    <Edit2 size={18} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ gap: 1.5, color: 'error.main' }}>
                    <Trash2 size={18} /> Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Post?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary', borderRadius: 20, px: 3, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ borderRadius: 20, px: 3, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Global Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Users List Dialog (Followers/Following) */}
            <Dialog
                open={userListOpen}
                onClose={() => setUserListOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 3, height: '50vh' } }}
            >
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {listType === 'followers' ? 'Followers' : 'Following'}
                    <IconButton onClick={() => setUserListOpen(false)} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {loadingList ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : (
                        <List>
                            {userList.length > 0 ? userList.map((userItem) => (
                                <ListItem key={userItem._id} sx={{ px: 2 }}>
                                    <ListItemAvatar>
                                        <Avatar src={userItem.profilePic}>{userItem.username[0].toUpperCase()}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={userItem.username}
                                        secondary={userItem.name}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                                    />
                                    {currentUser && currentUser.id !== userItem._id && (
                                        <Button
                                            variant={currentUser.following.includes(userItem._id) ? "outlined" : "contained"}
                                            size="small"
                                            onClick={() => handleListFollow(userItem)}
                                            sx={{ borderRadius: 20, textTransform: 'none', fontSize: '0.8rem', minWidth: 80, boxShadow: 'none' }}
                                        >
                                            {currentUser.following.includes(userItem._id) ? 'Following' : 'Follow'}
                                        </Button>
                                    )}
                                </ListItem>
                            )) : (
                                <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                    No users found.
                                </Typography>
                            )}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

        </Container>
    );
};

export default Profile;
