const mongoose = require('mongoose')
const Players = require('../models/Players');

const WalletSchema = mongoose.Schema({

    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Players' },
    // walletAmount: { type: String, default: 0 },
    // bonusWalletAmount: { type: String, default: 0 }


})    

const Wallet = mongoose.model('wallet', WalletSchema)

module.exports = Wallet
