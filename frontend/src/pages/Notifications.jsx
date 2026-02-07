import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    CircularProgress,
    Paper
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);

                // Mark as read immediately when page opens
                await axios.put(`${API_URL}/api/notifications/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Error fetching notifications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleNotificationClick = (notification) => {
        if (notification.type === 'follow') {
            navigate(`/profile/${notification.sender._id}`);
        } else if (notification.post) {
            navigate(`/post/${notification.post._id}`);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: { xs: 0, sm: 2 }, pb: 8, px: { xs: 0, sm: 2 } }}>
            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 3 }, px: { xs: 2, sm: 0 }, fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.25rem', sm: '1.5rem' }, mt: { xs: 2, sm: 0 } }}>Notifications</Typography>

            <Paper elevation={0} sx={{ borderRadius: { xs: 0, sm: 4 }, overflow: 'hidden', border: { xs: 'none', sm: '1px solid #e0e0e0' }, borderTop: { xs: '1px solid #f0f0f0', sm: '1px solid #e0e0e0' }, boxShadow: { xs: 'none', sm: '0 4px 12px rgba(0,0,0,0.03)' } }}>
                <List sx={{ p: 0 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: '#f0f2f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <Typography variant="h3" sx={{ fontSize: '2rem' }}>🔔</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No Notifications</Typography>
                            <Typography color="text.secondary">When someone likes or comments, it will show up here.</Typography>
                        </Box>
                    ) : (
                        notifications.map((notif) => (
                            <React.Fragment key={notif._id}>
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(notif)}
                                    sx={{
                                        p: { xs: 2, sm: 2.5 },
                                        bgcolor: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)', // Subtle indigo tint for unread
                                        transition: 'all 0.2s ease',
                                        '&:hover': { bgcolor: 'action.hover' },
                                        position: 'relative'
                                    }}
                                >
                                    {!notif.read && (
                                        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: 'primary.main' }} />
                                    )}
                                    <ListItemAvatar sx={{ mr: 1 }}>
                                        <Avatar
                                            src={notif.sender?.profilePic}
                                            sx={{
                                                width: { xs: 40, sm: 48 },
                                                height: { xs: 40, sm: 48 },
                                                bgcolor: 'primary.main',
                                                border: '2px solid',
                                                borderColor: 'background.paper',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {notif.sender?.username?.[0]?.toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                                                <span style={{ fontWeight: 700, color: 'text.primary' }}>{notif.sender?.username}</span>
                                                {' '}
                                                <span style={{ color: 'text.secondary' }}>
                                                    {notif.type === 'like' && `liked your post.`}
                                                    {notif.type === 'comment' && `commented: "${notif.commentText}"`}
                                                    {notif.type === 'follow' && `started following you.`}
                                                </span>
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, mt: 0.5, display: 'block' }}>
                                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </Typography>
                                        }
                                    />
                                    {notif.post?.image && (
                                        <Box
                                            component="img"
                                            src={notif.post.image}
                                            sx={{
                                                width: { xs: 48, sm: 56 },
                                                height: { xs: 48, sm: 56 },
                                                borderRadius: 2,
                                                objectFit: 'cover',
                                                ml: { xs: 1.5, sm: 2 },
                                                border: '1px solid #e0e0e0'
                                            }}
                                        />
                                    )}
                                </ListItem>
                                <Divider component="li" sx={{ borderColor: '#f1f5f9' }} />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default Notifications;
