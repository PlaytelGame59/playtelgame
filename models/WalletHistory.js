const mongoose = require('mongoose');

const WalletHistorySchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    winning: {
        type: String,
        default: ''
    },
    bonus: {
        type: String,
        default: ''
    },
    wallet_amount: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: ''
    }
},{ collection: 'WalletHistory', timestamps: true });

const WalletHistory = mongoose.model('WalletHistory', WalletHistorySchema);

module.exports = WalletHistory;


