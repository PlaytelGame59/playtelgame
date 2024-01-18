const mongoose = require('mongoose');
const App = require('./App');

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
    status: {
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
    winning_amount: {
        type: Number,
        default: 0
    },
    bonus_ammount: {
        type: String,
        default: ''
    },
    join_code: {
        type: String,
        default: ''
    },
    no_of_loose: {
        type: Number,
        default: 0
    },
    no_of_total_win: {
        type: Number,
        default: 0
    },
    banned: {
        type: Boolean,
        default: false
    },
    app: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'App'
    },
}, {
    collection: 'Players',
    timestamps: true
});

const Players = mongoose.model('Players', PlayerSchema);

module.exports = Players;