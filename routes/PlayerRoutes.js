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
router.post('/withdraw/history', playerController.getWithdrawHistory);
router.post('/changeStatusFrdForFrd', playerController.changeFriendStatus);
router.post('/aadharUpload', playerController.playerAdharImage);
router.post('/players/notification/delete', playerController.deleteNotification);
router.post('/wallet/history', playerController.getPlayerWalletHistory);
router.get('/get/latest/winner', playerController.getLatestWinner);
router.post('/tournament/registration', playerController.registerTournament);
router.post('/wallet/load/amount', playerController.loadWalletAmount);
router.post('/tournament/details', playerController.getTournamentDetails);

module.exports = router;