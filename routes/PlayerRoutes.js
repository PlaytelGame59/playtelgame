const express = require('express');
const router = express.Router();
const playerController = require('../controllers/PlayerController');

router.post('/login', playerController.userLogin);
router.post('/players/save/profile-image', playerController.addPlayerImage);
router.post('/players/profile-image/get', playerController.getPlayerProfileImage);
router.post('/players/details', playerController.getPlayerDetails);
router.post('/players/update', playerController.updatePlayerDetails);
router.post('/update/name', playerController.updatePlayerName);
router.post('/addFrdForFrd', playerController.sendFriendRequest);
router.post('/is/register', playerController.isMobileRegistedred);
router.post('/getFrdForFrd', playerController.getFriendList);
router.post('/withdraw/request', playerController.sendWithdrawalRequest);
router.post('/wallet/withdraw/request', playerController.getWithdrawHistory);
router.post('/changeStatusFrdForFrd', playerController.changeFriendStatus);

module.exports = router;
