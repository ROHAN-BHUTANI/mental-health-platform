const express = require('express');
const router = express.Router();
const { register, login, profile, refresh, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authRegisterSchema, authLoginSchema, authRefreshSchema } = require('../validation/schemas');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, validate(authRegisterSchema), register);
router.post('/login', authLimiter, validate(authLoginSchema), login);
router.post('/refresh', validate(authRefreshSchema), refresh);
router.post('/logout', logout);
router.get('/profile', auth, profile);

module.exports = router;
