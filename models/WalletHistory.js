const mongoose = require('mongoose');
const Tournment = require('./Tournment');

const WalletHistorySchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    /**
     * debit/credit
     */
    type: {
        type: String,
        default: ''
    },
    /**
     * play_balance/winning_balance/bonus_balance
     */
    wallet_type: {
        type: String,
        default: ''
    },
    amount: {
        type: String,
        default: ''
    },
    /**
     * SUCCESSFUL, PENDING, INPROGRESS, FAILED
     */
    status: {
        type: String,
        default: ''
    },
    txn_id: {
        type: String,
        default: ''
    },
    /**
     * "PAYMENT METHODS(UPI/PAYMET ETC)," "BET"
     */
    method: {
        type: String,
        default: ''
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournment'
    },
    txn_date: {
        type: Date,
        default: new Date()
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    collection: 'WalletHistory',
    timestamps: true
});

const WalletHistory = mongoose.model('WalletHistory', WalletHistorySchema);

module.exports = WalletHistory;