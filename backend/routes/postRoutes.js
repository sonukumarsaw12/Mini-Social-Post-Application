const express = require('express');
const { createPost, getAllPosts, likePost, commentOnPost, replyToComment, getUserPosts, getPostById, updatePost, deletePost } = require('../controllers/postController');
const auth = require('../middleware/auth');
const router = express.Router();

const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/user/:userId', auth, getUserPosts);
router.post('/:id/like', auth, likePost);
router.post('/:id/comment', auth, commentOnPost);
router.post('/:id/comment/:commentId/reply', auth, replyToComment);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
