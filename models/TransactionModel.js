const mongoose = require('mongoose')

const TransactionSchema = mongoose.Schema({
    playerId: { type: String, required: true }, 
    amount: { type: Number, required: true }, 
    txnDateTime: { type: Date, required: true },
    type: { type: String, required: true }, 
    txnBy: { type: String, required: true },
    // notes: { type: String, required: true },
    // walletType: { type: String, required: true },
    // userId: { type: String, required: true } 
},
// {
//     timestamps: true, // This will add createdAt and updatedAt fields
// }
)

const TransactionModel = mongoose.model('transaction', TransactionSchema)

module.exports = { TransactionModel }