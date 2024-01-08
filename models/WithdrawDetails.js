const mongoose = require('mongoose');

const WithdrawDetailsSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    upi_id: {
        type: String,
        default: ''
    },
    bank_name: {
        type: Number,
        default: 0
    },
    bank_account: {
        type: String,
        default: ''
    },
    bank_ifsc: {
        type: String,
        default: ''
    },
    amt_withdraw: {
        type: String
    }
},{ collection: 'WithdrawDetails', timestamps: true });

const WithdrawDetails = mongoose.model('WithdrawDetails', WithdrawDetailsSchema);

module.exports = WithdrawDetails;


