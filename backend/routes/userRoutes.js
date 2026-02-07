const express = require('express');
const { followUser, unfollowUser, searchUsers, getUserProfile, updateProfilePic, getUserFriends } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

const upload = require('../middleware/upload');

router.get('/search', auth, searchUsers);
router.get('/:id', auth, getUserProfile);
router.get('/:id/friends', auth, getUserFriends);
router.put('/:id/follow', auth, followUser);
router.put('/:id/unfollow', auth, unfollowUser);
router.put('/:id/profile-pic', auth, upload.single('image'), require('../controllers/userController').updateProfilePic);
router.put('/:id/profile', auth, require('../controllers/userController').updateUserProfile);

module.exports = router;
