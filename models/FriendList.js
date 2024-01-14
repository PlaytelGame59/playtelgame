const mongoose = require('mongoose');

const FriendListSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    email: {
        type: String,
        default: ''
    },
    friend_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    friend_email: {
        type: String,
        default: ''
    },
    friend_status: {
        type: String,
        default: 'pending' // pending,
    }
},{ collection: 'FriendList', timestamps: true });

const FriendList = mongoose.model('FriendList', FriendListSchema);

module.exports = FriendList;


