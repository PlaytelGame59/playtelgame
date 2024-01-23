const mongoose = require('mongoose');

const SaveBankDetailsSchema = new mongoose.Schema({
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
    },
    trans_id: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: false
    }
},{ collection: 'SaveBankDetails', timestamps: true });

const SaveBankDetails = mongoose.model('SaveBankDetails', SaveBankDetailsSchema);

module.exports = SaveBankDetails;


