const router = require('express').Router();
const request = require('../controllers/friendRequest');
const auth = require('../middlewares/authenticateToken');

router.get('/send/', auth, request.sendFriendRequest);
router.get('/', auth, request.getFriendRequest);
router.get('/accept/', auth, request.acceptFriendRequest);
router.get('/reject/', auth, request.rejectFriendRequest);

module.exports = router;