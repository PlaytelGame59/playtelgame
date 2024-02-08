const express = require("express")
const router = express.Router();

const adminController = require('../controllers/AdminController');

// Admin module
router.post('/signup', adminController.signUp)
router.post('/login', adminController.login);
router.post('/reset-password', adminController.resetPassword)

// tournament module 
router.post('/add-tournament', adminController.addTorunment)
router.get('/tournaments-list', adminController.getTorunment);
router.post('/update-tournament', adminController.updateTournament)
router.post('/delete-tournaments-data', adminController.deleteTorunment);

router.post('/add/disclamer', adminController.addDisclaimer);
router.post('/add-notification', adminController.addNotification)
router.get('/get-notification', adminController.getNotification)

router.post('/add-notice', adminController.addNotice);
router.post('/update-notice', adminController.updateNotice);
router.post('/delete-notice', adminController.deleteNotice);
router.get('/get-all-notice', adminController.getAllNotices);

// router.post('/update-withdraw-status', adminController.updateWithdrawStatus);
router.get('/get-adhar-list', adminController.getPlayerAadharList);
router.get('/get-pan-list', adminController.getPlayerPanList);
router.get('/get-player-list', adminController.getPlayerList);
// router.get('/get-active-players', adminController.getActivePlayers);

router.post('/approve-player-adhar', adminController.approveAadharKyc);
router.post('/approve-player-pan', adminController.approvePanKyc);
router.post('/send-notification-to-players', adminController.sendNotificationToPlayers);

router.get('/adhar-pan-list', adminController.getAllAdharPanKycList);
router.get('/active/player', adminController.getActivePlayers);

router.post('/approve-reject-withdrawrequest', adminController.processWithdrawalRequest);
router.get('/get-withdraw-list', adminController.getWithdrawRequestList);
router.post('/accept-reject-pan-kyc', adminController.updatePanKYCStatus);

router.get('/get-banned-players', adminController.getBannedPlayers);

module.exports = router;