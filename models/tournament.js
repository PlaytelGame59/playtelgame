const mongoose = require('mongoose')

const TournamentSchema = mongoose.Schema({

    tournamentName: { 
        type: String,
        default:"" },
    betAmount: { 
        type: String,
        default:"0"
     }, 
    noPlayers: { 
        type: String,
        default:"0"
     }, 

    winningAmount: { 
        type: String,
        default:"0" },

    winnerCount: { 
        type: String,
        default:"0" 
    },

    winningAmount1: { 
        type: String,
        default:"0" 
    },

    winningAmount2: { 
        type: String,
        default:"0" 
    },
    winningAmount3: { 
        type: String,
        default:"0" 
    },   

    tournamentInterval: { type: String }, 
    tournamentType: { type: String }, 
    tournamentStatus: { type: String },
}, {
    collection: 'Players',
    timestamps: true
});

const Tournament = mongoose.model('tournament', TournamentSchema)

module.exports = Tournament