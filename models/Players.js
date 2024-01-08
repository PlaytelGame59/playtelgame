const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    first_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    device_type: {
        type: String,
        default: ''
    },
    device_token: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    player_status: {
        type: String,
        default: 0
    },
    player_image: {
        type: String,
        default: ''
    },
    no_of_games: {
        type: Number,
        default: 0
    },
    winning_games: {
        type: Number,
        default: 0
    },
    wallet_amount: {
        type: String,
        default: ''
    },
    winning: {
        type: String,
        default: ''
    },
    bonus: {
        type: String,
        default: ''
    }
},{ collection: 'Players', timestamps: true });

const Players = mongoose.model('Players', PlayerSchema);

module.exports = Players;


