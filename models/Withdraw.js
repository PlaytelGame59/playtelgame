const mongoose = require('mongoose')
const Players = require('../models/Players');

const WithdrawSchema = mongoose.Schema({
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Players' },

    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },

    transactionType: { type: String },
    walletType: { type: String },
    addAmount: { type: String },
    notes: { type: String }
})    

const Withdraw = mongoose.model('withdraw', WithdrawSchema)

module.exports = Withdraw

