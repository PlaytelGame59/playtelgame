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

router.post('/add-disclamer', adminController.addDisclamer);
router.post('/add-notification', adminController.addNotification)
router.get('/get-notification', adminController.getNotification)


router.post('/add-notice', adminController.addNotice);
router.post('/update-notice', adminController.updateNotice);
router.post('/delete-notice', adminController.deleteNotice);
router.get('/get-all-notice', adminController.getAllNotices);

router.post('/update-withdraw-status', adminController.updateWithdrawStatus);


module.exports = router;