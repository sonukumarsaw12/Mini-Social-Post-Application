const express = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', require('../middleware/auth'), getMe);

module.exports = router;
