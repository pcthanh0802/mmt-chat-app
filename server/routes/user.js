const router = require('express').Router();
const auth = require('../middlewares/authenticateToken');
const userController = require('../controllers/user');

router.get('/', auth, userController.findUser);
router.get('/friends', auth, userController.getFriendsList);

module.exports = router;

