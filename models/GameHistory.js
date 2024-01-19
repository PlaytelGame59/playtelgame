const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    game_name: {
        type: String,
        default: ''
      },

      bet_amount: {
        type: Number,
        default: 0.0
    },
    win_amount: {
        type: Number,
        default: 0.0
    },
    game_result: {
        type: String,
        default: ''  
    },
    no_ofplayers: {
        type: Number,
        default: 0
    },
    time: {
        type: String
    }  

},{ collection: 'GameHistory', timestamps: true });

const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

module.exports = GameHistory;

