const mongoose = require('mongoose');
const Player = require('../models/Players')

const NotificationSchema = new mongoose.Schema({
    player_Ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
    }],
    notificationTitle: {
        type: String,
        required: true,
    },
    notificationMessage: {
        type: String,
        required: true,
    },
    notificationImg: {
        type: String, 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
