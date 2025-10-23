// Express routes: Auth
const express = require('express');
const router = express.Router();
const { signUp, login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post("/signup", signUp);
router.post("/login", login);
// Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;