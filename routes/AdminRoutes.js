const express = require("express")
const router = express.Router();

const adminController = require('../controllers/AdminController');

// Admin module
router.post('/signup', adminController.signUp)
router.post('/login', adminController.login);
router.post('/reset-password', adminController.resetPassword)

// tournament module 
router.post('/add-tournament', adminController.addTorunment)
router.get('/tournaments-list', adminController.getTournamentList); // this api match with player controller
router.post('/update-tournament', adminController.updateTournament)
router.post('/delete-tournaments-data', adminController.deleteTorunment);


router.post('/add-disclamer', adminController.addDisclamer);

router.post('/add-notification', adminController.addNotification)

// player module
router.get('/players-list', adminController.getPlayer);
router.get('/players-report', adminController.getDetailPlayerReport); // getDetailPlayerReport
router.post('/update-players', adminController.updatePlayer);
router.post('/delete-players-data', adminController.deletePlayer);

router.post('/update-player-status', adminController.updateBanned)

// dfdsfds
router.get('/leaderboard', adminController.getleaderboard);

router.get('/active', adminController.getactivePlayer)

router.get('/banned-player', adminController.getBannedPlayers)

router.post('/add-withdraw-request', adminController.addWithdrawRequestList)
router.post('/update-withdraw-request', adminController.updateBanned)
router.get('/get-withdrawlist', adminController.getWithdrawRequestList)  // withdrawRequestList
router.get('/approve-withdraw', adminController.getapproveWithdraw)  // getapproveWithdraw
router.get('/reject-withdraw', adminController.getRejectedWithdraw) // getRejectedWithdraw

router.get('/transaction-list', adminController.getTransaction);

router.get('/getKYCRequest', adminController.getKYCData)


router.get('/get-notification', adminController.getNotification)

// router.post('/add-notification', adminController.addNotification)

router.post('/add-wallet', adminController.addAmount) // addAmount  /admin/add-wallet

// router.get('/top_ten_prize', adminController.topprize);  // getTransaction

// router.post('/withdraw/request', adminController.requestWithdraw);
// router.post('/wallet/withdraw/request', adminController.withdrawRequest)

module.exports = router;