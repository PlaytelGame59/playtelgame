const mongoose = require('mongoose');

const JoinedTournamentSchema = new mongoose.Schema({
tournament_name: {
    type: String,
    default: ''
},
bet_ammount: {
    type: Number,
    default: 0
},
no_of_players: {
    type: Number,
    default: 0
},
winning_ammount: {
    type: String,
    default: ''
},
tournament_interval: {
    type: String,
    default: '00:00:00'
},
tournament_type: {
    type: Number,
    default: 0
},
tournament_status: {
    type: Number,
    default: 0
}
},{ collection: 'JoinedTournament', timestamps: true });

const JoinedTournament = mongoose.model('JoinedTournament', JoinedTournamentSchema);

module.exports = JoinedTournament;


