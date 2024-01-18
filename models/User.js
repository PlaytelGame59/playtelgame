const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
   // email, first_name, device_type, device_token, user_type
    email: { type: String }, 
    first_name: { type: String}, 
    device_type: { type: String}, 
    device_token: { type: String }, 
    user_type: { type: Number },
    // image: { type: String }, 
    mobile: { type: String },
    // amount: { type: String },
    // winningAmount: { type: String },

    // playerId: { type: String }, 
    // aadhar: { type: String }, 
    // name: { type: String }, 
    // email: { type: String }, 
    // mobileNo: { type: String },

    // isActive: { type: Boolean, default: true },

    // walletAmount: { type: String, default: 0 },
    // bonusWalletAmount: { type: String, default: 0 },   
}, {
    timestamps: true
}
)

const UserModel = mongoose.model("user", UserSchema)

module.exports = { UserModel }     
