const mongoose = require('mongoose')
const Player = require('../models/Players')

const TransactionSchema = mongoose.Schema({
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    amount: { type: Number, required: true }, 
    txnDateTime: { type: Date, required: true },
    type: { type: String, required: true }, 
    txnBy: { type: String, required: true },
    // notes: { type: String, required: true },
    // walletType: { type: String, required: true },
}, {
    timestamps: true
}
)

const Transaction = mongoose.model('transaction', TransactionSchema)

module.exports = Transaction 