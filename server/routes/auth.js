const router = require('express').Router();
const authController = require('../controllers/auth')

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token', authController.regrantToken);
router.post('/verifyToken', authController.verifyToken);
router.delete('/logout', authController.logout);

module.exports = router;