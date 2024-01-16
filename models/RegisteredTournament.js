const mongoose = require('mongoose');

const RegisteredTournamentSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    tournament_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournment'
    },
    bonus_amount: {
        type: String,
        default: '0' 
    },
    play_amount: {
        type: String,
        default: '0' 
    },
    players_count: {
        type: String,
        default: '0' 
    },
    is_registered: {
        type: Boolean,
        default: 1
    },
    refund: {
        type: String,
        default: '0' 
    }
},{ collection: 'RegisteredTournament', timestamps: true });

const RegisteredTournament = mongoose.model('RegisteredTournament', RegisteredTournamentSchema);

module.exports = RegisteredTournament;


