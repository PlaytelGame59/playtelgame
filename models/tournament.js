const mongoose = require('mongoose')

const TournamentSchema = mongoose.Schema({

// tournament_id, player_id, bonus_amount, play_amount, players (Optional), 
// use_of (Optional), notes (optional), refund (Optional)


    tournamentName: { type: String },
    betAmount: { type: String }, 
    noPlayers: { type: String }, 

    winningAmount: { type: String },

    winnerCount: { type: String },
    winningAmount1: { type: String },
    winningAmount2: { type: String },
    winningAmount3: { type: String },   

    tournamentInterval: { type: String }, 
    tournamentType: { type: String }, 
    tournamentStatus: { type: String }
})    

const Tournament = mongoose.model('tournament', TournamentSchema)

module.exports = Tournament